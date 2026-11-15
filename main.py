import asyncio
import base64
import ipaddress
import json
import os
import re
import shutil
import socket
import sys
import time
import urllib.parse
import urllib.request
from collections import deque

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

LANGS = ("pt", "en", "es")
DEFAULTS = {"language": "pt", "enabled": False, "profile": "balanced", "collapsed": {}, "games": {}}
SECTIONS = ("diag", "routes", "relays", "settings", "chart", "help", "games",
            "wifiMain", "wifiAdv", "wifiStream", "wifiActions")
MAX_GAMES = 50
WATCH_DELAY = 5
WATCH_INTERVAL = 5
HIST_POINTS = 60
PROFILES = {
    "stable": {"margin": 10.0, "max_loss": 20.0},
    "balanced": {"margin": 5.0, "max_loss": 30.0},
    "aggressive": {"margin": 2.0, "max_loss": 40.0},
}

MAX_RELAYS = 4
ENROLL_TIMEOUT = 6
IFACE = "nolag{}"
TABLE_BASE = 51800
PREF_APPLY = 800
PREF_MEASURE = 900
RUN_DIR = "/run/nolag"
INTERVAL = 1.0
SNIFF_SECONDS = 2.0
HISTORY = 5
MIN_PACKETS = 10
MARGIN = 5.0
MAX_LOSS = 30.0
TOOLS = ("ip", "wg", "iptables", "ping")


# ---------- configurações ----------

_APPID = re.compile(r"^\d{1,12}$")


def clean_games(raw):
    """Perfis salvos por jogo: appid -> {name, auto, profile}."""
    out = {}
    if not isinstance(raw, dict):
        return out
    for appid, g in raw.items():
        if len(out) >= MAX_GAMES:
            break
        if not isinstance(appid, str) or not _APPID.match(appid) or not isinstance(g, dict):
            continue
        name = "".join(ch for ch in str(g.get("name", ""))[:40] if ch.isprintable()).strip() or appid
        profile = g.get("profile")
        out[appid] = {
            "name": name,
            "auto": g.get("auto") is True,
            "profile": profile if profile in PROFILES else "balanced",
        }
    return out


def sanitize_settings(raw):
    data = dict(DEFAULTS)
    data["collapsed"] = {}
    data["games"] = {}
    if isinstance(raw, dict):
        lang = raw.get("language")
        if isinstance(lang, str) and lang in LANGS:
            data["language"] = lang
        if isinstance(raw.get("enabled"), bool):
            data["enabled"] = raw["enabled"]
        if raw.get("profile") in PROFILES:
            data["profile"] = raw["profile"]
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


# ---------- relays gerenciados pelo plugin ----------

_KEY = re.compile(r"^[A-Za-z0-9+/]{43}=$")
_NAME = re.compile(r"^[\w\-. ]{1,24}$")


def clean_relay(d):
    """Valida um relay. Devolve dict limpo ou None."""
    if not isinstance(d, dict):
        return None
    try:
        name = str(d.get("name", "")).strip()
        endpoint = str(d.get("endpoint", ""))
        host, port = endpoint.rsplit(":", 1)
        ip = ipaddress.IPv4Address(host)
        port = int(port)
        iface = ipaddress.ip_interface(str(d.get("address", "")))
        pub, priv = str(d.get("public_key", "")), str(d.get("private_key", ""))
    except (ValueError, TypeError):
        return None
    if not _NAME.match(name) or not ip.is_global or not 1 <= port <= 65535:
        return None
    if iface.version != 4 or not iface.ip.is_private or iface.network.prefixlen < 8:
        return None
    if not _KEY.match(pub) or not _KEY.match(priv):
        return None
    return {
        "name": name,
        "endpoint": "%s:%d" % (ip, port),
        "public_key": pub,
        "private_key": priv,
        "address": str(iface),
    }


