"""Módulo Mudfish do NoLag: instalação persistente, daemon headless, porta 8282, rota e ping.

Independente do Wi-Fi: só usa o core_state (estado e eventos compartilhados).
Segue o guia oficial do SteamOS (docs.mudfish.net, "Instalação e utilização no Steam Deck"):
  - instalação: `sh mudfish-X.Y.Z-linux-x86_64.sh`, que grava em /opt/mudfish/<versão>/bin/;
  - execução: `/opt/mudfish/<versão>/bin/mudrun-headless` (sem flags) e login em http://127.0.0.1:8282.
Como o SteamOS é imutável, a pasta persistente fica em DECKY_PLUGIN_RUNTIME_DIR/mudfish e é ligada
em /opt/mudfish com mount --bind. Toda falha devolve um código e o motivo exato em "detail".

Fluxo guiado: instalar -> entrar no painel (login) -> ativar. Auto Selection (padrão ligado) e Multi-Path
(padrão desligado) são guardados em mudfish.json e aplicados pela API local; os endpoints dela ainda não são
documentados pelo Mudfish, então a aplicação só roda depois de mapeados (probe_api captura o que o painel expõe).

Isolamento: o Mudfish nunca mexe no Wi-Fi. Só o daemon do Mudfish começa desligado e é encerrado ao fechar o jogo.

API local (127.0.0.1:8282): o mudfish-api.json mapeado traz só os NOMES dos caminhos, sem método, parâmetros nem
corpos. Por isso o plugin só LÊ (GET) os caminhos de status e nunca chama os que alteram estado
(/do/node/autoselect, /item/conf_onoff) até o formato deles ser capturado pelo diagnóstico.

Proteção de créditos (o Mudfish cobra por tráfego): o serviço nasce sempre desligado; só liga sozinho se o usuário
ativar "keep_on" (ao reiniciar) ou "auto_on_game" (ao abrir jogo) na aba Conf, e é encerrado ao fechar qualquer
jogo. Ligar manualmente nunca ativa essas opções. O plugin só inicia o serviço; o roteamento por jogo
(split-tunneling) é configurado no painel do Mudfish e nunca como VPN total do sistema.
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
import urllib.error
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
MIN_FREE = 100_000_000
DETAIL_MAX = 400
LOG_MAX = 200_000
_VERSION = re.compile(r"^\d+\.\d+\.\d+$")
_RELEASE_RX = re.compile(r"mudfish-(\d+\.\d+\.\d+)-linux-x86_64\.sh")
OPTION_KEYS = ("auto_selection", "multipath", "auto_on_game", "keep_on")
_TUNNEL_DEV = core_state.TUNNEL_DEV
# Caminhos de LEITURA do painel (mapeados no mudfish-api.json). Os que alteram estado ficam de fora de propósito.
READ_ENDPOINTS = ("/do/mudrun/status", "/do/status/pingstat", "/do/status/netstat", "/do/rtt/staticnodes", "/do/rtt/vnodes")
NEVER_CALLED = ("/do/node/autoselect", "/item/conf_onoff", "/logout.html")
SESSION_PATH = "/item/list.html"
LOGOUT_PATH = "/logout.html"
SESSION_TTL = 6.0
LIVE_COUNT = 3
MAX_USER = 128
MAX_PASS = 256
PROBE_MAX_REQUESTS = 6
PROBE_MAX_BYTES = 200_000
_SRC_RX = re.compile(r"""(?:src|href)=["']([^"'#?]+\.(?:js|json))["']""", re.I)
_API_RX = re.compile(r"""["'](/[A-Za-z0-9_\-./]{2,80})["']""")
_API_WORDS = ("api", "json", "node", "fast", "status", "login", "item", "route", "config", "log")


def _tail(text, limit=DETAIL_MAX):
    """Final de uma saída de comando em uma linha só, para mostrar na tela."""
    flat = " | ".join(line.strip() for line in str(text or "").splitlines() if line.strip())
    return flat[-limit:]


def _err(e):
    """Motivo curto e legível de uma exceção de rede ou de arquivo."""
    if isinstance(e, urllib.error.HTTPError):
        return "HTTP %s %s" % (e.code, e.reason)
    if isinstance(e, urllib.error.URLError):
        return "rede: %s" % (e.reason,)
    return "%s: %s" % (type(e).__name__, e)


def _ver_key(v):
    return tuple(int(x) for x in v.split("."))


def sanitize_settings(raw):
    """Só guarda o que o módulo usa. Usuário e senha de versões antigas são descartados."""
    data = {"login_done": False, "keep_on": False, "auto_on_game": False, "auto_selection": True,
            "user": "", "password": "", "multipath": False, "ping_target": core_state.DEFAULT_TARGET, "ping_before": None, "ping_after": None}
    if not isinstance(raw, dict):
        return data
    data["login_done"] = raw.get("login_done") is True
    data["keep_on"] = raw.get("keep_on") is True
    data["auto_on_game"] = raw.get("auto_on_game") is True
    data["auto_selection"] = raw.get("auto_selection") is not False  # padrão: ligado
    data["multipath"] = raw.get("multipath") is True
    for key, limit in (("user", MAX_USER), ("password", MAX_PASS)):
        v = raw.get(key)
        data[key] = v[:limit] if isinstance(v, str) and all(ch.isprintable() for ch in v) else ""
    data["ping_target"] = core_state.clean_target(raw.get("ping_target"))
    for key in ("ping_before", "ping_after"):
        m = raw.get(key)
        if isinstance(m, dict):
            avg, jit, loss = m.get("avg"), m.get("jitter"), m.get("loss")
            ok = lambda x: x is None or (isinstance(x, (int, float)) and not isinstance(x, bool))  # noqa: E731
            if ok(avg) and ok(jit) and isinstance(loss, (int, float)) and not isinstance(loss, bool):
                data[key] = {"avg": avg, "jitter": jit, "loss": loss}
    return data


def _lines_tail(text, count=12, width=160):
    lines = [ln.strip()[:width] for ln in str(text or "").splitlines() if ln.strip()]
    return "\n".join(lines[-count:])


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


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):  # noqa: D401 - devolve o 3xx em vez de seguir
        return None


