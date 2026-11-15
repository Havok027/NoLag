"""Módulo Mudfish do NoLag: instalação persistente, daemon headless, porta 8282, rota e ping.

Independente do Wi-Fi: só usa o core_state (estado e eventos compartilhados).
O instalador oficial grava em /opt/mudfish/<versão>; como o SteamOS é imutável, a pasta
persistente fica em DECKY_PLUGIN_RUNTIME_DIR/mudfish e é ligada em /opt/mudfish com mount --bind.
"""
import asyncio
import json
import os
import platform
import re
import shutil
import signal
import socket
import time
import urllib.request

import decky

import core_state

PORT = 8282
WEBUI_URL = "http://127.0.0.1:%d" % PORT
RELEASES_URL = "https://mudfish.net/releases/"
FALLBACK_VERSION = "5.11.0"
INSTALLER = "mudfish-%s-linux-x86_64.sh"
MOUNT_POINT = "/opt/mudfish"
START_WAIT = 25
MIN_INSTALLER = 1_000_000
_VERSION = re.compile(r"^\d+\.\d+\.\d+$")
_RELEASE_RX = re.compile(r"mudfish-(\d+\.\d+\.\d+)-linux-x86_64\.sh")
_USER_MAX = 64
_PASS_MAX = 128


def _ver_key(v):
    return tuple(int(x) for x in v.split("."))


def clean_user(value):
    text = "".join(ch for ch in str(value or "") if ch.isprintable())[:_USER_MAX].strip()
    return text if text and not text.startswith("-") else ""


def clean_password(value):
    text = str(value or "")[:_PASS_MAX]
    return text if text and all(ch.isprintable() for ch in text) else ""


def sanitize_settings(raw):
    data = {"user": "", "password": "", "keep_on": False, "ping_target": core_state.DEFAULT_TARGET,
            "ping_before": None, "ping_after": None}
    if not isinstance(raw, dict):
        return data
    data["user"] = clean_user(raw.get("user"))
    data["password"] = clean_password(raw.get("password"))
    data["keep_on"] = raw.get("keep_on") is True
    data["ping_target"] = core_state.clean_target(raw.get("ping_target"))
    for key in ("ping_before", "ping_after"):
        m = raw.get(key)
        if isinstance(m, dict):
            avg, jit, loss = m.get("avg"), m.get("jitter"), m.get("loss")
            ok = lambda x: x is None or (isinstance(x, (int, float)) and not isinstance(x, bool))  # noqa: E731
            if ok(avg) and ok(jit) and isinstance(loss, (int, float)) and not isinstance(loss, bool):
                data[key] = {"avg": avg, "jitter": jit, "loss": loss}
    return data


def parse_release_versions(html):
    found = {m for m in _RELEASE_RX.findall(html or "") if _VERSION.match(m)}
    return sorted(found, key=_ver_key)


def mounted(mount_point, text=None):
    if text is None:
        try:
            with open("/proc/mounts", "r", encoding="utf-8") as f:
                text = f.read()
        except OSError:
            return False
    return any(len(line.split()) > 1 and line.split()[1] == mount_point for line in text.splitlines())


def find_daemon_pids(proc="/proc"):
    pids = []
    try:
        entries = os.listdir(proc)
    except OSError:
        return pids
    for entry in entries:
        if not entry.isdigit():
            continue
        try:
            with open(os.path.join(proc, entry, "cmdline"), "rb") as f:
                argv = f.read(4096).split(b"\0")
        except OSError:
            continue
        if argv and os.path.basename(argv[0].decode(errors="ignore")) == "mudrun-headless":
            pids.append(int(entry))
    return pids


def port_open(port=PORT, host="127.0.0.1"):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    try:
        return s.connect_ex((host, port)) == 0
    except OSError:
        return False
    finally:
        s.close()