def parse_relay_code(code):
    """Código 'nolag1:<base64url(json)>' gerado pelo relay-setup.sh. Devolve (relay, erro)."""
    if not isinstance(code, str) or not code.strip().startswith("nolag1:"):
        return None, "bad_code"
    body = code.strip()[7:]
    try:
        data = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)).decode("utf-8"))
    except Exception:
        return None, "bad_code"
    if not isinstance(data, dict):
        return None, "bad_code"
    relay = clean_relay({
        "name": data.get("n"),
        "endpoint": data.get("e"),
        "public_key": data.get("s"),
        "private_key": data.get("k"),
        "address": data.get("a"),
    })
    return (relay, "") if relay else (None, "bad_code")


def load_stored_relays():
    try:
        with open(_path("relays.json"), "r", encoding="utf-8") as f:
            raw = json.load(f)
    except Exception:
        return []
    out = []
    for item in raw if isinstance(raw, list) else []:
        relay = clean_relay(item)
        if relay and all(relay["name"] != r["name"] for r in out):
            out.append(dict(relay, builtin=False))
    return out[:MAX_RELAYS]


def load_file_relays():
    """Relays pré-configurados: linhas 'nolag1:...' em relay-code.txt (pasta do plugin ou das configurações)."""
    out = []
    folders = (getattr(decky, "DECKY_PLUGIN_DIR", ""), decky.DECKY_PLUGIN_SETTINGS_DIR)
    for folder in folders:
        if not folder:
            continue
        try:
            with open(os.path.join(folder, "relay-code.txt"), "r", encoding="utf-8") as f:
                lines = f.read().splitlines()
        except OSError:
            continue
        for line in lines:
            relay, _err = parse_relay_code(line)
            if relay and all(relay["name"] != r["name"] for r in out):
                out.append(dict(relay, builtin=True))
    return out


# ---------- relays públicos com cadastro automático (nolag2) ----------

_P25519 = 2**255 - 19
_TOKEN = re.compile(r"^[A-Za-z0-9_\-]{1,64}$")


def x25519(k_bytes, u_bytes):
    """Curve25519 (RFC 7748). Usado só para gerar a chave WireGuard do próprio aparelho."""
    p = _P25519
    k = bytearray(k_bytes)
    k[0] &= 248
    k[31] &= 127
    k[31] |= 64
    k = int.from_bytes(k, "little")
    u = int.from_bytes(u_bytes, "little") & ((1 << 255) - 1)
    x1, x2, z2, x3, z3, swap = u, 1, 0, u, 1, 0
    for t in range(254, -1, -1):
        kt = (k >> t) & 1
        swap ^= kt
        if swap:
            x2, x3, z2, z3 = x3, x2, z3, z2
        swap = kt
        a = (x2 + z2) % p
        aa = a * a % p
        b = (x2 - z2) % p
        bb = b * b % p
        e = (aa - bb) % p
        c = (x3 + z3) % p
        d = (x3 - z3) % p
        da = d * a % p
        cb = c * b % p
        x3 = pow(da + cb, 2, p)
        z3 = x1 * pow(da - cb, 2, p) % p
        x2 = aa * bb % p
        z2 = e * (aa + 121665 * e) % p
    if swap:
        x2, x3, z2, z3 = x3, x2, z3, z2
    return (x2 * pow(z2, p - 2, p) % p).to_bytes(32, "little")


def new_keypair():
    priv = bytearray(os.urandom(32))
    priv[0] &= 248
    priv[31] &= 127
    priv[31] |= 64
    pub = x25519(bytes(priv), (9).to_bytes(32, "little"))
    return base64.b64encode(bytes(priv)).decode(), base64.b64encode(pub).decode()