_FORM_RX = re.compile(r"<form\b[^>]*>", re.I)
_INPUT_RX = re.compile(r"<input\b[^>]*>", re.I)
_ATTR_RX = re.compile(r"""\b(name|type|id)\s*=\s*["']([^"']{0,40})["']""", re.I)
_LIB_RX = re.compile(r"(jquery|axios|polyfill|promise|\.min\.js)", re.I)


class MudfishApi:
    """Cliente da API local (127.0.0.1:8282). Só GET, só no próprio aparelho.

    Só lê o que está em READ_ENDPOINTS. Os caminhos que alteram estado (Auto Selection, itens) NÃO são chamados
    enquanto o método e os parâmetros deles não forem capturados (probe) e conferidos.
    """
    ENDPOINTS = {}  # preenchido só depois de mapear os caminhos que alteram estado

    def __init__(self, host="127.0.0.1", port=PORT):
        self.base = "http://%s:%d" % (host, port)
        self._opener = urllib.request.build_opener(_NoRedirect)

    def mapped(self):
        return bool(self.ENDPOINTS)

    def _get(self, path, follow=True):
        req = urllib.request.Request(self.base + path, headers={"User-Agent": "NoLag"})
        if follow:
            with urllib.request.urlopen(req, timeout=3) as r:  # noqa: S310 - só 127.0.0.1
                return r.status, r.headers.get("Content-Type", ""), r.read(PROBE_MAX_BYTES)
        try:
            with self._opener.open(req, timeout=3) as r:
                return r.status, r.headers.get("Content-Type", ""), r.read(PROBE_MAX_BYTES)
        except urllib.error.HTTPError as e:  # 3xx/4xx/5xx chegam aqui, sem seguir o redirecionamento
            return e.code, e.headers.get("Content-Type", "") if e.headers else "", b""

    def check(self):
        """(sessão, api_ok). Sessão: active | inactive | unknown (heurística, veja abaixo)."""
        try:
            status, _ctype, _body = self._get("/do/mudrun/status", follow=False)
            api_ok = status == 200
        except Exception:
            return "unknown", False
        try:
            code, _ctype, body = self._get(SESSION_PATH, follow=False)
        except Exception:
            return "unknown", api_ok
        if code in (301, 302, 303, 307, 308, 401, 403):
            return "inactive", api_ok
        if code == 200:
            text = body.decode("utf-8", "replace").lower()
            # a lista de itens só existe com sessão: se vier um formulário de senha, é a tela de login
            return ("inactive" if ("type=\"password\"" in text or "type='password'" in text) else "active"), api_ok
        return "unknown", api_ok

    def logout(self):
        """Encerra a sessão do painel (GET /logout.html). True se o painel respondeu."""
        try:
            code, _ctype, _body = self._get(LOGOUT_PATH, follow=False)
            return code < 500
        except Exception:
            return False

    def apply(self, options):
        """(ok, motivo) para {"auto_selection": bool, "multipath": bool}. Sem endpoint conferido, não adivinha."""
        return False, "api_unmapped"

    def probe(self):
        """Captura só leitura: página do painel, caminhos de status, contexto das chamadas e campos de formulário."""
        rows, found, reads, snippets, forms = [], set(), {}, {}, []
        try:
            status, ctype, body = self._get("/")
        except Exception as e:
            return [{"path": "/", "status": 0, "type": "", "bytes": 0, "error": _err(e), "head": ""}], [], {}, {}, []
        root = body.decode("utf-8", "replace")
        rows.append({"path": "/", "status": status, "type": ctype, "bytes": len(body), "error": "", "head": root[:300]})
        texts = [("/", root)]
        for src in _SRC_RX.findall(root):
            if len(rows) >= PROBE_MAX_REQUESTS or not src.startswith("/") or _LIB_RX.search(src):
                continue
            try:
                st, ct, bd = self._get(src)
            except Exception as e:
                rows.append({"path": src, "status": 0, "type": "", "bytes": 0, "error": _err(e), "head": ""})
                continue
            txt = bd.decode("utf-8", "replace")
            rows.append({"path": src, "status": st, "type": ct, "bytes": len(bd), "error": "", "head": txt[:300]})
            texts.append((src, txt))
        for _name, txt in texts:
            for m in _API_RX.findall(txt):
                low = m.lower()
                if any(w in low for w in _API_WORDS) and not low.endswith((".js", ".css", ".png", ".svg", ".ico")):
                    found.add(m)
        for path in READ_ENDPOINTS:
            try:
                st, ct, bd = self._get(path)
                reads[path] = {"status": st, "type": ct, "bytes": len(bd), "body": bd.decode("utf-8", "replace")[:4000]}
            except Exception as e:
                reads[path] = {"status": 0, "type": "", "bytes": 0, "body": "", "error": _err(e)}
        # contexto em volta de cada caminho (revela método e parâmetros da chamada) sem chamar o caminho
        for path in sorted(set(found) | set(NEVER_CALLED) | set(READ_ENDPOINTS)):
            hits = []
            for name, txt in texts:
                start = 0
                while len(hits) < 3:
                    i = txt.find(path, start)
                    if i < 0:
                        break
                    hits.append({"in": name, "text": txt[max(0, i - 220): i + len(path) + 220]})
                    start = i + len(path)
            if hits:
                snippets[path] = hits
        for tag in _FORM_RX.findall(root)[:6]:
            forms.append({"form": tag[:200]})
        for tag in _INPUT_RX.findall(root)[:20]:
            attrs = {k.lower(): v for k, v in _ATTR_RX.findall(tag)}  # só nomes e tipos, nunca valores
            if attrs:
                forms.append({"input": attrs})
        return rows, sorted(found)[:60], reads, snippets, forms


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
        self.detail = ""  # motivo exato da última falha, mostrado na tela
        self.api = MudfishApi()
        self.option_state = ""  # "" | applied | api_unmapped | failed
        self._check_cache = (0.0, "unknown", False)
        self.owned = False  # ligado por perfil de jogo (não persiste ao reiniciar)

    # ---------- arquivos ----------
    @property
    def store(self):
        return os.path.join(self.runtime_dir, "mudfish")

    @property
    def log_path(self):
        return os.path.join(self.runtime_dir, "mudfish.log")

    @property
    def install_log_path(self):
        return os.path.join(self.runtime_dir, "mudfish-install.log")

    def _log_install(self, text):
        try:
            os.makedirs(self.runtime_dir, exist_ok=True)
            with open(self.install_log_path, "a", encoding="utf-8") as f:
                f.write("[%s] %s\n" % (time.strftime("%Y-%m-%d %H:%M:%S"), str(text)[-LOG_MAX:]))
        except OSError:
            pass

    def _log_tail(self):
        try:
            with open(self.log_path, "rb") as f:
                f.seek(0, os.SEEK_END)
                f.seek(max(0, f.tell() - 600))
                return _tail(f.read().decode("utf-8", "replace"))
        except OSError:
            return ""

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

    def _set(self, phase, error="", detail=""):
        self.phase, self.error, self.detail = phase, error, detail
        self._publish()

    def _publish(self):
        version, _exe = self.installed()
        core_state.bus.set_state("mudfish", {
            "installed": bool(version), "running": self._alive(), "phase": self.phase, "error": self.error,
            "detail": self.detail,
        })

    async def get_status(self):
        cfg = self.load()
        version, _exe = self.installed()
        running = self._alive()
        if self.phase in ("running", "starting") and not running and self.phase != "starting":
            self.phase = "off"
        if running and self.phase == "off":
            self.phase = "running"
        session, api_ok = await self._check()
        logged = session == "active" or (session == "unknown" and cfg["login_done"])
        data = {
            "arch_ok": platform.machine() == "x86_64",
            "installed": bool(version),
            "version": version,
            "mounted": mounted(self.mount_point),
            "running": running,
            "port_open": await asyncio.to_thread(port_open),
            "phase": self.phase,
            "error": self.error,
            "detail": self.detail,
            "auto_selection": cfg["auto_selection"],
            "multipath": cfg["multipath"],
            "auto_on_game": cfg["auto_on_game"],
            "option_state": self.option_state,
            "login_done": logged,
            "session": session,
            "api_ok": api_ok,
            "user": cfg["user"],
            "has_password": bool(cfg["password"]),
            "step": "install" if not version else ("login" if not logged else "activate"),
            "keep_on": cfg["keep_on"],
            "ping_target": cfg["ping_target"],
            "ping_before": cfg["ping_before"],
            "ping_after": cfg["ping_after"],
            "webui": WEBUI_URL,
        }
        self._publish()
        return data

    async def _check(self):
        """Sessão do painel e estado da API, com cache curto (o painel do Decky consulta a cada poucos segundos)."""
        at, session, api_ok = self._check_cache
        if time.monotonic() - at < SESSION_TTL:
            return session, api_ok
        if not (self._alive() and await asyncio.to_thread(port_open)):
            self._check_cache = (time.monotonic(), "unknown", False)
            return "unknown", False
        try:
            session, api_ok = await asyncio.to_thread(self.api.check)
        except Exception:  # pragma: no cover - defensivo
            session, api_ok = "unknown", False
        self._check_cache = (time.monotonic(), session, api_ok)
        return session, api_ok

    # ---------- instalação ----------
    async def _ensure_mount(self):
        """(ok, motivo). Liga a pasta persistente em /opt/mudfish com mount --bind."""
        if mounted(self.mount_point):
            return True, ""
        try:
            os.makedirs(self.store, exist_ok=True)
        except OSError as e:
            return False, "pasta persistente %s: %s" % (self.store, _err(e))
        try:
            os.makedirs(self.mount_point, exist_ok=True)
        except OSError as e:
            # SteamOS imutável: libera a escrita só o tempo de criar o ponto de montagem.
            if not shutil.which("steamos-readonly"):
                return False, "não deu para criar %s (%s) e steamos-readonly não existe" % (self.mount_point, _err(e))
            rc, out = await self.run(["steamos-readonly", "disable"], 30)
            if rc != 0:
                return False, "steamos-readonly disable falhou (código %s): %s" % (rc, _tail(out, 200))
            mk_err = ""
            try:
                os.makedirs(self.mount_point, exist_ok=True)
            except OSError as e2:
                mk_err = _err(e2)
            finally:
                await self.run(["steamos-readonly", "enable"], 30)
            if not os.path.isdir(self.mount_point):
                return False, "não deu para criar %s mesmo liberando a escrita: %s" % (self.mount_point, mk_err)
        rc, out = await self.run(["mount", "--bind", self.store, self.mount_point], 15)
        if rc != 0:
            return False, "mount --bind falhou (código %s): %s" % (rc, _tail(out, 200))
        if not mounted(self.mount_point):
            return False, "mount --bind terminou sem erro, mas %s não aparece montado" % self.mount_point
        return True, ""

    def _fetch_latest(self):
        try:
            req = urllib.request.Request(RELEASES_URL, headers={"User-Agent": "NoLag"})
            with urllib.request.urlopen(req, timeout=15) as r:  # noqa: S310 - URL fixa
                html = r.read(2_000_000).decode("utf-8", "ignore")
            versions = parse_release_versions(html)
            return versions[-1] if versions else FALLBACK_VERSION
        except Exception:
            return FALLBACK_VERSION

    def _check_installer(self, tmp):
        """Confere o arquivo baixado; devolve o motivo se não for o instalador, senão ''."""
        try:
            size = os.path.getsize(tmp)
            with open(tmp, "rb") as f:
                head = f.read(60)
        except OSError as e:
            return _err(e)
        if size < MIN_INSTALLER or not head.startswith(b"#!"):
            start = head[:40].decode("utf-8", "replace").replace("\n", " ")
            return "arquivo inválido: %d bytes, começa com %r (esperado um script com mais de 1 MB)" % (size, start)
        return ""

    def _download(self, version, dest):
        """Baixa com urllib. Levanta ValueError com o motivo exato se falhar."""
        url = RELEASES_URL + INSTALLER % version
        req = urllib.request.Request(url, headers={"User-Agent": "NoLag"})
        tmp = dest + ".part"
        try:
            with urllib.request.urlopen(req, timeout=60) as r, open(tmp, "wb") as f:  # noqa: S310 - URL fixa
                shutil.copyfileobj(r, f)
        except Exception as e:
            self._rm(tmp)
            raise ValueError("%s (%s)" % (_err(e), url))
        bad = self._check_installer(tmp)
        if bad:
            self._rm(tmp)
            raise ValueError(bad)
        os.replace(tmp, dest)

    @staticmethod
    def _rm(path):
        try:
            os.remove(path)
        except OSError:
            pass

    async def _download_curl(self, version, dest):
        """Plano B: curl do sistema (certificados do SteamOS). Devolve o motivo ou ''."""
        if not shutil.which("curl"):
            return "curl não encontrado"
        url = RELEASES_URL + INSTALLER % version
        tmp = dest + ".part"
        rc, out = await self.run(["curl", "-fsSL", "--retry", "2", "--connect-timeout", "15", "-o", tmp, url], 180)
        if rc != 0:
            self._rm(tmp)
            return "curl código %s: %s" % (rc, _tail(out, 200))
        bad = self._check_installer(tmp)
        if bad:
            self._rm(tmp)
            return bad
        os.replace(tmp, dest)
        return ""

    async def _fetch_installer(self, version, dest):
        """Baixa o instalador (urllib, depois curl). Devolve '' se deu certo, senão o motivo."""
        try:
            await asyncio.to_thread(self._download, version, dest)
            return ""
        except Exception as e:
            first = str(e)
        self._log_install("download urllib falhou: %s" % first)
        second = await self._download_curl(version, dest)
        if not second:
            return ""
        self._log_install("download curl falhou: %s" % second)
        return "%s; plano B: %s" % (first, second)

    def _find_exe(self, version):
        exe = os.path.join(self.store, version, "bin", "mudrun-headless")
        return exe if os.path.isfile(exe) else ""

    async def install(self):
        if self.lock.locked():
            return {"ok": False, "error": "busy", "detail": ""}
        async with self.lock:
            if platform.machine() != "x86_64":
                return self._fail("unsupported_arch", "arquitetura %s, o Mudfish só tem pacote x86_64" % platform.machine())
            was_running = self._alive()
            self._set("installing")
            version = ""
            try:
                if was_running:
                    await self._stop_locked()
                    self._set("installing")
                try:
                    os.makedirs(self.runtime_dir, exist_ok=True)
                    os.makedirs(self.store, exist_ok=True)
                    free = shutil.disk_usage(self.runtime_dir).free
                except OSError as e:
                    return self._fail("install_failed", "pasta %s: %s" % (self.runtime_dir, _err(e)))
                if free < MIN_FREE:
                    return self._fail("install_failed", "pouco espaço livre em %s: %d MB (precisa de ao menos %d MB)"
                                      % (self.runtime_dir, free // 1_000_000, MIN_FREE // 1_000_000))
                ok, why = await self._ensure_mount()
                if not ok:
                    return self._fail("mount_failed", why)
                latest = await asyncio.to_thread(self._fetch_latest)
                tried, reasons, version, dest = [], [], "", ""
                for cand in (latest, FALLBACK_VERSION):
                    if cand in tried:
                        continue
                    tried.append(cand)
                    path = os.path.join(self.runtime_dir, INSTALLER % cand)
                    why = await self._fetch_installer(cand, path)
                    if not why:
                        version, dest = cand, path
                        break
                    reasons.append("v%s: %s" % (cand, why))
                if not version:
                    return self._fail("download_failed", " || ".join(reasons))
                tmpdir = os.path.join(self.runtime_dir, "tmp")
                os.makedirs(tmpdir, exist_ok=True)
                # Guia oficial: `sh mudfish-X.Y.Z-linux-x86_64.sh` (aqui já como root, sem sudo).
                rc, out = await self.run(["env", "TMPDIR=" + tmpdir, "sh", dest], 300)
                self._rm(dest)
                shutil.rmtree(tmpdir, ignore_errors=True)
                self._log_install("instalador v%s código %s:\n%s" % (version, rc, out))
                exe = self._find_exe(version)
                if rc != 0 or not exe:
                    try:
                        found = ", ".join(sorted(os.listdir(self.store))) or "vazia"
                    except OSError:
                        found = "ilegível"
                    why = "instalador v%s terminou com código %s%s; %s não tem mudrun-headless (pasta: %s). Saída: %s" % (
                        version, rc, " (tempo esgotado)" if rc == 124 else "", self.store, found, _tail(out, 220))
                    return self._fail("install_failed", why)
                try:
                    os.chmod(exe, 0o755)
                except OSError as e:
                    return self._fail("install_failed", "chmod no mudrun-headless: %s" % _err(e))
                for old in os.listdir(self.store):  # só a versão nova fica no disco
                    if old != version and _VERSION.match(old):
                        shutil.rmtree(os.path.join(self.store, old), ignore_errors=True)
                self._set("off")
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: instalação falhou: {e}")
                return self._fail("install_failed", _err(e))
        if was_running:
            return await self.start()
        return {"ok": True, "error": "", "detail": "", "version": version}

    def _fail(self, code, detail=""):
        detail = str(detail or "")[:DETAIL_MAX * 2]
        decky.logger.error(f"NoLag Mudfish: {code}: {detail}")
        self._log_install("%s: %s" % (code, detail))
        self._set("error", code, detail)
        return {"ok": False, "error": code, "detail": detail}

    # ---------- daemon ----------
    async def start(self):
        if self.lock.locked():
            return {"ok": False, "error": "busy"}
        async with self.lock:
            return await self._start_locked()

    async def _start_locked(self):
        if self._alive():
            self._set("running")
            return {"ok": True, "error": ""}
        version, exe = self.installed()
        if not version:
            return self._fail("not_installed")
        cfg = self.load()
        self._set("starting")
        log = None
        try:
            ok, why = await self._ensure_mount()
            if not ok:
                return self._fail("mount_failed", why)
            if not os.access(exe, os.X_OK):
                try:
                    os.chmod(exe, 0o755)
                except OSError as e:
                    return self._fail("start_failed", "chmod no mudrun-headless: %s" % _err(e))
            os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
            if os.path.isfile(self.log_path) and os.path.getsize(self.log_path) > LOG_MAX:
                os.remove(self.log_path)
            log = open(self.log_path, "ab")
            # Guia oficial: `/opt/mudfish/<versão>/bin/mudrun-headless`, sem flags; o login é pela porta 8282.
            self.proc = await asyncio.create_subprocess_exec(
                exe, stdin=asyncio.subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True,
            )
        except Exception as e:
            decky.logger.error(f"NoLag Mudfish: não iniciou: {e}")
            return self._fail("start_failed", "%s (%s)" % (_err(e), exe))
        finally:
            if log is not None:
                log.close()
        deadline = time.monotonic() + START_WAIT
        while time.monotonic() < deadline:
            if self.proc.returncode is not None and not find_daemon_pids():
                return self._fail("exited", "código %s. Log: %s" % (self.proc.returncode, self._log_tail() or "vazio"))
            if await asyncio.to_thread(port_open):
                break
            await asyncio.sleep(1)
        else:
            tail = self._log_tail()
            await self._kill()
            return self._fail("start_failed", "a porta %d não abriu em %d s. Log: %s" % (PORT, START_WAIT, tail or "vazio"))
        self._set("running")  # ligar nunca ativa o keep_on: só a aba Conf faz isso
        await self._apply_options(cfg)
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

    async def _stop_locked(self):
        self._set("stopping")
        await self._kill()
        self.option_state = ""
        self._set("off")

    async def stop(self):
        async with self.lock:
            await self._stop_locked()
        return {"ok": True, "error": ""}

    async def set_enabled(self, enabled):
        return await (self.start() if enabled is True else self.stop())

    # ---------- configuração ----------
    async def _apply_options(self, cfg):
        """Aplica Auto Selection e Multi-Path pela API local. Nunca derruba o serviço se falhar."""
        opts = {"auto_selection": cfg["auto_selection"], "multipath": cfg["multipath"]}
        try:
            ok, why = await asyncio.to_thread(self.api.apply, opts)
        except Exception as e:  # pragma: no cover - defensivo
            ok, why = False, _err(e)
        self.option_state = "applied" if ok else ("api_unmapped" if why == "api_unmapped" else "failed")
        if not ok:
            self._log_install("opções %s não aplicadas: %s" % (opts, why))
        self._publish()
        return ok, why

    async def set_option(self, key, value):
        """Liga ou desliga uma opção guardada (auto_selection, multipath, auto_on_game, keep_on)."""
        if key not in OPTION_KEYS or not isinstance(value, bool):
            return {"ok": False, "error": "bad_option"}
        cfg = self.load()
        cfg[key] = value
        self.save(cfg)
        applied = False
        if key in ("auto_selection", "multipath") and self._alive():
            applied, _why = await self._apply_options(cfg)
        return {"ok": True, "error": "", "key": key, "value": value, "applied": applied, "state": self.option_state}

    async def confirm_login(self, done):
        """O login é feito no painel (porta 8282); aqui só guarda que o usuário já entrou."""
        cfg = self.load()
        cfg["login_done"] = done is True
        self.save(cfg)
        return {"ok": True, "error": ""}

    async def set_credentials(self, user, password):
        """Usuário e senha opcionais, só neste aparelho (0600). Senha vazia mantém a que já estava guardada."""
        if not isinstance(user, str) or not isinstance(password, str):
            return {"ok": False, "error": "bad_credentials"}
        user = user.strip()
        if not user or len(user) > MAX_USER or len(password) > MAX_PASS:
            return {"ok": False, "error": "bad_credentials"}
        if not all(ch.isprintable() for ch in user + password):
            return {"ok": False, "error": "bad_credentials"}
        cfg = self.load()
        cfg["user"] = user
        if password:
            cfg["password"] = password
        self.save(cfg)
        return {"ok": True, "error": "", "has_password": bool(cfg["password"])}

    async def clear_credentials(self):
        cfg = self.load()
        cfg["user"], cfg["password"] = "", ""
        self.save(cfg)
        return {"ok": True, "error": ""}

    async def reset_session(self):
        """Reseta a sessão: sai do painel (se ele responder) e volta o passo de login."""
        out = await asyncio.to_thread(self.api.logout) if self._alive() else False
        cfg = self.load()
        cfg["login_done"] = False
        self.save(cfg)
        self._check_cache = (0.0, "unknown", False)
        return {"ok": True, "error": "", "logged_out": bool(out)}

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
        # Aviso de VPN total: com o Mudfish ligado, a rota até um destino qualquer não pode passar pelo túnel.
        info["full_vpn"] = bool(info["running"] and _TUNNEL_DEV.match(info.get("dev") or ""))
        return info

    async def get_live(self):
        """Medição contínua para o gráfico do Painel.

        Sempre mede a linha base "sem Mudfish" pela interface padrão (custo zero de créditos). Com o Mudfish ligado,
        mede também pelo túnel, ao mesmo tempo, para mostrar o ganho real.
        """
        cfg = self.load()
        target = cfg["ping_target"]
        running = self._alive()
        base_dev = await core_state.default_dev()
        tun = await core_state.tunnel_dev() if running else ""
        jobs = [core_state.ping_stats(target, LIVE_COUNT, base_dev or None), core_state.route_get(target)]
        if tun:
            jobs.append(core_state.ping_stats(target, LIVE_COUNT, tun))
        res = await asyncio.gather(*jobs, return_exceptions=True)
        ok = lambda x: None if isinstance(x, Exception) else x  # noqa: E731
        base, route = ok(res[0]), ok(res[1]) or {}
        tunnel = ok(res[2]) if tun else None
        full_vpn = bool(running and (_TUNNEL_DEV.match(route.get("dev") or "") or _TUNNEL_DEV.match(base_dev or "")))
        return {"ok": True, "running": running, "base": base, "tunnel": tunnel, "base_iface": base_dev,
                "tunnel_iface": tun, "full_vpn": full_vpn, "only_game": bool(running and not full_vpn)}

    async def test_ping(self):
        """Com o Mudfish desligado guarda o 'antes'; ligado, guarda o 'depois'."""
        cfg = self.load()
        running = self._alive()
        m = await core_state.ping_stats(cfg["ping_target"], 5)
        cfg["ping_after" if running else "ping_before"] = m
        self.save(cfg)
        return {"ok": m is not None, "which": "after" if running else "before", "metrics": m}

    # ---------- logs e diagnóstico da API ----------
    async def get_logs(self):
        def read(path):
            try:
                with open(path, "rb") as f:
                    f.seek(0, os.SEEK_END)
                    f.seek(max(0, f.tell() - 4000))
                    return _lines_tail(f.read().decode("utf-8", "replace"))
            except OSError:
                return ""
        service = await asyncio.to_thread(read, self.log_path)
        install = await asyncio.to_thread(read, self.install_log_path)
        return {"ok": True, "error": "", "service": service, "install": install}

    async def probe_api(self):
        """Captura (só leitura) o que o painel expõe e grava em mudfish-api.json, para mapear o que falta."""
        if not await asyncio.to_thread(port_open):
            return {"ok": False, "error": "port_closed"}
        rows, found, reads, snippets, forms = await asyncio.to_thread(self.api.probe)
        path = os.path.join(self.runtime_dir, "mudfish-api.json")
        try:
            os.makedirs(self.runtime_dir, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"time": time.strftime("%Y-%m-%d %H:%M:%S"), "requests": rows, "paths": found,
                           "reads": reads, "snippets": snippets, "forms": forms}, f, ensure_ascii=False, indent=2)
        except OSError as e:
            return {"ok": False, "error": "write_failed", "detail": _err(e)}
        return {"ok": True, "error": "", "requests": len(rows), "paths": len(found), "file": path}

    # ---------- ciclo de vida e barramento ----------
    def register(self):
        core_state.bus.register(
            "mudfish",
            enable=self._game_on, disable=self._game_off, active=self._alive, status=self.get_status,
        )
        self._publish()

    async def _game_on(self):
        """Só liga sozinho se o usuário ativou "ao abrir jogo" na aba Conf (padrão: desligado)."""
        if not self.load()["auto_on_game"]:
            return {"ok": False, "error": "auto_off"}
        r = await self.start()
        self.owned = bool(r.get("ok"))
        return r

    async def _game_off(self):
        """Ao fechar o jogo, encerra o Mudfish sempre (ligado por perfil ou à mão) para zerar o tráfego."""
        self.owned = False
        if self._alive():
            return await self.stop()
        return {"ok": True, "error": ""}

    async def _main(self):
        self.register()
        try:
            if self.installed()[0]:
                ok, why = await self._ensure_mount()
                if not ok:
                    decky.logger.error(f"NoLag Mudfish: montagem no boot falhou: {why}")
            if self.load()["keep_on"]:
                if not self._alive():
                    await self.start()
            elif self._alive():
                await self._kill()  # sobra de uma sessão anterior: sempre nasce desligado
                self._set("off")
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
