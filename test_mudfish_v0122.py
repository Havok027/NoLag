"""v0.12.2: versão dinâmica do núcleo, aviso de atualização, atualização em um clique, túnel só medido com núcleo pronto."""
import os
import shutil
import sys
import tempfile
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_mudfish_mgr import fake_install, make, run  # noqa: E402

import core_state  # noqa: E402
import main  # noqa: E402
import mudfish_mgr  # noqa: E402


class UpdateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.mgr = make(self.tmp)
        fake_install(self.mgr, "5.11.0")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_strict_fetch_has_no_fixed_fallback(self):
        self.mgr._fetch_latest_strict = lambda: ""
        self.assertEqual(self.mgr._fetch_latest(), mudfish_mgr.FALLBACK_VERSION)
        r = run(self.mgr.check_update(force=True))
        self.assertEqual((r["ok"], r["error"]), (False, "update_check_failed"))
        self.assertFalse(r["update"]["available"])

    def test_newer_version_is_announced_with_direct_link(self):
        self.mgr._fetch_latest_strict = lambda: "5.12.0"
        r = run(self.mgr.check_update())
        self.assertTrue(r["ok"] and r["update"]["available"])
        self.assertEqual(r["update"]["latest"], "5.12.0")
        self.assertEqual(r["update"]["url"], mudfish_mgr.RELEASES_URL + "mudfish-5.12.0-linux-x86_64.sh")
        st = run(self.mgr.get_status())
        self.assertTrue(st["update"]["available"])

    def test_same_or_older_version_is_not_an_update(self):
        for latest in ("5.11.0", "5.10.9"):
            self.mgr._fetch_latest_strict = lambda v=latest: v
            self.assertFalse(run(self.mgr.check_update(force=True))["update"]["available"])

    def test_check_is_cached_for_hours(self):
        calls = []
        self.mgr._fetch_latest_strict = lambda: (calls.append(1), "5.12.0")[1]
        run(self.mgr.check_update())
        run(self.mgr.check_update())
        self.assertEqual(len(calls), 1)
        self.mgr._update_at -= mudfish_mgr.UPDATE_TTL + 1
        run(self.mgr.check_update())
        self.assertEqual(len(calls), 2)

    def test_update_core_installs_exactly_the_announced_version(self):
        self.mgr._fetch_latest_strict = lambda: "5.12.0"
        seen = []

        async def fake_install_call(version=None):
            seen.append(version)
            return {"ok": True, "error": "", "version": version}

        self.mgr.install = fake_install_call
        r = run(self.mgr.update_core())
        self.assertEqual(seen, ["5.12.0"])
        self.assertTrue(r["ok"] and r["updated"])

    def test_update_core_does_nothing_when_up_to_date_or_check_fails(self):
        async def boom(version=None):
            raise AssertionError("não deveria instalar")

        self.mgr.install = boom
        self.mgr._fetch_latest_strict = lambda: "5.11.0"
        r = run(self.mgr.update_core())
        self.assertEqual((r["ok"], r["updated"]), (True, False))
        self.mgr._fetch_latest_strict = lambda: ""
        self.assertEqual(run(self.mgr.update_core())["error"], "update_check_failed")

    def test_update_requires_installed_core(self):
        mgr = make(tempfile.mkdtemp())
        self.assertEqual(run(mgr.update_core())["error"], "not_installed")

    def test_explicit_version_never_falls_back_to_fixed_version(self):
        tried = []

        async def fetch(cand, dest):
            tried.append(cand)
            return "sem rede"

        self.mgr._fetch_installer = fetch
        self.mgr._ensure_mount = lambda: _ok()
        r = run(self.mgr.install(version="5.12.0"))
        self.assertEqual(tried, ["5.12.0"])
        self.assertFalse(r["ok"])


async def _ok():
    return True, ""


class LiveGateTests(unittest.TestCase):
    def test_tunnel_not_measured_until_core_is_ready(self):
        tmp = tempfile.mkdtemp()
        mgr = make(tmp)
        saved = (core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev)
        pinged = []

        async def default():
            return "wlan0"

        async def tunnel():
            return "msk"

        async def route(t):
            return {"dev": "wlan0"}

        async def ping(target, count, iface=None):
            pinged.append(iface)
            return {"avg": 20.0, "jitter": 1.0, "loss": 0.0}

        core_state.ping_stats, core_state.route_get = ping, route
        core_state.default_dev, core_state.tunnel_dev = default, tunnel
        mgr._alive = lambda: True
        try:
            mgr.api.last = {"core_ready": False, "client_ready": False}
            live = run(mgr.get_live())
            self.assertTrue(live["tunnel_waiting"])
            self.assertIsNone(live["tunnel"])
            self.assertNotIn("msk", pinged)
            mgr.api.last = {"core_ready": True, "client_ready": True}
            live = run(mgr.get_live())
            self.assertFalse(live["tunnel_waiting"])
            self.assertIn("msk", pinged)
            self.assertIsNotNone(live["tunnel"])
        finally:
            core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev = saved
            shutil.rmtree(tmp, ignore_errors=True)


class ProbeV4Tests(unittest.TestCase):
    def test_keywords_are_capped_per_page_so_one_page_cannot_hide_the_others(self):
        api = mudfish_mgr.MudfishApi()
        busy = "iid " * 50

        def fake(path, follow=True):
            if path == "/":
                return 200, "text/html", busy.encode()
            if path == "/item/list.html":
                return 200, "text/html", b"self.user = response.data.data.user; iid"
            return 200, "text/html", b"{}"

        api._get = fake
        _rows, _found, _reads, snippets, _forms = api.probe()
        pages = {h["in"] for h in snippets["kw:iid"]}
        self.assertIn("/item/list.html", pages)
        self.assertLessEqual(sum(1 for h in snippets["kw:iid"] if h["in"] == "/"), mudfish_mgr.KEYWORD_PER_SOURCE)
        self.assertIn("kw:self.user", snippets)
        for word in ("data.user", "turnOffFullVPN", "updateActiveItems", "newversion"):
            self.assertIn(word, mudfish_mgr.KEYWORD_PROBES)


class RouterTests(unittest.TestCase):
    def test_new_rpcs_exist(self):
        p = main.Plugin()
        for name in ("mudfish_check_update", "mudfish_update"):
            self.assertTrue(callable(getattr(p, name)), name)
        p.mudfish = None
        self.assertEqual(run(p.mudfish_update())["error"], "mudfish_unavailable")


if __name__ == "__main__":
    unittest.main()
