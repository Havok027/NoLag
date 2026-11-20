"""v0.15.2: latência dos nós não fica presa em 'Medindo' quando o RTT em tempo real já existe."""
import asyncio
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
import mudfish_mgr  # noqa: E402




class RttLiveTests(unittest.TestCase):
    def _manager(self):
        import test_mudfish_v012 as t
        for obj in vars(t).values():
            if isinstance(obj, type) and issubclass(obj, unittest.TestCase) and hasattr(obj, "setUp") and obj is not unittest.TestCase:
                if "test_rtt_polled_until_ready_then_throttled" in dir(obj):
                    case = obj("test_rtt_polled_until_ready_then_throttled")
                    case.setUp()
                    self.addCleanup(case.tearDown)
                    return case.mgr
        self.fail("fixture não encontrada")

    def test_live_marks_rtt_when_nodes_still_pending(self):
        mgr = self._manager()
        mgr.api.rtt = lambda: {"static": "pending", "vnodes": "error", "n_static": 0, "n_vnodes": 0}
        mgr.api.pingstat = lambda: {"avg": 9.0, "jitter": 1.0, "loss": 0.0}
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertTrue(mgr.rtt.get("live"))

    def test_no_live_without_pingstat(self):
        mgr = self._manager()
        mgr.api.rtt = lambda: {"static": "pending", "vnodes": "pending", "n_static": 0, "n_vnodes": 0}
        mgr.api.pingstat = lambda: None
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertFalse(mgr.rtt.get("live"))

    def test_both_ready_skips_pingstat(self):
        mgr = self._manager()
        mgr.api.rtt = lambda: {"static": "ready", "vnodes": "ready", "n_static": 1, "n_vnodes": 1}
        mgr.api.pingstat = lambda: self.fail("não deveria ler o pingstat")
        asyncio.run(mgr._poll_rtt(force=True))
        self.assertNotIn("live", mgr.rtt)


if __name__ == "__main__":
    unittest.main()
