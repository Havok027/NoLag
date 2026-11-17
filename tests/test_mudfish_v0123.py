"""v0.12.3: túnel ocioso (sem item/jogo ativo) não é perda de pacotes; diagnóstico v5 captura as chamadas axios."""
import json
import os
import re
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import mudfish_mgr  # noqa: E402


class FakeApi(mudfish_mgr.MudfishApi):
    def __init__(self, rows=None, status=200):
        super().__init__()
        self.rows, self.status = rows, status

    def _get(self, path, follow=True):
        if self.rows is None:
            raise OSError("fora")
        return self.status, "application/json", json.dumps(self.rows).encode()


class NetstatTests(unittest.TestCase):
    def test_sums_only_the_recent_window(self):
        rows = [{"rx": 9999, "tx": 9999}] * 5 + [{"rx": 100, "tx": 50}] * 10
        self.assertEqual(FakeApi(rows).netstat_recent(10), 1500)

    def test_unreadable_is_none(self):
        self.assertIsNone(FakeApi(None).netstat_recent())
        self.assertIsNone(FakeApi([]).netstat_recent())
        self.assertIsNone(FakeApi({"a": 1}).netstat_recent())
        self.assertIsNone(FakeApi([{"rx": 1}], status=500).netstat_recent())

    def test_idle_threshold_matches_real_capture(self):
        idle = [{"rx": 0, "tx": 0}] * 8 + [{"rx": 336, "tx": 0}, {"rx": 0, "tx": 0}]
        busy = [{"rx": 3136, "tx": 2352}] * 10
        self.assertLess(FakeApi(idle).netstat_recent(), mudfish_mgr.IDLE_BYTES)
        self.assertGreaterEqual(FakeApi(busy).netstat_recent(), mudfish_mgr.IDLE_BYTES)


class ProbeCallsTests(unittest.TestCase):
    def test_call_regex_catches_url_before_query(self):
        js = "axios.post('https://' + self.mudrun_status.api_server + '/graphql', {query: `{x}`}, {headers: {}})"
        m = mudfish_mgr._CALL_RX.search(js)
        self.assertTrue(m and "api_server" in m.group(1) and "/graphql" in m.group(1))

    def test_keywords_cover_graphql_and_version(self):
        self.assertIn("graphql", mudfish_mgr.KEYWORD_PROBES)
        self.assertIn("mudfishVpnVersion", mudfish_mgr.KEYWORD_PROBES)

    def test_probe_still_never_calls_mutating_paths(self):
        self.assertIn("/do/node/autoselect", mudfish_mgr.NEVER_CALLED)
        self.assertFalse(mudfish_mgr.MudfishApi().mapped())


if __name__ == "__main__":
    unittest.main()
