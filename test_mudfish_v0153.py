"""v0.15.3: valor em ms na linha de latência dos nós."""
import asyncio
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
import test_mudfish_v012 as base  # noqa: E402  (instala o stub do decky)
import mudfish_mgr  # noqa: E402

STATIC = (b'{"status": 200, "n_checked": 3, "rtts": [{"sid": 1, "rttavg": 153.0, "success": 1},'
          b' {"sid": 2, "rttavg": 0, "success": 0}, {"sid": 3, "rttavg": 40.4, "success": 2}]}')


class RttMsTests(unittest.TestCase):
    def test_best_ignores_failed_and_zero(self):
        self.assertEqual(mudfish_mgr._rtt_best(STATIC), 40.4)
        self.assertIsNone(mudfish_mgr._rtt_best(b'{"status": 300}'))
        self.assertIsNone(mudfish_mgr._rtt_best(b"lixo"))

    def test_api_rtt_exposes_best(self):
        api = mudfish_mgr.MudfishApi.__new__(mudfish_mgr.MudfishApi)
        api._get = lambda path, follow=True: (200, "application/json", STATIC if "static" in path else b'{"status": 300}')
        r = api.rtt()
        self.assertEqual(r["static"], "ready")
        self.assertEqual(r["vnodes"], "pending")
        self.assertEqual(r["best"], 40.4)

    def _mgr(self):
        for obj in vars(base).values():
            if isinstance(obj, type) and issubclass(obj, unittest.TestCase) and "test_rtt_polled_until_ready_then_throttled" in dir(obj):
                case = obj("test_rtt_polled_until_ready_then_throttled")
                case.setUp()
                self.addCleanup(case.tearDown)
                return case.mgr
        self.fail("fixture não encontrada")

    def test_live_ms_wins_over_best(self):
        mgr = self._mgr()
        mgr.api.rtt = lambda: {"static": "ready", "vnodes": "pending", "n_static": 3, "n_vnodes": 0, "best": 40.4}
        mgr.api.pingstat = lambda: {"avg": 12.8, "jitter": 1.0, "loss": 0.0}
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertEqual(mgr.rtt["ms"], 13)

    def test_best_used_without_live(self):
        mgr = self._mgr()
        mgr.api.rtt = lambda: {"static": "ready", "vnodes": "ready", "n_static": 3, "n_vnodes": 1, "best": 40.4}
        mgr.api.pingstat = lambda: None
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertEqual(mgr.rtt["ms"], 40)

    def test_no_ms_when_nothing_measured(self):
        mgr = self._mgr()
        mgr.api.rtt = lambda: {"static": "pending", "vnodes": "pending", "n_static": 0, "n_vnodes": 0}
        mgr.api.pingstat = lambda: None
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertNotIn("ms", mgr.rtt)


if __name__ == "__main__":
    unittest.main()