def parse_public_code(code):
    """Código 'nolag2:<base64url(json)>': relay público, sem chave privada. Devolve dict ou None."""
    if not isinstance(code, str) or not code.strip().startswith("nolag2:"):
        return None
    body = code.strip()[7:]
    try:
        data = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)).decode("utf-8"))
        name = str(data.get("n", "")).strip()
        host, port = str(data.get("e", "")).rsplit(":", 1)
        ip = ipaddress.IPv4Address(host)
        port = int(port)
        server_key = str(data.get("s", ""))
        url = urllib.parse.urlparse(str(data.get("u", "")))
        token = str(data.get("t", ""))
        url_port = url.port
    except Exception:
        return None
    if not _NAME.match(name) or not ip.is_global or not 1 <= port <= 65535:
        return None
    if not _KEY.match(server_key) or not _TOKEN.match(token):
        return None
    if url.scheme not in ("http", "https") or url.hostname != str(ip) or url_port is None:
        return None
    return {
        "name": name,
        "endpoint": "%s:%d" % (ip, port),
        "public_key": server_key,
        "url": "%s://%s:%d" % (url.scheme, ip, url_port),
        "token": token,
    }


def load_public_relays():
    """Relays públicos listados como 'nolag2:...' em relay-code.txt."""
    out = []
    folders = (getattr(decky, "DECKY_PLUGIN_DIR", ""), decky.DECKY_PLUGIN_SETTINGS_DIR)
    for folder in folders:
        if not folder:
            continue
        try:
            with open(os.path.join(folder, "relay-code.txt"), "r", encoding="utf-8") as f:
                lines = f.read().splitlines()
        except OSError:
            continue
        for line in lines:
            relay = parse_public_code(line)
            if relay and all(relay["name"] != r["name"] for r in out):
                out.append(relay)
    return out