class MudfishManager:
    def __init__(self, settings_dir=None, runtime_dir=None, mount_point=MOUNT_POINT, runner=None):
        self.settings_dir = settings_dir or decky.DECKY_PLUGIN_SETTINGS_DIR
        self.runtime_dir = runtime_dir or getattr(decky, "DECKY_PLUGIN_RUNTIME_DIR", self.settings_dir)
        self.mount_point = mount_point
        self.run = runner or core_state.run
        self.proc = None
        self.lock = asyncio.Lock()
        self.phase = "off"  # off | installing | starting | running | stopping | error
        self.error = ""
        self.owned = False  # ligado por perfil de jogo (não persiste ao reiniciar)

    # ---------- arquivos ----------
    @property
    def store(self):
        return os.path.join(self.runtime_dir, "mudfish")

    @property
    def log_path(self):
        return os.path.join(self.runtime_dir, "mudfish.log")

    def _cfg_path(self):
        return os.path.join(self.settings_dir, "mudfish.json")

    def load(self):
        try:
            with open(self._cfg_path(), "r", encoding="utf-8") as f:
                return sanitize_settings(json.load(f))
        except Exception:
            return sanitize_settings(None)

    def save(self, data):
        data = sanitize_settings(data)
        path = self._cfg_path()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp = path + ".tmp"
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, path)
        return data

    def installed(self):
        """(versão, caminho do mudrun-headless) da maior versão instalada, ou ('', '')."""
        try:
            names = [n for n in os.listdir(self.store) if _VERSION.match(n)]
        except OSError:
            return "", ""
        for v in sorted(names, key=_ver_key, reverse=True):
            exe = os.path.join(self.store, v, "bin", "mudrun-headless")
            if os.path.isfile(exe):
                return v, os.path.join(self.mount_point, v, "bin", "mudrun-headless")
        return "", ""

    # ---------- estado ----------
    def _alive(self):
        if self.proc is not None and self.proc.returncode is None:
            return True
        return bool(find_daemon_pids())

    def _set(self, phase, error=""):
        self.phase, self.error = phase, error
        self._publish()

    def _publish(self):
        version, _exe = self.installed()
        core_state.bus.set_state("mudfish", {
            "installed": bool(version), "running": self._alive(), "phase": self.phase, "error": self.error,
        })

    async def get_status(self):
        cfg = self.load()
        version, _exe = self.installed()
        running = self._alive()
        if self.phase in ("running", "starting") and not running and self.phase != "starting":
            self.phase = "off"
        if running and self.phase == "off":
            self.phase = "running"
        data = {
            "arch_ok": platform.machine() == "x86_64",
            "installed": bool(version),
            "version": version,
            "mounted": mounted(self.mount_point),
            "running": running,
            "port_open": await asyncio.to_thread(port_open),
            "phase": self.phase,
            "error": self.error,
            "user": cfg["user"],
            "has_password": bool(cfg["password"]),
            "keep_on": cfg["keep_on"],
            "ping_target": cfg["ping_target"],
            "ping_before": cfg["ping_before"],
            "ping_after": cfg["ping_after"],
            "webui": WEBUI_URL,
        }
        self._publish()
        return data

    # ---------- instalação ----------
    async def _ensure_mount(self):
        if mounted(self.mount_point):
            return True
        os.makedirs(self.store, exist_ok=True)
        try:
            os.makedirs(self.mount_point, exist_ok=True)
        except OSError:
            # SteamOS imutável: libera a escrita só o tempo de criar o ponto de montagem.
            if not shutil.which("steamos-readonly"):
                return False
            await self.run(["steamos-readonly", "disable"], 30)
            try:
                os.makedirs(self.mount_point, exist_ok=True)
            except OSError:
                pass
            finally:
                await self.run(["steamos-readonly", "enable"], 30)
            if not os.path.isdir(self.mount_point):
                return False
        rc, _out = await self.run(["mount", "--bind", self.store, self.mount_point], 15)
        return rc == 0 and mounted(self.mount_point)

    def _fetch_latest(self):
        try:
            req = urllib.request.Request(RELEASES_URL, headers={"User-Agent": "NoLag"})
            with urllib.request.urlopen(req, timeout=15) as r:  # noqa: S310 - URL fixa
                html = r.read(2_000_000).decode("utf-8", "ignore")
            versions = parse_release_versions(html)
            return versions[-1] if versions else FALLBACK_VERSION
        except Exception:
            return FALLBACK_VERSION

    def _download(self, version, dest):
        url = RELEASES_URL + INSTALLER % version
        req = urllib.request.Request(url, headers={"User-Agent": "NoLag"})
        tmp = dest + ".part"
        with urllib.request.urlopen(req, timeout=60) as r, open(tmp, "wb") as f:  # noqa: S310 - URL fixa
            shutil.copyfileobj(r, f)
        size = os.path.getsize(tmp)
        with open(tmp, "rb") as f:
            head = f.read(2)
        if size < MIN_INSTALLER or head != b"#!":
            os.remove(tmp)
            raise ValueError("installer_invalid")
        os.replace(tmp, dest)

    async def install(self):
        if self.lock.locked():
            return {"ok": False, "error": "busy"}
        async with self.lock:
            if platform.machine() != "x86_64":
                return {"ok": False, "error": "unsupported_arch"}
            was_running = self._alive()
            self._set("installing")
            try:
                if was_running:
                    await self._stop_locked()
                    self._set("installing")
                os.makedirs(self.store, exist_ok=True)
                if not await self._ensure_mount():
                    return self._fail("mount_failed")
                version = await asyncio.to_thread(self._fetch_latest)
                dest = os.path.join(self.runtime_dir, INSTALLER % version)
                try:
                    await asyncio.to_thread(self._download, version, dest)
                except Exception:
                    return self._fail("download_failed")
                rc, _out = await self.run(["sh", dest], 300)
                try:
                    os.remove(dest)
                except OSError:
                    pass
                exe = os.path.join(self.store, version, "bin", "mudrun-headless")
                if rc != 0 or not os.path.isfile(exe):
                    return self._fail("install_failed")
                os.chmod(exe, 0o755)
                for old in os.listdir(self.store):  # só a versão nova fica no disco
                    if old != version and _VERSION.match(old):
                        shutil.rmtree(os.path.join(self.store, old), ignore_errors=True)
                self._set("off")
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: instalação falhou: {e}")
                return self._fail("install_failed")
        if was_running:
            return await self.start()
        return {"ok": True, "error": "", "version": version}

    def _fail(self, code):
        self._set("error", code)
        return {"ok": False, "error": code}

    # ---------- daemon ----------
    async def start(self, persist=True):
        if self.lock.locked():
            return {"ok": False, "error": "busy"}
        async with self.lock:
            return await self._start_locked(persist)

    async def _start_locked(self, persist):
        if self._alive():
            self._set("running")
            return {"ok": True, "error": ""}
        version, exe = self.installed()
        if not version:
            return self._fail("not_installed")
        cfg = self.load()
        if not cfg["user"] or not cfg["password"]:
            return self._fail("no_credentials")
        self._set("starting")
        try:
            if not await self._ensure_mount():
                return self._fail("mount_failed")
            os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
            self.proc = await asyncio.create_subprocess_exec(
                exe, "-B", "-u", cfg["user"], "-p", cfg["password"], "-O", self.log_path,
                stdin=asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL, start_new_session=True,
            )
        except Exception as e:
            decky.logger.error(f"NoLag Mudfish: não iniciou: {e}")
            return self._fail("start_failed")
        deadline = time.monotonic() + START_WAIT
        while time.monotonic() < deadline:
            if self.proc.returncode is not None and not find_daemon_pids():
                return self._fail("exited")
            if await asyncio.to_thread(port_open):
                break
            await asyncio.sleep(1)
        else:
            await self._kill()
            return self._fail("start_failed")
        if persist:
            cfg["keep_on"] = True
            self.save(cfg)
        self._set("running")
        return {"ok": True, "error": ""}

    async def _kill(self):
        proc, self.proc = self.proc, None
        pids = set(find_daemon_pids())
        if proc is not None and proc.returncode is None:
            pids.add(proc.pid)
        for sig, wait in ((signal.SIGTERM, 6), (signal.SIGKILL, 2)):
            for pid in list(pids):
                try:
                    os.killpg(os.getpgid(pid), sig) if pid == getattr(proc, "pid", None) else os.kill(pid, sig)
                except (ProcessLookupError, PermissionError, OSError):
                    pids.discard(pid)
            end = time.monotonic() + wait
            while time.monotonic() < end and (set(find_daemon_pids()) & pids):
                await asyncio.sleep(0.3)
            if not (set(find_daemon_pids()) & pids):
                break
        if proc is not None:
            try:
                await asyncio.wait_for(proc.wait(), 1)
            except Exception:
                pass

    async def _stop_locked(self, persist=True):
        self._set("stopping")
        await self._kill()
        if persist:
            cfg = self.load()
            cfg["keep_on"] = False
            self.save(cfg)
        self._set("off")

    async def stop(self, persist=True):
        async with self.lock:
            await self._stop_locked(persist)
        return {"ok": True, "error": ""}

    async def set_enabled(self, enabled):
        return await (self.start() if enabled is True else self.stop())

    # ---------- configuração ----------
    async def set_credentials(self, user, password):
        cfg = self.load()
        u = clean_user(user)
        if not u:
            return {"ok": False, "error": "bad_user"}
        cfg["user"] = u
        if password not in (None, ""):
            p = clean_password(password)
            if not p:
                return {"ok": False, "error": "bad_password"}
            cfg["password"] = p
        if not cfg["password"]:
            return {"ok": False, "error": "bad_password"}
        self.save(cfg)
        return {"ok": True, "error": ""}

    async def clear_credentials(self):
        cfg = self.load()
        cfg["user"], cfg["password"] = "", ""
        self.save(cfg)
        return {"ok": True, "error": ""}

    async def set_ping_target(self, value):
        cfg = self.load()
        cfg["ping_target"] = core_state.clean_target(value)
        cfg["ping_before"], cfg["ping_after"] = None, None
        self.save(cfg)
        return {"ok": True, "target": cfg["ping_target"]}

    # ---------- rota e ping ----------
    async def get_route(self):
        cfg = self.load()
        info = await core_state.route_get(cfg["ping_target"])
        info["running"] = self._alive()
        return info

    async def test_ping(self):
        """Com o Mudfish desligado guarda o 'antes'; ligado, guarda o 'depois'."""
        cfg = self.load()
        running = self._alive()
        m = await core_state.ping_stats(cfg["ping_target"], 5)
        cfg["ping_after" if running else "ping_before"] = m
        self.save(cfg)
        return {"ok": m is not None, "which": "after" if running else "before", "metrics": m}

    # ---------- ciclo de vida e barramento ----------
    def register(self):
        core_state.bus.register(
            "mudfish",
            enable=self._game_on, disable=self._game_off, active=self._alive, status=self.get_status,
        )
        self._publish()

    async def _game_on(self):
        r = await self.start(persist=False)
        self.owned = bool(r.get("ok"))
        return r

    async def _game_off(self):
        if self.owned:
            self.owned = False
            return await self.stop(persist=False)
        return {"ok": True, "error": ""}

    async def _main(self):
        self.register()
        try:
            if self.installed()[0]:
                await self._ensure_mount()
            if self.load()["keep_on"] and not self._alive():
                await self.start()
        except Exception as e:
            decky.logger.error(f"NoLag Mudfish: falha ao iniciar: {e}")

    async def _unload(self):
        try:
            await self._kill()
        finally:
            core_state.bus.unregister("mudfish")
            self.phase = "off"

    async def _uninstall(self):
        await self._unload()
        if mounted(self.mount_point):
            await self.run(["umount", self.mount_point], 15)
        shutil.rmtree(self.store, ignore_errors=True)
