import asyncio
import logging
import os
import sys
import tempfile
import types
import unittest

if "decky" not in sys.modules:
    sys.modules["decky"] = types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-core-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import core_state  # noqa: E402

PING = """4 packets transmitted, 4 received, 0% packet loss, time 603ms
rtt min/avg/max/mdev = 10.100/12.300/15.000/1.900 ms
"""
ROUTE = "1.1.1.1 via 192.168.0.1 dev wlan0 src 192.168.0.23 uid 0\n    cache\n"


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


class ParseTests(unittest.TestCase):
    def test_ping(self):
        self.assertEqual(core_state.parse_ping(PING), {"avg": 12.3, "jitter": 1.9, "loss": 0.0})
        self.assertIsNone(core_state.parse_ping("lixo"))
        self.assertEqual(core_state.parse_ping("4 packets transmitted, 0 received, 100% packet loss")["avg"], None)

    def test_route(self):
        self.assertEqual(core_state.parse_route(ROUTE), {"dev": "wlan0", "src": "192.168.0.23", "via": "192.168.0.1"})
        self.assertEqual(core_state.parse_route("")["dev"], "")

    def test_target_is_sanitized(self):
        self.assertEqual(core_state.clean_target("8.8.8.8"), "8.8.8.8")
        self.assertEqual(core_state.clean_target("Game.Example.com"), "game.example.com")
        for bad in ("", "-c1 8.8.8.8", "a b", "x;rm -rf /", "localhost", "999.1.1.1", None):
            self.assertEqual(core_state.clean_target(bad), core_state.DEFAULT_TARGET, bad)


class BusTests(unittest.TestCase):
    def test_missing_module_does_not_raise(self):
        bus = core_state.Bus()
        r = run(bus.call("mudfish", "enable"))
        self.assertFalse(r["ok"])
        self.assertEqual(r["error"], "module_unavailable")

    def test_failure_is_isolated(self):
        bus = core_state.Bus()
        calls = []

        async def boom():
            raise RuntimeError("x")

        async def fine():
            calls.append("ok")
            return 1

        bus.register("a", enable=boom)
        bus.register("b", enable=fine)
        self.assertFalse(run(bus.call("a", "enable"))["ok"])
        self.assertTrue(run(bus.call("b", "enable"))["ok"])
        self.assertEqual(calls, ["ok"])

    def test_state_and_unregister(self):
        bus = core_state.Bus()
        bus.register("m", status=lambda: 1)
        bus.set_state("m", {"running": True})
        self.assertTrue(bus.get_state("m")["running"])
        self.assertTrue(bus.has("m", "status"))
        bus.unregister("m")
        self.assertEqual(bus.get_state("m"), {})
        self.assertFalse(bus.has("m"))

    def test_emit_survives_bad_subscriber(self):
        bus = core_state.Bus()
        got = []
        bus.subscribe("e", lambda p: (_ for _ in ()).throw(ValueError("x")))
        bus.subscribe("e", lambda p: got.append(p))
        run(bus.emit("e", 5))
        self.assertEqual(got, [5])


class SnapshotTests(unittest.TestCase):
    def test_snapshot_uses_route_and_ping(self):
        async def fake(cmd, timeout=15):
            return (0, ROUTE) if cmd[0] == "ip" else (0, PING)

        old = core_state.run
        core_state.run = fake
        try:
            snap = run(core_state.snapshot("1.1.1.1"))
        finally:
            core_state.run = old
        self.assertEqual(snap["route"]["dev"], "wlan0")
        self.assertEqual(snap["ping"]["avg"], 12.3)

    def test_module_has_no_module_imports(self):
        src = open(os.path.join(ROOT, "core_state.py"), encoding="utf-8").read()
        self.assertNotIn("wifi_mgr", src)
        self.assertNotIn("mudfish_mgr", src)


if __name__ == "__main__":
    unittest.main()
