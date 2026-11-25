import asyncio
import json
import shutil
import time
import logging
import os
import stat
import sys
import tempfile
import types
import unittest

if "decky" not in sys.modules:
    sys.modules["decky"] = types.SimpleNamespace(
        DECKY_PLUGIN_SETTINGS_DIR=tempfile.mkdtemp(),
        DECKY_PLUGIN_DIR=tempfile.mkdtemp(),
        logger=logging.getLogger("nolag-mudfish-test"),
    )
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import core_state  # noqa: E402
import mudfish_mgr  # noqa: E402

PING = "4 packets transmitted, 4 received, 0% packet loss, time 603ms\nrtt min/avg/max/mdev = 10/20.0/30/2.5 ms\n"


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def make(tmp, runner=None):
    store = os.path.join(tmp, "runtime")
    return mudfish_mgr.MudfishManager(
        settings_dir=os.path.join(tmp, "settings"), runtime_dir=store,
        mount_point=os.path.join(tmp, "opt"), runner=runner,
    )


def fake_install(mgr, version="5.11.0"):
    exe_dir = os.path.join(mgr.store, version, "bin")
    os.makedirs(exe_dir)
    exe = os.path.join(exe_dir, "mudrun-headless")
    with open(exe, "w") as f:
        f.write("#!/bin/sh\nsleep 30\n")
    os.chmod(exe, 0o755)
    os.symlink(mgr.store, mgr.mount_point)  # no teste, o "mount --bind" vira um link
    return exe


class PureTests(unittest.TestCase):
    def test_settings_sanitized(self):
        d = mudfish_mgr.sanitize_settings({"keep_on": "x", "auto_on_game": True, "auto_selection": "no", "multipath": "yes",
                                           "ping_target": "x y", "ping_before": {"avg": "z", "jitter": 1, "loss": 0},
                                           "user": "ana", "password": "s3nha", "profile": "aggressive"})
        self.assertEqual((d["user"], d["password"]), ("ana", "s3nha"))  # conta opcional guardada
        self.assertFalse(d["keep_on"])
        self.assertNotIn("auto_on_game", d)  # v0.17.1: opção removida, valor antigo é descartado
        self.assertTrue(d["auto_selection"])  # padrão ligado: só False de verdade desliga
        self.assertFalse(d["multipath"])
        self.assertEqual(d["ping_target"], core_state.DEFAULT_TARGET)
        self.assertIsNone(d["ping_before"])
        self.assertNotIn("profile", d)  # perfil antigo é descartado
        bad = mudfish_mgr.sanitize_settings({"user": 5, "password": "a\nb"})
        self.assertEqual((bad["user"], bad["password"]), ("", ""))
        ok = mudfish_mgr.sanitize_settings({"auto_selection": False, "multipath": True, "keep_on": True,
                                            "ping_after": {"avg": 20.0, "jitter": 2.5, "loss": 0}})
        self.assertEqual((ok["auto_selection"], ok["multipath"], ok["keep_on"]), (False, True, True))
        self.assertEqual(ok["ping_after"]["avg"], 20.0)

    def test_credit_defaults_are_safe(self):
        d = mudfish_mgr.sanitize_settings(None)
        self.assertFalse(d["keep_on"])
        self.assertFalse(d["multipath"])
        self.assertTrue(d["auto_selection"])

    def test_release_versions(self):
        html = 'x mudfish-5.9.1-linux-x86_64.sh y mudfish-5.11.0-linux-x86_64.sh mudfish-5.10.2-linux-arm64.sh'
        self.assertEqual(mudfish_mgr.parse_release_versions(html), ["5.9.1", "5.11.0"])
        self.assertEqual(mudfish_mgr.parse_release_versions(""), [])

    def test_mounted(self):
        text = "tmpfs /run tmpfs rw 0 0\n/dev/x /opt/mudfish ext4 rw 0 0\n"
        self.assertTrue(mudfish_mgr.mounted("/opt/mudfish", text))
        self.assertFalse(mudfish_mgr.mounted("/opt/other", text))

    def test_find_daemon_pids(self):
        with tempfile.TemporaryDirectory() as proc:
            for pid, argv in (("101", b"/opt/mudfish/5.11.0/bin/mudrun-headless\0-B\0"), ("102", b"python\0x\0"), ("abc", b"")):
                os.makedirs(os.path.join(proc, pid))
                with open(os.path.join(proc, pid, "cmdline"), "wb") as f:
                    f.write(argv)
            self.assertEqual(mudfish_mgr.find_daemon_pids(proc), [101])

    def test_webui_and_port(self):
        self.assertEqual(mudfish_mgr.WEBUI_URL, "http://127.0.0.1:8282")
        self.assertEqual(mudfish_mgr.PORT, 8282)