def load_enrollments():
    try:
        with open(_path("enrollments.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return {}
    return data if isinstance(data, dict) else {}


def _enroll_http(base, token, pubkey):
    """Pede ao relay um endereço para esta chave pública. Devolve o endereço ou None."""
    body = json.dumps({"v": 1, "pubkey": pubkey, "token": token}).encode("utf-8")
    req = urllib.request.Request(
        base.rstrip("/") + "/enroll", data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=ENROLL_TIMEOUT) as resp:
            data = json.loads(resp.read(2048).decode("utf-8"))
    except Exception:
        return None
    address = data.get("address") if isinstance(data, dict) else None
    return address if isinstance(address, str) else None


async def enrolled_relays(room):
    """Gera a chave própria, cadastra no relay público e reaproveita o cadastro. Devolve (relays, falhas)."""
    store = load_enrollments()
    out, failed, changed = [], 0, False
    for pub in load_public_relays()[: max(room, 0)]:
        saved = store.get(pub["name"])
        if not (
            isinstance(saved, dict)
            and saved.get("server") == pub["public_key"]
            and saved.get("endpoint") == pub["endpoint"]
            and _KEY.match(str(saved.get("private_key", "")))
            and _KEY.match(str(saved.get("public_key", "")))
        ):
            priv, cpub = new_keypair()
            saved = {"private_key": priv, "public_key": cpub, "server": pub["public_key"], "endpoint": pub["endpoint"]}
        address = await asyncio.to_thread(_enroll_http, pub["url"], pub["token"], saved["public_key"])
        relay = None
        if address:
            relay = clean_relay({
                "name": pub["name"],
                "endpoint": pub["endpoint"],
                "public_key": pub["public_key"],
                "private_key": saved["private_key"],
                "address": address,
            })
        if relay:
            store[pub["name"]] = dict(saved, address=address)
            changed = True
            out.append(dict(relay, builtin=True))
        else:
            failed += 1
    if changed:
        _write_private(_path("enrollments.json"), json.dumps(store, indent=2))
    return out, failed



def load_relays():
    out = load_file_relays()
    for relay in load_stored_relays():
        if all(relay["name"] != r["name"] for r in out):
            out.append(relay)
    return out[:MAX_RELAYS]


def save_relays(relays):
    keep = [{k: v for k, v in r.items() if k != "builtin"} for r in relays]
    _write_private(_path("relays.json"), json.dumps(keep, indent=2))


def public_relays(relays):
    return [{"name": r["name"], "endpoint": r["endpoint"], "builtin": r.get("builtin", False)} for r in relays]


def render_wg_conf(relay):
    """Formato nativo do `wg setconf` (sem Address/Table/hooks)."""
    return (
        "[Interface]\nPrivateKey = %s\n\n[Peer]\nPublicKey = %s\nEndpoint = %s\n"
        "AllowedIPs = 0.0.0.0/0\nPersistentKeepalive = 25\n"
        % (relay["private_key"], relay["public_key"], relay["endpoint"])
    )


# ---------- detecção do jogo e do servidor ----------

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


def parse_packet(data, hatype):
    """(porta origem, IP destino, porta destino) de um pacote UDP/IPv4, ou None."""
    if hatype == 1:
        if len(data) < 14 or data[12:14] != b"\x08\x00":
            return None
        ip = data[14:]
    elif hatype == 65534:
        ip = data
    else:
        return None
    if len(ip) < 28 or ip[0] >> 4 != 4 or ip[9] != 17:
        return None
    ihl = (ip[0] & 15) * 4
    if len(ip) < ihl + 4:
        return None
    return (
        int.from_bytes(ip[ihl:ihl + 2], "big"),
        socket.inet_ntoa(ip[16:20]),
        int.from_bytes(ip[ihl + 2:ihl + 4], "big"),
    )


def sanitize_target(value):
    try:
        ip = ipaddress.IPv4Address(str(value).strip())
    except ValueError:
        return ""
    if not ip.is_global or ip.is_multicast or ip.is_reserved:
        return ""
    return str(ip)


def sniff(ports, seconds, stats=None):
    """Conta pacotes UDP enviados pelas portas do jogo, por IP de destino (só leitura)."""
    counts = {}
    if not ports:
        return counts
    s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(3))
    s.settimeout(0.2)
    end = time.monotonic() + seconds
    try:
        while time.monotonic() < end:
            try:
                data, addr = s.recvfrom(2048)
            except socket.timeout:
                continue
            if addr[2] != 4 or addr[0] == "lo":
                continue
            pkt = parse_packet(data, addr[3])
            if not pkt or pkt[0] not in ports:
                continue
            if stats is not None:
                stats["seen"] = stats.get("seen", 0) + 1
            if pkt[2] in (53, 123):
                continue
            dst = sanitize_target(pkt[1])
            if dst:
                counts[dst] = counts.get(dst, 0) + 1
    finally:
        s.close()
    return counts


def push_sample(series, key, metrics):
    """Guarda o ping médio (ou None se perdeu tudo) da rota para o gráfico."""
    values = series.setdefault(key, deque(maxlen=HIST_POINTS))
    avg = metrics.get("avg") if isinstance(metrics, dict) else None
    values.append(avg)


def merge_counts(history):
    total = {}
    for counts in history:
        for ip, n in counts.items():
            total[ip] = total.get(ip, 0) + n
    return total


def pick_target(tally, current):
    cand = {ip: n for ip, n in tally.items() if n >= MIN_PACKETS}
    if current in cand:
        return current
    return max(cand, key=cand.get) if cand else None


# ---------- medição e escolha ----------

_LOSS = re.compile(r"(\d+(?:\.\d+)?)% packet loss")
_RTT = re.compile(r"= ([\d.]+)/([\d.]+)/([\d.]+)/([\d.]+) ms")


def parse_ping(text):
    m = _LOSS.search(text or "")
    if not m:
        return None
    loss = float(m.group(1))
    r = _RTT.search(text)
    if not r:
        return {"avg": None, "jitter": None, "loss": loss}
    return {"avg": float(r.group(2)), "jitter": float(r.group(4)), "loss": loss}


def score(m, max_loss=MAX_LOSS):
    if not m or m["avg"] is None or m["loss"] >= max_loss:
        return None
    return m["avg"] + 2 * m["jitter"] + 10 * m["loss"]


def choose(direct, relays, active, margin=MARGIN):
    cand = {"direct": direct if direct is not None else float("inf")}
    for key, value in relays.items():
        if value is not None:
            cand[key] = value
    best = min(cand, key=cand.get)
    cur = cand.get(active, float("inf"))
    if best != active and cand[best] + margin < cur:
        return best
    return active if active in cand else best


# ---------- comandos de rede (tudo reversível) ----------

def _clean_env():
    env = dict(os.environ)
    for k in ("LD_LIBRARY_PATH", "LD_PRELOAD"):
        env.pop(k, None)
    return env


async def run(cmd, timeout=15):
    proc = None
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=_clean_env(),
        )
        out, _ = await asyncio.wait_for(proc.communicate(), timeout)
        return proc.returncode, out.decode(errors="replace")
    except asyncio.TimeoutError:
        try:
            proc.kill()
        except Exception:
            pass
        return 124, ""
    except Exception as e:
        return 127, str(e)


