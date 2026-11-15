"""Estado e eventos compartilhados do NoLag.

Os módulos (Wi-Fi, Mudfish) se registram aqui e conversam só por este arquivo.
Nenhum módulo importa o outro: se um falhar ou estiver desligado, o outro segue.
"""
import asyncio
import ipaddress
import re
import time

import decky

_HOST = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9\-.]{0,60}[A-Za-z0-9])?$")
_LOSS = re.compile(r"(\d+(?:\.\d+)?)% packet loss")
_RTT = re.compile(r"= ([\d.]+)/([\d.]+)/([\d.]+)/([\d.]+) ms")
_ROUTE = {"dev": re.compile(r"\bdev (\S+)"), "src": re.compile(r"\bsrc (\S+)"), "via": re.compile(r"\bvia (\S+)")}

DEFAULT_TARGET = "1.1.1.1"


def clean_target(value, default=DEFAULT_TARGET):
    """Alvo de ping: IPv4 ou nome de host simples. Qualquer outra coisa vira o padrão."""
    text = str(value or "").strip()
    if not text:
        return default
    try:
        return str(ipaddress.IPv4Address(text))
    except ValueError:
        pass
    if re.fullmatch(r"[\d.]+", text):
        return default  # parece IP mas não é válido
    if _HOST.match(text) and "." in text and not text.startswith("-"):
        return text.lower()
    return default


def parse_ping(text):
    m = _LOSS.search(text or "")
    if not m:
        return None
    loss = float(m.group(1))
    r = _RTT.search(text)
    if not r:
        return {"avg": None, "jitter": None, "loss": loss}
    return {"avg": float(r.group(2)), "jitter": float(r.group(4)), "loss": loss}


def parse_route(text):
    """Lê a saída de `ip route get`: interface, IP local e gateway."""
    out = {"dev": "", "src": "", "via": ""}
    first = (text or "").strip().splitlines()[:1]
    if not first:
        return out
    for key, rx in _ROUTE.items():
        m = rx.search(first[0])
        if m:
            out[key] = m.group(1)
    return out


async def run(cmd, timeout=15):
    proc = None
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdin=asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT
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


async def route_get(target):
    rc, out = await run(["ip", "route", "get", target], 5)
    info = parse_route(out if rc == 0 else "")
    info["target"] = target
    return info


async def ping_stats(target, count=4):
    rc, out = await run(["ping", "-n", "-c", str(int(count)), "-i", "0.2", "-W", "1", target], 15)
    return parse_ping(out)


class Bus:
    """Registro de módulos, estado compartilhado e eventos. Toda chamada é isolada de falhas."""

    def __init__(self):
        self._modules = {}
        self._state = {}
        self._subs = {}

    def register(self, name, **handlers):
        self._modules[name] = dict(handlers)

    def unregister(self, name):
        self._modules.pop(name, None)
        self._state.pop(name, None)

    def has(self, name, action=None):
        mod = self._modules.get(name)
        return bool(mod) and (action is None or action in mod)

    def set_state(self, name, state):
        data = dict(state) if isinstance(state, dict) else {"value": state}
        data["ts"] = time.time()
        self._state[name] = data

    def get_state(self, name):
        return dict(self._state.get(name, {}))

    def states(self):
        return {k: dict(v) for k, v in self._state.items()}

    def subscribe(self, event, callback):
        self._subs.setdefault(event, []).append(callback)

    async def emit(self, event, payload=None):
        results = []
        for cb in list(self._subs.get(event, [])):
            try:
                r = cb(payload)
                if asyncio.iscoroutine(r):
                    r = await r
                results.append(r)
            except Exception as e:  # um assinante com defeito não derruba os outros
                decky.logger.error(f"NoLag bus: falha em {event}: {e}")
        return results

    async def call(self, name, action, *args):
        handler = (self._modules.get(name) or {}).get(action)
        if handler is None:
            return {"ok": False, "error": "module_unavailable", "result": None}
        try:
            r = handler(*args)
            if asyncio.iscoroutine(r):
                r = await r
            return {"ok": True, "error": "", "result": r}
        except Exception as e:
            decky.logger.error(f"NoLag bus: {name}.{action} falhou: {e}")
            return {"ok": False, "error": type(e).__name__, "result": None}


bus = Bus()


async def snapshot(target=DEFAULT_TARGET):
    """Fotografia da conexão para o Painel: rota ativa, ping e o estado de cada módulo."""
    target = clean_target(target)
    route, ping = await asyncio.gather(route_get(target), ping_stats(target, 3))
    return {"route": route, "ping": ping, "modules": bus.states()}
