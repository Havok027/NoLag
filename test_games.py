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
            "123": {"name": "Hunt", "auto": True, "profile": "stable"},
            "abc": {"name": "x", "auto": True},
            "456": {"name": "", "auto": "yes", "profile": "nope"},
            "789": "texto",
        })
        self.assertEqual(out["123"], {"name": "Hunt", "auto": True, "profile": "stable"})
        self.assertEqual(out["456"], {"name": "456", "auto": False, "profile": "balanced"})
        self.assertEqual(set(out), {"123", "456"})

    def test_limit_and_type(self):
        many = {str(i): {"name": "g", "auto": True, "profile": "balanced"} for i in range(main.MAX_GAMES + 20)}
        self.assertEqual(len(main.clean_games(many)), main.MAX_GAMES)
        self.assertEqual(main.clean_games("x"), {})

    def test_sanitize_includes_games(self):
        d = main.sanitize_settings({"games": {"1": {"name": "A", "auto": True, "profile": "aggressive"}}})
        self.assertEqual(d["games"]["1"]["profile"], "aggressive")
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
        self.saved = (main.WATCH_DELAY, main.WATCH_INTERVAL, main.find_game_pids, main.game_id)
        main.WATCH_DELAY, main.WATCH_INTERVAL = 0, 0.01

    def tearDown(self):
        main.WATCH_DELAY, main.WATCH_INTERVAL, main.find_game_pids, main.game_id = self.saved
        reset()

    def test_watcher_turns_on_for_auto_game(self):
        data = main._load()
        data["games"] = {"777": {"name": "Hunt", "auto": True, "profile": "stable"}}
        main._save(data)
        main.find_game_pids = lambda: [1]
        main.game_id = lambda pids: "777"
        plugin = main.Plugin()
        started = []
        plugin._start = lambda: started.append(True)
        asyncio.run(plugin._watch())
        self.assertTrue(main._load()["enabled"])
        self.assertEqual(started, [True])
        self.assertFalse(plugin.manual)

    def test_watcher_ignores_game_without_auto(self):
        data = main._load()
        data["games"] = {"777": {"name": "Hunt", "auto": False, "profile": "stable"}}
        main._save(data)
        main.find_game_pids = lambda: [1]
        main.game_id = lambda pids: "777"
        plugin = main.Plugin()
        plugin._start = lambda: self.fail("não deveria ligar")

        async def run():
            task = asyncio.ensure_future(plugin._watch())
            await asyncio.sleep(0.1)
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        asyncio.run(run())
        self.assertFalse(main._load()["enabled"])

    def test_turning_off_in_game_disables_auto(self):
        data = main._load()
        data["enabled"] = True
        data["games"] = {"777": {"name": "Hunt", "auto": True, "profile": "balanced"}}
        main._save(data)
        plugin = main.Plugin()
        plugin.status["appid"] = "777"
        plugin._begin_watch = lambda force=False: None

        async def run():
            await plugin.set_enabled(False)

        asyncio.run(run())
        now = main._load()
        self.assertFalse(now["enabled"])
        self.assertFalse(now["games"]["777"]["auto"])

    def test_profile_change_inside_saved_game_is_per_game(self):
        data = main._load()
        data["games"] = {"777": {"name": "Hunt", "auto": True, "profile": "balanced"}}
        main._save(data)
        plugin = main.Plugin()
        plugin.status["appid"] = "777"
        asyncio.run(plugin.set_settings({"profile": "aggressive"}))
        now = main._load()
        self.assertEqual(now["games"]["777"]["profile"], "aggressive")
        self.assertEqual(now["profile"], "balanced")

    def test_set_game_auto_and_delete(self):
        data = main._load()
        data["games"] = {"1": {"name": "A", "auto": True, "profile": "balanced"}}
        main._save(data)
        plugin = main.Plugin()
        plugin._begin_watch = lambda force=False: None
        out = asyncio.run(plugin.set_game_auto("1", False))
        self.assertFalse(out["games"]["1"]["auto"])
        out = asyncio.run(plugin.delete_game("1"))
        self.assertEqual(out["games"], {})
        asyncio.run(plugin.delete_game(5))

    def test_monitor_disables_on_exit_and_saves_profile(self):
        data = main._load()
        data["enabled"] = True
        main._save(data)
        calls = iter([[1], []])
        orig = (main.shutil.which, main.load_relays, main.load_public_relays, main.teardown,
                main.game_ports, main.sniff, main.apply_route)

        async def noop(*a, **k):
            return True

        main.shutil.which = lambda t: "/usr/bin/" + t
        main.load_relays = lambda: []
        main.load_public_relays = lambda: []
        main.teardown = noop
        main.find_game_pids = lambda: next(calls)
        main.game_id = lambda pids: "777"
        main.game_ports = lambda pids: ([5000], "Hunt")
        main.sniff = lambda ports, seconds, stats=None: {}
        main.apply_route = noop
        plugin = main.Plugin()
        plugin.manual = True
        watched = []
        plugin._begin_watch = lambda force=False: watched.append(force)
        try:
            asyncio.run(plugin._monitor())
        finally:
            (main.shutil.which, main.load_relays, main.load_public_relays, main.teardown,
             main.game_ports, main.sniff, main.apply_route) = orig
        now = main._load()
        self.assertFalse(now["enabled"])
        self.assertEqual(now["games"]["777"], {"name": "Hunt", "auto": True, "profile": "balanced"})
        self.assertEqual(plugin.status["phase"], "off")
        self.assertEqual(watched, [True])


if __name__ == "__main__":
    unittest.main()
