"""v0.16.3: seletor de navegador do painel (detecção, sanitização e lançamento)."""
import asyncio
import os
import stat
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import mudfish_mgr  # noqa: E402


def _exe(d, name):
    p = os.path.join(d, name)
    with open(p, "w") as f:
        f.write("#!/bin/sh\n")
    os.chmod(p, os.stat(p).st_mode | stat.S_IXUSR)
    return p


class DetectTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.bin = os.path.join(self.tmp.name, "bin")
        self.apps = os.path.join(self.tmp.name, "apps")
        os.makedirs(self.bin)
        os.makedirs(self.apps)

    def kw(self):
        return dict(exports=[self.apps], bin_dirs=[self.bin], path_env="", home=self.tmp.name)

    def test_only_steam_when_nothing_installed(self):
        self.assertEqual(mudfish_mgr.list_browsers(**self.kw()), [{"id": "steam_default", "name": "Steam"}])

    def test_native_binaries_detected(self):
        _exe(self.bin, "firefox")
        _exe(self.bin, "google-chrome-stable")
        out = mudfish_mgr.list_browsers(**self.kw())
        self.assertEqual(out[0]["id"], "steam_default")
        self.assertEqual([b["id"] for b in out[1:]], ["chrome", "firefox"])
        self.assertEqual(out[1]["name"], "Google Chrome")

    def test_flatpak_detected_via_desktop_file(self):
        _exe(self.bin, "flatpak")
        open(os.path.join(self.apps, "com.brave.Browser.desktop"), "w").close()
        found = mudfish_mgr.detect_browsers(**self.kw())
        self.assertEqual(found["brave"], [os.path.join(self.bin, "flatpak"), "run", "com.brave.Browser"])

    def test_flatpak_without_flatpak_binary_is_ignored(self):
        open(os.path.join(self.apps, "com.brave.Browser.desktop"), "w").close()
        self.assertNotIn("brave", mudfish_mgr.detect_browsers(**self.kw()))

    def test_user_flatpak_dir_uses_home(self):
        _exe(self.bin, "flatpak")
        d = os.path.join(self.tmp.name, ".local/share/flatpak/exports/share/applications")
        os.makedirs(d)
        open(os.path.join(d, "org.mozilla.firefox.desktop"), "w").close()
        found = mudfish_mgr.detect_browsers(exports=["~/.local/share/flatpak/exports/share/applications"], bin_dirs=[self.bin], path_env="", home=self.tmp.name)
        self.assertIn("firefox", found)


class SanitizeTests(unittest.TestCase):
    def test_clean_browser(self):
        self.assertEqual(mudfish_mgr.clean_browser("firefox"), "firefox")
        for bad in (None, 5, "", "steam_default", "rm -rf /", "../x", "Firefox", "unknown"):
            self.assertEqual(mudfish_mgr.clean_browser(bad), "steam_default")

    def test_settings_default_and_sanitized(self):
        self.assertEqual(mudfish_mgr.sanitize_settings(None)["panel_browser"], "steam_default")
        self.assertEqual(mudfish_mgr.sanitize_settings({"panel_browser": "edge"})["panel_browser"], "edge")
        self.assertEqual(mudfish_mgr.sanitize_settings({"panel_browser": "; reboot"})["panel_browser"], "steam_default")


class CommandTests(unittest.TestCase):
    def test_plain_command_appends_fixed_url(self):
        cmd, env = mudfish_mgr.browser_command(["/usr/bin/firefox"], is_root=False)
        self.assertEqual(cmd, ["/usr/bin/firefox", "http://127.0.0.1:8282"])
        self.assertIn("DISPLAY", env)

    def test_root_runs_as_session_user_with_display_env(self):
        with mock.patch("shutil.which", return_value="/usr/bin/runuser"), mock.patch.dict(os.environ, {"DISPLAY": ":1"}, clear=False):
            cmd, env = mudfish_mgr.browser_command(["flatpak", "run", "org.mozilla.firefox"], user="deck", uid=1000, is_root=True)
        self.assertEqual(cmd[:5], ["runuser", "-u", "deck", "--", "env"])
        self.assertIn("DISPLAY=:1", cmd)
        self.assertEqual(cmd[-4:-1], ["flatpak", "run", "org.mozilla.firefox"])
        self.assertEqual(cmd[-1], "http://127.0.0.1:8282")


class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.mgr = mudfish_mgr.MudfishManager(settings_dir=self.tmp.name, runtime_dir=self.tmp.name)

    def run_(self, coro):
        return asyncio.run(coro)

    def test_default_does_not_launch(self):
        with mock.patch("subprocess.Popen") as popen:
            r = self.run_(self.mgr.open_panel_browser())
        self.assertEqual(r, {"ok": True, "external": False})
        popen.assert_not_called()

    def test_launch_detached_with_mock(self):
        self.run_(self.mgr.set_panel_browser("firefox"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={"firefox": ["/usr/bin/firefox"]}), \
                mock.patch("subprocess.Popen") as popen:
            r = self.run_(self.mgr.open_panel_browser())
        self.assertEqual(r, {"ok": True, "external": True})
        args, kw = popen.call_args
        self.assertEqual(args[0][-1], "http://127.0.0.1:8282")
        self.assertTrue(kw["start_new_session"])
        self.assertIn("DISPLAY", kw["env"])

    def test_missing_browser_falls_back_and_resets_setting(self):
        self.run_(self.mgr.set_panel_browser("brave"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={}), mock.patch("subprocess.Popen") as popen:
            r = self.run_(self.mgr.open_panel_browser())
        self.assertFalse(r["ok"])
        self.assertEqual(r["error"], "browser_missing")
        popen.assert_not_called()
        self.assertEqual(self.mgr.load()["panel_browser"], "steam_default")

    def test_launch_failure_reports_error(self):
        self.run_(self.mgr.set_panel_browser("edge"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={"edge": ["/x/edge"]}), \
                mock.patch("subprocess.Popen", side_effect=OSError("boom")):
            r = self.run_(self.mgr.open_panel_browser())
        self.assertFalse(r["ok"])
        self.assertEqual(r["error"], "browser_launch_failed")

    def test_list_resets_uninstalled_selection(self):
        self.run_(self.mgr.set_panel_browser("chrome"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={"firefox": ["/usr/bin/firefox"]}):
            r = self.run_(self.mgr.list_browsers())
        self.assertEqual(r["selected"], "steam_default")
        self.assertEqual([b["id"] for b in r["browsers"]], ["steam_default", "firefox"])
        self.assertEqual(self.mgr.load()["panel_browser"], "steam_default")

    def test_list_keeps_installed_selection(self):
        self.run_(self.mgr.set_panel_browser("firefox"))
        with mock.patch.object(mudfish_mgr, "detect_browsers", return_value={"firefox": ["/usr/bin/firefox"]}):
            r = self.run_(self.mgr.list_browsers())
        self.assertEqual(r["selected"], "firefox")

    def test_set_rejects_garbage(self):
        r = self.run_(self.mgr.set_panel_browser("$(evil)"))
        self.assertEqual(r["selected"], "steam_default")


if __name__ == "__main__":
    unittest.main()
