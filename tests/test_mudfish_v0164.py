"""v0.16.4: ambiente gráfico detectado, flags Chromium e diagnóstico de falha ao abrir o navegador externo."""
import asyncio
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import mudfish_mgr  # noqa: E402

URL = "http://127.0.0.1:8282"


class EnvTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = os.path.join(self.tmp.name, "run")
        self.x11 = os.path.join(self.tmp.name, "x11")
        os.makedirs(os.path.join(self.root, "1000"))
        os.makedirs(self.x11)

    def touch(self, *parts):
        open(os.path.join(*parts), "w").close()

    def env(self, **kw):
        return mudfish_mgr.session_env(1000, "/home/deck", self.root, self.x11, environ=kw.get("environ", {}))

    def test_wayland_prefers_gamescope_then_wayland0_then_wayland1(self):
        self.assertNotIn("WAYLAND_DISPLAY", self.env())
        self.touch(self.root, "1000", "wayland-1")
        self.assertEqual(self.env()["WAYLAND_DISPLAY"], "wayland-1")
        self.touch(self.root, "1000", "wayland-0")
        self.assertEqual(self.env()["WAYLAND_DISPLAY"], "wayland-0")
        self.touch(self.root, "1000", "gamescope-0")
        self.assertEqual(self.env()["WAYLAND_DISPLAY"], "gamescope-0")

    def test_dbus_runtime_and_home(self):
        e = self.env()
        self.assertEqual(e["DBUS_SESSION_BUS_ADDRESS"], "unix:path=%s/1000/bus" % self.root)
        self.assertEqual(e["XDG_RUNTIME_DIR"], os.path.join(self.root, "1000"))
        self.assertEqual(e["HOME"], "/home/deck")

    def test_display_from_active_x11_sockets_lowest_first(self):
        self.touch(self.x11, "X1")
        self.assertEqual(self.env()["DISPLAY"], ":1")
        self.touch(self.x11, "X0")
        self.assertEqual(self.env()["DISPLAY"], ":0")
        self.touch(self.x11, "X11-lock")  # ruído ignorado
        self.assertEqual(self.env()["DISPLAY"], ":0")

    def test_display_fallbacks(self):
        self.assertEqual(self.env(environ={"DISPLAY": ":7"})["DISPLAY"], ":7")
        self.assertEqual(self.env()["DISPLAY"], ":0")
        self.assertEqual(mudfish_mgr.detect_x_display(os.path.join(self.tmp.name, "nope")), "")


class CommandTests(unittest.TestCase):
    def test_chromium_family_gets_flags_before_url(self):
        for bid in mudfish_mgr.CHROMIUM_IDS:
            cmd, _ = mudfish_mgr.browser_command(["/usr/bin/x"], is_root=False, browser=bid)
            self.assertEqual(cmd, ["/usr/bin/x", "--ozone-platform-hint=auto", "--new-window", URL], bid)

    def test_firefox_and_unknown_get_no_flags(self):
        cmd, _ = mudfish_mgr.browser_command(["/usr/bin/firefox"], is_root=False, browser="firefox")
        self.assertEqual(cmd, ["/usr/bin/firefox", URL])

    def test_flatpak_as_root_receives_full_env_via_runuser(self):
        with tempfile.TemporaryDirectory() as d:
            root, x11 = os.path.join(d, "run"), os.path.join(d, "x11")
            os.makedirs(os.path.join(root, "1000"))
            os.makedirs(x11)
            open(os.path.join(root, "1000", "gamescope-0"), "w").close()
            open(os.path.join(x11, "X0"), "w").close()
            with mock.patch("shutil.which", return_value="/usr/bin/runuser"):
                cmd, env = mudfish_mgr.browser_command(["/usr/bin/flatpak", "run", "com.google.Chrome"], user="deck", uid=1000,
                                                       is_root=True, browser="chrome", home="/home/deck",
                                                       runtime_root=root, x11_dir=x11)
        self.assertEqual(cmd[:5], ["runuser", "-u", "deck", "--", "env"])
        for item in ("DISPLAY=:0", "WAYLAND_DISPLAY=gamescope-0", "XDG_RUNTIME_DIR=%s/1000" % root,
                     "DBUS_SESSION_BUS_ADDRESS=unix:path=%s/1000/bus" % root, "HOME=/home/deck"):
            self.assertIn(item, cmd)
        self.assertEqual(cmd[-6:], ["/usr/bin/flatpak", "run", "com.google.Chrome", "--ozone-platform-hint=auto", "--new-window", URL])
        self.assertEqual(env["WAYLAND_DISPLAY"], "gamescope-0")


class LaunchDiagnosticTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.mgr = mudfish_mgr.MudfishManager(settings_dir=self.tmp.name, runtime_dir=self.tmp.name)
        asyncio.run(self.mgr.set_panel_browser("chrome"))
        p = mock.patch.object(mudfish_mgr, "LAUNCH_WAIT", 0)
        p.start()
        self.addCleanup(p.stop)
        p = mock.patch.object(mudfish_mgr, "detect_browsers", return_value={"chrome": ["/usr/bin/google-chrome-stable"]})
        p.start()
        self.addCleanup(p.stop)

    def launch(self, popen):
        with mock.patch("subprocess.Popen", popen):
            return asyncio.run(self.mgr.open_panel_browser())

    def test_still_running_is_success(self):
        proc = mock.Mock()
        proc.poll.return_value = None
        r = self.launch(mock.Mock(return_value=proc))
        self.assertEqual(r, {"ok": True, "external": True})

    def test_handoff_exit_zero_is_success(self):
        proc = mock.Mock()
        proc.poll.return_value = 0
        self.assertEqual(self.launch(mock.Mock(return_value=proc))["ok"], True)

    def test_early_nonzero_exit_returns_stderr(self):
        def fake(cmd, **kw):
            kw["stderr"].write(b"Authorization required\nCannot open display\n")
            kw["stderr"].flush()
            proc = mock.Mock()
            proc.poll.return_value = 1
            return proc
        r = self.launch(fake)
        self.assertFalse(r["ok"])
        self.assertEqual(r["error"], "browser_launch_failed")
        self.assertIn("Cannot open display", r["detail"])
        self.assertTrue(r["detail"].startswith("Authorization required"), "começo da saída primeiro")
        log = open(os.path.join(self.tmp.name, mudfish_mgr.LAUNCH_LOG), encoding="utf-8").read()
        self.assertIn("comando: ", log)
        self.assertIn("código de saída: 1", log)
        self.assertIn("DISPLAY=", log)
        self.assertIn("Cannot open display", log)
        self.assertFalse(r["external"])

    def test_early_exit_without_stderr_reports_code(self):
        proc = mock.Mock()
        proc.poll.return_value = 127
        r = self.launch(mock.Mock(return_value=proc))
        self.assertFalse(r["ok"])
        self.assertIn("127", r["detail"])

    def test_launch_uses_flags_and_session_env(self):
        proc = mock.Mock()
        proc.poll.return_value = None
        popen = mock.Mock(return_value=proc)
        self.launch(popen)
        args, kw = popen.call_args
        self.assertIn("--ozone-platform-hint=auto", args[0])
        self.assertEqual(args[0][-1], URL)
        self.assertIn("DISPLAY", kw["env"])
        self.assertTrue(kw["start_new_session"])


if __name__ == "__main__":
    unittest.main()
