"""Perfis por jogo: ao abrir um jogo salvo, liga Wi-Fi e/ou Mudfish; ao sair, desfaz só o que ligou.

Fala com os módulos só pelo core_state. Cada ação é isolada: se um módulo falhar ou estiver
indisponível, o outro continua normalmente.
"""
import asyncio

import decky

import core_state

MODULES = ("wifi", "mudfish")
INTERVAL = 5


class GameProfiles:
    def __init__(self, detect, load_games, interval=INTERVAL):
        self.detect = detect          # async () -> (appid, nome) ou ("", "")
        self.load_games = load_games  # () -> {appid: {"wifi": bool, "mudfish": bool, ...}}
        self.interval = interval
        self.task = None
        self.appid = ""
        self.name = ""
        self.started = set()  # módulos que ESTE perfil ligou (só esses são desligados na saída)

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
        await self._leave()

    def current(self):
        return {"appid": self.appid, "name": self.name}

    async def _enter(self, appid):
        wanted = self.load_games().get(appid, {})
        for mod in MODULES:
            if wanted.get(mod) is not True or not core_state.bus.has(mod, "enable"):
                continue
            if await self._is_active(mod):
                continue  # já estava ligado antes do jogo: não é nosso para desligar depois
            r = await core_state.bus.call(mod, "enable")
            if r["ok"] and not (isinstance(r["result"], dict) and r["result"].get("ok") is False):
                self.started.add(mod)
        await core_state.bus.emit("game_started", {"appid": appid, "modules": sorted(self.started)})

    async def _leave(self):
        done, self.started = sorted(self.started), set()
        for mod in done:
            await core_state.bus.call(mod, "disable")
        if done:
            await core_state.bus.emit("game_stopped", {"modules": done})

    async def _is_active(self, mod):
        if not core_state.bus.has(mod, "active"):
            return False
        r = await core_state.bus.call(mod, "active")
        return bool(r["ok"] and r["result"])

    async def tick(self):
        appid, name = await self.detect()
        if appid != self.appid:
            if self.appid:
                await self._leave()
            self.appid, self.name = appid, name if appid else ""
            if appid:
                await self._enter(appid)
        elif appid and name and name != self.name:
            self.name = name

    async def _loop(self):
        try:
            while True:
                try:
                    await self.tick()
                except asyncio.CancelledError:
                    raise
                except Exception as e:
                    decky.logger.error(f"NoLag perfis por jogo: {e}")
                await asyncio.sleep(self.interval)
        except asyncio.CancelledError:
            raise
