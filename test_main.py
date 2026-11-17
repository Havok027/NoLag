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


class SettingsTests(unittest.TestCase):
    def test_sanitize_defaults_and_types(self):
        self.assertEqual(main.sanitize_settings(None), main.DEFAULTS)
        d = main.sanitize_settings({"language": "xx", "enabled": True, "profile": "stable", "target": "1.1.1.1"})
        self.assertEqual(d, {"language": "pt", "collapsed": {}, "games": {}})  # campos da rota antiga são ignorados
        ok = main.sanitize_settings({"language": "en"})
        self.assertEqual(ok, {"language": "en", "collapsed": {}, "games": {}})

    def test_old_settings_file_keeps_games_and_language(self):
        old = {"language": "es", "enabled": True, "profile": "aggressive",
               "games": {"10": {"name": "Hunt", "auto": True, "profile": "stable", "wifi": True}}}
        d = main.sanitize_settings(old)
        self.assertEqual(d["language"], "es")
        self.assertEqual(d["games"]["10"], {"name": "Hunt", "wifi": True})

    def test_legacy_route_is_gone(self):
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "main.py")
        with open(path, encoding="utf-8") as f:
            src = f.read().lower()
        for word in ("wireguard", "relay", "iptables", "sniff", "teardown", "_monitor", "set_game_auto"):
            self.assertFalse(word in src, word)
        for name in ("get_status", "set_enabled", "get_relays", "add_relay", "remove_relay", "set_game_auto"):
            self.assertFalse(hasattr(main.Plugin, name), name)


class DetectionTests(unittest.TestCase):
    def test_parse_udp_table(self):
        text = (
            "  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode ref pointer drops\n"
            "  10: 0100007F:1F90 00000000:0000 07 00000000:00000000 00:00000000 00000000  1000        0 12345 2 0000000000000000 0\n"
            "  11: 00000000:C350 00000000:0000 07 00000000:00000000 00:00000000 00000000  1000        0 777 2 0000000000000000 0\n"
        )
        self.assertEqual(main.parse_udp_table(text), {12345: 8080, 777: 50000})


if __name__ == "__main__":
    unittest.main()
