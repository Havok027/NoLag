import asyncio
import json
import os
import re
import sys

import decky

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# O módulo Wi-Fi é independente: se falhar ao carregar, o resto do NoLag segue.
try:
    from wifi_mgr import WifiManager
    WIFI_IMPORT_ERROR = ""
except Exception as _e:  # pragma: no cover - só em ambiente quebrado
    WifiManager = None  # type: ignore
    try:
        _py = ",".join(sorted(f for f in os.listdir(os.path.dirname(os.path.abspath(__file__))) if f.endswith(".py")))
    except Exception:
        _py = "?"
    WIFI_IMPORT_ERROR = f"{type(_e).__name__}: {_e} | py: {_py}"[:300]
    decky.logger.error(f"NoLag Wi-Fi: módulo não carregou: {WIFI_IMPORT_ERROR}")

# O módulo Mudfish e o barramento compartilhado também são independentes do Wi-Fi.
try:
    import core_state
    from mudfish_mgr import MudfishManager
    MUDFISH_IMPORT_ERROR = ""
except Exception as _e:  # pragma: no cover - só em ambiente quebrado
    core_state = None  # type: ignore
    MudfishManager = None  # type: ignore
    MUDFISH_IMPORT_ERROR = f"{type(_e).__name__}: {_e}"[:300]
    decky.logger.error(f"NoLag Mudfish: módulo não carregou: {MUDFISH_IMPORT_ERROR}")
try:
    from game_profiles import GameProfiles
except Exception as _e:  # pragma: no cover
    GameProfiles = None  # type: ignore
    decky.logger.error(f"NoLag perfis por jogo: não carregou: {_e}")

LANGS = ("pt", "en", "es")
DEFAULTS = {"language": "pt", "collapsed": {}, "games": {}}
SECTIONS = ("help", "games", "wifiMain", "wifiAdv", "wifiStream", "wifiActions",
            "mudfishMain", "mudfishAdv", "mudfishNet", "mudfishLogs", "conn", "mudfishAcc", "confGames", "confDiag")
MAX_GAMES = 50


# ---------- configurações ----------

_APPID = re.compile(r"^\d{1,12}$")


def clean_games(raw):
    """Jogos salvos: appid -> {name, wifi?, mudfish?}. Campos antigos (auto, profile) são descartados."""
    out = {}
    if not isinstance(raw, dict):
        return out
    for appid, g in raw.items():
        if len(out) >= MAX_GAMES:
            break
        if not isinstance(appid, str) or not _APPID.match(appid) or not isinstance(g, dict):
            continue
        name = "".join(ch for ch in str(g.get("name", ""))[:40] if ch.isprintable()).strip() or appid
        out[appid] = {"name": name}
        for module in ("wifi", "mudfish"):  # só aparecem quando ligados
            if g.get(module) is True:
                out[appid][module] = True
    return out


def sanitize_settings(raw):
    data = dict(DEFAULTS)
    data["collapsed"] = {}
    data["games"] = {}
    if isinstance(raw, dict):
        lang = raw.get("language")
        if isinstance(lang, str) and lang in LANGS:
            data["language"] = lang
        col = raw.get("collapsed")
        if isinstance(col, dict):
            data["collapsed"] = {k: col[k] for k in SECTIONS if isinstance(col.get(k), bool)}
        data["games"] = clean_games(raw.get("games"))
    return data


def _path(name):
    return os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, name)


def _write_private(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, path)


def _load():
    try:
        with open(_path("settings.json"), "r", encoding="utf-8") as f:
            return sanitize_settings(json.load(f))
    except Exception:
        return sanitize_settings(None)


def _save(data):
    _write_private(_path("settings.json"), json.dumps(data, ensure_ascii=False, indent=2))


# ---------- detecção do jogo aberto ----------

def find_game_pids():
    """PIDs de processos iniciados pelo Steam como jogo (variável SteamGameId)."""
    pids = []
    for entry in os.listdir("/proc"):
        if not entry.isdigit():
            continue
        try:
            with open("/proc/%s/environ" % entry, "rb") as f:
                env = f.read(65536)
        except OSError:
            continue
        for item in env.split(b"\0"):
            if item.startswith(b"SteamGameId="):
                if item[12:].strip() not in (b"", b"0"):
                    pids.append(int(entry))
                break
    return pids


def game_id(pids):
    """appid do Steam (SteamGameId) do primeiro processo do jogo, ou ''."""
    for pid in pids:
        try:
            with open("/proc/%d/environ" % pid, "rb") as f:
                env = f.read(65536)
        except OSError:
            continue
        for item in env.split(b"\0"):
            if item.startswith(b"SteamGameId="):
                value = item[12:].decode("ascii", "ignore").strip()
                if _APPID.match(value) and value != "0":
                    return value
                break
    return ""


