"""Histórico de medições do NoLag (últimos 30 min), para o dashboard em tela cheia.

Módulo independente: não importa Wi-Fi, Mudfish nem o barramento. Quem o cria entrega uma função `sample` (async) que
devolve a medição ao vivo (`{"base": {...}, "tunnel": {...}}`, como o `get_live` do Mudfish). Se ela falhar ou não
existir, só não há histórico; o resto do plugin segue normalmente.

Cada amostra guardada: `{"t": epoch, "b": [ping, jitter, perda] ou None, "w": [ping, jitter, perda] ou None}`, em que
`b` é a conexão normal (sem Mudfish) e `w` é pelo túnel do Mudfish (com Mudfish). Só leitura de medições já feitas.
"""
import asyncio
import json
import os
import time

import decky

INTERVAL = 10        # segundos entre amostras
WINDOW = 1800        # janela guardada: 30 min
FLUSH_EVERY = 60     # segundos entre gravações em disco
MAX_SAMPLES = WINDOW // 2  # teto de segurança (nunca chega perto com INTERVAL 10)


def _num(v, digits=1):
    if isinstance(v, bool) or not isinstance(v, (int, float)) or v != v or v in (float("inf"), float("-inf")):
        return None
    return round(float(v), digits)


def pack(metrics):
    """{"avg","jitter","loss"} -> [ping, jitter, perda] (cada um número ou None); tudo vazio vira None."""
    if not isinstance(metrics, dict):
        return None
    out = [_num(metrics.get("avg")), _num(metrics.get("jitter")), _num(metrics.get("loss"))]
    return out if any(v is not None for v in out) else None


def _clean_pack(raw):
    if not isinstance(raw, (list, tuple)) or len(raw) != 3:
        return None
    out = [_num(v) for v in raw]
    return out if any(v is not None for v in out) else None


def clean_samples(raw, now, window=WINDOW):
    """Arquivo ou memória -> lista ordenada de amostras válidas dentro da janela (descarta lixo e relógio adiantado)."""
    out = []
    if not isinstance(raw, list):
        return out
    for item in raw:
        if not isinstance(item, dict):
            continue
        t = item.get("t")
        if isinstance(t, bool) or not isinstance(t, (int, float)) or t != t:
            continue
        t = int(t)
        if t < now - window or t > now + 60:
            continue
        out.append({"t": t, "b": _clean_pack(item.get("b")), "w": _clean_pack(item.get("w"))})
    out.sort(key=lambda s: s["t"])
    return out[-MAX_SAMPLES:]


class HistoryRecorder:
    def __init__(self, sample, path, interval=INTERVAL, window=WINDOW, flush_every=FLUSH_EVERY, clock=time.time):
        self.sample = sample        # async () -> {"base": {...}, "tunnel": {...}} ou None
        self.path = path
        self.interval = interval
        self.window = window
        self.flush_every = flush_every
        self.clock = clock
        self.samples = []
        self.task = None
        self._last_flush = 0.0
        self._dirty = False
        self._load()

    # ---------- arquivo ----------
    def _load(self):
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except Exception:
            return
        self.samples = clean_samples(raw.get("samples") if isinstance(raw, dict) else None, self.clock(), self.window)

    def flush(self):
        if not self._dirty:
            return
        try:
            os.makedirs(os.path.dirname(self.path), exist_ok=True)
            tmp = self.path + ".tmp"
            fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump({"samples": self.samples}, f, separators=(",", ":"))
            os.replace(tmp, self.path)
            self._dirty = False
        except OSError as e:
            decky.logger.error(f"NoLag histórico: não gravou o arquivo: {e}")

    # ---------- medição ----------
    def _prune(self, now):
        cut = now - self.window
        self.samples = [s for s in self.samples if s["t"] >= cut][-MAX_SAMPLES:]

    async def tick(self):
        """Uma medição: nunca levanta erro (a falha só deixa um buraco no histórico)."""
        try:
            live = await self.sample()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            decky.logger.error(f"NoLag histórico: falha ao medir: {e}")
            return None
        if not isinstance(live, dict):
            return None
        now = int(self.clock())
        item = {"t": now, "b": pack(live.get("base")), "w": pack(live.get("tunnel"))}
        if item["b"] is None and item["w"] is None:
            return None
        self.samples.append(item)
        self._prune(now)
        self._dirty = True
        return item

    async def _loop(self):
        try:
            while True:
                await self.tick()
                if self.clock() - self._last_flush >= self.flush_every:
                    self._last_flush = self.clock()
                    await asyncio.to_thread(self.flush)
                await asyncio.sleep(self.interval)
        except asyncio.CancelledError:
            raise

    def start(self):
        if self.task is None or self.task.done():
            self.task = asyncio.ensure_future(self._loop())

    async def stop(self):
        task, self.task = self.task, None
        if task and not task.done():
            task.cancel()
            try:
                await task
            except BaseException:
                pass
        await asyncio.to_thread(self.flush)

    # ---------- reinício ----------
    def reset(self):
        """Apaga todas as amostras (memória e arquivo) e recomeça a métrica a partir de agora."""
        self.samples = []
        self._dirty = True
        self.flush()
        return self.snapshot()

    # ---------- leitura para a tela ----------
    def snapshot(self):
        now = int(self.clock())
        self._prune(now)
        return {"ok": True, "now": now, "interval": self.interval, "window": self.window,
                "samples": [dict(s) for s in self.samples]}
