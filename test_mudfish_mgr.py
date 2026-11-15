import asyncio
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
        d = mudfish_mgr.sanitize_settings({"user": "-bad", "password": "a\nb", "keep_on": "x", "ping_target": "x y",
                                           "ping_before": {"avg": "z", "jitter": 1, "loss": 0}})
        self.assertEqual(d["user"], "")
        self.assertEqual(d["password"], "")
        self.assertFalse(d["keep_on"])
        self.assertEqual(d["ping_target"], core_state.DEFAULT_TARGET)
        self.assertIsNone(d["ping_before"])
        ok = mudfish_mgr.sanitize_settings({"user": "ana", "password": "s3nha", "ping_after": {"avg": 20.0, "jitter": 2.5, "loss": 0}})
        self.assertEqual((ok["user"], ok["password"]), ("ana", "s3nha"))
        self.assertEqual(ok["ping_after"]["avg"], 20.0)

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

    def test_status_never_leaks_password(self):
        run(self.mgr.set_credentials("ana", "s3nha"))
        st = run(self.mgr.get_status())
        self.assertEqual(st["user"], "ana")
        self.assertTrue(st["has_password"])
        self.assertNotIn("password", st)
        self.assertNotIn("s3nha", str(st))
        mode = stat.S_IMODE(os.stat(self.mgr._cfg_path()).st_mode)
        self.assertEqual(mode, 0o600)

    def test_credentials_validation_and_keep_password(self):
        self.assertEqual(run(self.mgr.set_credentials("", "x"))["error"], "bad_user")
        self.assertEqual(run(self.mgr.set_credentials("ana", ""))["error"], "bad_password")
        self.assertTrue(run(self.mgr.set_credentials("ana", "s3nha"))["ok"])
        self.assertTrue(run(self.mgr.set_credentials("bia", ""))["ok"])  # troca só o usuário
        cfg = self.mgr.load()
        self.assertEqual((cfg["user"], cfg["password"]), ("bia", "s3nha"))
        run(self.mgr.clear_credentials())
        self.assertEqual(self.mgr.load()["user"], "")

    def test_start_requires_install_and_login(self):
        self.assertEqual(run(self.mgr.start())["error"], "not_installed")
        fake_install(self.mgr)
        self.assertEqual(run(self.mgr.start())["error"], "no_credentials")

    def test_start_and_stop_daemon(self):
        fake_install(self.mgr)
        run(self.mgr.set_credentials("ana", "s3nha"))
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
        self.assertTrue(keep)
        self.assertTrue(s["ok"])
        self.assertIsNone(proc)
        self.assertFalse(self.mgr.load()["keep_on"])

    def test_daemon_command_uses_headless_flags(self):
        fake_install(self.mgr)
        run(self.mgr.set_credentials("ana", "s3nha"))
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
        self.assertTrue(a[0].endswith("mudrun-headless"))
        self.assertIn("-B", a)
        self.assertEqual(a[a.index("-u") + 1], "ana")
        self.assertEqual(a[a.index("-p") + 1], "s3nha")
        self.assertIn("-O", a)

    def test_game_profile_only_stops_what_it_started(self):
        self.assertTrue(run(self.mgr._game_off())["ok"])  # nada ligado por jogo: nada a desligar
        fake_install(self.mgr)
        run(self.mgr.set_credentials("ana", "s3nha"))
        mudfish_mgr.port_open, old = (lambda *a, **k: True), mudfish_mgr.port_open
        try:
            async def go():
                on = await self.mgr._game_on()
                keep = self.mgr.load()["keep_on"]
                await self.mgr._game_off()
                return on, keep, self.mgr._alive()
            on, keep, alive = run(go())
        finally:
            mudfish_mgr.port_open = old
        self.assertTrue(on["ok"])
        self.assertFalse(keep)  # perfil de jogo não persiste ao reiniciar
        self.assertFalse(alive)

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
            if cmd[0] == "sh":
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

    def test_bus_registration_and_state(self):
        core_state.bus.unregister("mudfish")
        self.mgr.register()
        self.assertTrue(core_state.bus.has("mudfish", "enable"))
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