def parse_udp_table(text):
    """inode -> porta local, a partir de /proc/net/udp ou udp6."""
    out = {}
    for line in text.splitlines()[1:]:
        parts = line.split()
        if len(parts) < 10:
            continue
        try:
            out[int(parts[9])] = int(parts[1].rsplit(":", 1)[1], 16)
        except (ValueError, IndexError):
            continue
    return out


def game_ports(pids):
    """Portas UDP locais dos processos do jogo e o nome do processo com mais sockets."""
    inodes = {}
    for pid in pids:
        try:
            for fd in os.listdir("/proc/%d/fd" % pid):
                try:
                    link = os.readlink("/proc/%d/fd/%s" % (pid, fd))
                except OSError:
                    continue
                if link.startswith("socket:["):
                    inodes[int(link[8:-1])] = pid
        except OSError:
            continue
    table = {}
    for fname in ("/proc/net/udp", "/proc/net/udp6"):
        try:
            with open(fname, "r", encoding="utf-8") as f:
                table.update(parse_udp_table(f.read()))
        except OSError:
            continue
    ports, per = set(), {}
    for inode, pid in inodes.items():
        port = table.get(inode)
        if port:
            ports.add(port)
            per[pid] = per.get(pid, 0) + 1
    name = ""
    if per:
        try:
            with open("/proc/%d/comm" % max(per, key=per.get), "r", encoding="utf-8") as f:
                name = f.read().strip()[:24]
        except OSError:
            pass
    return ports, name


# ---------- plugin ----------

