import asyncio
import base64
import ipaddress
import json
import os
import re
import shutil
import socket
import time
from collections import deque

import decky

LANGS = ("pt", "en", "es")
DEFAULTS = {"language": "pt", "enabled": False}

MAX_RELAYS = 4
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

def sanitize_settings(raw):
    data = dict(DEFAULTS)
    if isinstance(raw, dict):
        lang = raw.get("language")
        if isinstance(lang, str) and lang in LANGS:
            data["language"] = lang
        if isinstance(raw.get("enabled"), bool):
            data["enabled"] = raw["enabled"]
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
        return dict(DEFAULTS)


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


def load_relays():
    try:
        with open(_path("relays.json"), "r", encoding="utf-8") as f:
            raw = json.load(f)
    except Exception:
        return []
    out = []
    for item in raw if isinstance(raw, list) else []:
        relay = clean_relay(item)
        if relay and all(relay["name"] != r["name"] for r in out):
            out.append(relay)
    return out[:MAX_RELAYS]


def save_relays(relays):
    _write_private(_path("relays.json"), json.dumps(relays, indent=2))


def public_relays(relays):
    return [{"name": r["name"], "endpoint": r["endpoint"]} for r in relays]


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


def sniff(ports, seconds):
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
            if not pkt or pkt[0] not in ports or pkt[2] in (53, 123):
                continue
            dst = sanitize_target(pkt[1])
            if dst:
                counts[dst] = counts.get(dst, 0) + 1
    finally:
        s.close()
    return counts


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


def score(m):
    if not m or m["avg"] is None or m["loss"] >= MAX_LOSS:
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
        ["ip", "rule", "add", "to", target + "/32", "lookup", str(TABLE_BASE + index), "pref", str(PREF_APPLY)]
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
        self.task = None
        self.status = self._new_status("off")

    def _new_status(self, phase, error="", detail="", game="", target=""):
        return {
            "phase": phase,
            "active": "direct",
            "game": game,
            "target": target,
            "direct": None,
            "direct_score": None,
            "relays": [],
            "error": error,
            "detail": detail,
        }

    def _fail(self, error, detail=""):
        self.status = self._new_status("error", error, detail)

    def _start(self):
        if self.task and not self.task.done():
            return
        self.status = self._new_status("starting")
        self.task = asyncio.ensure_future(self._monitor())

    async def _stop(self):
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

    async def _monitor(self):
        try:
            missing = [t for t in TOOLS if not shutil.which(t)]
            if missing:
                return self._fail("tools_missing", ", ".join(missing))
            relays = load_relays()
            if not relays:
                return self._fail("no_relays")
            await teardown()
            rows, ready = [], []
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
                self.status = self._new_status("error", "setup_failed")
                self.status["relays"] = rows
                return
            history = deque(maxlen=HISTORY)
            target, active, game = None, "direct", ""
            while True:
                pids = await asyncio.to_thread(find_game_pids)
                if not pids:
                    if target:
                        await apply_route(target, None)
                    target, active, game = None, "direct", ""
                    history.clear()
                    self.status = self._new_status("waiting")
                    self.status["relays"] = rows
                    await asyncio.sleep(3)
                    continue
                ports, name = await asyncio.to_thread(game_ports, pids)
                game = name or game
                try:
                    counts = await asyncio.to_thread(sniff, ports, SNIFF_SECONDS)
                except OSError:
                    decky.logger.exception("NoLag: não foi possível observar o tráfego")
                    return self._fail("sniff_failed")
                history.append(counts)
                new_target = pick_target(merge_counts(history), target)
                if new_target != target:
                    if target:
                        await apply_route(target, None)
                    target, active = new_target, "direct"
                    for _i, row in ready:
                        row["metrics"], row["score"] = None, None
                if not target:
                    self.status = self._new_status("waiting", game=game)
                    self.status["relays"] = rows
                    continue
                results = await asyncio.gather(
                    ping_target(target),
                    *[ping_target(target, IFACE.format(i)) for i, _row in ready]
                )
                direct = results[0]
                scores = {}
                for (i, row), m in zip(ready, results[1:]):
                    row["metrics"] = m
                    row["score"] = score(m)
                    scores[IFACE.format(i)] = row["score"]
                dscore = score(direct)
                new = choose(dscore, scores, active)
                if new != active:
                    index = None if new == "direct" else int(new[len("nolag"):])
                    active = new if await apply_route(target, index) else "direct"
                self.status = {
                    "phase": "running",
                    "active": active,
                    "game": game,
                    "target": target,
                    "direct": direct,
                    "direct_score": dscore,
                    "relays": rows,
                    "error": "",
                    "detail": "",
                }
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
        if isinstance(patch, dict) and "language" in patch:
            data["language"] = patch["language"]
        data = sanitize_settings(data)
        _save(data)
        return data

    async def set_enabled(self, enabled):
        data = _load()
        data["enabled"] = enabled is True
        _save(data)
        if data["enabled"]:
            self._start()
        else:
            await self._stop()
        return self.status

    async def get_status(self):
        return self.status

    async def get_relays(self):
        return public_relays(load_relays())

    async def add_relay(self, code):
        relay, err = parse_relay_code(code)
        relays = load_relays()
        if err:
            return {"ok": False, "error": err, "relays": public_relays(relays)}
        others = [r for r in relays if r["name"] != relay["name"]]
        if len(others) >= MAX_RELAYS:
            return {"ok": False, "error": "too_many", "relays": public_relays(relays)}
        others.append(relay)
        save_relays(others)
        await self._restart()
        return {"ok": True, "error": "", "relays": public_relays(others)}

    async def remove_relay(self, name):
        relays = [r for r in load_relays() if r["name"] != name]
        save_relays(relays)
        await self._restart()
        return public_relays(relays)

    async def _main(self):
        await teardown()
        if _load()["enabled"]:
            self._start()
        decky.logger.info("NoLag iniciado")

    async def _unload(self):
        await self._stop()
        decky.logger.info("NoLag descarregado")
