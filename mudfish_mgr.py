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

API local (127.0.0.1:8282), mapeada pelo mudfish-api.json da v0.11.3 (Mudfish 5.11.0):
  - /do/mudrun/status devolve JSON com isSignedIn, autologin, fullvpn_enabled, core_ready e client_ready. A API local
    não pede JWT: a sessão é a do próprio cliente Mudfish (autologin), então o plugin só lê isSignedIn e NUNCA guarda,
    registra nem repete o jwt/token (o diagnóstico os remove);
  - /do/rtt/staticnodes e /do/rtt/vnodes respondem status 300 enquanto o cliente mede o RTT dos nós e 200 (com rtts)
    quando termina: o plugin repete a leitura até ficar pronto e mostra o estado na tela;
  - Full VPN (fullvpn_enabled) é PERMITIDO desde a v0.15.0 (jogos sem item para a região): o serviço segue ligado e a tela só informa;
  - os caminhos que alteram estado (/do/node/autoselect, /item/conf_onoff) continuam NÃO chamados: o iid dos itens e o
    endpoint do interruptor de Full VPN ainda não foram capturados. O diagnóstico v4 mostrou que user.items (iid, rid, active)
    vem de um POST GraphQL ao api.mudfish.net com o JWT do cliente; a URL ficou fora da captura. Sem ela e sem decisão
    explícita de enviar o JWT do aparelho ao servidor do Mudfish, o plugin não monta o iid (o diagnóstico v5 captura a URL).

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
FALLBACK_VERSION = "6.6.4"  # só para instalação nova quando mudfish.net/releases/ não responde
INSTALLER = "mudfish-%s-linux-x86_64.sh"
MOUNT_POINT = "/opt/mudfish"
START_WAIT = 25
MIN_INSTALLER = 1_000_000
MIN_FREE = 100_000_000
DETAIL_MAX = 400
LOG_MAX = 200_000
_VERSION = re.compile(r"^\d+\.\d+\.\d+$")
_RELEASE_RX = re.compile(r"mudfish-(\d+\.\d+\.\d+)-linux-x86_64\.sh")
PROC_NAMES = ("mudrun", "mudrun-headless", "mudflow", "mudfish")  # processos que a desinstalação encerra
OPTION_KEYS = ("auto_selection", "multipath", "auto_on_game", "keep_on")
_TUNNEL_DEV = core_state.TUNNEL_DEV
# Caminhos de LEITURA do painel (mapeados no mudfish-api.json). Os que alteram estado ficam de fora de propósito.
READ_ENDPOINTS = ("/do/mudrun/status", "/do/status/pingstat", "/do/status/netstat", "/do/rtt/staticnodes", "/do/rtt/vnodes")
NEVER_CALLED = ("/do/node/autoselect", "/item/conf_onoff", "/logout.html")
SESSION_PATH = "/item/list.html"
LOGOUT_PATH = "/logout.html"
SESSION_TTL = 6.0
SESSION_WATCH = 6.0
RTT_PENDING_EVERY = 6.0   # enquanto o cliente ainda mede (status 300)
RTT_READY_EVERY = 120.0   # depois de pronto, só revalida de vez em quando
SECRET_KEYS = ("jwt", "token")
UPDATE_TTL = 6 * 3600.0  # a consulta à página de versões é feita no máximo a cada 6 h
# v4 do diagnóstico: de onde vêm os itens (iid) e o interruptor de Full VPN, e se a interface expõe versão nova.
KEYWORD_PROBES = ("fullvpn", "data.user", "self.user", "updateActiveItems", "turnOffFullVPN", "getconfprogress", "iid",
                  "autoselect", "conf_onoff", "newversion", "upgrade", "download", "mudrun_status.version",
                  "graphql", "mudfishVpnVersion")