async def teardown():
    """Remove tudo que o plugin cria. Pode rodar quantas vezes precisar."""
    for _ in range(5):
        rc, _o = await run(["ip", "rule", "del", "pref", str(PREF_APPLY)])
        if rc != 0:
            break
    for i in range(MAX_RELAYS):
        name = IFACE.format(i)
        for _ in range(3):
            rc, _o = await run(["ip", "rule", "del", "pref", str(PREF_MEASURE + i)])
            if rc != 0:
                break
        await run(["ip", "route", "flush", "table", str(TABLE_BASE + i)])
        for _ in range(3):
            rc, _o = await run(["iptables", "-t", "nat", "-D", "POSTROUTING", "-o", name, "-j", "MASQUERADE"])
            if rc != 0:
                break
        await run(["ip", "link", "del", name])


async def setup_relay(index, relay):
    name = IFACE.format(index)
    table = str(TABLE_BASE + index)
    path = os.path.join(RUN_DIR, name + ".conf")
    os.makedirs(RUN_DIR, mode=0o700, exist_ok=True)
    rc, out = await run(["ip", "link", "add", name, "type", "wireguard"])
    if rc != 0:
        decky.logger.error("ip link add %s falhou: %s", name, out.strip()[-200:])
        return False
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(render_wg_conf(relay))
    try:
        rc, out = await run(["wg", "setconf", name, path])
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
    if rc != 0:
        decky.logger.error("wg setconf falhou em %s: %s", name, out.strip()[-200:])
        return False
    steps = (
        ["ip", "addr", "add", relay["address"], "dev", name],
        ["ip", "link", "set", name, "mtu", "1380", "up"],
        ["ip", "route", "replace", "default", "dev", name, "table", table],
        ["ip", "rule", "add", "oif", name, "lookup", table, "pref", str(PREF_MEASURE + index)],
    )
    for cmd in steps:
        rc, _o = await run(cmd)
        if rc != 0:
            return False
    masq = ["POSTROUTING", "-o", name, "-j", "MASQUERADE"]
    rc, _o = await run(["iptables", "-t", "nat", "-C"] + masq)
    if rc != 0:
        rc, _o = await run(["iptables", "-t", "nat", "-A"] + masq)
        if rc != 0:
            return False
    return True


async def apply_route(target, index):
    """index None = rota direta (sem regra). Só um IP é desviado."""
    await run(["ip", "rule", "del", "pref", str(PREF_APPLY)])
    if index is None:
        return True
    rc, _o = await run(
        ["ip", "rule", "add", "to", target + "/32", "ipproto", "udp", "lookup", str(TABLE_BASE + index), "pref", str(PREF_APPLY)]
    )
    return rc == 0


async def ping_target(target, iface=None):
    cmd = ["ping", "-n", "-c", "5", "-i", "0.2", "-W", "1"]
    if iface:
        cmd += ["-I", iface]
    cmd.append(target)
    _rc, out = await run(cmd, 15)
    return parse_ping(out)


