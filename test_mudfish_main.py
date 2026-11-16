import asyncio
import logging
import os
import sys
import tempfile
import types
import unittest

if "decky" not in sys.modules:
    sys.modules["decky"] = types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-mudmain-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main  # noqa: E402


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def read(name):
    for d in (ROOT, os.path.dirname(os.path.abspath(__file__))):
        p = os.path.join(d, name)
        if os.path.exists(p):
            return open(p, encoding="utf-8").read()
    raise FileNotFoundError(name)


class GamesTests(unittest.TestCase):
    def test_game_flags_are_kept_and_sanitized(self):
        g = main.clean_games({"10": {"name": "A", "auto": True, "profile": "stable", "wifi": True, "mudfish": "sim"}})  # auto/profile antigos caem
        self.assertTrue(g["10"]["wifi"])
        self.assertNotIn("mudfish", g["10"])
        old = main.clean_games({"11": {"name": "B", "auto": False, "profile": "balanced"}})
        self.assertEqual(old["11"], {"name": "B"})  # perfis antigos continuam válidos, sem os campos da rota

    def test_sections_for_new_ui(self):
        for k in ("mudfishMain", "mudfishAdv", "mudfishLogs", "conn"):
            self.assertIn(k, main.SECTIONS)

    def test_set_game_module_creates_and_updates(self):
        p = main.Plugin()
        d = run(p.set_game_module("42", "mudfish", True))
        self.assertTrue(d["games"]["42"]["mudfish"])
        self.assertFalse(d["games"]["42"].get("wifi", False))
        d = run(p.set_game_module("42", "wifi", True))
        self.assertTrue(d["games"]["42"]["wifi"] and d["games"]["42"]["mudfish"])
        d = run(p.set_game_module("42", "mudfish", False))
        self.assertTrue(d["games"]["42"]["wifi"])
        self.assertFalse(d["games"]["42"].get("mudfish", False))
        run(p.delete_game("42"))

    def test_set_game_module_rejects_bad_input(self):
        p = main.Plugin()
        before = main._load()["games"]
        run(p.set_game_module("abc", "mudfish", True))
        run(p.set_game_module("42", "evil", True))
        self.assertEqual(main._load()["games"], before)


class RouterTests(unittest.TestCase):
    def test_methods_exist(self):
        p = main.Plugin()
        for name in ("mudfish_available", "mudfish_get_status", "mudfish_install", "mudfish_set_enabled",
                     "mudfish_set_option", "mudfish_confirm_login", "mudfish_set_ping_target",
                     "mudfish_get_route", "mudfish_test_ping", "mudfish_get_logs", "mudfish_probe_api", "get_snapshot", "get_current_game", "set_game_module"):
            self.assertTrue(callable(getattr(p, name)), name)

    def test_plugin_works_without_mudfish_module(self):
        p = main.Plugin()
        p.mudfish = None
        self.assertFalse(run(p.mudfish_available())["available"])
        self.assertEqual(run(p.mudfish_install())["error"], "mudfish_unavailable")
        self.assertEqual(run(p.mudfish_get_status())["error"], "mudfish_unavailable")
        self.assertFalse(hasattr(p, "get_status"))  # a rota interna não existe mais

    def test_wifi_keeps_working_when_mudfish_is_off(self):
        p = main.Plugin()
        p.mudfish = None
        r = run(p.wifi_available())
        self.assertEqual(r["available"], p.wifi is not None)

    def test_snapshot_survives_missing_modules(self):
        p = main.Plugin()
        p.mudfish = None
        p.wifi = None

        async def fake(cmd, timeout=15):
            return 0, "1.1.1.1 via 10.0.0.1 dev eth0 src 10.0.0.2"

        old = main.core_state.run
        main.core_state.run = fake
        try:
            snap = run(p.get_snapshot())
        finally:
            main.core_state.run = old
        self.assertEqual(snap["route"]["dev"], "eth0")
        self.assertEqual(snap["modules"], {})

    def test_main_is_a_thin_router(self):
        src = read("main.py")
        self.assertNotIn("mudrun-headless", src)
        self.assertNotIn("mount --bind", src)
        self.assertNotIn("8282", src)

    def test_build_packs_every_python_module(self):
        for name in ("mudfish_mgr.py", "core_state.py", "game_profiles.py"):
            self.assertTrue(os.path.exists(os.path.join(ROOT, name)) or os.path.exists(
                os.path.join(os.path.dirname(os.path.abspath(__file__)), name)), name)
        for rel in (os.path.join(ROOT, ".github", "workflows", "build.yml"), os.path.join(ROOT, "build.yml")):
            if os.path.exists(rel):
                text = open(rel, encoding="utf-8").read()
                for name in ("mudfish_mgr.py", "core_state.py", "game_profiles.py", "wifi_mgr.py", "wifi_dispatcher.py"):
                    self.assertIn(name, text, name)
                return


if __name__ == "__main__":
    unittest.main()
