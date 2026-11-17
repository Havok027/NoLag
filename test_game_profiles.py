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
        logger=logging.getLogger("nolag-games-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import core_state  # noqa: E402
import game_profiles  # noqa: E402


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


class Fake:
    def __init__(self, active=False, fail=False):
        self.active, self.fail, self.log = active, fail, []

    async def enable(self):
        self.log.append("on")
        if self.fail:
            raise RuntimeError("x")
        self.active = True
        return {"ok": True}

    async def disable(self):
        self.log.append("off")
        self.active = False
        return {"ok": True}

    def is_active(self):
        return self.active


def setup(wifi=None, mud=None, games=None):
    core_state.bus.unregister("wifi")
    core_state.bus.unregister("mudfish")
    for name, f in (("wifi", wifi), ("mudfish", mud)):
        if f is not None:
            core_state.bus.register(name, enable=f.enable, disable=f.disable, active=f.is_active)
    seq = {"cur": ("", "")}
    gp = game_profiles.GameProfiles(lambda: _detect(seq), lambda: games or {})
    return gp, seq


async def _detect(seq):
    return seq["cur"]


class GameProfileTests(unittest.TestCase):
    def tearDown(self):
        core_state.bus.unregister("wifi")
        core_state.bus.unregister("mudfish")

    def test_each_module_is_independent(self):
        w, m = Fake(), Fake()
        gp, seq = setup(w, m, {"10": {"wifi": True, "mudfish": False}})
        seq["cur"] = ("10", "Jogo")
        run(gp.tick())
        self.assertEqual((w.log, m.log), (["on"], []))  # Mudfish não liga sem o perfil do jogo
        seq["cur"] = ("", "")
        run(gp.tick())
        self.assertEqual((w.log, m.log), (["on"], []))  # Wi-Fi segue otimizado; Mudfish desligado, nada a encerrar
        self.assertTrue(w.active)
        self.assertFalse(m.active)

    def test_wifi_is_never_turned_off_by_games_or_mudfish(self):
        # Isolamento: fechar o jogo ou encerrar o Mudfish nunca desfaz o Wi-Fi Optimizer.
        w, m = Fake(), Fake(active=True)
        gp, seq = setup(w, m, {"10": {"wifi": True}})
        seq["cur"] = ("10", "Jogo")
        run(gp.tick())
        seq["cur"] = ("", "")
        run(gp.tick())
        self.assertEqual(w.log, ["on"])
        self.assertTrue(w.active)
        self.assertEqual(m.log, ["off"])  # só o Mudfish cai
        run(gp.stop())
        self.assertEqual(w.log, ["on"])

    def test_mudfish_is_stopped_when_any_game_closes(self):
        # Proteção de créditos: mesmo ligado à mão, e em jogo sem perfil salvo, o Mudfish cai ao fechar o jogo.
        for games in ({"10": {"wifi": True}}, {}):
            m = Fake(active=True)
            gp, seq = setup(None, m, games)
            seq["cur"] = ("10", "Jogo")
            run(gp.tick())
            seq["cur"] = ("", "")
            run(gp.tick())
            self.assertEqual(m.log, ["off"])
            self.assertFalse(m.active)

    def test_does_not_turn_off_what_was_already_on(self):
        w = Fake(active=True)
        gp, seq = setup(w, None, {"10": {"wifi": True}})
        seq["cur"] = ("10", "Jogo")
        run(gp.tick())
        seq["cur"] = ("", "")
        run(gp.tick())
        self.assertEqual(w.log, [])
        self.assertTrue(w.active)

    def test_unsaved_game_changes_nothing(self):
        w = Fake()
        gp, seq = setup(w, None, {})
        seq["cur"] = ("77", "Outro")
        run(gp.tick())
        self.assertEqual(w.log, [])
        self.assertEqual(gp.current(), {"appid": "77", "name": "Outro"})

    def test_switching_games_leaves_the_first(self):
        w = Fake()
        gp, seq = setup(w, None, {"1": {"wifi": True}, "2": {}})
        seq["cur"] = ("1", "A")
        run(gp.tick())
        seq["cur"] = ("2", "B")
        run(gp.tick())
        self.assertEqual(w.log, ["on"])  # trocar de jogo não desfaz o Wi-Fi

    def test_no_module_imports(self):
        src = open(os.path.join(ROOT, "game_profiles.py"), encoding="utf-8").read()
        self.assertNotIn("wifi_mgr", src)
        self.assertNotIn("mudfish_mgr", src)


if __name__ == "__main__":
    unittest.main()
