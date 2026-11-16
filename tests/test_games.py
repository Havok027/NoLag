import asyncio
import logging
import os
import subprocess
import sys
import tempfile
import time
import types
import unittest

sys.modules.setdefault(
    "decky",
    types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-test"),
    ),
)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main  # noqa: E402


def reset():
    main._save(main.sanitize_settings(None))


class CleanGamesTests(unittest.TestCase):
    def test_keeps_valid_and_drops_bad(self):
        out = main.clean_games({
            "123": {"name": "Hunt", "wifi": True, "mudfish": True},
            "abc": {"name": "x"},
            "456": {"name": "", "wifi": "yes"},
            "789": "texto",
        })
        self.assertEqual(out["123"], {"name": "Hunt", "wifi": True, "mudfish": True})
        self.assertEqual(out["456"], {"name": "456"})
        self.assertEqual(set(out), {"123", "456"})

    def test_limit_and_type(self):
        many = {str(i): {"name": "g"} for i in range(main.MAX_GAMES + 20)}
        self.assertEqual(len(main.clean_games(many)), main.MAX_GAMES)
        self.assertEqual(main.clean_games("x"), {})

    def test_sanitize_includes_games(self):
        d = main.sanitize_settings({"games": {"1": {"name": "A", "mudfish": True}}})
        self.assertTrue(d["games"]["1"]["mudfish"])
        self.assertEqual(main.sanitize_settings(None)["games"], {})


class GameIdTests(unittest.TestCase):
    def test_reads_steam_game_id(self):
        proc = subprocess.Popen(["sleep", "5"], env={"SteamGameId": "4242"})
        try:
            time.sleep(0.2)
            self.assertEqual(main.game_id([proc.pid]), "4242")
        finally:
            proc.kill()
            proc.wait()

    def test_ignores_bad_values(self):
        proc = subprocess.Popen(["sleep", "5"], env={"SteamGameId": "0"})
        try:
            time.sleep(0.2)
            self.assertEqual(main.game_id([proc.pid]), "")
            self.assertEqual(main.game_id([]), "")
        finally:
            proc.kill()
            proc.wait()


class LifecycleTests(unittest.TestCase):
    def setUp(self):
        reset()

    def tearDown(self):
        reset()

    def test_delete_game(self):
        data = main._load()
        data["games"] = {"777": {"name": "Hunt", "wifi": True}}
        main._save(data)
        plugin = main.Plugin()
        out = asyncio.run(plugin.delete_game("777"))
        self.assertEqual(out["games"], {})
        self.assertEqual(main._load()["games"], {})

    def test_set_settings_only_language_and_collapsed(self):
        plugin = main.Plugin()
        out = asyncio.run(plugin.set_settings({"language": "en", "collapsed": {"mudfishAdv": False, "evil": True},
                                                "enabled": True, "profile": "stable"}))
        self.assertEqual(out["language"], "en")
        self.assertEqual(out["collapsed"], {"mudfishAdv": False})
        self.assertNotIn("enabled", out)
        self.assertNotIn("profile", out)


if __name__ == "__main__":
    unittest.main()