# v5: o diagnóstico v4 mostrou que user.items (iid) vem de um POST ao api.mudfish.net com o JWT, mas a janela de
# captura começava depois da URL. Estas chamadas (só o começo de axios.get/post, sem corpo nem cabeçalhos) fecham a lacuna.
# v6: caminho real do botão "Conectar"/"Desconectar" da interface local (método e parâmetros), para ligar a automação.
KEYWORD_PROBES = KEYWORD_PROBES + ("Conectar", "connect", "disconnect", "mudrun/start", "mudrun/stop", "do/mudfish", "pingstat")
# v0.12.5: rotas oficiais da interface local (capturadas do próprio painel): $.post("/do/mudfish/start|stop", {}),
# resposta JSON {status}: start 200 = iniciado, 201 = já em execução; stop 200 = encerrado; 409 = recusado (estado de execução).
START_PATH = "/do/mudfish/start"
STOP_PATH = "/do/mudfish/stop"
START_OK = (200, 201)
STOP_OK = (200,)
PING_LOSS_MS = 2800      # o painel trata valores acima disso como "perda de pacotes" (envia 3000)
PING_WINDOW = 5          # linhas recentes de /do/status/pingstat usadas na média
PING_STALE_S = 120       # linha mais recente mais velha que isso = sem dados
CORE_WAIT = 20           # espera (s) por core_running depois do start
CONNECT_WAIT = 45        # espera máxima (s) pelo núcleo pronto e sessão ativa antes de tentar conectar
CONNECT_STEP = 3.0
CALL_PROBE_MAX = 40
IDLE_BYTES = 4096        # tráfego do cliente nos últimos NET_WINDOW s abaixo disso = túnel ocioso (sem item/jogo ativo)
NET_WINDOW = 10
KEYWORD_PER_SOURCE = 3
KEYWORD_MAX_HITS = 8
PAGE_PROBES = ("/item/list.html", "/item/manage.html")
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


def installer_url(version):
    """URL direta do instalador de uma versão (a versão vem da página de releases ou do fallback, nunca fixa no código)."""
    if not isinstance(version, str) or not _VERSION.match(version):
        raise ValueError("versão inválida: %r" % (version,))
    return RELEASES_URL + INSTALLER % version


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


def find_mudfish_pids(proc="/proc", names=PROC_NAMES, own=None):
    """PIDs de qualquer processo do Mudfish (mudrun, mudrun-headless, mudflow, mudfish), exceto o do próprio plugin."""
    own = os.getpid() if own is None else own
    pids = []
    try:
        entries = os.listdir(proc)
    except OSError:
        return pids
    for entry in entries:
        if not entry.isdigit() or int(entry) == own:
            continue
        try:
            with open(os.path.join(proc, entry, "cmdline"), "rb") as f:
                argv = f.read(4096).split(b"\0")
        except OSError:
            continue
        if argv and os.path.basename(argv[0].decode(errors="ignore")) in names:
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
_CALL_RX = re.compile(r"axios\.(?:post|get|put|delete)\(\s*([^,)]{1,160})", re.I)
_LIB_RX = re.compile(r"(jquery|axios|polyfill|promise|\.min\.js)", re.I)


def _redact(text):
    """Remove jwt/token de qualquer corpo antes de guardar em disco (segredos da sessão do painel)."""
    out = str(text or "")
    for key in SECRET_KEYS:
        out = re.sub(r'("%s"\s*:\s*)"[^"]*"' % key, r'\1"***"', out)
    return re.sub(r"eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}", "***", out)


def _rtt_state(body):
    """('ready'|'pending'|'error', quantidade) de uma resposta de /do/rtt/*."""
    try:
        obj = json.loads(body.decode("utf-8", "replace") if isinstance(body, (bytes, bytearray)) else str(body))
    except Exception:
        return "error", 0
    if not isinstance(obj, dict):
        return "error", 0
    code = obj.get("status")
    if code == 200:
        rtts = obj.get("rtts")
        return "ready", len(rtts) if isinstance(rtts, (list, dict)) else 0
    if code == 300:
        return "pending", 0
    return "error", 0


def _rtt_best(body):
    """Menor `rttavg` (ms) entre os nós medidos de /do/rtt/*, ou None. Só entradas com sucesso e valor positivo."""
    try:
        obj = json.loads(body.decode("utf-8", "replace") if isinstance(body, (bytes, bytearray)) else str(body))
    except Exception:
        return None
    rtts = obj.get("rtts") if isinstance(obj, dict) else None
    if not isinstance(rtts, list):
        return None
    vals = [float(r["rttavg"]) for r in rtts
            if isinstance(r, dict) and isinstance(r.get("rttavg"), (int, float)) and not isinstance(r.get("rttavg"), bool)
            and r["rttavg"] > 0 and (r.get("success") or 0) > 0]
    return min(vals) if vals else None


