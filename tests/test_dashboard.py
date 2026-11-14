import logging
import os
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


class CollapsedTests(unittest.TestCase):
    def test_only_known_sections_and_bools(self):
        d = main.sanitize_settings({"collapsed": {"diag": True, "relays": "x", "evil": True, "routes": False}})
        self.assertEqual(d["collapsed"], {"diag": True, "routes": False})

    def test_bad_type_falls_back(self):
        self.assertEqual(main.sanitize_settings({"collapsed": "x"})["collapsed"], {})

    def test_defaults_not_shared(self):
        a = main.sanitize_settings(None)
        a["collapsed"]["diag"] = True
        self.assertEqual(main.sanitize_settings(None)["collapsed"], {})

    def test_status_has_diag(self):
        p = main.Plugin()
        self.assertEqual(p.status["diag"], {"pids": 0, "ports": 0, "seen": 0, "top": []})


if __name__ == "__main__":
    unittest.main()
