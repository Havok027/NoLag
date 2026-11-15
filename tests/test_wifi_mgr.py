import asyncio
import inspect
import logging
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import types
import unittest

if "decky" not in sys.modules:
    sys.modules["decky"] = types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-wifi-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main  # noqa: E402
import wifi_dispatcher  # noqa: E402
import wifi_mgr  # noqa: E402


def read(name):
    for d in (ROOT, os.path.dirname(os.path.abspath(__file__))):
        p = os.path.join(d, name)
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                return f.read()
    raise FileNotFoundError(name)


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


class WifiModule(unittest.TestCase):
    def test_sem_atualizador_relatorio_ou_rede(self):
        src = read("wifi_mgr.py")
        for bad in ("urlopen", "http://", "https://", "api.github", "minisign", "TRUSTED_RELEASE",
                    "REPORT_URL", "check_for_update", "apply_update", "send_report", "_post_report"):
            self.assertNotIn(bad, src, bad)
        for name in ("check_for_update", "apply_update", "send_report", "preview_report",
                     "get_update_progress", "update_notice", "get_report_state"):
            self.assertFalse(hasattr(wifi_mgr.WifiManager, name), name)

    def test_aviso_de_copyright_mantido(self):
        for name in ("wifi_mgr.py", "wifi_dispatcher.py"):
            head = read(name)[:400]
            self.assertIn("Arcada Labs", head, name)
            self.assertIn("BSD", head, name)

    def test_api_exposta_bate_com_o_modulo(self):
        publicos = {n for n, f in inspect.getmembers(wifi_mgr.WifiManager)
                    if not n.startswith("_") and inspect.iscoroutinefunction(f)}
        self.assertEqual(publicos, set(main.WIFI_API))
        for n in main.WIFI_API:
            self.assertTrue(hasattr(main.Plugin, "wifi_" + n), n)

    def test_configuracao_propria_do_wifi(self):
        self.assertEqual(os.path.basename(wifi_mgr.SETTINGS_FILE), "wifi.json")
        self.assertNotEqual(os.path.basename(wifi_mgr.SETTINGS_FILE), "settings.json")

    def test_arquivos_de_sistema_nao_colidem_com_o_wifi_optimizer(self):
        for const in ("DISPATCHER_PATH", "NM_CONF_PATH", "MODPROBE_CONF_PATH", "GENERIC_BACKEND_CONF"):
            val = getattr(wifi_mgr, const)
            self.assertIn("nolag-wifi", val, const)
            self.assertNotIn("wifi-optimizer", val, const)
        self.assertNotIn("wifi-optimizer", wifi_dispatcher.DISPATCHER_TEMPLATE)


class Regressoes(unittest.TestCase):
    def test_stubs_do_atualizador_sao_sincronos_e_inertes(self):
        w = wifi_mgr.WifiManager()
        self.assertIs(w._update_running(), False)
        self.assertIsNone(w._stop_update())
        self.assertIsNone(w._acknowledge_update())
        self.assertFalse(hasattr(w, "_report_guard"))

    def test_mudanca_de_perfil_nao_fica_recusada(self):
        w = wifi_mgr.WifiManager()
        self.assertFalse(w._profile_change_refused())

    def test_uninstall_chega_ao_teardown(self):
        w = wifi_mgr.WifiManager()
        chamado = []
        w._teardown = lambda deadline: chamado.append(deadline)
        run(w._uninstall())
        self.assertEqual(len(chamado), 1)


