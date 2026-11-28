"""v0.17.2 (ordem invertida na v0.17.4): versão lida da lista de releases com a página de download de reserva, e sem atualização silenciosa."""
import io
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_mudfish_mgr import make, run  # noqa: E402

import mudfish_mgr  # noqa: E402

DOWNLOAD_PAGE = """<a href="https://mudfish.net/download?filename=mudfish-6.7.1-x86_64-win2k-setup.exe">win</a>
<a href="https://mudfish.net/download?filename=mudfish-6.7.1-linux-x86_64.sh">Linux</a>
<a href="https://mudfish.net/download?filename=mudfish-6.7.1-linux-x86_64.sh">SteamOS</a>"""
RELEASES_PAGE = '<a href="mudfish-6.6.4-linux-x86_64.sh">a</a> <a href="mudfish-6.7.1-linux-x86_64.sh">b</a> <a href="mudfish-5.11.0-linux-x86_64.sh">c</a> <a href="mudfish-6.7.1-universal.dmg">mac</a>'


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class LatestVersionTests(unittest.TestCase):
    def test_releases_list_is_the_main_source(self):
        mgr = make(tempfile.mkdtemp())
        seen = []

        def fake_open(req, timeout=0):
            seen.append(req.full_url)
            return _Resp(RELEASES_PAGE.encode())

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", fake_open):
            self.assertEqual(mgr._fetch_latest_strict(), "6.7.1")
        self.assertEqual(seen, [mudfish_mgr.RELEASES_URL])
        self.assertEqual(mgr.latest_error, "")

    def test_download_page_is_used_when_releases_fails_or_has_no_installer(self):
        mgr = make(tempfile.mkdtemp())

        def fake_open(req, timeout=0):
            if req.full_url == mudfish_mgr.RELEASES_URL:
                return _Resp(b"<html>sem links</html>")
            return _Resp(DOWNLOAD_PAGE.encode())

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", fake_open):
            self.assertEqual(mgr._fetch_latest_strict(), "6.7.1")

    def test_both_sources_down_returns_empty_and_keeps_the_reason(self):
        mgr = make(tempfile.mkdtemp())

        def boom(*a, **k):
            raise OSError("sem rede")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", boom):
            self.assertEqual(mgr._fetch_latest_strict(), "")
        self.assertIn(mudfish_mgr.RELEASES_URL, mgr.latest_error)
        self.assertIn(mudfish_mgr.DOWNLOAD_URL, mgr.latest_error)

    def test_failed_check_returns_the_reason_to_the_screen(self):
        mgr = make(tempfile.mkdtemp())
        mgr.installed = lambda: ("6.6.4", "/x")

        def boom(*a, **k):
            raise OSError("sem rede")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", boom):
            r = run(mgr.check_update(force=True))
        self.assertFalse(r["ok"])
        self.assertEqual(r["error"], "update_check_failed")
        self.assertIn("sem rede", r["detail"])

    def test_long_listing_is_read_past_the_old_2mb_limit(self):
        self.assertGreaterEqual(mudfish_mgr.PAGE_MAX, 8_000_000)


class DownloadUrlTests(unittest.TestCase):
    def test_releases_file_first_download_link_second(self):
        self.assertEqual(mudfish_mgr.installer_urls("6.7.1"), [
            "https://mudfish.net/releases/mudfish-6.7.1-linux-x86_64.sh",
            "https://mudfish.net/download?filename=mudfish-6.7.1-linux-x86_64.sh"])
        with self.assertRaises(ValueError):
            mudfish_mgr.installer_urls("6.7")

    def test_falls_back_to_download_link_when_releases_file_is_not_an_installer(self):
        mgr = make(tempfile.mkdtemp())
        dest = os.path.join(tempfile.mkdtemp(), "x.sh")
        seen = []
        good = b"#!/bin/sh\n" + b"0" * mudfish_mgr.MIN_INSTALLER

        def fake_open(req, timeout=0):
            seen.append(req.full_url)
            return _Resp(good if "download?filename" in req.full_url else b"<html>erro</html>")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", fake_open):
            mgr._download("6.7.1", dest)
        self.assertEqual(len(seen), 2)
        self.assertTrue(os.path.isfile(dest))

    def test_error_lists_every_attempt(self):
        mgr = make(tempfile.mkdtemp())

        def boom(*a, **k):
            raise OSError("sem rede")

        with mock.patch.object(mudfish_mgr.urllib.request, "urlopen", boom):
            with self.assertRaises(ValueError) as cm:
                mgr._download("6.7.1", os.path.join(tempfile.mkdtemp(), "x.sh"))
        self.assertIn("/releases/", str(cm.exception))
        self.assertIn("download?filename=", str(cm.exception))


class NoSilentUpdateTests(unittest.TestCase):
    def test_boot_only_checks_never_installs(self):
        mgr = make(tempfile.mkdtemp())
        mgr.installed = lambda: ("6.6.4", "/x")
        calls = []

        async def fake_check(force=False):
            calls.append("check")
            return {"ok": True}

        async def boom(*a, **k):
            raise AssertionError("não deve instalar sozinho")

        mgr.check_update = fake_check
        mgr.update_core = boom
        mgr.install = boom
        run(mgr._check_update_boot())
        self.assertEqual(calls, ["check"])
        self.assertFalse(hasattr(mgr, "_auto_update"))


if __name__ == "__main__":
    unittest.main()
