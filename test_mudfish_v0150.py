"""v0.15.0: Full VPN permitido (sem trava) e aviso informativo."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
import mudfish_mgr  # noqa: E402


class FullVpnAllowedTests(unittest.TestCase):
    def test_no_enforcement_left_in_backend(self):
        src = open(mudfish_mgr.__file__, encoding="utf-8").read()
        self.assertNotIn("_enforce_fullvpn", src)
        self.assertNotIn("fullvpn_blocked", src)

    def test_watch_loop_keeps_running(self):
        src = open(mudfish_mgr.__file__, encoding="utf-8").read()
        loop = src[src.index("async def _watch_session"):src.index("async def _poll_rtt")]
        self.assertIn("_poll_rtt", loop)
        self.assertNotIn("return", loop.replace("return\n        except", ""))


if __name__ == "__main__":
    unittest.main()
