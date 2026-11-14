import asyncio
import ipaddress
import json
import os
import re
import shutil

import decky

LANGS = ("pt", "en", "es")
DEFAULTS = {"language": "pt", "enabled": False, "target": ""}

MAX_RELAYS = 4
IFACE = "nolag{}"
TABLE_BASE = 51800
PREF_APPLY = 800
PREF_MEASURE = 900
RUN_DIR = "/run/nolag"
INTERVAL = 3.0
MARGIN = 5.0
MAX_LOSS = 30.0
TOOLS = ("ip", "wg", "wg-quick", "iptables", "ping")


# ---------- configurações ----------

def sanitize_target(value):
    if not isinstance(value, str):
        return ""
    try:
        ip = ipaddress.IPv4Address(value.strip())
    except ValueError:
        return ""
    if not ip.is_global or ip.is_multicast or ip.is_reserved:
        return ""
    return str(ip)


def sanitize_settings(raw):
    data = dict(DEFAULTS)
    if isinstance(raw, dict):
        lang = raw.get("language")
        if isinstance(lang, str) and lang in LANGS:
            data["language"] = lang
        if isinstance(raw.get("enabled"), bool):
            data["enabled"] = raw["enabled"]
        data["target"] = sanitize_target(raw.get("target"))
    return data


def _settings_path():
    return os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")


def _load():
    try:
        with open(_settings_path(), "r", encoding="utf-8") as f:
            return sanitize_settings(json.load(f))
    except Exception:
        return dict(DEFAULTS)


def _save(data):
    os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
    tmp = _settings_path() + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, _settings_path())


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


# ---------- relays WireGuard ----------

_IFACE_KEYS = {"privatekey": "PrivateKey", "address": "Address", "mtu": "MTU"}
_PEER_KEYS = {
    "publickey": "PublicKey",
    "presharedkey": "PresharedKey",
    "endpoint": "Endpoint",
    "persistentkeepalive": "PersistentKeepalive",
}
_VALUE = re.compile(r"^[A-Za-z0-9+/=.,:\[\]_\- ]+$")


def build_wg_conf(text):
    """Devolve (conf, endpoint, erro). Só chaves conhecidas passam; PostUp e afins são descartados."""
    section = None
    iface, peer, peers = {}, {}, 0
    for line in text.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        low = line.lower()
        if low == "[interface]":
            section = "i"
            continue
        if low == "[peer]":
            peers += 1
            section = "p" if peers == 1 else "x"
            continue
        if "=" not in line or section in (None, "x"):
            continue
        key, val = (p.strip() for p in line.split("=", 1))
        k = key.lower()
        known = (section == "i" and k in _IFACE_KEYS) or (section == "p" and k in _PEER_KEYS)
        if not known:
            continue
        if not _VALUE.match(val):
            return None, "", "invalid_value"
        if section == "i":
            iface[_IFACE_KEYS[k]] = val
        else:
            peer[_PEER_KEYS[k]] = val
    for need in ("PrivateKey", "Address"):
        if need not in iface:
            return None, "", "missing_" + need.lower()
    for need in ("PublicKey", "Endpoint"):
        if need not in peer:
            return None, "", "missing_" + need.lower()
    lines = ["[Interface]"]
    lines += ["%s = %s" % (k, v) for k, v in iface.items()]
    lines += ["Table = off", "", "[Peer]"]
    lines += ["%s = %s" % (k, v) for k, v in peer.items() if k != "PersistentKeepalive"]
    lines += ["AllowedIPs = 0.0.0.0/0", "PersistentKeepalive = %s" % peer.get("PersistentKeepalive", "25")]
    return "\n".join(lines) + "\n", peer["Endpoint"], ""


def relays_dir():
    return os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "relays")


def load_relays():
    out = []
    try:
        names = sorted(f for f in os.listdir(relays_dir()) if f.lower().endswith(".conf"))
    except OSError:
        return out
    for index, fname in enumerate(names[:MAX_RELAYS]):
        item = {
            "index": index,
            "name": re.sub(r"[^\w\-. ]", "", fname[:-5])[:24] or "relay",
            "endpoint": "",
            "conf": None,
            "error": "",
        }
        try:
            path = os.path.join(relays_dir(), fname)
            if os.path.getsize(path) > 4096:
                raise ValueError("too_big")
            with open(path, "r", encoding="utf-8") as f:
                conf, endpoint, err = build_wg_conf(f.read())
            item["conf"], item["endpoint"], item["error"] = conf, endpoint, err
        except Exception as e:
            item["error"] = str(e) if isinstance(e, ValueError) else "unreadable"
        out.append(item)
    return out


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


async def setup_relay(index, conf):
    name = IFACE.format(index)
    table = str(TABLE_BASE + index)
    os.makedirs(RUN_DIR, mode=0o700, exist_ok=True)
    path = os.path.join(RUN_DIR, name + ".conf")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(conf)
    try:
        rc, out = await run(["wg-quick", "up", path], 20)
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
    if rc != 0:
        decky.logger.error("wg-quick up falhou em %s: %s", name, out.strip()[-300:])
        return False
    steps = (
        ["ip", "route", "replace", "default", "dev", name, "table", table],
        ["ip", "rule", "add", "oif", name, "lookup", table, "pref", str(PREF_MEASURE + index)],
    )
    for cmd in steps:
        rc, _o = await run(cmd)
        if rc != 0:
            return False
    masq = ["-t", "nat", "POSTROUTING", "-o", name, "-j", "MASQUERADE"]
    rc, _o = await run(["iptables", "-t", "nat", "-C"] + masq[2:])
    if rc != 0:
        rc, _o = await run(["iptables", "-t", "nat", "-A"] + masq[2:])
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

    def _new_status(self, phase, error="", detail=""):
        return {
            "phase": phase,
            "active": "direct",
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

    async def _monitor(self):
        try:
            target = _load()["target"]
            missing = [t for t in TOOLS if not shutil.which(t)]
            if missing:
                return self._fail("tools_missing", ", ".join(missing))
            if not target:
                return self._fail("no_target")
            relays = load_relays()
            if not relays:
                return self._fail("no_relays", relays_dir())
            await teardown()
            rows = []
            ready = []
            for r in relays:
                ok = False
                if r["conf"]:
                    ok = await setup_relay(r["index"], r["conf"])
                    if not ok:
                        r["error"] = "setup_failed"
                row = {
                    "name": r["name"],
                    "iface": IFACE.format(r["index"]),
                    "endpoint": r["endpoint"],
                    "valid": ok,
                    "error": r["error"],
                    "metrics": None,
                    "score": None,
                }
                rows.append(row)
                if ok:
                    ready.append((r["index"], row))
            if not ready:
                self.status = self._new_status("error", "setup_failed")
                self.status["relays"] = rows
                return
            active = "direct"
            while True:
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
        old = _load()
        data = dict(old)
        if isinstance(patch, dict):
            for key in ("language", "target"):
                if key in patch:
                    data[key] = patch[key]
        data["enabled"] = old["enabled"]
        data = sanitize_settings(data)
        _save(data)
        if data["target"] != old["target"] and self.task and not self.task.done():
            await self._stop()
            if data["enabled"]:
                self._start()
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

    async def _main(self):
        try:
            os.makedirs(relays_dir(), exist_ok=True)
        except OSError:
            pass
        await teardown()
        if _load()["enabled"]:
            self._start()
        decky.logger.info("NoLag iniciado")

    async def _unload(self):
        await self._stop()
        decky.logger.info("NoLag descarregado")
