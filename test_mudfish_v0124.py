"""v0.12.4: telemetria pela API do Mudfish, conexão automática (sem endpoint inventado) e atualização automática."""
import asyncio
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import mudfish_mgr  # noqa: E402


class FakeApi(mudfish_mgr.MudfishApi):
    def __init__(self, body=None, status=200):
        super().__init__()
        self.body, self.status = body, status

    def _get(self, path, follow=True):
        if self.body is None:
            raise OSError("fora")
        return self.status, "application/json", json.dumps(self.body).encode()


class VersionTests(unittest.TestCase):
    def test_fallback_is_new_core(self):
        self.assertEqual(mudfish_mgr.FALLBACK_VERSION, "6.6.4")

    def test_probe_v6_keywords(self):
        for word in ("Conectar", "disconnect", "pingstat"):
            self.assertIn(word, mudfish_mgr.KEYWORD_PROBES)


if __name__ == "__main__":
    unittest.main()