class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.mgr = make(self.tmp)
        # no teste o "mount --bind" vira um link simbólico
        self._mounted = mudfish_mgr.mounted
        mudfish_mgr.mounted = lambda mp, text=None: os.path.islink(mp)

    def tearDown(self):
        mudfish_mgr.mounted = self._mounted

    def test_status_has_options_and_no_secrets(self):
        st = run(self.mgr.get_status())
        self.assertEqual((st["auto_selection"], st["multipath"], st["keep_on"]), (True, False, False))
        for key in ("password", "profile"):
            self.assertNotIn(key, st)  # a senha nunca sai do backend
        self.assertEqual((st["user"], st["has_password"]), ("", False))

    def test_set_option_validation_and_persistence(self):
        self.assertEqual(run(self.mgr.set_option("evil", True))["error"], "bad_option")
        self.assertEqual(run(self.mgr.set_option("multipath", "sim"))["error"], "bad_option")
        r = run(self.mgr.set_option("multipath", True))
        self.assertTrue(r["ok"])
        self.assertFalse(r["applied"])  # desligado: só guarda
        self.assertTrue(self.mgr.load()["multipath"])
        self.assertTrue(run(self.mgr.set_option("auto_selection", False))["ok"])
        self.assertFalse(self.mgr.load()["auto_selection"])
        self.assertEqual(stat.S_IMODE(os.stat(self.mgr._cfg_path()).st_mode), 0o600)

    def test_options_never_guess_the_api(self):
        fake_install(self.mgr)
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                await self.mgr.start()
                r = await self.mgr.set_option("multipath", True)
                st = await self.mgr.get_status()
                await self.mgr.stop()
                return r, st
            r, st = run(go())
        finally:
            mudfish_mgr.port_open = old
        self.assertFalse(r["applied"])
        self.assertEqual(r["state"], "api_unmapped")  # sem endpoints mapeados: não finge que aplicou
        self.assertEqual(st["option_state"], "api_unmapped")
        self.assertFalse(mudfish_mgr.MudfishApi().mapped())

    def test_start_requires_install_but_not_login(self):
        self.assertEqual(run(self.mgr.start())["error"], "not_installed")
        fake_install(self.mgr)
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                r = await self.mgr.start()
                await self.mgr.stop()
                return r
            self.assertTrue(run(go())["ok"])  # o login é feito no painel 127.0.0.1:8282
        finally:
            mudfish_mgr.port_open = old

    def test_manual_start_and_stop_never_touch_keep_on(self):
        fake_install(self.mgr)
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                r = await self.mgr.start()
                alive = self.mgr._alive()
                keep = self.mgr.load()["keep_on"]
                s = await self.mgr.stop()
                return r, alive, keep, s, self.mgr.proc
            r, alive, keep, s, proc = run(go())
        finally:
            mudfish_mgr.port_open = old
        self.assertTrue(r["ok"])
        self.assertTrue(alive)
        self.assertFalse(keep)  # ligar à mão nunca ativa "manter ligado": créditos protegidos
        self.assertTrue(s["ok"])
        self.assertIsNone(proc)
        self.assertFalse(self.mgr.load()["keep_on"])

    def test_daemon_command_follows_official_guide(self):
        fake_install(self.mgr)
        seen = {}
        orig = asyncio.create_subprocess_exec

        async def spy(*args, **kw):
            seen["args"] = args
            return await orig(*args, **kw)

        asyncio.create_subprocess_exec = spy
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                await self.mgr.start()
                await self.mgr.stop()
            run(go())
        finally:
            asyncio.create_subprocess_exec = orig
            mudfish_mgr.port_open = old
        a = list(seen["args"])
        self.assertEqual(len(a), 1)  # guia oficial: mudrun-headless sem flags
        self.assertTrue(a[0].endswith("/bin/mudrun-headless"))

    def test_mudfish_has_no_game_on_hook(self):
        # v0.17.1: o Mudfish não liga por jogo; só o encerramento ao fechar o jogo continua registrado no barramento.
        self.assertFalse(hasattr(self.mgr, "_game_on"))
        self.assertFalse(hasattr(self.mgr, "_auto_connect"))
        self.mgr.register()
        self.assertFalse(core_state.bus.has("mudfish", "enable"))
        self.assertTrue(core_state.bus.has("mudfish", "disable"))
        core_state.bus.unregister("mudfish")

    def test_game_off_stops_even_if_started_by_hand(self):
        fake_install(self.mgr)
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                await self.mgr.start()  # ligado à mão
                await self.mgr._game_off()
                return self.mgr._alive()
            self.assertFalse(run(go()))
        finally:
            mudfish_mgr.port_open = old

    def test_boot_always_starts_off_unless_keep_on(self):
        fake_install(self.mgr)
        killed = []

        async def fake_kill():
            killed.append(True)

        self.mgr._kill = fake_kill
        self.mgr._alive = lambda: True  # sobra de uma sessão anterior
        run(self.mgr._main())
        self.assertEqual(killed, [True])  # keep_on desligado: derruba o que sobrou
        core_state.bus.unregister("mudfish")

    def test_full_vpn_warning(self):
        async def fake(cmd, timeout=15):
            return 0, "1.1.1.1 dev tun0 src 10.8.0.2 uid 0"

        old = core_state.run
        core_state.run = fake
        try:
            self.mgr._alive = lambda: True
            self.assertTrue(run(self.mgr.get_route())["full_vpn"])
            self.mgr._alive = lambda: False
            self.assertFalse(run(self.mgr.get_route())["full_vpn"])  # desligado: sem aviso
        finally:
            core_state.run = old

    def test_credentials_optional_and_never_leak(self):
        self.assertEqual(run(self.mgr.set_credentials("", "x"))["error"], "bad_credentials")
        self.assertEqual(run(self.mgr.set_credentials("ana", "a\nb"))["error"], "bad_credentials")
        self.assertEqual(run(self.mgr.set_credentials(5, "x"))["error"], "bad_credentials")
        r = run(self.mgr.set_credentials(" ana ", "s3nha"))
        self.assertTrue(r["ok"] and r["has_password"])
        st = run(self.mgr.get_status())
        self.assertEqual((st["user"], st["has_password"]), ("ana", True))
        self.assertNotIn("s3nha", json.dumps(st))
        self.assertTrue(run(self.mgr.set_credentials("ana2", ""))["ok"])  # senha vazia mantém a salva
        self.assertEqual(self.mgr.load()["password"], "s3nha")
        self.assertEqual(stat.S_IMODE(os.stat(self.mgr._cfg_path()).st_mode), 0o600)
        run(self.mgr.clear_credentials())
        self.assertEqual((self.mgr.load()["user"], self.mgr.load()["password"]), ("", ""))

    def test_reset_session_goes_back_to_login(self):
        fake_install(self.mgr)
        run(self.mgr.confirm_login(True))
        self.assertEqual(run(self.mgr.get_status())["step"], "activate")
        called = []
        self.mgr.api.logout = lambda: called.append(True) or True
        self.mgr._alive = lambda: True
        r = run(self.mgr.reset_session())
        self.assertTrue(r["ok"] and r["logged_out"])
        self.mgr._alive = lambda: False
        self.assertFalse(self.mgr.load()["login_done"])
        self.assertEqual(run(self.mgr.get_status())["step"], "login")

    def test_session_detection_overrides_manual_flag(self):
        fake_install(self.mgr)
        self.mgr._alive = lambda: True
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            self.mgr.api.check = lambda: ("active", True)
            st = run(self.mgr.get_status())
            self.assertTrue(st["login_done"])  # já entrou na WebUI: sem falso "pendente entrar na conta"
            self.assertEqual((st["step"], st["session"], st["api_ok"]), ("activate", "active", True))
            self.mgr._check_cache = (0.0, "unknown", False)
            self.mgr.api.check = lambda: ("inactive", True)
            run(self.mgr.confirm_login(True))
            st = run(self.mgr.get_status())
            self.assertFalse(st["login_done"])  # o painel mostra tela de login: sessão inexistente
            self.assertEqual(st["step"], "login")
            self.mgr._check_cache = (0.0, "unknown", False)
            self.mgr.api.check = lambda: ("unknown", False)
            # v0.11.1: a detecção grava o último estado conhecido; sem evidência, vale ele (aqui: sem sessão)
            self.assertFalse(run(self.mgr.get_status())["login_done"])
            self.mgr._check_cache = (0.0, "unknown", False)
            self.mgr.api.check = lambda: ("active", True)
            run(self.mgr.get_status())
            self.assertTrue(self.mgr.load()["login_done"])  # detectado e gravado sozinho, sem botão manual
            self.mgr._check_cache = (0.0, "unknown", False)
            self.mgr.api.check = lambda: ("unknown", False)
            self.assertTrue(run(self.mgr.get_status())["login_done"])
        finally:
            mudfish_mgr.port_open = old

    def test_api_check_heuristic(self):
        api = mudfish_mgr.MudfishApi()
        calls = []

        def fake(path, follow=True):
            calls.append((path, follow))
            return fake.table[path]

        api._get = fake
        fake.table = {"/do/mudrun/status": (200, "application/json", b"{}"), "/item/list.html": (200, "text/html", b"<ul>jogos</ul>")}
        self.assertEqual(api.check(), ("active", True))
        fake.table["/item/list.html"] = (200, "text/html", b'<form><input type="password"></form>')
        self.assertEqual(api.check(), ("inactive", True))
        fake.table["/item/list.html"] = (302, "", b"")
        self.assertEqual(api.check(), ("inactive", True))
        fake.table["/item/list.html"] = (500, "", b"")
        self.assertEqual(api.check(), ("unknown", True))
        self.assertTrue(all(follow is False for _p, follow in calls))  # nunca segue redirecionamento

    def test_api_never_calls_state_changing_paths(self):
        api = mudfish_mgr.MudfishApi()
        seen = []
        root = '<form action="/login"><input name="user" type="text"><input name="pw" type="password" value="segredo"></form>' \
               '<script>axios.post("/do/node/autoselect", {on: 1}); axios.get("/item/conf_onoff?id=1")</script>'

        def fake(path, follow=True):
            seen.append(path)
            return 200, "text/html", (root if path == "/" else b"{}").encode() if path == "/" else b"{}"

        api._get = fake
        rows, found, reads, snippets, forms = api.probe()
        for blocked in mudfish_mgr.NEVER_CALLED:
            self.assertNotIn(blocked, seen)
        self.assertEqual(sorted(reads), sorted(mudfish_mgr.READ_ENDPOINTS))
        self.assertIn("/do/node/autoselect", snippets)  # o contexto da chamada é capturado sem chamá-la
        self.assertIn("axios.post", snippets["/do/node/autoselect"][0]["text"])
        self.assertNotIn("segredo", json.dumps(forms))  # nunca guarda valores de campos
        self.assertIn({"input": {"name": "pw", "type": "password"}}, forms)
        self.assertEqual(api.apply({"multipath": True}), (False, "api_unmapped"))  # sem endpoint conferido, não chuta

    def test_live_measures_baseline_without_mudfish_and_tunnel_with_it(self):
        pings = []

        async def fake_ping(target, count=4, iface=None):
            pings.append(iface)
            return {"avg": 30.0 if iface == "wlan0" else 12.0, "jitter": 1.0, "loss": 0}

        async def fake_route(target):
            return {"dev": "wlan0", "src": "192.168.0.5", "via": "192.168.0.1", "target": target}

        async def fake_default():
            return "wlan0"

        async def fake_tunnel():
            return "tun0"

        saved = (core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev)
        core_state.ping_stats, core_state.route_get = fake_ping, fake_route
        core_state.default_dev, core_state.tunnel_dev = fake_default, fake_tunnel
        try:
            self.mgr._alive = lambda: False
            off = run(self.mgr.get_live())
            self.assertEqual(pings, ["wlan0"])  # desligado: só a linha base, pela interface padrão, sem créditos
            self.assertEqual((off["base"]["avg"], off["tunnel"], off["only_game"]), (30.0, None, False))
            pings.clear()
            self.mgr._alive = lambda: True
            on = run(self.mgr.get_live())
            self.assertEqual(sorted(pings), ["tun0", "wlan0"])  # ligado: as duas rotas na mesma amostra
            self.assertEqual((on["base"]["avg"], on["tunnel"]["avg"]), (30.0, 12.0))
            self.assertTrue(on["only_game"] and not on["full_vpn"])
            core_state.route_get = lambda t: fake_route_vpn()

            async def fake_route_vpn():
                return {"dev": "tun0", "src": "10.0.0.2", "via": "", "target": "1.1.1.1"}

            on = run(self.mgr.get_live())
            self.assertTrue(on["full_vpn"] and not on["only_game"])
        finally:
            core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev = saved

    def test_ping_before_and_after(self):
        calls = []

        async def fake(cmd, timeout=15):
            calls.append(cmd)
            return 0, PING

        old = core_state.run
        core_state.run = fake
        try:
            r1 = run(self.mgr.test_ping())
            self.mgr.proc = types.SimpleNamespace(returncode=None, pid=1)
            r2 = run(self.mgr.test_ping())
        finally:
            core_state.run = old
            self.mgr.proc = None
        self.assertEqual(r1["which"], "before")
        self.assertEqual(r2["which"], "after")
        cfg = self.mgr.load()
        self.assertEqual(cfg["ping_before"]["avg"], 20.0)
        self.assertEqual(cfg["ping_after"]["jitter"], 2.5)
        self.assertEqual(calls[0][-1], core_state.DEFAULT_TARGET)

    def test_ping_target_resets_comparison(self):
        self.mgr.save({**self.mgr.load(), "ping_before": {"avg": 1.0, "jitter": 0.1, "loss": 0}})
        r = run(self.mgr.set_ping_target("game.example.com"))
        self.assertEqual(r["target"], "game.example.com")
        self.assertIsNone(self.mgr.load()["ping_before"])
        self.assertEqual(run(self.mgr.set_ping_target("x;y"))["target"], core_state.DEFAULT_TARGET)

    def test_route_uses_ip_route_get(self):
        seen = []

        async def fake(cmd, timeout=15):
            seen.append(cmd)
            return 0, "1.1.1.1 via 10.0.0.1 dev wlan0 src 10.0.0.9 uid 0"

        old = core_state.run
        core_state.run = fake
        try:
            info = run(self.mgr.get_route())
        finally:
            core_state.run = old
        self.assertEqual(seen[0][:3], ["ip", "route", "get"])
        self.assertEqual(info["dev"], "wlan0")

    def test_install_flow(self):
        calls = []

        async def runner(cmd, timeout=15):
            calls.append(cmd)
            if cmd[0] == "mount":
                os.rmdir(cmd[-1])
                os.symlink(cmd[-2], cmd[-1])
            if "sh" in cmd:
                self.assertEqual(cmd[0], "env")  # sh <instalador> com TMPDIR próprio
                self.assertTrue(cmd[1].startswith("TMPDIR="))
                exe_dir = os.path.join(self.mgr.store, "5.12.0", "bin")
                os.makedirs(exe_dir, exist_ok=True)
                with open(os.path.join(exe_dir, "mudrun-headless"), "w") as f:
                    f.write("#!/bin/sh\n")
            return 0, ""

        mgr = make(self.tmp, runner)
        os.makedirs(os.path.join(mgr.store, "5.10.0", "bin"))
        mgr._fetch_latest = lambda: "5.12.0"
        mgr._download = lambda v, dest: open(dest, "w").write("#!/bin/sh\n")
        r = run(mgr.install())
        self.assertTrue(r["ok"], r)
        self.assertEqual(mgr.installed()[0], "5.12.0")
        self.assertFalse(os.path.exists(os.path.join(mgr.store, "5.10.0")))  # versão antiga removida
        self.assertTrue(any(c[0] == "mount" for c in calls))

    def test_install_failure_is_reported(self):
        async def runner(cmd, timeout=15):
            return 1, ""

        mgr = make(self.tmp, runner)
        r = run(mgr.install())
        self.assertFalse(r["ok"])
        self.assertIn(r["error"], ("mount_failed", "unsupported_arch"))
        self.assertTrue(r["detail"])  # o motivo exato sempre acompanha o código

    def test_install_download_failure_shows_exact_reason(self):
        async def runner(cmd, timeout=15):
            if cmd[0] == "mount":
                os.rmdir(cmd[-1])
                os.symlink(cmd[-2], cmd[-1])
            if cmd[0] == "curl":
                return 22, "curl: (22) The requested URL returned error: 404"
            return 0, ""

        mgr = make(self.tmp, runner)
        mgr._fetch_latest = lambda: "5.12.0"

        def boom(version, dest):
            raise ValueError("HTTP 404 Not Found (https://mudfish.net/releases/x.sh)")

        mgr._download = boom
        r = run(mgr.install())
        self.assertEqual(r["error"], "download_failed")
        self.assertIn("HTTP 404", r["detail"])
        self.assertIn("curl código 22", r["detail"])
        self.assertIn("v5.12.0", r["detail"])
        self.assertIn("v" + mudfish_mgr.FALLBACK_VERSION, r["detail"])  # tentou também a versão de reserva
        st = run(mgr.get_status())
        self.assertEqual((st["phase"], st["error"]), ("error", "download_failed"))
        self.assertEqual(st["detail"], r["detail"])
        self.assertTrue(os.path.isfile(mgr.install_log_path))

    def test_install_extraction_failure_shows_installer_output(self):
        async def runner(cmd, timeout=15):
            if cmd[0] == "mount":
                os.rmdir(cmd[-1])
                os.symlink(cmd[-2], cmd[-1])
                return 0, ""
            if "sh" in cmd:
                return 1, "Verifying archive integrity...\nCRC checksum is wrong"
            return 0, ""

        mgr = make(self.tmp, runner)
        mgr._fetch_latest = lambda: "5.11.0"
        mgr._download = lambda v, dest: open(dest, "w").write("#!/bin/sh\n")
        r = run(mgr.install())
        self.assertEqual(r["error"], "install_failed")
        self.assertIn("código 1", r["detail"])
        self.assertIn("CRC checksum is wrong", r["detail"])
        self.assertIn("mudrun-headless", r["detail"])

    def test_mount_failure_shows_exact_reason(self):
        async def runner(cmd, timeout=15):
            return 32, "mount: /opt/mudfish: permission denied."

        mgr = make(self.tmp, runner)
        ok, why = run(mgr._ensure_mount())
        self.assertFalse(ok)
        self.assertIn("código 32", why)
        self.assertIn("permission denied", why)

    def test_invalid_installer_file_is_explained(self):
        mgr = make(self.tmp)
        os.makedirs(mgr.runtime_dir, exist_ok=True)
        bad = os.path.join(mgr.runtime_dir, "x.sh.part")
        with open(bad, "w") as f:
            f.write("<html>404</html>")
        why = mgr._check_installer(bad)
        self.assertIn("arquivo inválido", why)
        self.assertIn("<html>", why)

    def test_daemon_exit_shows_service_log(self):
        fake_install(self.mgr)
        exe = self.mgr.installed()[1]
        with open(exe, "w") as f:
            f.write("#!/bin/sh\necho 'sem permissao de root'\nexit 3\n")
        os.chmod(exe, 0o755)
        r = run(self.mgr.start())
        self.assertEqual(r["error"], "exited")
        self.assertIn("código 3", r["detail"])
        self.assertIn("sem permissao de root", r["detail"])

    def test_bus_registration_and_state(self):
        core_state.bus.unregister("mudfish")
        self.mgr.register()
        self.assertFalse(core_state.bus.has("mudfish", "enable"))  # v0.17.1: não liga por jogo
        self.assertTrue(core_state.bus.has("mudfish", "disable"))
        self.assertIn("running", core_state.bus.get_state("mudfish"))
        core_state.bus.unregister("mudfish")

    def test_module_is_independent_of_wifi(self):
        src = open(os.path.join(ROOT, "mudfish_mgr.py"), encoding="utf-8").read()
        self.assertNotIn("wifi_mgr", src)
        self.assertNotIn("import main", src)
        wifi = open(os.path.join(ROOT, "wifi_mgr.py"), encoding="utf-8").read()
        self.assertNotIn("mudfish", wifi.lower().replace("nolag-wifi", ""))


