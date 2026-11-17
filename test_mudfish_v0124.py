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


class PingstatTests(unittest.TestCase):
    def test_reads_last_row_of_list(self):
        rows = [{"rtt": 99, "jitter": 9, "loss": 5}, {"rtt": 32.5, "jitter": 1.2, "loss": 0}]
        self.assertEqual(FakeApi(rows).pingstat(), {"avg": 32.5, "jitter": 1.2, "loss": 0.0})

    def test_reads_nested_dict_and_alt_names(self):
        self.assertEqual(FakeApi({"data": {"avg": 20, "mdev": 2, "lost": 1}}).pingstat(), {"avg": 20.0, "jitter": 2.0, "loss": 1.0})

    def test_missing_fields_stay_none_not_invented(self):
        self.assertEqual(FakeApi({"rtt": 40}).pingstat(), {"avg": 40.0, "jitter": None, "loss": None})

    def test_unreadable_is_none(self):
        self.assertIsNone(FakeApi(None).pingstat())
        self.assertIsNone(FakeApi([]).pingstat())
        self.assertIsNone(FakeApi({"x": "a"}).pingstat())
        self.assertIsNone(FakeApi({"rtt": 10}, status=500).pingstat())


class ConnectTests(unittest.TestCase):
    def test_unmapped_sends_nothing(self):
        self.assertEqual(mudfish_mgr.MudfishApi().connect(), (False, "connect_unmapped"))
        self.assertEqual(mudfish_mgr.MudfishApi().disconnect(), (False, "connect_unmapped"))

    def test_never_called_endpoints_stay_blocked(self):
        for path in ("/do/node/autoselect", "/item/conf_onoff"):
            self.assertNotIn(path, json.dumps(mudfish_mgr.CONNECT_ENDPOINTS))


class VersionTests(unittest.TestCase):
    def test_fallback_is_new_core(self):
        self.assertEqual(mudfish_mgr.FALLBACK_VERSION, "6.6.4")

    def test_probe_v6_keywords(self):
        for word in ("Conectar", "disconnect", "pingstat"):
            self.assertIn(word, mudfish_mgr.KEYWORD_PROBES)


if __name__ == "__main__":
    unittest.main()
