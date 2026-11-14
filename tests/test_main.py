import asyncio
import base64
import json
import logging
import os
import socket
import struct
import sys
import tempfile
import types
import unittest

sys.modules["decky"] = types.SimpleNamespace(
    DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
    DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
    logger=logging.getLogger("nolag-test"),
)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main  # noqa: E402

PING_OK = """5 packets transmitted, 5 received, 0% packet loss, time 804ms
rtt min/avg/max/mdev = 10.100/12.300/15.000/1.900 ms
"""
PING_LOSS = "5 packets transmitted, 0 received, 100% packet loss, time 4090ms\n"

K1 = "A" * 43 + "="
K2 = "B" * 43 + "="
RELAY = {"name": "Oracle SP", "endpoint": "129.151.10.20:51820", "public_key": K1, "private_key": K2, "address": "10.8.0.2/32"}


def make_code(**over):
    d = {"v": 1, "n": "Oracle SP", "e": "129.151.10.20:51820", "s": K1, "k": K2, "a": "10.8.0.2/32"}
    d.update(over)
    raw = base64.urlsafe_b64encode(json.dumps(d).encode()).decode().rstrip("=")
    return "nolag1:" + raw


def udp_packet(sport, dst, dport, ether=True):
    udp = struct.pack("!HHHH", sport, dport, 8, 0)
    ip = struct.pack("!BBHHHBBH4s4s", 0x45, 0, 28, 0, 0, 64, 17, 0, socket.inet_aton("192.168.0.5"), socket.inet_aton(dst))
    return (b"\x00" * 12 + b"\x08\x00" if ether else b"") + ip + udp


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
    def test_sanitize_defaults_and_types(self):
        self.assertEqual(main.sanitize_settings(None), main.DEFAULTS)
        d = main.sanitize_settings({"language": "xx", "enabled": "yes", "target": "1.1.1.1"})
        self.assertEqual(d, {"language": "pt", "enabled": False, "profile": "balanced", "collapsed": {}})
        ok = main.sanitize_settings({"language": "en", "enabled": True, "profile": "stable"})
        self.assertEqual(ok, {"language": "en", "enabled": True, "profile": "stable", "collapsed": {}})
        self.assertEqual(main.sanitize_settings({"profile": "x; rm"})["profile"], "balanced")

    def test_target_only_public_unicast(self):
        self.assertEqual(main.sanitize_target("8.8.8.8"), "8.8.8.8")
        for bad in ("192.168.0.1", "127.0.0.1", "10.0.0.5", "0.0.0.0", "224.0.0.1", "255.255.255.255", "x", "", None):
            self.assertEqual(main.sanitize_target(bad), "", bad)


class RelayTests(unittest.TestCase):
    def test_parse_code_ok(self):
        relay, err = main.parse_relay_code(make_code())
        self.assertEqual(err, "")
        self.assertEqual(relay, RELAY)

    def test_parse_code_rejects_bad_input(self):
        bad = [
            "", None, "abc", "nolag1:@@@", make_code(e="192.168.1.1:51820"), make_code(e="8.8.8.8:99999"),
            make_code(e="x;reboot:1"), make_code(s="curta"), make_code(a="8.8.8.8/32"), make_code(n="a/b"),
            make_code(a="10.0.0.2/32\nPostUp=x"),
        ]
        for code in bad:
            self.assertEqual(main.parse_relay_code(code)[1], "bad_code", code)

    def test_wg_conf_native_only(self):
        conf = main.render_wg_conf(RELAY)
        self.assertIn("AllowedIPs = 0.0.0.0/0", conf)
        for banned in ("Address", "Table", "PostUp", "DNS"):
            self.assertNotIn(banned, conf)

    def test_store_roundtrip_and_private_file(self):
        main.save_relays([RELAY, dict(RELAY, name="Outro"), dict(RELAY, endpoint="10.0.0.1:1")])
        self.assertEqual([r["name"] for r in main.load_relays()], ["Oracle SP", "Outro"])
        mode = os.stat(os.path.join(main.decky.DECKY_PLUGIN_SETTINGS_DIR, "relays.json")).st_mode & 0o777
        self.assertEqual(mode, 0o600)
        self.assertNotIn("private_key", main.public_relays(main.load_relays())[0])


