"""v0.12.5: start/stop pelas rotas oficiais (/do/mudfish/start|stop) e telemetria no formato real do pingstat."""
import asyncio
import json
import os
import sys
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import mudfish_mgr  # noqa: E402

NOW = 1794943689.0
# amostra real capturada (mudfish-api.json, Mudfish 6.6.4)
REAL = [
    {"time": 1794943642000, "56481_9297": 0, "56481_9313": 0, "56481_149824": 0},
    {"time": 1794943654000, "56481_9297": 930, "56481_9313": 149, "56481_149824": 21},
    {"time": 1794943666000, "56481_9297": 3000, "56481_9313": 146, "56481_149824": 13},
    {"time": 1794943678000, "56481_9297": 348, "56481_9313": 146, "56481_149824": 15},
    {"time": 1794943689000, "56481_9297": 456, "56481_9313": 211, "56481_149824": 17},
]


class FakeApi(mudfish_mgr.MudfishApi):
    def __init__(self, body=None, status=200):
        super().__init__()
        self.body, self.status = body, status

    def _get(self, path, follow=True):
        if self.body is None:
            raise OSError("fora")
        return self.status, "application/json", json.dumps(self.body).encode()


class PingstatTests(unittest.TestCase):
    def test_real_sample_uses_best_route(self):
        m = FakeApi(REAL).pingstat(now=NOW)
        self.assertAlmostEqual(m["avg"], 16.5)       # coluna 149824: 21, 13, 15, 17
        self.assertAlmostEqual(m["jitter"], (8 + 2 + 2) / 3)
        self.assertEqual(m["loss"], 0.0)

    def test_loss_marker_counts_as_loss(self):
        rows = [{"time": 1794943689000, "a": 20}, {"time": 1794943689000, "a": 3000},
                {"time": 1794943689000, "a": 30}, {"time": 1794943689000, "a": 3000}]
        m = FakeApi(rows).pingstat(now=NOW)
        self.assertEqual(m["loss"], 50.0)
        self.assertAlmostEqual(m["avg"], 25.0)

    def test_zero_is_unknown_not_loss(self):
        rows = [{"time": 1794943689000, "a": 0}, {"time": 1794943689000, "a": 0}]
        self.assertIsNone(FakeApi(rows).pingstat(now=NOW))

    def test_stale_or_unreadable_is_none(self):
        self.assertIsNone(FakeApi(REAL).pingstat(now=NOW + 3600))
        self.assertIsNone(FakeApi(None).pingstat(now=NOW))
        self.assertIsNone(FakeApi({"x": 1}).pingstat(now=NOW))
        self.assertIsNone(FakeApi([]).pingstat(now=NOW))
        self.assertIsNone(FakeApi(REAL, status=500).pingstat(now=NOW))


class PostApi(mudfish_mgr.MudfishApi):
    def __init__(self, code):
        super().__init__()
        self.code, self.paths = code, []

    def _post_json(self, path):
        self.paths.append(path)
        if isinstance(self.code, Exception):
            raise self.code
        return self.code


class StartStopTests(unittest.TestCase):
    def test_paths_are_the_official_ones(self):
        self.assertEqual(mudfish_mgr.START_PATH, "/do/mudfish/start")
        self.assertEqual(mudfish_mgr.STOP_PATH, "/do/mudfish/stop")

    def test_start_accepts_200_and_201_only(self):
        self.assertEqual(PostApi(200).core_start(), (True, ""))
        self.assertEqual(PostApi(201).core_start(), (True, ""))
        self.assertEqual(PostApi(409).core_start(), (False, "status_409"))
        self.assertEqual(PostApi(500).core_start(), (False, "status_500"))

    def test_stop_accepts_200_only(self):
        self.assertEqual(PostApi(200).core_stop(), (True, ""))
        self.assertEqual(PostApi(409).core_stop(), (False, "status_409"))

    def test_exception_is_reported_not_raised(self):
        ok, why = PostApi(OSError("sem rota")).core_start()
        self.assertFalse(ok)
        self.assertTrue(why)

    def test_start_stop_use_official_paths(self):
        api = PostApi(200)
        api.core_start(); api.core_stop()
        self.assertEqual(api.paths, ["/do/mudfish/start", "/do/mudfish/stop"])

    def test_status_exposes_core_running(self):
        raw = json.dumps({"core_running": True, "isSignedIn": True, "jwt": "x"}).encode()
        self.assertTrue(mudfish_mgr.MudfishApi._parse_status(raw)["core_running"])


if __name__ == "__main__":
    unittest.main()
