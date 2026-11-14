import json
import os

import decky

LANGS = ("pt", "en", "es")
DEFAULTS = {"language": "pt"}


def sanitize_settings(raw):
    data = dict(DEFAULTS)
    if isinstance(raw, dict):
        lang = raw.get("language")
        if isinstance(lang, str) and lang in LANGS:
            data["language"] = lang
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


class Plugin:
    async def get_settings(self):
        return _load()

    async def set_settings(self, patch):
        data = _load()
        if isinstance(patch, dict):
            data.update(patch)
        data = sanitize_settings(data)
        _save(data)
        return data

    async def _main(self):
        decky.logger.info("NoLag iniciado")

    async def _unload(self):
        decky.logger.info("NoLag descarregado")