class PresetRelayTests(unittest.TestCase):
    def setUp(self):
        self.path = os.path.join(main.decky.DECKY_PLUGIN_DIR, "relay-code.txt")
        main.save_relays([])

    def tearDown(self):
        if os.path.exists(self.path):
            os.remove(self.path)

    def test_file_relays_are_builtin_and_deduped(self):
        with open(self.path, "w") as f:
            f.write("lixo\n" + make_code() + "\n" + make_code(n="Segundo") + "\n" + make_code(e="192.168.0.1:1", n="Ruim") + "\n")
        main.save_relays([RELAY, dict(RELAY, name="Manual")])
        relays = main.load_relays()
        self.assertEqual([r["name"] for r in relays], ["Oracle SP", "Segundo", "Manual"])
        self.assertEqual([r["builtin"] for r in relays], [True, True, False])
        self.assertEqual([r["builtin"] for r in main.public_relays(relays)], [True, True, False])
        main.save_relays([r for r in main.load_stored_relays() if r["name"] != "Manual"])
        self.assertEqual([r["name"] for r in main.load_stored_relays()], ["Oracle SP"])

    def test_add_relay_respects_limit(self):
        with open(self.path, "w") as f:
            f.write("\n".join(make_code(n="F%d" % i) for i in range(4)))
        res = asyncio.run(main.Plugin().add_relay(make_code(n="Quinto")))
        self.assertEqual((res["ok"], res["error"]), (False, "too_many"))


class MonitorTests(unittest.TestCase):
    def test_no_relays_is_a_notice_not_an_error(self):
        plugin = main.Plugin()
        saved = (main.load_relays, main.find_game_pids, main.run, main.asyncio.sleep, main.shutil.which)

        async def stop(_t):
            raise asyncio.CancelledError()

        main.load_relays = lambda: []
        main.find_game_pids = lambda: []
        main.run = Recorder()
        main.asyncio.sleep = stop
        main.shutil.which = lambda name: "/usr/bin/" + name
        try:
            with self.assertRaises(asyncio.CancelledError):
                asyncio.run(plugin._monitor())
        finally:
            main.load_relays, main.find_game_pids, main.run, main.asyncio.sleep, main.shutil.which = saved
        self.assertEqual(plugin.status["phase"], "waiting")
        self.assertEqual(plugin.status["notice"], "no_relays")
        self.assertEqual(plugin.status["error"], "")


class DetectionTests(unittest.TestCase):
    def test_parse_udp_table(self):
        text = (
            "  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode ref pointer drops\n"
            "  10: 0100007F:1F90 00000000:0000 07 00000000:00000000 00:00000000 00000000  1000        0 12345 2 0000000000000000 0\n"
            "  11: 00000000:C350 00000000:0000 07 00000000:00000000 00:00000000 00000000  1000        0 777 2 0000000000000000 0\n"
        )
        self.assertEqual(main.parse_udp_table(text), {12345: 8080, 777: 50000})

    def test_parse_packet(self):
        self.assertEqual(main.parse_packet(udp_packet(50000, "34.1.2.3", 7777), 1), (50000, "34.1.2.3", 7777))
        self.assertEqual(main.parse_packet(udp_packet(50000, "34.1.2.3", 7777, ether=False), 65534), (50000, "34.1.2.3", 7777))
        self.assertIsNone(main.parse_packet(udp_packet(1, "34.1.2.3", 2)[:20], 1))
        self.assertIsNone(main.parse_packet(b"\x00" * 60, 1))
        self.assertIsNone(main.parse_packet(udp_packet(1, "34.1.2.3", 2), 772))

    def test_pick_target(self):
        self.assertEqual(main.pick_target({"1.1.1.1": 50, "2.2.2.2": 20}, None), "1.1.1.1")
        self.assertEqual(main.pick_target({"1.1.1.1": 50, "2.2.2.2": 20}, "2.2.2.2"), "2.2.2.2")  # mantém
        self.assertIsNone(main.pick_target({"1.1.1.1": 3}, None))
        self.assertEqual(main.pick_target({"1.1.1.1": 3, "2.2.2.2": 40}, "1.1.1.1"), "2.2.2.2")
        self.assertEqual(main.merge_counts([{"a": 1}, {"a": 2, "b": 3}]), {"a": 3, "b": 3})