class Plugin:
    def __init__(self):
        self.wifi = WifiManager() if WifiManager is not None else None
        self.wifi_task = None
        self.mudfish = MudfishManager() if MudfishManager is not None else None
        self.profiles = None
        self.modules_task = None

    async def get_settings(self):
        return _load()

    async def set_settings(self, patch):
        data = _load()
        if isinstance(patch, dict):
            for key in ("language", "collapsed"):
                if key in patch:
                    data[key] = patch[key]
        data = sanitize_settings(data)
        _save(data)
        return data

    async def delete_game(self, appid):
        data = _load()
        if isinstance(appid, str):
            data["games"].pop(appid, None)
            _save(data)
        return _load()

    async def _main(self):
        if self.wifi is not None:
            self.wifi_task = asyncio.ensure_future(self._wifi_boot())
        self.modules_task = asyncio.ensure_future(self._modules_boot())
        decky.logger.info("NoLag iniciado")

    async def _modules_boot(self):
        """Mudfish, barramento e perfis por jogo: cada parte falha sozinha, sem afetar o resto."""
        if core_state is None:
            return
        if self.wifi is not None:
            # Isolamento: sem "disable". Nada (jogo fechando, console ligando, Mudfish desligando) desfaz o Wi-Fi.
            core_state.bus.register("wifi", enable=self._wifi_game_on, active=self._wifi_active)
        if self.mudfish is not None:
            try:
                await self.mudfish._main()
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: falha ao iniciar: {e}")
        if GameProfiles is not None:
            self.profiles = GameProfiles(self._detect_game, lambda: _load()["games"])
            self.profiles.start()

    async def _detect_game(self):
        pids = await asyncio.to_thread(find_game_pids)
        if not pids:
            return "", ""
        appid = await asyncio.to_thread(game_id, pids)
        if not appid:
            return "", ""
        name = _load()["games"].get(appid, {}).get("name", "")
        if not name or name == appid:
            try:
                _ports, name = await asyncio.to_thread(game_ports, pids)
            except Exception:
                name = ""
        return appid, name or appid

    async def _wifi_active(self):
        st = await self.wifi.get_status()
        cfg = (st or {}).get("settings") or {}
        return any(cfg.get(k) is True for k in WIFI_ACTIVE_KEYS)

    async def _wifi_game_on(self):
        return await self.wifi.optimize_safe()

    async def _wifi_boot(self):
        try:
            await self.wifi._main()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            decky.logger.error(f"NoLag Wi-Fi: falha ao iniciar: {e}")

    async def _unload(self):
        if self.modules_task is not None and not self.modules_task.done():
            self.modules_task.cancel()
        if self.profiles is not None:
            try:
                await self.profiles.stop()
            except Exception as e:
                decky.logger.error(f"NoLag perfis por jogo: falha ao descarregar: {e}")
        if self.mudfish is not None:
            try:
                await self.mudfish._unload()
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: falha ao descarregar: {e}")
        if self.wifi is not None:
            try:
                await self.wifi._unload()
            except Exception as e:
                decky.logger.error(f"NoLag Wi-Fi: falha ao descarregar: {e}")
            if self.wifi_task is not None and not self.wifi_task.done():
                self.wifi_task.cancel()
        decky.logger.info("NoLag descarregado")

    async def _uninstall(self):
        if self.wifi is not None:
            try:
                await self.wifi._uninstall()
            except Exception as e:
                decky.logger.error(f"NoLag Wi-Fi: falha ao desinstalar: {e}")
        if self.mudfish is not None:
            try:
                await self.mudfish._uninstall()
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: falha ao desinstalar: {e}")

    async def _migration(self):
        if self.wifi is not None:
            try:
                await self.wifi._migration()
            except Exception as e:
                decky.logger.error(f"NoLag Wi-Fi: falha na migração: {e}")

    async def _wifi_call(self, name, *args):
        if self.wifi is None:
            return {"success": False, "error": "wifi_unavailable"}
        return await getattr(self.wifi, name)(*args)

    async def wifi_acknowledge_settings_recovered(self):
        return await self._wifi_call("acknowledge_settings_recovered")

    async def wifi_allow_wpa2(self):
        return await self._wifi_call("allow_wpa2")

    async def wifi_get_backend_switch_status(self):
        return await self._wifi_call("get_backend_switch_status")

    async def wifi_get_device_info(self):
        return await self._wifi_call("get_device_info")

    async def wifi_get_diagnostic_info(self):
        return await self._wifi_call("get_diagnostic_info")

    async def wifi_get_regdomain(self):
        return await self._wifi_call("get_regdomain")

    async def wifi_get_status(self):
        return await self._wifi_call("get_status")

    async def wifi_list_streaming_apps(self):
        return await self._wifi_call("list_streaming_apps")

    async def wifi_move_bssid_lock(self):
        return await self._wifi_call("move_bssid_lock")

    async def wifi_optimize_safe(self):
        return await self._wifi_call("optimize_safe")

    async def wifi_poke_detection(self):
        return await self._wifi_call("poke_detection")

    async def wifi_reapply_all(self):
        return await self._wifi_call("reapply_all")

    async def wifi_reapply_volatile(self):
        return await self._wifi_call("reapply_volatile")

    async def wifi_repair_drifted(self):
        return await self._wifi_call("repair_drifted")

    async def wifi_reset_settings(self):
        return await self._wifi_call("reset_settings")

    async def wifi_save_diagnostic_info(self):
        return await self._wifi_call("save_diagnostic_info")

    async def wifi_set_auto_fix(self, enabled):
        return await self._wifi_call("set_auto_fix", enabled)

    async def wifi_set_band_preference(self, enabled, band='a'):
        return await self._wifi_call("set_band_preference", enabled, band)

    async def wifi_set_bssid_lock(self, enabled):
        return await self._wifi_call("set_bssid_lock", enabled)

    async def wifi_set_buffer_tuning(self, enabled):
        return await self._wifi_call("set_buffer_tuning", enabled)

    async def wifi_set_cake(self, enabled):
        return await self._wifi_call("set_cake", enabled)

    async def wifi_set_dns(self, enabled, provider='cloudflare', custom_servers=''):
        return await self._wifi_call("set_dns", enabled, provider, custom_servers)

    async def wifi_set_ipv6(self, disabled):
        return await self._wifi_call("set_ipv6", disabled)

    async def wifi_set_link_watchdog(self, enabled):
        return await self._wifi_call("set_link_watchdog", enabled)

    async def wifi_set_power_save(self, disabled):
        return await self._wifi_call("set_power_save", disabled)

    async def wifi_set_regdomain(self, country):
        return await self._wifi_call("set_regdomain", country)

    async def wifi_set_streaming_app(self, app_id, watched):
        return await self._wifi_call("set_streaming_app", app_id, watched)

    async def wifi_set_streaming_hold(self, held):
        return await self._wifi_call("set_streaming_hold", held)

    async def wifi_set_streaming_mode(self, enabled):
        return await self._wifi_call("set_streaming_mode", enabled)

    async def wifi_set_streaming_patterns(self, text):
        return await self._wifi_call("set_streaming_patterns", text)

    async def wifi_start_backend_switch(self, backend):
        return await self._wifi_call("start_backend_switch", backend)


    # ---- Mudfish (roteador fino: a lógica fica em mudfish_mgr.py) ----
    async def _mudfish_call(self, name, *args):
        if self.mudfish is None:
            return {"ok": False, "error": "mudfish_unavailable"}
        return await getattr(self.mudfish, name)(*args)

    async def mudfish_available(self):
        here = os.path.dirname(os.path.abspath(__file__))
        files = [n for n in ("mudfish_mgr.py", "core_state.py") if not os.path.exists(os.path.join(here, n))]
        error = MUDFISH_IMPORT_ERROR
        if files:
            error = ("arquivo ausente: " + ", ".join(files))[:200]
        return {"available": self.mudfish is not None, "error": error}

    async def mudfish_get_status(self):
        if self.mudfish is None:
            return {"installed": False, "running": False, "phase": "error", "error": "mudfish_unavailable"}
        return await self.mudfish.get_status()

    async def mudfish_install(self):
        return await self._mudfish_call("install")

    async def mudfish_check_update(self):
        return await self._mudfish_call("check_update")

    async def mudfish_update(self):
        return await self._mudfish_call("update_core")

    async def mudfish_set_enabled(self, enabled):
        return await self._mudfish_call("set_enabled", enabled)

    async def mudfish_set_option(self, key, value):
        return await self._mudfish_call("set_option", key, value)

    async def mudfish_confirm_login(self, done):
        return await self._mudfish_call("confirm_login", done)

    async def mudfish_set_credentials(self, user, password):
        return await self._mudfish_call("set_credentials", user, password)

    async def mudfish_clear_credentials(self):
        return await self._mudfish_call("clear_credentials")

    async def mudfish_reset_session(self):
        return await self._mudfish_call("reset_session")

    async def mudfish_get_live(self):
        return await self._mudfish_call("get_live")

    async def mudfish_set_ping_target(self, target):
        return await self._mudfish_call("set_ping_target", target)

    async def mudfish_get_route(self):
        return await self._mudfish_call("get_route")

    async def mudfish_test_ping(self):
        return await self._mudfish_call("test_ping")

    async def mudfish_get_logs(self):
        return await self._mudfish_call("get_logs")

    async def mudfish_probe_api(self):
        return await self._mudfish_call("probe_api")

    # ---- Painel e perfis por jogo ----
    async def get_snapshot(self):
        """Métricas da conexão para o Painel (rota ativa, ping e estado de cada módulo)."""
        if core_state is None:
            return {"route": {}, "ping": None, "modules": {}}
        target = self.mudfish.load()["ping_target"] if self.mudfish is not None else core_state.DEFAULT_TARGET
        data = await core_state.snapshot(target)
        if self.mudfish is not None:
            data["modules"]["mudfish"] = await self.mudfish.get_status()
        if self.wifi is not None:
            try:
                st = await self.wifi.get_status()
                data["modules"]["wifi"] = {
                    "connected": bool((st or {}).get("connected")),
                    "live": (st or {}).get("live") or {},
                }
            except Exception:
                data["modules"]["wifi"] = {"connected": False, "live": {}}
        return data

    async def get_current_game(self):
        return self.profiles.current() if self.profiles is not None else {"appid": "", "name": ""}

    async def set_game_module(self, appid, module, value):
        """Salva se o jogo liga o Wi-Fi e/ou o Mudfish (independentes entre si)."""
        data = _load()
        if module in ("wifi", "mudfish") and isinstance(appid, str) and _APPID.match(appid):
            cur = self.profiles.current() if self.profiles is not None else {}
            game = data["games"].get(appid)
            if game is None:
                if len(data["games"]) >= MAX_GAMES:
                    return data
                name = cur.get("name") if cur.get("appid") == appid else ""
                game = {"name": name or appid}
            game[module] = value is True
            data["games"][appid] = game
            data = sanitize_settings(data)
            _save(data)
        return data

    async def wifi_available(self):
        here = os.path.dirname(os.path.abspath(__file__))
        files = [n for n in ("wifi_mgr.py", "wifi_dispatcher.py") if not os.path.exists(os.path.join(here, n))]
        error = WIFI_IMPORT_ERROR
        if files:
            error = ("arquivo ausente: " + ", ".join(files))[:200]
        return {"available": self.wifi is not None, "error": error}


# Chaves do Wi-Fi que contam como "otimização ativa" (mesma regra do cartão do Painel).
WIFI_ACTIVE_KEYS = (
    "power_save_disabled", "buffer_tuning_enabled", "cake_enabled", "ipv6_disabled",
    "bssid_lock_enabled", "band_preference_enabled", "dns_enabled", "streaming_mode_enabled",
    "link_watchdog_enabled", "auto_fix_on_wake",
)

# Métodos do módulo Wi-Fi expostos ao frontend com o prefixo wifi_.
WIFI_API = (
    "acknowledge_settings_recovered", "allow_wpa2", "get_backend_switch_status",
    "get_device_info", "get_diagnostic_info", "get_regdomain", "get_status",
    "list_streaming_apps", "move_bssid_lock", "optimize_safe", "poke_detection",
    "reapply_all", "reapply_volatile", "repair_drifted", "reset_settings",
    "save_diagnostic_info", "set_auto_fix", "set_band_preference", "set_bssid_lock",
    "set_buffer_tuning", "set_cake", "set_dns", "set_ipv6", "set_link_watchdog",
    "set_power_save", "set_regdomain", "set_streaming_app", "set_streaming_hold",
    "set_streaming_mode", "set_streaming_patterns", "start_backend_switch",
)
