"""v0.16.8: reiniciar o histórico (memória e arquivo) e seguir gravando a partir de agora."""
import asyncio
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import history_mgr  # noqa: E402


async def live():
    return {"base": {"avg": 20, "jitter": 1, "loss": 0}, "tunnel": {"avg": 15, "jitter": 1, "loss": 0}}


class ResetTests(unittest.TestCase):
    def make(self, d, clock):
        return history_mgr.HistoryRecorder(live, os.path.join(d, "history.json"), clock=clock)

    def test_reset_clears_memory_and_file(self):
        with tempfile.TemporaryDirectory() as d:
            t = [1000.0]
            rec = self.make(d, lambda: t[0])
            for i in range(3):
                t[0] += 10
                asyncio.run(rec.tick())
            rec.flush()
            self.assertEqual(len(rec.samples), 3)
            snap = rec.reset()
            self.assertEqual(snap["samples"], [])
            self.assertTrue(snap["ok"])
            with open(os.path.join(d, "history.json")) as f:
                self.assertEqual(json.load(f)["samples"], [])
            self.assertEqual(self.make(d, lambda: t[0]).samples, [])

    def test_keeps_recording_after_reset(self):
        with tempfile.TemporaryDirectory() as d:
            t = [1000.0]
            rec = self.make(d, lambda: t[0])
            asyncio.run(rec.tick())
            rec.reset()
            t[0] += 10
            asyncio.run(rec.tick())
            snap = rec.snapshot()
            self.assertEqual(len(snap["samples"]), 1)
            self.assertEqual(snap["samples"][0]["t"], 1010)

    def test_reset_on_empty_history_is_safe(self):
        with tempfile.TemporaryDirectory() as d:
            rec = self.make(d, lambda: 1000.0)
            self.assertEqual(rec.reset()["samples"], [])


class MainTests(unittest.TestCase):
    def test_main_exposes_history_reset(self):
        src = open(os.path.join(os.path.dirname(__file__), "..", "main.py"), encoding="utf-8").read()
        self.assertIn("async def history_reset", src)
        self.assertIn("self.history.reset", src)


if __name__ == "__main__":
    unittest.main()
