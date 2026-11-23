"""v0.16.0: histórico de medições (módulo independente) e sua ligação com o main.py."""
import asyncio
import json
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
        logger=logging.getLogger("nolag-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import history_mgr  # noqa: E402


class Clock:
    def __init__(self, t=10_000):
        self.t = t

    def __call__(self):
        return self.t


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


LIVE = {"base": {"avg": 8.04, "jitter": 0.21, "loss": 0.0}, "tunnel": {"avg": 12.5, "jitter": 1.0, "loss": 0.0}}


class PackTests(unittest.TestCase):
    def test_pack_rounds_and_handles_missing(self):
        self.assertEqual(history_mgr.pack({"avg": 8.04, "jitter": 0.21, "loss": 0}), [8.0, 0.2, 0.0])
        self.assertEqual(history_mgr.pack({"avg": None, "jitter": None, "loss": 100}), [None, None, 100.0])
        self.assertIsNone(history_mgr.pack({"avg": None, "jitter": None, "loss": None}))
        self.assertIsNone(history_mgr.pack(None))
        self.assertIsNone(history_mgr.pack({"avg": True, "jitter": "x", "loss": float("nan")}))

    def test_clean_samples_drops_junk_old_and_future(self):
        raw = [{"t": 9000, "b": [1, 2, 0], "w": None}, {"t": 5000, "b": [1, 1, 1]}, {"t": 99999, "b": [1, 1, 1]},
               {"t": "x"}, "lixo", {"t": 9500, "b": [1, 2], "w": [3, 4, 5]}]
        out = history_mgr.clean_samples(raw, 10_000)
        self.assertEqual([s["t"] for s in out], [9000, 9500])
        self.assertEqual(out[1], {"t": 9500, "b": None, "w": [3.0, 4.0, 5.0]})  # b com tamanho errado vira None
        self.assertEqual(history_mgr.clean_samples("lixo", 10_000), [])


class RecorderTests(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.path = os.path.join(self.dir, "history.json")
        self.clock = Clock()

    def rec(self, live):
        async def sample():
            if isinstance(live, Exception):
                raise live
            return live
        return history_mgr.HistoryRecorder(sample, self.path, clock=self.clock)

    def test_tick_records_both_sides(self):
        r = self.rec(LIVE)
        item = run(r.tick())
        self.assertEqual(item, {"t": 10_000, "b": [8.0, 0.2, 0.0], "w": [12.5, 1.0, 0.0]})
        self.assertEqual(r.snapshot()["samples"], [item])

    def test_without_tunnel_keeps_only_base(self):
        r = self.rec({"base": LIVE["base"], "tunnel": None})
        self.assertEqual(run(r.tick())["w"], None)

    def test_failures_leave_a_gap_without_raising(self):
        self.assertIsNone(run(self.rec(RuntimeError("boom")).tick()))
        self.assertIsNone(run(self.rec(None).tick()))
        self.assertIsNone(run(self.rec({"base": None, "tunnel": None}).tick()))

    def test_window_is_pruned_to_30_minutes(self):
        r = self.rec(LIVE)
        run(r.tick())
        self.clock.t += 1700
        run(r.tick())
        self.assertEqual(len(r.snapshot()["samples"]), 2)
        self.clock.t += 200  # a primeira passa de 1800 s
        run(r.tick())
        self.assertEqual([s["t"] for s in r.snapshot()["samples"]], [11_700, 11_900])

    def test_persists_and_reloads_only_fresh_samples(self):
        r = self.rec(LIVE)
        run(r.tick())
        r.flush()
        self.assertEqual(oct(os.stat(self.path).st_mode & 0o777), "0o600")
        self.clock.t += 100
        again = self.rec(LIVE)
        self.assertEqual(len(again.samples), 1)
        self.clock.t += 5000
        self.assertEqual(self.rec(LIVE).samples, [])  # velha demais: histórico recomeça

    def test_corrupt_file_is_ignored(self):
        with open(self.path, "w") as f:
            f.write("{não é json")
        self.assertEqual(self.rec(LIVE).samples, [])

    def test_stop_flushes_and_loop_samples(self):
        async def go():
            r = history_mgr.HistoryRecorder(lambda: _async(LIVE), self.path, interval=0.01, flush_every=999, clock=self.clock)
            r.start()
            await asyncio.sleep(0.08)
            await r.stop()
            return r
        r = run(go())
        self.assertGreaterEqual(len(r.samples), 2)
        with open(self.path, encoding="utf-8") as f:
            self.assertEqual(len(json.load(f)["samples"]), len(r.samples))

    def test_snapshot_shape(self):
        snap = self.rec(LIVE).snapshot()
        self.assertEqual(set(snap), {"ok", "now", "interval", "window", "samples"})
        self.assertEqual((snap["interval"], snap["window"]), (10, 1800))


async def _async(v):
    return v


class WiringTests(unittest.TestCase):
    def test_module_is_independent(self):
        src = open(os.path.join(ROOT, "history_mgr.py"), encoding="utf-8").read()
        for word in ("mudfish_mgr", "wifi_mgr", "core_state", "game_profiles"):
            self.assertNotIn("import " + word, src)
            self.assertNotIn("from " + word, src)

    def test_main_wires_history_isolated(self):
        src = open(os.path.join(ROOT, "main.py"), encoding="utf-8").read()
        self.assertIn("from history_mgr import HistoryRecorder", src)
        self.assertIn("async def history_get", src)
        self.assertIn("HistoryRecorder(self.mudfish.get_live", src)
        self.assertIn("await self.history.stop()", src)

    def test_build_packs_history_module(self):
        for rel in (os.path.join(ROOT, ".github", "workflows", "build.yml"), os.path.join(ROOT, "build.yml")):
            if os.path.exists(rel):
                self.assertIn("history_mgr.py", open(rel, encoding="utf-8").read())
                return


if __name__ == "__main__":
    unittest.main()
