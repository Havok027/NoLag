"""v0.14.0: URL do instalador resolvida dinamicamente (sem versão fixa) e desinstalação completa do Mudfish."""
import io
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_mudfish_mgr import fake_install, make, run  # noqa: E402

import mudfish_mgr  # noqa: E402

PAGE = """<a href="mudfish-5.11.0-linux-x86_64.sh">a</a> <a href="mudfish-6.6.4-linux-x86_64.sh">b</a>
<a href="mudfish-10.0.1-linux-x86_64.sh">c</a> <a href="mudfish-9.9.9-windows-x86_64.exe">w</a>
<a href="mudfish-12.0.0-linux-arm64.sh">arm</a>"""


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


async def _ok():
    return True, ""


class DynamicUrlTests(unittest.TestCase):
    def test_installer_url_follows_the_version(self):
        self.assertEqual(mudfish_mgr.installer_url("6.6.4"), "https://mudfish.net/releases/mudfish-6.6.4-linux-x86_64.sh")
        self.assertEqual(mudfish_mgr.installer_url("7.1.0"), mudfish_mgr.RELEASES_URL + "mudfish-7.1.0-linux-x86_64.sh")
        for bad in ("", "6.6", "6.6.4/../x", None, "latest"):
            with self.assertRaises(ValueError):
                mudfish_mgr.installer_url(bad)

    def test_no_fixed_old_version_in_the_download_path(self):
        self.assertEqual(mudfish_mgr.FALLBACK_VERSION, "6.6.4")
        self.assertNotIn("5.11.0", mudfish_mgr.INSTALLER)
        self.assertNotIn("5.11.0", mudfish_mgr.RELEASES_URL)

    def test_release_page_picks_highest_linux_x86_64_numerically(self):
        self.assertEqual(mudfish_mgr.parse_release_versions(PAGE), ["5.11.0", "6.6.4", "10.0.1"])

    def test_latest_is_scraped_from_the_releases_page(self):
        mgr = make(tempfile.mkdtemp())
        seen = []

        def fake_open(req, timeout=0):
            seen.append(req.full_url)
            return _Resp(PAGE.encode())

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", fake_open):
            self.assertEqual(mgr._fetch_latest_strict(), "10.0.1")
            self.assertEqual(mgr._fetch_latest(), "10.0.1")
        self.assertEqual(seen[0], mudfish_mgr.RELEASES_URL)

    def test_failed_lookup_uses_safe_fallback_not_5_11_0(self):
        mgr = make(tempfile.mkdtemp())

        def boom(*a, **k):
            raise OSError("sem rede")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", boom):
            self.assertEqual(mgr._fetch_latest_strict(), "")
            self.assertEqual(mgr._fetch_latest(), "6.6.4")

    def test_fresh_install_downloads_latest_then_fallback(self):
        mgr = make(tempfile.mkdtemp())
        mgr._fetch_latest = lambda: "7.0.0"
        mgr._ensure_mount = lambda: _ok()
        tried = []

        async def fetch(cand, dest):
            tried.append(cand)
            return "sem rede"

        mgr._fetch_installer = fetch
        r = run(mgr.install())
        self.assertEqual(tried, ["7.0.0", "6.6.4"])
        self.assertEqual(r["error"], "download_failed")

    def test_download_requests_the_resolved_url(self):
        mgr = make(tempfile.mkdtemp())
        seen = []

        def fake_open(req, timeout=0):
            seen.append(req.full_url)
            raise OSError("parar aqui")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", fake_open):
            with self.assertRaises(ValueError):
                mgr._download("7.0.0", os.path.join(tempfile.mkdtemp(), "x.sh"))
        self.assertEqual(seen, ["https://mudfish.net/releases/mudfish-7.0.0-linux-x86_64.sh"])

    def test_status_shows_installed_and_latest_versions(self):
        mgr = make(tempfile.mkdtemp())
        fake_install(mgr, "6.6.4")
        mgr._fetch_latest_strict = lambda: "6.7.0"
        run(mgr.check_update(force=True))
        st = run(mgr.get_status())
        self.assertEqual((st["version"], st["update"]["latest"], st["update"]["available"]), ("6.6.4", "6.7.0", True))
        self.assertEqual(st["update"]["url"], mudfish_mgr.installer_url("6.7.0"))


class UninstallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.mgr = make(self.tmp)
        fake_install(self.mgr, "6.6.4")
        for path in (self.mgr.log_path, self.mgr.install_log_path, os.path.join(self.mgr.runtime_dir, "mudfish-api.json"),
                     os.path.join(self.mgr.runtime_dir, "mudfish-6.6.4-linux-x86_64.sh.part")):
            with open(path, "w") as f:
                f.write("x")
        os.makedirs(os.path.join(self.mgr.runtime_dir, "tmp"))
        self.mgr.save({"login_done": True, "keep_on": True, "auto_on_game": True, "user": "u", "password": "p"})

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_find_mudfish_pids_matches_only_mudfish_processes(self):
        proc = tempfile.mkdtemp()
        for pid, argv in (("101", b"/opt/mudfish/6.6.4/bin/mudflow\0--x\0"), ("102", b"/usr/bin/python3\0a\0"),
                          ("103", b"mudrun\0"), ("104", b"/opt/mudfish/bin/mudrun-headless\0"), ("105", b"/opt/mudfish/bin/mudfish\0"),
                          ("106", b"/bin/mudfishx\0")):
            os.makedirs(os.path.join(proc, pid))
            with open(os.path.join(proc, pid, "cmdline"), "wb") as f:
                f.write(argv)
        self.assertEqual(sorted(mudfish_mgr.find_mudfish_pids(proc, own=0)), [101, 103, 104, 105])
        self.assertEqual(sorted(mudfish_mgr.find_mudfish_pids(proc, own=103)), [101, 104, 105])

    def test_removes_install_mount_logs_and_leftovers(self):
        r = run(self.mgr.uninstall())
        self.assertTrue(r["ok"], r)
        self.assertFalse(os.path.exists(self.mgr.store))
        self.assertFalse(os.path.lexists(self.mgr.mount_point))
        for name in ("mudfish.log", "mudfish-install.log", "mudfish-api.json", "tmp", "mudfish-6.6.4-linux-x86_64.sh.part"):
            self.assertFalse(os.path.exists(os.path.join(self.mgr.runtime_dir, name)), name)
        st = run(self.mgr.get_status())
        self.assertFalse(st["installed"])
        self.assertEqual(st["step"], "install")
        self.assertEqual(self.mgr.phase, "off")

    def test_keeps_preferences_but_clears_account_and_keep_on(self):
        run(self.mgr.uninstall())
        cfg = self.mgr.load()
        self.assertEqual((cfg["user"], cfg["password"], cfg["login_done"], cfg["keep_on"]), ("", "", False, False))
        self.assertNotIn("auto_on_game", cfg)

    def test_stops_every_mudfish_process(self):
        exe = os.path.join(self.tmp, "mudflow")  # só o argv[0] importa; o binário é o Python (o coreutils novo recusa nomes alheios)
        p = subprocess.Popen([exe, "-c", "import time; time.sleep(30)"], executable=sys.executable)
        try:
            for _ in range(40):  # espera o exec: logo após o Popen o cmdline ainda é o do processo pai
                if p.pid in mudfish_mgr.find_mudfish_pids():
                    break
                time.sleep(0.05)
            self.assertIn(p.pid, mudfish_mgr.find_mudfish_pids())
            r = run(self.mgr.uninstall())
            self.assertTrue(r["ok"], r)
            p.wait(timeout=5)
            self.assertIsNotNone(p.returncode)
        finally:
            if p.poll() is None:
                p.kill()

    def test_reports_failure_when_a_process_survives(self):
        async def noop():
            return None

        self.mgr._kill_all_mudfish = noop
        with mock.patch.object(mudfish_mgr, "find_mudfish_pids", lambda *a, **k: [4242]):
            r = run(self.mgr.uninstall())
        self.assertEqual((r["ok"], r["error"]), (False, "uninstall_failed"))

    def test_uninstall_is_refused_while_busy(self):
        async def go():
            async with self.mgr.lock:
                return await self.mgr.uninstall()

        self.assertEqual(run(go())["error"], "busy")
        self.assertTrue(os.path.exists(self.mgr.store))

    def test_can_reinstall_flow_after_uninstall(self):
        run(self.mgr.uninstall())
        self.mgr._fetch_latest = lambda: "6.6.4"
        self.mgr._ensure_mount = lambda: _ok()
        tried = []

        async def fetch(cand, dest):
            tried.append(cand)
            return "sem rede"

        self.mgr._fetch_installer = fetch
        self.assertEqual(run(self.mgr.install())["error"], "download_failed")
        self.assertEqual(tried, ["6.6.4"])

    def test_main_exposes_uninstall(self):
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "main.py"), encoding="utf-8") as f:
            src = f.read()
        self.assertIn("async def mudfish_uninstall", src)
        self.assertIn('_mudfish_call("uninstall")', src)


if __name__ == "__main__":
    unittest.main()
