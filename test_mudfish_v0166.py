"""v0.16.6: atalho do Steam para o painel (especificação por navegador detectado, persistência e filtro de jogo)."""
import asyncio
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import mudfish_mgr  # noqa: E402
import main  # noqa: E402


class SpecTests(unittest.TestCase):
    def test_flatpak_firefox_spec(self):
        spec = mudfish_mgr.launch_spec(["/usr/bin/flatpak", "run", "org.mozilla.firefox"], "firefox")
        self.assertEqual(spec["exe"], "/usr/bin/flatpak")
        self.assertEqual(spec["launch_options"], "run org.mozilla.firefox --kiosk http://127.0.0.1:8282")
        self.assertEqual(spec["start_dir"], "/usr/bin")
        self.assertEqual(spec["name"], "NoLag - Painel Mudfish")

    def test_native_chromium_gets_flags(self):
        spec = mudfish_mgr.launch_spec(["/usr/bin/google-chrome-stable"], "chrome")
        self.assertEqual(spec["launch_options"], "--ozone-platform-hint=auto --new-window --start-fullscreen --window-size=1280,800 http://127.0.0.1:8282")

    def test_flatpak_chromium_flags_after_app_id(self):
        spec = mudfish_mgr.launch_spec(["/var/lib/flatpak/exports/bin/flatpak", "run", "com.brave.Browser"], "brave")
        self.assertTrue(spec["launch_options"].startswith("run com.brave.Browser --ozone-platform-hint=auto"))

    def test_signature_changes_with_browser(self):
        a = mudfish_mgr.launch_spec(["/usr/bin/firefox"], "firefox")["sig"]
        b = mudfish_mgr.launch_spec(["/usr/bin/chromium"], "chromium")["sig"]
        self.assertNotEqual(a, b)
        self.assertEqual(a, mudfish_mgr.launch_spec(["/usr/bin/firefox"], "firefox")["sig"])


class GameIdTests(unittest.TestCase):
    def test_panel_game_id_matches_short_and_64bit(self):
        a = 3000000001
        self.assertTrue(mudfish_mgr.is_panel_game_id(str(a), a))
        self.assertTrue(mudfish_mgr.is_panel_game_id(str((a << 32) | 0x02000000), a))
        self.assertFalse(mudfish_mgr.is_panel_game_id("4242", a))
        self.assertFalse(mudfish_mgr.is_panel_game_id("4242", 0))
        self.assertFalse(mudfish_mgr.is_panel_game_id("abc", a))

    def test_game_id_skips_panel_and_returns_real_game(self):
        import subprocess
        panel = subprocess.Popen(["sleep", "5"], env={"SteamGameId": "777"})
        game = subprocess.Popen(["sleep", "5"], env={"SteamGameId": "4242"})
        self.addCleanup(panel.kill)
        self.addCleanup(game.kill)
        import time
        time.sleep(0.3)  # espera o exec aplicar o ambiente
        skip = lambda v: mudfish_mgr.is_panel_game_id(v, 777)  # noqa: E731
        self.assertEqual(main.game_id([panel.pid, game.pid], skip), "4242")
        self.assertEqual(main.game_id([panel.pid], skip), "")
        self.assertEqual(main.game_id([panel.pid, game.pid]), "777")


class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.mgr = mudfish_mgr.MudfishManager(settings_dir=self.tmp.name, runtime_dir=self.tmp.name)

    def run_(self, coro):
        return asyncio.run(coro)

    def test_default_is_steam_browser(self):
        self.assertEqual(self.run_(self.mgr.panel_launch_spec()), {"ok": True, "steam": True})

    def test_spec_uses_detected_browser(self):
        self.run_(self.mgr.set_panel_browser("firefox"))
        found = {"firefox": ["/usr/bin/flatpak", "run", "org.mozilla.firefox"]}
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value=found):
            spec = self.run_(self.mgr.panel_launch_spec())
        self.assertTrue(spec["ok"])
        self.assertFalse(spec["steam"])
        self.assertEqual(spec["exe"], "/usr/bin/flatpak")
        self.assertIsNone(spec["saved"])

    def test_missing_browser_resets_to_steam(self):
        self.run_(self.mgr.set_panel_browser("brave"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={}):
            spec = self.run_(self.mgr.panel_launch_spec())
        self.assertEqual(spec["error"], "browser_missing")
        self.assertEqual(self.mgr.load()["panel_browser"], "steam_default")

    def test_save_and_clear_shortcut(self):
        self.assertEqual(self.mgr.panel_shortcut_appid(), 0)
        self.assertTrue(self.run_(self.mgr.save_panel_shortcut(3000000001, "abcdef0123456789"))["ok"])
        self.assertEqual(self.mgr.panel_shortcut_appid(), 3000000001)
        self.run_(self.mgr.clear_panel_shortcut())
        self.assertEqual(self.mgr.panel_shortcut_appid(), 0)

    def test_save_rejects_garbage(self):
        for appid, sig in ((0, "abcdef01"), (-1, "abcdef01"), (True, "abcdef01"), ("5", "abcdef01"), (5, "../x"), (2 ** 40, "abcdef01")):
            self.assertFalse(self.run_(self.mgr.save_panel_shortcut(appid, sig))["ok"], (appid, sig))
        self.assertEqual(self.mgr.panel_shortcut_appid(), 0)

    def test_sanitize_keeps_valid_shortcut_only(self):
        self.assertEqual(mudfish_mgr.sanitize_settings({"panel_shortcut": {"appid": 5, "sig": "abcdef01"}})["panel_shortcut"], {"appid": 5, "sig": "abcdef01"})
        self.assertIsNone(mudfish_mgr.sanitize_settings({"panel_shortcut": "x"})["panel_shortcut"])
        self.assertIsNone(mudfish_mgr.sanitize_settings(None)["panel_shortcut"])


if __name__ == "__main__":
    unittest.main()