if __name__ == "__main__":
    unittest.main()


class V0111Tests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.mgr = mudfish_mgr.MudfishManager(settings_dir=self.tmp, runtime_dir=self.tmp, mount_point=os.path.join(self.tmp, "mnt"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_api_unmapped_does_not_pollute_install_log(self):
        cfg = self.mgr.load()
        ok, why = run(self.mgr._apply_options(cfg))
        self.assertFalse(ok)
        self.assertEqual(self.mgr.option_state, "api_unmapped")
        self.assertFalse(os.path.exists(self.mgr.install_log_path) and "não aplicadas" in open(self.mgr.install_log_path, encoding="utf-8").read())

    def test_real_option_failure_is_still_logged(self):
        self.mgr.api.apply = lambda opts: (False, "timeout")
        run(self.mgr._apply_options(self.mgr.load()))
        self.assertEqual(self.mgr.option_state, "failed")
        self.assertIn("timeout", open(self.mgr.install_log_path, encoding="utf-8").read())

    def test_saving_credentials_forces_new_session_check(self):
        self.mgr._check_cache = (time.monotonic(), "inactive", True)
        run(self.mgr.set_credentials("ana", "x"))
        self.assertEqual(self.mgr._check_cache[0], 0.0)

    def test_watcher_detects_session_in_background(self):
        async def go():
            self.mgr._alive = lambda: True
            self.mgr.api.check = lambda: ("active", True)
            mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
            try:
                self.mgr._start_watch()
                await asyncio.sleep(0.3)
                self.mgr._stop_watch()
            finally:
                mudfish_mgr.port_open = old
        run(go())
        self.assertTrue(self.mgr.load()["login_done"])