class Dispatcher(unittest.TestCase):
    def test_modelo_tem_os_marcadores(self):
        t = wifi_dispatcher.DISPATCHER_TEMPLATE
        for key in ("__SETTINGS_PATH__", "__PLUGIN_DIR__", "__PLUGIN_NAME__"):
            self.assertIn(key, t)

    def test_instala_com_marcadores_trocados(self):
        tmp = tempfile.mkdtemp()
        old_path = wifi_mgr.DISPATCHER_PATH
        wifi_mgr.DISPATCHER_PATH = os.path.join(tmp, "99-nolag-wifi")
        had = hasattr(wifi_mgr.decky, "DECKY_PLUGIN_NAME")
        wifi_mgr.decky.DECKY_PLUGIN_NAME = "NoLag"
        try:
            ok = wifi_mgr.WifiManager()._install_dispatcher()
            self.assertTrue(ok)
            with open(wifi_mgr.DISPATCHER_PATH, encoding="utf-8") as f:
                script = f.read()
            self.assertEqual(re.findall(r"__[A-Z_]+__", script), [])
            self.assertIn("PLUGIN_NAME=NoLag", script)
            mode = stat.S_IMODE(os.stat(wifi_mgr.DISPATCHER_PATH).st_mode)
            self.assertEqual(mode, 0o755)
            self.assertEqual(os.listdir(tmp), ["99-nolag-wifi"])
            if shutil.which("bash"):
                r = subprocess.run(["bash", "-n", wifi_mgr.DISPATCHER_PATH], capture_output=True, text=True)
                self.assertEqual(r.returncode, 0, r.stderr)
            self.assertTrue(wifi_mgr.WifiManager()._remove_dispatcher())
            self.assertEqual(os.listdir(tmp), [])
        finally:
            wifi_mgr.DISPATCHER_PATH = old_path
            if not had:
                del wifi_mgr.decky.DECKY_PLUGIN_NAME

    def test_modelo_passa_bash_n(self):
        if not shutil.which("bash"):
            self.skipTest("sem bash")
        t = wifi_dispatcher.DISPATCHER_TEMPLATE
        t = t.replace("__SETTINGS_PATH__", "/tmp/x/wifi.json").replace("__PLUGIN_DIR__", "/tmp/x").replace(
            "__PLUGIN_NAME__", "NoLag")
        p = os.path.join(tempfile.mkdtemp(), "d.sh")
        with open(p, "w") as f:
            f.write(t)
        r = subprocess.run(["bash", "-n", p], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)


class Independencia(unittest.TestCase):
    def test_nolag_funciona_sem_o_modulo_wifi(self):
        old = main.WifiManager
        main.WifiManager = None
        try:
            p = main.Plugin()
            self.assertIsNone(p.wifi)
            self.assertEqual(run(p.wifi_get_status()), {"success": False, "error": "wifi_unavailable"})
            self.assertFalse(run(p.wifi_available())["available"])
            run(p._unload())
            run(p._uninstall())
            run(p._migration())
        finally:
            main.WifiManager = old

    def test_wifi_nao_depende_do_estado_da_rota(self):
        p = main.Plugin()
        self.assertIsNotNone(p.wifi)
        self.assertIsNot(p.wifi, p)
        self.assertTrue(run(p.wifi_available())["available"])

    def test_ciclo_de_vida_delega_ao_wifi(self):
        calls = []

        class Fake:
            async def _main(self):
                calls.append("main")

            async def _unload(self):
                calls.append("unload")

            async def _uninstall(self):
                calls.append("uninstall")

            async def _migration(self):
                calls.append("migration")

            async def get_status(self):
                return {"success": True, "connected": True}

        p = main.Plugin()
        p.wifi = Fake()

        async def go():
            await p._wifi_boot()
            await p._unload()
            await p._uninstall()
            await p._migration()
            return await p.wifi_get_status()

        self.assertEqual(run(go())["connected"], True)
        self.assertEqual(calls, ["main", "unload", "uninstall", "migration"])

    def test_falha_do_wifi_nao_derruba_o_nolag(self):
        class Boom:
            async def _main(self):
                raise RuntimeError("x")

            async def _unload(self):
                raise RuntimeError("x")

            async def _uninstall(self):
                raise RuntimeError("x")

            async def _migration(self):
                raise RuntimeError("x")

        p = main.Plugin()
        p.wifi = Boom()

        async def go():
            await p._wifi_boot()
            await p._unload()
            await p._uninstall()
            await p._migration()

        run(go())


if __name__ == "__main__":
    unittest.main()