class MetricsTests(unittest.TestCase):
    def test_parse_ping(self):
        self.assertEqual(main.parse_ping(PING_OK), {"avg": 12.3, "jitter": 1.9, "loss": 0.0})
        self.assertEqual(main.parse_ping(PING_LOSS), {"avg": None, "jitter": None, "loss": 100.0})
        self.assertIsNone(main.parse_ping("connect: Network is unreachable"))

    def test_score(self):
        self.assertAlmostEqual(main.score({"avg": 20.0, "jitter": 2.0, "loss": 0.0}), 24.0)
        self.assertIsNone(main.score({"avg": 20.0, "jitter": 2.0, "loss": 40.0}))
        self.assertIsNone(main.score(None))
        self.assertIsNotNone(main.score({"avg": 20.0, "jitter": 2.0, "loss": 25.0}, 30.0))
        self.assertIsNone(main.score({"avg": 20.0, "jitter": 2.0, "loss": 25.0}, 20.0))

    def test_choose(self):
        self.assertEqual(main.choose(50.0, {"a": 30.0}, "direct"), "a")
        self.assertEqual(main.choose(50.0, {"a": 47.0}, "direct"), "direct")
        self.assertEqual(main.choose(50.0, {"a": 40.0, "b": 38.0}, "a"), "a")
        self.assertEqual(main.choose(50.0, {"a": 40.0, "b": 30.0}, "a"), "b")
        self.assertEqual(main.choose(50.0, {"a": None}, "a"), "direct")
        self.assertEqual(main.choose(None, {"a": None}, "direct"), "direct")
        self.assertEqual(main.choose(None, {"a": 80.0}, "direct"), "a")


class NetworkTests(unittest.TestCase):
    def _with_run(self, rec):
        main.run, self._orig = rec, main.run
        main.RUN_DIR, self._dir = tempfile.mkdtemp(), main.RUN_DIR

    def _restore(self):
        main.run, main.RUN_DIR = self._orig, self._dir

    def test_apply_route(self):
        rec = Recorder()
        self._with_run(rec)
        try:
            self.assertTrue(asyncio.run(main.apply_route("8.8.8.8", 1)))
            self.assertEqual(rec.calls[0], ["ip", "rule", "del", "pref", "800"])
            self.assertEqual(rec.calls[1], ["ip", "rule", "add", "to", "8.8.8.8/32", "lookup", "51801", "pref", "800"])
            rec.calls.clear()
            self.assertTrue(asyncio.run(main.apply_route("", None)))
            self.assertEqual(rec.calls, [["ip", "rule", "del", "pref", "800"]])
        finally:
            self._restore()

    def test_teardown_covers_everything(self):
        rec = Recorder(fail=("rule del", "-D POSTROUTING"))
        self._with_run(rec)
        try:
            asyncio.run(main.teardown())
        finally:
            self._restore()
        flat = [" ".join(c) for c in rec.calls]
        for i in range(main.MAX_RELAYS):
            self.assertIn("ip link del nolag%d" % i, flat)
            self.assertIn("ip route flush table %d" % (main.TABLE_BASE + i), flat)

    def test_setup_relay_sequence_and_conf_removed(self):
        rec = Recorder(fail=("-C POSTROUTING",))
        self._with_run(rec)
        try:
            self.assertTrue(asyncio.run(main.setup_relay(0, RELAY)))
            self.assertEqual(os.listdir(main.RUN_DIR), [])
        finally:
            self._restore()
        flat = [" ".join(c) for c in rec.calls]
        self.assertEqual(flat[0], "ip link add nolag0 type wireguard")
        self.assertTrue(flat[1].startswith("wg setconf nolag0 "))
        self.assertIn("ip addr add 10.8.0.2/32 dev nolag0", flat)
        self.assertIn("iptables -t nat -A POSTROUTING -o nolag0 -j MASQUERADE", flat)

    def test_setup_relay_fails_cleanly(self):
        for broken in ("link add", "wg setconf"):
            rec = Recorder(fail=(broken,))
            self._with_run(rec)
            try:
                self.assertFalse(asyncio.run(main.setup_relay(0, RELAY)))
                self.assertEqual(os.listdir(main.RUN_DIR), [])
            finally:
                self._restore()


if __name__ == "__main__":
    unittest.main()
