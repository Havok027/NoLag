import asyncio
import logging
import os
import sys
import tempfile
import types
import unittest

sys.modules["decky"] = types.SimpleNamespace(
    DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
    logger=logging.getLogger("nolag-test"),
)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main  # noqa: E402

PING_OK = """PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
--- 8.8.8.8 ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 804ms
rtt min/avg/max/mdev = 10.100/12.300/15.000/1.900 ms
"""
PING_LOSS = "5 packets transmitted, 0 received, 100% packet loss, time 4090ms\n"

WG = """[Interface]
PrivateKey = AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
Address = 10.8.0.2/32
DNS = 1.1.1.1
ListenPort = 51820
PostUp = touch /tmp/pwned

[Peer]
PublicKey = BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=
AllowedIPs = 10.8.0.1/32
Endpoint = 203.0.113.9:51820
"""


class Recorder:
    def __init__(self, fail=()):
        self.calls = []
        self.fail = fail

    async def __call__(self, cmd, timeout=15):
        self.calls.append(cmd)
        joined = " ".join(cmd)
        for f in self.fail:
            if f in joined:
                return 1, ""
        return 0, ""


class SettingsTests(unittest.TestCase):
    def test_target_only_public_ipv4(self):
        self.assertEqual(main.sanitize_target(" 8.8.8.8 "), "8.8.8.8")
        for bad in ("192.168.0.1", "127.0.0.1", "10.0.0.5", "0.0.0.0", "224.0.0.1", "x.com", "8.8.8.8; ls", "::1", 5, None):
            self.assertEqual(main.sanitize_target(bad), "", bad)

    def test_sanitize_defaults_and_types(self):
        self.assertEqual(main.sanitize_settings(None), main.DEFAULTS)
        d = main.sanitize_settings({"language": "xx", "enabled": "yes", "target": "1.1.1.1"})
        self.assertEqual(d, {"language": "pt", "enabled": False, "target": "1.1.1.1"})


class MetricsTests(unittest.TestCase):
    def test_parse_ping(self):
        self.assertEqual(main.parse_ping(PING_OK), {"avg": 12.3, "jitter": 1.9, "loss": 0.0})
        self.assertEqual(main.parse_ping(PING_LOSS), {"avg": None, "jitter": None, "loss": 100.0})
        self.assertIsNone(main.parse_ping("connect: Network is unreachable"))

    def test_score(self):
        self.assertAlmostEqual(main.score({"avg": 20.0, "jitter": 2.0, "loss": 0.0}), 24.0)
        self.assertIsNone(main.score({"avg": 20.0, "jitter": 2.0, "loss": 40.0}))
        self.assertIsNone(main.score(None))

    def test_choose(self):
        self.assertEqual(main.choose(50.0, {"a": 30.0}, "direct"), "a")
        self.assertEqual(main.choose(50.0, {"a": 47.0}, "direct"), "direct")  # abaixo da margem
        self.assertEqual(main.choose(50.0, {"a": 40.0, "b": 38.0}, "a"), "a")  # histerese
        self.assertEqual(main.choose(50.0, {"a": 40.0, "b": 30.0}, "a"), "b")
        self.assertEqual(main.choose(50.0, {"a": None}, "a"), "direct")  # relay caiu
        self.assertEqual(main.choose(None, {"a": None}, "direct"), "direct")
        self.assertEqual(main.choose(None, {"a": 80.0}, "direct"), "a")


class WireGuardTests(unittest.TestCase):
    def test_conf_whitelist(self):
        conf, endpoint, err = main.build_wg_conf(WG)
        self.assertEqual(err, "")
        self.assertEqual(endpoint, "203.0.113.9:51820")
        for banned in ("PostUp", "DNS", "ListenPort", "pwned", "10.8.0.1/32"):
            self.assertNotIn(banned, conf)
        self.assertIn("Table = off", conf)
        self.assertIn("AllowedIPs = 0.0.0.0/0", conf)
        self.assertIn("PersistentKeepalive = 25", conf)

    def test_conf_errors(self):
        self.assertEqual(main.build_wg_conf("[Interface]\nAddress = 10.0.0.2/32\n")[2], "missing_privatekey")
        bad = WG.replace("203.0.113.9:51820", "x;reboot")
        self.assertEqual(main.build_wg_conf(bad)[2], "invalid_value")


class NetworkTests(unittest.TestCase):
    def test_apply_route(self):
        rec = Recorder()
        main.run, orig = rec, main.run
        try:
            self.assertTrue(asyncio.run(main.apply_route("8.8.8.8", 1)))
            self.assertEqual(rec.calls[0], ["ip", "rule", "del", "pref", "800"])
            self.assertEqual(rec.calls[1], ["ip", "rule", "add", "to", "8.8.8.8/32", "lookup", "51801", "pref", "800"])
            rec.calls.clear()
            self.assertTrue(asyncio.run(main.apply_route("8.8.8.8", None)))
            self.assertEqual(rec.calls, [["ip", "rule", "del", "pref", "800"]])
        finally:
            main.run = orig

    def test_teardown_covers_everything(self):
        rec = Recorder(fail=("rule del", "-D POSTROUTING"))
        main.run, orig = rec, main.run
        try:
            asyncio.run(main.teardown())
        finally:
            main.run = orig
        flat = [" ".join(c) for c in rec.calls]
        for i in range(main.MAX_RELAYS):
            self.assertIn("ip link del nolag%d" % i, flat)
            self.assertIn("ip route flush table %d" % (main.TABLE_BASE + i), flat)

    def test_setup_relay_removes_conf_and_adds_masquerade(self):
        rec = Recorder(fail=("-C POSTROUTING",))
        main.run, orig = rec, main.run
        main.RUN_DIR, old_dir = tempfile.mkdtemp(), main.RUN_DIR
        try:
            self.assertTrue(asyncio.run(main.setup_relay(0, "conf")))
            self.assertEqual(os.listdir(main.RUN_DIR), [])
        finally:
            main.run, main.RUN_DIR = orig, old_dir
        flat = [" ".join(c) for c in rec.calls]
        self.assertTrue(flat[0].startswith("wg-quick up "))
        self.assertIn("iptables -t nat -A POSTROUTING -o nolag0 -j MASQUERADE", flat)

    def test_setup_relay_fails_when_wg_quick_fails(self):
        rec = Recorder(fail=("wg-quick",))
        main.run, orig = rec, main.run
        main.RUN_DIR, old_dir = tempfile.mkdtemp(), main.RUN_DIR
        try:
            self.assertFalse(asyncio.run(main.setup_relay(0, "conf")))
            self.assertEqual(os.listdir(main.RUN_DIR), [])
        finally:
            main.run, main.RUN_DIR = orig, old_dir


if __name__ == "__main__":
    unittest.main()