class MudfishApi:
    """Cliente da API local (127.0.0.1:8282). Só GET, só no próprio aparelho.

    Só lê o que está em READ_ENDPOINTS. Os caminhos que alteram estado (Auto Selection, itens) NÃO são chamados
    enquanto o método e os parâmetros deles não forem capturados (probe) e conferidos.
    """
    ENDPOINTS = {}  # preenchido só depois de mapear os caminhos que alteram estado

    def __init__(self, host="127.0.0.1", port=PORT):
        self.base = "http://%s:%d" % (host, port)
        self._opener = urllib.request.build_opener(_NoRedirect)
        self.last = {}  # último resumo de /do/mudrun/status (sem jwt/token)

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
            status, _ctype, raw = self._get("/do/mudrun/status", follow=False)
            api_ok = status == 200
        except Exception:
            self.last = {}
            return "unknown", False
        info = self._parse_status(raw) if api_ok else {}
        self.last = info
        if isinstance(info.get("signed_in"), bool):  # o próprio cliente diz se a sessão está ativa
            return ("active" if info["signed_in"] else "inactive"), api_ok
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

    @staticmethod
    def _parse_status(raw):
        """Resumo seguro de /do/mudrun/status: só os campos usados, nunca jwt/token."""
        try:
            obj = json.loads(raw.decode("utf-8", "replace"))
        except Exception:
            return {}
        if not isinstance(obj, dict):
            return {}
        flag = lambda k: obj.get(k) if isinstance(obj.get(k), bool) else None  # noqa: E731
        return {"signed_in": flag("isSignedIn"), "autologin": flag("autologin"), "fullvpn": flag("fullvpn_enabled"),
                "core_ready": flag("core_ready"), "client_ready": flag("client_ready"), "core_running": flag("core_running"),
                "version": obj.get("version") if isinstance(obj.get("version"), str) else ""}

    def rtt(self):
        """Estado da medição de RTT dos nós (só leitura): {static, vnodes, n_static, n_vnodes}."""
        out = {}
        for key, path in (("static", "/do/rtt/staticnodes"), ("vnodes", "/do/rtt/vnodes")):
            try:
                st, _ct, body = self._get(path, follow=False)
                state, n = _rtt_state(body) if st == 200 else ("error", 0)
                best = _rtt_best(body) if state == "ready" else None
            except Exception:
                state, n, best = "error", 0, None
            out[key], out["n_" + key] = state, n
            if best is not None and (out.get("best") is None or best < out["best"]):
                out["best"] = best
        return out

    def netstat_recent(self, window=NET_WINDOW):
        """Bytes (rx+tx) do cliente nos últimos `window` segundos, de /do/status/netstat (só leitura). None se falhar."""
        try:
            st, _ct, body = self._get("/do/status/netstat", follow=False)
            rows = json.loads(body.decode("utf-8", "replace")) if st == 200 else None
        except Exception:
            return None
        if not isinstance(rows, list) or not rows:
            return None
        total = 0
        for row in rows[-window:]:
            if isinstance(row, dict):
                for key in ("rx", "tx"):
                    if isinstance(row.get(key), (int, float)):
                        total += row[key]
        return total

    def pingstat(self, now=None):
        """RTT, jitter e perda do túnel, de /do/status/pingstat (só GET).

        Formato real: lista de linhas {"time": ms, "<sid>_<iid>": rtt_ms, ...}; 0 = ainda sem medição e valor acima de
        2800 = perda de pacotes (é como o gráfico do painel lê). Usa as últimas linhas e a coluna (rota) de menor
        mediana. None se não houver dado recente ou válido.
        """
        try:
            st, _ct, body = self._get("/do/status/pingstat", follow=False)
            rows = json.loads(body.decode("utf-8", "replace")) if st == 200 else None
        except Exception:
            return None
        if not isinstance(rows, list):
            return None
        rows = [r for r in rows if isinstance(r, dict)][-PING_WINDOW:]
        if not rows:
            return None
        stamp = rows[-1].get("time")
        if isinstance(stamp, (int, float)) and abs((now if now is not None else time.time()) - stamp / 1000.0) > PING_STALE_S:
            return None
        cols = {}
        for row in rows:
            for key, val in row.items():
                if key != "time" and isinstance(val, (int, float)) and not isinstance(val, bool) and val > 0:
                    cols.setdefault(key, []).append(float(val))
        best = None
        for vals in cols.values():
            good = [v for v in vals if v <= PING_LOSS_MS]
            if not good:
                continue
            med = sorted(good)[len(good) // 2]
            if best is None or med < best[0]:
                best = (med, vals, good)
        if best is None:
            return None
        _med, vals, good = best
        jitter = (sum(abs(x - y) for x, y in zip(good, good[1:])) / (len(good) - 1)) if len(good) > 1 else None
        loss = 100.0 * (len(vals) - len(good)) / len(vals)
        return {"avg": sum(good) / len(good), "jitter": jitter, "loss": loss}

    def _post_json(self, path):
        """POST de formulário vazio (igual ao $.post do painel). Devolve o `status` do JSON ou levanta."""
        req = urllib.request.Request(self.base + path, data=b"", method="POST", headers={"User-Agent": "NoLag"})
        try:
            with self._opener.open(req, timeout=8) as r:  # só 127.0.0.1
                http, raw = r.status, r.read(PROBE_MAX_BYTES)
        except urllib.error.HTTPError as e:
            return e.code
        try:
            obj = json.loads(raw.decode("utf-8", "replace"))
            code = obj.get("status") if isinstance(obj, dict) else None
        except Exception:
            code = None
        return code if isinstance(code, int) else http

    def core_start(self):
        """POST /do/mudfish/start (botão Conectar). (ok, motivo): 200 iniciado, 201 já em execução."""
        try:
            code = self._post_json(START_PATH)
        except Exception as e:
            return False, _err(e)
        return (code in START_OK), ("" if code in START_OK else "status_%s" % code)

    def core_stop(self):
        """POST /do/mudfish/stop (botão Desconectar). (ok, motivo): 200 encerrado."""
        try:
            code = self._post_json(STOP_PATH)
        except Exception as e:
            return False, _err(e)
        return (code in STOP_OK), ("" if code in STOP_OK else "status_%s" % code)

    def connect(self):
        return self.core_start()

    def disconnect(self):
        return self.core_stop()

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
                reads[path] = {"status": st, "type": ct, "bytes": len(bd), "body": _redact(bd.decode("utf-8", "replace"))[:4000]}
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
        # v3: páginas de itens (só GET) e palavras-chave, para mapear o iid e o interruptor de Full VPN
        for page in PAGE_PROBES:
            try:
                st, ct, bd = self._get(page)
            except Exception as e:
                snippets["page:" + page] = [{"in": page, "text": "erro: " + _err(e)}]
                continue
            txt = bd.decode("utf-8", "replace")
            texts.append((page, txt))
            snippets["page:" + page] = [{"in": page, "text": "status %s, %d bytes" % (st, len(bd))}]
        for word in KEYWORD_PROBES:
            hits = []
            for name, txt in texts:
                taken = 0
                for m in re.finditer(re.escape(word), txt, re.I):
                    if taken >= KEYWORD_PER_SOURCE or len(hits) >= KEYWORD_MAX_HITS:
                        break  # limite por página: uma página grande não esgota o espaço das outras
                    taken += 1
                    hits.append({"in": name, "text": _redact(txt[max(0, m.start() - 600): m.end() + 400])})
            if hits:
                snippets["kw:" + word] = hits
        calls, seen = [], set()
        for name, txt in texts:
            for m in _CALL_RX.finditer(txt):
                head = _redact(m.group(0).strip())
                if head not in seen and len(calls) < CALL_PROBE_MAX:
                    seen.add(head)
                    calls.append({"in": name, "text": head})
        if calls:
            snippets["calls"] = calls
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
        self._watch = None
        self.lock = asyncio.Lock()
        self.phase = "off"  # off | installing | starting | running | stopping | error
        self.error = ""
        self.detail = ""  # motivo exato da última falha, mostrado na tela
        self.api = MudfishApi()
        self.option_state = ""  # "" | applied | api_unmapped | failed
        self._check_cache = (0.0, "unknown", False)
        self.owned = False  # ligado por perfil de jogo (não persiste ao reiniciar)
        self.rtt = {"static": "unknown", "vnodes": "unknown", "n_static": 0, "n_vnodes": 0}
        self._rtt_at = 0.0
        self.update = {"latest": "", "checked": False}
        self.connect_state = ""   # "" | connecting | connected | manual (precisa clicar em Conectar no painel) | failed
        self.connect_detail = ""
        self._connect_task = None
        self._auto_update_at = 0.0
        self._update_at = 0.0

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
            "full_vpn_api": self.api.last.get("fullvpn") is True,
            "core_ready": self.api.last.get("core_ready"),
            "rtt": dict(self.rtt),
            "update": self._update_view(version),
            "connect": self.connect_state,
            "connect_detail": self.connect_detail,
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
        await self._sync_login(session)
        return session, api_ok

    async def _sync_login(self, session):
        """Detecção automática: guarda login_done conforme a sessão detectada (sem botão manual)."""
        if session not in ("active", "inactive"):
            return
        want = session == "active"
        try:
            cfg = self.load()
            if cfg["login_done"] != want:
                cfg["login_done"] = want
                self.save(cfg)
        except Exception as e:  # pragma: no cover - defensivo
            decky.logger.error(f"NoLag Mudfish: não gravou o estado de login: {e}")

    def recheck_session(self):
        """Invalida o cache para a próxima leitura refazer a detecção na hora."""
        self._check_cache = (0.0, "unknown", False)

    async def _watch_session(self):
        """Com o serviço ligado, confere a sessão do painel em segundo plano (mesmo com o menu fechado)."""
        try:
            while self._alive():
                await self._check()
                await self._poll_rtt()
                await asyncio.sleep(SESSION_WATCH)
        except asyncio.CancelledError:
            raise
        except Exception as e:  # pragma: no cover - defensivo
            decky.logger.error(f"NoLag Mudfish: vigia de sessão parou: {e}")

    async def _poll_rtt(self, force=False):
        """Lê o estado do RTT dos nós (300 = medindo, 200 = pronto). Só leitura; não toca em itens nem em créditos."""
        now = time.monotonic()
        pending = "pending" in (self.rtt.get("static"), self.rtt.get("vnodes")) or self.rtt.get("static") == "unknown"
        if not force and now - self._rtt_at < (RTT_PENDING_EVERY if pending else RTT_READY_EVERY):
            return
        self._rtt_at = now
        try:
            self.rtt = await asyncio.to_thread(self.api.rtt)
        except Exception:  # pragma: no cover - defensivo
            self.rtt = {"static": "error", "vnodes": "error", "n_static": 0, "n_vnodes": 0}
        # /do/rtt/* pode ficar em "medindo" ou divergir entre si no 6.6.4 mesmo com o painel já mostrando o RTT em
        # tempo real; se o pingstat (a fonte do gráfico do painel) traz dado recente, a medição está funcionando.
        if not (self.rtt.get("static") == "ready" and self.rtt.get("vnodes") == "ready"):
            try:
                live = await asyncio.to_thread(self.api.pingstat)
            except Exception:  # pragma: no cover - defensivo
                live = None
            if live:
                self.rtt = dict(self.rtt, live=True)
                if isinstance(live.get("avg"), (int, float)):
                    self.rtt["ms"] = int(round(live["avg"]))
        # Sem RTT ao vivo, mostra a melhor medição entre os nós (só leitura de /do/rtt/*).
        if "ms" not in self.rtt and isinstance(self.rtt.get("best"), (int, float)):
            self.rtt["ms"] = int(round(self.rtt["best"]))

    def _start_watch(self):
        self._stop_watch()
        self.recheck_session()
        try:
            self._watch = asyncio.get_running_loop().create_task(self._watch_session())
        except RuntimeError:  # pragma: no cover - sem loop
            self._watch = None

    def _stop_watch(self):
        task, self._watch = getattr(self, "_watch", None), None
        if task is not None and not task.done():
            task.cancel()

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
        return self._fetch_latest_strict() or FALLBACK_VERSION

    def _fetch_latest_strict(self):
        """Última versão publicada em mudfish.net/releases, ou '' se a consulta falhar (sem cair na versão fixa)."""
        try:
            req = urllib.request.Request(RELEASES_URL, headers={"User-Agent": "NoLag"})
            with urllib.request.urlopen(req, timeout=15) as r:  # noqa: S310 - URL fixa
                html = r.read(2_000_000).decode("utf-8", "ignore")
            versions = parse_release_versions(html)
            return versions[-1] if versions else ""
        except Exception:
            return ""

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
        url = installer_url(version)
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
        url = installer_url(version)
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

    def _update_view(self, installed):
        latest = self.update.get("latest", "")
        newer = bool(latest and installed and _VERSION.match(latest) and _ver_key(latest) > _ver_key(installed))
        return {"latest": latest, "installed": installed, "available": newer, "checked": bool(self.update.get("checked")),
                "url": installer_url(latest) if latest and _VERSION.match(latest) else ""}

    async def check_update(self, force=False):
        """Consulta a versão mais recente (cache de 6 h). Só informa: nunca baixa nem instala."""
        version, _exe = self.installed()
        if version and (force or not self.update["checked"] or time.monotonic() - self._update_at >= UPDATE_TTL):
            latest = await asyncio.to_thread(self._fetch_latest_strict)
            if not latest:
                return {"ok": False, "error": "update_check_failed", "update": self._update_view(version)}
            self.update, self._update_at = {"latest": latest, "checked": True}, time.monotonic()
        return {"ok": True, "error": "", "update": self._update_view(version)}

    async def update_core(self):
        """Atualização em um clique: confere a versão, baixa, troca o binário e religa o serviço se estava ligado."""
        version, _exe = self.installed()
        if not version:
            return {"ok": False, "error": "not_installed", "detail": ""}
        chk = await self.check_update(force=True)
        if not chk["ok"]:
            return chk
        if not chk["update"]["available"]:
            return {"ok": True, "error": "", "updated": False, "version": version}
        res = await self.install(version=chk["update"]["latest"])
        if res.get("ok"):
            res["updated"] = True
        return res

    async def install(self, version=None):
        wanted = version  # versão pedida (atualização); a variável `version` abaixo passa a guardar a instalada
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
                latest = wanted or await asyncio.to_thread(self._fetch_latest)
                tried, reasons, version, dest = [], [], "", ""
                # Atualização com versão definida: nunca cai na versão fixa (evita rebaixar o Mudfish instalado).
                for cand in ((latest,) if wanted else (latest, FALLBACK_VERSION)):
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
        self._start_watch()
        await self._apply_options(cfg)
        return {"ok": True, "error": ""}

    async def _kill(self):
        self._stop_watch()
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
        self.rtt, self._rtt_at = {"static": "unknown", "vnodes": "unknown", "n_static": 0, "n_vnodes": 0}, 0.0
        self.api.last = {}
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
        if not ok and why != "api_unmapped":  # api_unmapped é esperado até a Etapa 2: não polui o log
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
        self.recheck_session()
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
        info["full_vpn"] = bool(info["running"] and (_TUNNEL_DEV.match(info.get("dev") or "") or self.api.last.get("fullvpn") is True))
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
        # Núcleo ainda subindo (core_ready/client_ready falsos no status): o túnel ainda não carrega tráfego e medi-lo
        # daria um falso 100% de perda. Só mede quando o cliente informa que está pronto (ou não informa nada).
        tunnel_waiting = bool(running and tun and (self.api.last.get("core_ready") is False
                                                   or self.api.last.get("client_ready") is False))
        # Telemetria do próprio Mudfish (RTT/jitter/perda): no modo "Apenas Jogo" só o IP do item passa pelo túnel, então
        # o ICMP para um alvo externo não reflete a rota. Quando a API tem dado recente, ela é a fonte do "Com Mudfish".
        api_m = await asyncio.to_thread(self.api.pingstat) if (running and not tunnel_waiting) else None
        jobs = [core_state.ping_stats(target, LIVE_COUNT, base_dev or None), core_state.route_get(target)]
        if tun and not tunnel_waiting and not api_m:
            jobs.append(core_state.ping_stats(target, LIVE_COUNT, tun))
        res = await asyncio.gather(*jobs, return_exceptions=True)
        ok = lambda x: None if isinstance(x, Exception) else x  # noqa: E731
        base, route = ok(res[0]), ok(res[1]) or {}
        tunnel = ok(res[2]) if (tun and not tunnel_waiting and not api_m) else None
        # Túnel sem resposta alguma com a linha base ok: no modo por jogo o alvo de ping pode não estar no item do
        # Mudfish. Não mostra 100% de perda como se fosse a qualidade do túnel; avisa para usar o IP do servidor.
        no_reply = bool(tunnel and not api_m and base and isinstance(tunnel.get("loss"), (int, float)) and tunnel["loss"] >= 100
                        and isinstance(base.get("loss"), (int, float)) and base["loss"] < 100)
        # Sem item/jogo ativo o túnel fica ocioso: não há tráfego tunelado e o ping pela interface do túnel não tem
        # resposta. Isso não é perda de qualidade. O cliente informa o tráfego em /do/status/netstat; quase nada nos
        # últimos segundos = ocioso. Com tráfego e sem resposta, continua sendo alvo fora do item (blocked).
        tunnel_idle = False
        if no_reply and not api_m:
            recent = await asyncio.to_thread(self.api.netstat_recent)
            tunnel_idle = recent is not None and recent < IDLE_BYTES
        tunnel_blocked = bool(no_reply and not tunnel_idle)
        if no_reply:
            tunnel = None
        tunnel_source = "icmp" if tunnel else ""
        if api_m:
            tunnel, tunnel_source, tunnel_blocked, tunnel_idle = api_m, "api", False, False
        full_vpn = bool(running and (_TUNNEL_DEV.match(route.get("dev") or "") or _TUNNEL_DEV.match(base_dev or "")
                                     or self.api.last.get("fullvpn") is True))
        return {"ok": True, "running": running, "base": base, "tunnel": tunnel, "base_iface": base_dev,
                "tunnel_iface": tun, "full_vpn": full_vpn, "only_game": bool(running and not full_vpn),
                "tunnel_blocked": tunnel_blocked, "tunnel_idle": tunnel_idle, "tunnel_waiting": tunnel_waiting, "rtt": dict(self.rtt),
                "tunnel_source": tunnel_source, "connect": self.connect_state}

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

    async def _auto_update(self):
        """Atualiza o núcleo sozinho (serviço desligado), no máximo uma tentativa a cada UPDATE_TTL. Nunca derruba falha."""
        try:
            if self._alive() or not self.installed()[0]:
                return
            if self._auto_update_at and time.monotonic() - self._auto_update_at < UPDATE_TTL:
                return
            self._auto_update_at = time.monotonic()
            res = await self.update_core()
            if res.get("updated"):
                decky.logger.info("NoLag Mudfish: núcleo atualizado para v%s" % res.get("version"))
        except Exception as e:
            decky.logger.error(f"NoLag Mudfish: atualização automática falhou: {e}")

    async def _auto_connect(self):
        """Espera sessão ativa e núcleo pronto, dispara POST /do/mudfish/start e confere `core_running`.
        Qualquer recusa (409, sessão inativa, erro) vira `manual`: a tela orienta clicar em Conectar no painel."""
        self.connect_state, self.connect_detail = "connecting", ""
        try:
            deadline = time.monotonic() + CONNECT_WAIT
            while time.monotonic() < deadline and self._alive():
                self.recheck_session()
                session, _ok = await self._check()
                last = self.api.last
                if session == "active" and last.get("core_ready") is not False and last.get("client_ready") is not False:
                    ok, why = await asyncio.to_thread(self.api.core_start)
                    if not ok:
                        self.connect_state, self.connect_detail = "manual", why
                        return
                    end = time.monotonic() + CORE_WAIT
                    while time.monotonic() < end and self._alive():
                        self.recheck_session()
                        await self._check()
                        if self.api.last.get("core_running") is True:
                            self.connect_state = "connected"
                            return
                        await asyncio.sleep(1.5)
                    self.connect_state, self.connect_detail = "manual", "core_not_running"
                    return
                await asyncio.sleep(CONNECT_STEP)
            self.connect_state, self.connect_detail = "manual", "session_or_core_not_ready"
        except asyncio.CancelledError:
            raise
        except Exception as e:
            self.connect_state, self.connect_detail = "failed", _err(e)

    def _cancel_connect(self):
        task, self._connect_task = self._connect_task, None
        if task and not task.done():
            task.cancel()
        self.connect_state, self.connect_detail = "", ""

    async def _game_on(self):
        """Só liga sozinho se o usuário ativou "ao abrir jogo" na aba Conf (padrão: desligado)."""
        if not self.load()["auto_on_game"]:
            return {"ok": False, "error": "auto_off"}
        await self._auto_update()
        r = await self.start()
        self.owned = bool(r.get("ok"))
        if r.get("ok"):
            self._connect_task = asyncio.ensure_future(self._auto_connect())
        return r

    async def _game_off(self):
        """Ao fechar o jogo, encerra o Mudfish sempre (ligado por perfil ou à mão) para zerar o tráfego."""
        self.owned = False
        self._cancel_connect()
        if self._alive():
            # Desconecta pela API (igual ao botão Desconectar) e depois encerra o serviço: libera a porta 8282 e zera o
            # consumo. Se a API recusar ou não responder, o encerramento do serviço garante o corte do túnel.
            if self.api.last.get("core_running") is not False and await asyncio.to_thread(port_open):
                ok, why = await asyncio.to_thread(self.api.core_stop)
                if not ok:
                    decky.logger.warning(f"NoLag Mudfish: POST {STOP_PATH} não confirmou ({why}); encerrando o serviço")
            return await self.stop()
        return {"ok": True, "error": ""}

    async def _main(self):
        self.register()
        try:
            if self.installed()[0]:
                ok, why = await self._ensure_mount()
                if not ok:
                    decky.logger.error(f"NoLag Mudfish: montagem no boot falhou: {why}")
            await self._auto_update()
            if self.load()["keep_on"]:
                if not self._alive():
                    await self.start()
            elif self._alive():
                await self._kill()  # sobra de uma sessão anterior: sempre nasce desligado
                self._set("off")
        except Exception as e:
            decky.logger.error(f"NoLag Mudfish: falha ao iniciar: {e}")

    async def _unload(self):
        self._cancel_connect()
        try:
            await self._kill()
        finally:
            core_state.bus.unregister("mudfish")
            self.phase = "off"

    async def _kill_all_mudfish(self):
        """Encerra o serviço do plugin e qualquer outro processo do Mudfish (mudrun, mudflow, mudfish)."""
        await self._kill()
        for sig, wait in ((signal.SIGTERM, 4), (signal.SIGKILL, 2)):
            pids = set(find_mudfish_pids())
            if not pids:
                return
            for pid in pids:
                try:
                    os.kill(pid, sig)
                except (ProcessLookupError, PermissionError, OSError):
                    pass
            end = time.monotonic() + wait
            while time.monotonic() < end and find_mudfish_pids():
                await asyncio.sleep(0.3)

    async def uninstall(self):
        """Remove o Mudfish: encerra os processos, desmonta e apaga /opt/mudfish e a pasta persistente, limpa logs e restos.
        Mantém as preferências do plugin (só zera conta, login e 'manter ligado')."""
        if self.lock.locked():
            return {"ok": False, "error": "busy", "detail": ""}
        async with self.lock:
            self._cancel_connect()
            self._set("stopping")
            removed = []
            try:
                if await asyncio.to_thread(port_open):
                    await asyncio.to_thread(self.api.core_stop)  # melhor esforço: encerra o núcleo antes de matar o processo
                await self._kill_all_mudfish()
                if mounted(self.mount_point):
                    rc, _out = await self.run(["umount", self.mount_point], 15)
                    if rc != 0 or mounted(self.mount_point):
                        await self.run(["umount", "-l", self.mount_point], 15)
                if os.path.isdir(self.store):
                    shutil.rmtree(self.store, ignore_errors=True)
                    removed.append(self.store)
                if os.path.islink(self.mount_point):
                    os.unlink(self.mount_point)
                    removed.append(self.mount_point)
                elif os.path.isdir(self.mount_point) and not mounted(self.mount_point):
                    shutil.rmtree(self.mount_point, ignore_errors=True)
                    if not os.path.exists(self.mount_point):
                        removed.append(self.mount_point)
                shutil.rmtree(os.path.join(self.runtime_dir, "tmp"), ignore_errors=True)
                leftovers = [self.log_path, self.install_log_path, os.path.join(self.runtime_dir, "mudfish-api.json")]
                try:
                    leftovers += [os.path.join(self.runtime_dir, n) for n in os.listdir(self.runtime_dir)
                                  if n.startswith("mudfish-") and n.endswith((".sh", ".part"))]
                except OSError:
                    pass
                for path in leftovers:
                    if os.path.exists(path):
                        self._rm(path)
                        removed.append(path)
                cfg = self.load()
                cfg.update({"login_done": False, "keep_on": False, "user": "", "password": ""})
                self.save(cfg)
                left = [pth for pth in (self.store,) if os.path.exists(pth)]
                if left or find_mudfish_pids():
                    return self._fail("uninstall_failed", "não foi possível remover: %s" % (", ".join(left) or "processo ainda ativo"))
            except Exception as e:
                decky.logger.error(f"NoLag Mudfish: desinstalação falhou: {e}")
                return self._fail("uninstall_failed", _err(e))
            self.rtt, self._rtt_at = {"static": "unknown", "vnodes": "unknown", "n_static": 0, "n_vnodes": 0}, 0.0
            self.api.last = {}
            self.update, self._update_at = {"latest": "", "checked": False}, 0.0
            self.connect_state, self.connect_detail, self.option_state = "", "", ""
            self._check_cache = (0.0, "unknown", False)
            self.owned = False
            self._set("off")
        return {"ok": True, "error": "", "detail": "", "removed": removed}

    async def _uninstall(self):
        await self._unload()
        if mounted(self.mount_point):
            await self.run(["umount", self.mount_point], 15)
        shutil.rmtree(self.store, ignore_errors=True)