# ---------- plugin ----------

class Plugin:
    def __init__(self):
        self.wifi = WifiManager() if WifiManager is not None else None
        self.wifi_task = None
        self.task = None
        self.watcher = None
        self.manual = False
        self.status = self._new_status("off")

    def _new_status(self, phase, error="", detail="", game="", target="", notice="", relays=None, appid=""):
        return {
            "phase": phase,
            "active": "direct",
            "game": game,
            "appid": appid,
            "target": target,
            "direct": None,
            "direct_score": None,
            "relays": relays or [],
            "error": error,
            "detail": detail,
            "notice": notice,
            "diag": {"pids": 0, "ports": 0, "seen": 0, "top": []},
            "history": {},
        }

    def _fail(self, error, detail=""):
        self.status = self._new_status("error", error, detail)

    def _cancel_watch(self):
        watcher, self.watcher = self.watcher, None
        if watcher and not watcher.done():
            watcher.cancel()

    def _begin_watch(self, force=False):
        if self.watcher and not self.watcher.done():
            return
        if not force and self.task and not self.task.done():
            return
        self.watcher = asyncio.ensure_future(self._watch())

    async def _watch(self):
        """Com a chave desligada, espera um jogo com perfil automático abrir e liga sozinho."""
        try:
            await asyncio.sleep(WATCH_DELAY)
            while True:
                data = _load()
                if data["enabled"]:
                    return
                wanted = {k for k, g in data["games"].items() if g["auto"]}
                if wanted:
                    pids = await asyncio.to_thread(find_game_pids)
                    appid = await asyncio.to_thread(game_id, pids) if pids else ""
                    if appid in wanted:
                        data["enabled"] = True
                        _save(data)
                        self.manual = False
                        self.watcher = None
                        self._start()
                        return
                await asyncio.sleep(WATCH_INTERVAL)
        except asyncio.CancelledError:
            raise
        except Exception:
            decky.logger.exception("NoLag: falha ao esperar o jogo")

    def _start(self):
        self._cancel_watch()
        if self.task and not self.task.done():
            return
        self.status = self._new_status("starting")
        self.task = asyncio.ensure_future(self._monitor())

    async def _stop(self):
        self._cancel_watch()
        task, self.task = self.task, None
        if task and not task.done():
            task.cancel()
            try:
                await task
            except BaseException:
                pass
        await teardown()
        self.status = self._new_status("off")

    async def _restart(self):
        await self._stop()
        if _load()["enabled"]:
            self._start()
        else:
            self._begin_watch()

    async def _monitor(self):
        notice, detail = "", ""
        try:
            if not shutil.which("ping"):
                return self._fail("tools_missing", "ping")
            relays = load_relays()
            missing = [t for t in TOOLS if not shutil.which(t)]
            has_public = bool(load_public_relays())
            if missing and (relays or has_public):
                notice, detail, relays = "tools_missing", ", ".join(missing), []
            else:
                auto_failed = 0
                if has_public and len(relays) < MAX_RELAYS:
                    auto, auto_failed = await enrolled_relays(MAX_RELAYS - len(relays))
                    relays += [r for r in auto if all(r["name"] != x["name"] for x in relays)]
                if not relays:
                    notice = "enroll_failed" if auto_failed else "no_relays"
            rows, ready = [], []
            if relays:
                await teardown()
                for index, relay in enumerate(relays):
                    ok = await setup_relay(index, relay)
                    row = {
                        "name": relay["name"],
                        "iface": IFACE.format(index),
                        "endpoint": relay["endpoint"],
                        "valid": ok,
                        "error": "" if ok else "setup_failed",
                        "metrics": None,
                        "score": None,
                    }
                    rows.append(row)
                    if ok:
                        ready.append((index, row))
                if not ready:
                    notice = "setup_failed"

            def st(phase, **kw):
                return self._new_status(phase, notice=notice, detail=detail, relays=rows, **kw)

            history = deque(maxlen=HISTORY)
            series = {}
            had_game, appid, saved_appid = False, "", ""
            target, active, game = None, "direct", ""
            while True:
                pids = await asyncio.to_thread(find_game_pids)
                if not pids:
                    if target:
                        await apply_route(target, None)
                    if had_game:
                        # Saiu do jogo: desliga sozinho. Com perfil automático, liga de novo ao reabrir.
                        data = _load()
                        data["enabled"] = False
                        _save(data)
                        self.status = self._new_status("off")
                        self._begin_watch(force=True)
                        return
                    target, active, game, appid = None, "direct", "", ""
                    history.clear()
                    self.status = st("waiting")
                    await asyncio.sleep(3)
                    continue
                had_game = True
                appid = await asyncio.to_thread(game_id, pids)
                ports, name = await asyncio.to_thread(game_ports, pids)
                game = name or game
                if appid and appid != saved_appid:
                    saved_appid = appid
                    if self.manual:
                        # Ligou à mão dentro de um jogo: salva o perfil para ligar sozinho nas próximas vezes.
                        data = _load()
                        old = data["games"].get(appid, {})
                        data["games"][appid] = {
                            "name": game or old.get("name") or appid,
                            "auto": True,
                            "profile": old.get("profile") or data["profile"],
                        }
                        _save(sanitize_settings(data))
                try:
                    stats = {}
                    counts = await asyncio.to_thread(sniff, ports, SNIFF_SECONDS, stats)
                except OSError as exc:
                    decky.logger.exception("NoLag: não foi possível observar o tráfego")
                    return self._fail("sniff_failed", "%s (uid %d)" % (exc.strerror or type(exc).__name__, os.geteuid()))
                history.append(counts)
                total = merge_counts(history)
                top = sorted(total.items(), key=lambda kv: -kv[1])[:3]
                diag = {"pids": len(pids), "ports": len(ports), "seen": stats.get("seen", 0), "top": [[ip, n] for ip, n in top]}
                new_target = pick_target(total, target)
                if new_target != target:
                    if target:
                        await apply_route(target, None)
                    target, active = new_target, "direct"
                    series.clear()
                    for _i, row in ready:
                        row["metrics"], row["score"] = None, None
                if not target:
                    self.status = st("waiting", game=game, appid=appid)
                    self.status["diag"] = diag
                    continue
                cur = _load()
                pname = cur["games"].get(appid, {}).get("profile") or cur["profile"]
                prof = PROFILES[pname if pname in PROFILES else "balanced"]
                results = await asyncio.gather(
                    ping_target(target),
                    *[ping_target(target, IFACE.format(i)) for i, _row in ready]
                )
                direct = results[0]
                push_sample(series, "direct", direct)
                for (i, _row), m in zip(ready, results[1:]):
                    push_sample(series, IFACE.format(i), m)
                scores = {}
                for (i, row), m in zip(ready, results[1:]):
                    row["metrics"] = m
                    row["score"] = score(m, prof["max_loss"])
                    scores[IFACE.format(i)] = row["score"]
                dscore = score(direct, prof["max_loss"])
                new = choose(dscore, scores, active, prof["margin"])
                if new != active:
                    index = None if new == "direct" else int(new[len("nolag"):])
                    active = new if await apply_route(target, index) else "direct"
                self.status = st("running", game=game, target=target, appid=appid)
                self.status["active"] = active
                self.status["direct"] = direct
                self.status["direct_score"] = dscore
                self.status["diag"] = diag
                self.status["history"] = {k: list(v) for k, v in series.items()}
                await asyncio.sleep(INTERVAL)
        except Exception:
            decky.logger.exception("NoLag: falha no monitor")
            self._fail("unexpected")
        finally:
            await teardown()

    async def get_settings(self):
        return _load()

    async def set_settings(self, patch):
        data = _load()
        if isinstance(patch, dict):
            appid = self.status.get("appid") or ""
            for key in ("language", "profile", "collapsed"):
                if key in patch:
                    if key == "profile" and appid in data["games"] and patch[key] in PROFILES:
                        data["games"][appid]["profile"] = patch[key]  # dentro de um jogo salvo, vale só para ele
                    else:
                        data[key] = patch[key]
        data = sanitize_settings(data)
        _save(data)
        return data

    async def set_enabled(self, enabled):
        data = _load()
        data["enabled"] = enabled is True
        appid = self.status.get("appid") or ""
        if not data["enabled"] and appid in data["games"]:
            data["games"][appid]["auto"] = False  # desligou de propósito: não liga sozinho neste jogo
        _save(data)
        if data["enabled"]:
            self.manual = True
            self._start()
        else:
            await self._stop()
            self._begin_watch()
        return self.status

    async def set_game_auto(self, appid, auto):
        data = _load()
        if isinstance(appid, str) and appid in data["games"]:
            data["games"][appid]["auto"] = auto is True
            _save(data)
        if not data["enabled"]:
            self._begin_watch()
        return _load()

    async def delete_game(self, appid):
        data = _load()
        if isinstance(appid, str):
            data["games"].pop(appid, None)
            _save(data)
        return _load()

    async def get_status(self):
        return self.status

    async def get_relays(self):
        rows = public_relays(load_relays())
        for r in load_public_relays():
            if all(r["name"] != x["name"] for x in rows):
                rows.append({"name": r["name"], "endpoint": r["endpoint"], "builtin": True})
        return rows[:MAX_RELAYS]

    async def add_relay(self, code):
        relay, err = parse_relay_code(code)
        if err:
            return {"ok": False, "error": err, "relays": public_relays(load_relays())}
        if len([r for r in load_relays() if r["name"] != relay["name"]]) >= MAX_RELAYS:
            return {"ok": False, "error": "too_many", "relays": public_relays(load_relays())}
        stored = [r for r in load_stored_relays() if r["name"] != relay["name"]]
        stored.append(relay)
        save_relays(stored)
        await self._restart()
        return {"ok": True, "error": "", "relays": public_relays(load_relays())}

    async def remove_relay(self, name):
        save_relays([r for r in load_stored_relays() if r["name"] != name])
        await self._restart()
        return public_relays(load_relays())

    async def _main(self):
        if self.wifi is not None:
            self.wifi_task = asyncio.ensure_future(self._wifi_boot())
        await teardown()
        if _load()["enabled"]:
            self.manual = False
            self._start()
        else:
            self._begin_watch()
        decky.logger.info("NoLag iniciado")

    async def _wifi_boot(self):
        try:
            await self.wifi._main()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            decky.logger.error(f"NoLag Wi-Fi: falha ao iniciar: {e}")

    async def _unload(self):
        if self.wifi is not None:
            try:
                await self.wifi._unload()
            except Exception as e:
                decky.logger.error(f"NoLag Wi-Fi: falha ao descarregar: {e}")
            if self.wifi_task is not None and not self.wifi_task.done():
                self.wifi_task.cancel()
        await self._stop()
        decky.logger.info("NoLag descarregado")

    async def _uninstall(self):
        if self.wifi is not None:
            try:
                await self.wifi._uninstall()
            except Exception as e:
                decky.logger.error(f"NoLag Wi-Fi: falha ao desinstalar: {e}")

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

    async def wifi_available(self):
        here = os.path.dirname(os.path.abspath(__file__))
        files = [n for n in ("wifi_mgr.py", "wifi_dispatcher.py") if not os.path.exists(os.path.join(here, n))]
        error = WIFI_IMPORT_ERROR
        if files:
            error = ("arquivo ausente: " + ", ".join(files))[:200]
        return {"available": self.wifi is not None, "error": error}


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
