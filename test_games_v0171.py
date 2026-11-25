"""v0.17.1: nome real do jogo (vindo do Steam pelo frontend) no lugar do nome do processo."""
import asyncio
import logging
import os
import sys
import tempfile
import types
import unittest
from unittest import mock

sys.modules.setdefault(
    "decky",
    types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-test"),
    ),
)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import main  # noqa: E402


def reset():
    main._save(main.sanitize_settings(None))


class GameNameTests(unittest.TestCase):
    def setUp(self):
        reset()

    def test_saved_profile_name_is_replaced(self):
        plugin = main.Plugin()
        main._save(main.sanitize_settings({"games": {"594650": {"name": "Main", "wifi": True}}}))
        out = asyncio.run(plugin.set_game_name("594650", "Hunt: Showdown 1896"))
        self.assertEqual(out["games"]["594650"]["name"], "Hunt: Showdown 1896")
        self.assertTrue(out["games"]["594650"]["wifi"])
        self.assertEqual(main._load()["games"]["594650"]["name"], "Hunt: Showdown 1896")

    def test_unsaved_game_is_not_created_but_name_is_used_for_detection(self):
        plugin = main.Plugin()
        out = asyncio.run(plugin.set_game_name("594650", "Hunt: Showdown 1896"))
        self.assertEqual(out["games"], {})
        with mock.patch.object(main, "find_game_pids", return_value=[1]), \
                mock.patch.object(main, "game_id", return_value="594650"), \
                mock.patch.object(main, "game_ports", return_value=([], "Main")):
            self.assertEqual(asyncio.run(plugin._detect_game()), ("594650", "Hunt: Showdown 1896"))

    def test_without_real_name_the_process_name_is_still_the_fallback(self):
        plugin = main.Plugin()
        with mock.patch.object(main, "find_game_pids", return_value=[1]), \
                mock.patch.object(main, "game_id", return_value="594650"), \
                mock.patch.object(main, "game_ports", return_value=([], "Main")):
            self.assertEqual(asyncio.run(plugin._detect_game()), ("594650", "Main"))

    def test_invalid_input_is_ignored(self):
        plugin = main.Plugin()
        main._save(main.sanitize_settings({"games": {"1": {"name": "Velho"}}}))
        for appid, name in (("abc", "X"), ("1", ""), ("1", "   "), ("1", "1"), ("1", 5), (7, "X")):
            asyncio.run(plugin.set_game_name(appid, name))
        self.assertEqual(main._load()["games"]["1"]["name"], "Velho")
        self.assertEqual(plugin.game_names, {})

    def test_name_is_cleaned_and_truncated(self):
        plugin = main.Plugin()
        main._save(main.sanitize_settings({"games": {"1": {"name": "Velho"}}}))
        out = asyncio.run(plugin.set_game_name("1", "A\nB" + "x" * 80))
        self.assertLessEqual(len(out["games"]["1"]["name"]), 40)
        self.assertNotIn("\n", out["games"]["1"]["name"])


if __name__ == "__main__":
    unittest.main()
