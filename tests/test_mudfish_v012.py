"""v0.12.0: sessão pelo status da API, Full VPN travado, RTT, interface msk, túnel sem resposta e diagnóstico sem segredos."""
import asyncio
import json
import os
import shutil
import sys
import tempfile
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_mudfish_mgr import make, run  # noqa: E402

import core_state  # noqa: E402
import mudfish_mgr  # noqa: E402

JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IngifQ.AVON9jdJcwg687L6VS4MBkyJptoRiIAXxQ"


def status_body(**kw):
    base = {"status": 200, "username": "u", "autologin": True, "fullvpn_enabled": False, "core_ready": True,
            "client_ready": True, "token": "123", "jwt": JWT, "version": "5.11.0", "isSignedIn": True}
    base.update(kw)
    return json.dumps(base).encode()


class ApiTests(unittest.TestCase):
    def api(self, table):
        api = mudfish_mgr.MudfishApi()
        api._get = lambda path, follow=True: table[path]
        return api

    def test_session_comes_from_is_signed_in(self):
        api = self.api({"/do/mudrun/status": (200, "application/json", status_body())})
        self.assertEqual(api.check(), ("active", True))  # sem consultar /item/list.html
        api = self.api({"/do/mudrun/status": (200, "application/json", status_body(isSignedIn=False))})
        self.assertEqual(api.check(), ("inactive", True))

    def test_status_summary_never_keeps_jwt_or_token(self):
        api = self.api({"/do/mudrun/status": (200, "application/json", status_body(fullvpn_enabled=True))})
        api.check()
        self.assertIs(api.last["fullvpn"], True)
        self.assertNotIn("jwt", json.dumps(api.last))
        self.assertNotIn("token", json.dumps(api.last))

    def test_rtt_states(self):
        pend = (200, "application/json", b'{ "status": 300, "n_checked": 1}')
        ready = (200, "application/json", b'{"status": 200, "rtts": [{"sid": 1, "rtt": 30}, {"sid": 2, "rtt": 40}]}')
        r = self.api({"/do/rtt/staticnodes": pend, "/do/rtt/vnodes": ready}).rtt()
        self.assertEqual((r["static"], r["vnodes"], r["n_vnodes"]), ("pending", "ready", 2))
        bad = (200, "text/html", b"<html>")
        self.assertEqual(self.api({"/do/rtt/staticnodes": bad, "/do/rtt/vnodes": bad}).rtt()["static"], "error")

    def test_probe_redacts_secrets_and_never_calls_writes(self):
        seen = []

        def fake(path, follow=True):
            seen.append(path)
            if path == "/":
                return 200, "text/html", b"<script>$.post('/do/node/autoselect',{iid:iid}); fullvpn_onoffswitch</script>"
            if path == "/do/mudrun/status":
                return 200, "application/json", status_body()
            return 200, "text/html", b"<li data-iid='7'>jogo</li>"

        api = mudfish_mgr.MudfishApi()
        api._get = fake
        rows, found, reads, snippets, forms = api.probe()
        body = reads["/do/mudrun/status"]["body"]
        self.assertNotIn(JWT, body)
        self.assertNotIn('"token": "123"', body)
        self.assertIn("***", body)
        for blocked in mudfish_mgr.NEVER_CALLED:
            self.assertNotIn(blocked, seen)
        self.assertIn("kw:iid", snippets)
        self.assertIn("kw:fullvpn", snippets)
        self.assertIn("page:/item/list.html", snippets)


class CoreTests(unittest.TestCase):
    def test_msk_is_a_tunnel_interface(self):
        self.assertTrue(core_state.TUNNEL_DEV.match("msk"))
        self.assertTrue(core_state.TUNNEL_DEV.match("msk0"))
        self.assertFalse(core_state.TUNNEL_DEV.match("wlan0"))


class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.mgr = make(self.tmp)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_fullvpn_on_stops_service(self):
        killed = []

        async def go():
            alive = {"v": True}
            self.mgr._alive = lambda: alive["v"]

            async def fake_kill():
                killed.append(1)
                alive["v"] = False

            self.mgr._kill = fake_kill
            self.mgr.api.last = {"fullvpn": True}
            return await self.mgr._enforce_fullvpn()

        self.assertTrue(run(go()))
        self.assertEqual(killed, [1])
        self.assertEqual((self.mgr.phase, self.mgr.error), ("error", "fullvpn_blocked"))

    def test_fullvpn_off_leaves_service_alone(self):
        self.mgr._alive = lambda: True
        self.mgr.api.last = {"fullvpn": False}
        self.assertFalse(run(self.mgr._enforce_fullvpn()))

    def test_rtt_polled_until_ready_then_throttled(self):
        calls = []
        outs = [{"static": "pending", "vnodes": "pending", "n_static": 0, "n_vnodes": 0},
                {"static": "ready", "vnodes": "ready", "n_static": 3, "n_vnodes": 2}]
        self.mgr.api.rtt = lambda: (calls.append(1), outs[min(len(calls) - 1, 1)])[1]

        async def go():
            await self.mgr._poll_rtt(force=True)
            self.assertEqual(self.mgr.rtt["static"], "pending")
            self.mgr._rtt_at -= mudfish_mgr.RTT_PENDING_EVERY + 1
            await self.mgr._poll_rtt()
            self.assertEqual(self.mgr.rtt["static"], "ready")
            await self.mgr._poll_rtt()  # pronto: não repete antes do intervalo longo

        run(go())
        self.assertEqual(len(calls), 2)

    def test_status_exposes_rtt_and_fullvpn_flag(self):
        self.mgr.rtt = {"static": "ready", "vnodes": "ready", "n_static": 1, "n_vnodes": 1}
        st = run(self.mgr.get_status())
        self.assertEqual(st["rtt"]["static"], "ready")
        self.assertIs(st["full_vpn_api"], False)

    def test_live_hides_dead_tunnel_and_flags_it(self):
        saved = (core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev)

        async def fake_default():
            return "wlan0"

        async def fake_tunnel():
            return "msk"

        async def fake_route(t):
            return {"dev": "wlan0"}

        async def fake_ping(target, count, iface=None):
            ok = {"avg": 20.0, "jitter": 1.0, "loss": 0.0}
            return ok if iface == "wlan0" else {"avg": None, "jitter": None, "loss": 100.0}

        core_state.ping_stats, core_state.route_get = fake_ping, fake_route
        core_state.default_dev, core_state.tunnel_dev = fake_default, fake_tunnel
        self.mgr._alive = lambda: True
        try:
            live = run(self.mgr.get_live())
        finally:
            core_state.ping_stats, core_state.route_get, core_state.default_dev, core_state.tunnel_dev = saved
        self.assertTrue(live["tunnel_blocked"])
        self.assertIsNone(live["tunnel"])
        self.assertEqual(live["tunnel_iface"], "msk")
        self.assertFalse(live["full_vpn"])


if __name__ == "__main__":
    unittest.main()
