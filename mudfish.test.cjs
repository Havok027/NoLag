const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const read = (f) => {
  for (const dir of ["../src", ".."]) {
    const p = path.join(__dirname, dir, f);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  throw new Error("arquivo não encontrado: " + f);
};

test("todo texto usado nas telas do Mudfish e da Conf existe 3 vezes no i18n (pt, en, es) e na interface", () => {
  const src = read("i18n.tsx");
  const used = new Set();
  for (const f of ["MudfishTab.tsx", "ConfTab.tsx", "Content.tsx"]) {
    for (const m of read(f).matchAll(/\bt\.(\w+)/g)) used.add(m[1]);
  }
  assert.ok(used.size > 60);
  for (const key of used) {
    const count = (src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length;
    assert.strictEqual(count, 3, key);
    assert.ok(new RegExp("^\\s+" + key + ": string;", "m").test(src), "interface " + key);
  }
});

test("textos de perfis antigos e da rota interna foram removidos", () => {
  const src = read("i18n.tsx");
  for (const key of ["profileStable", "profileBalanced", "profileAggressive", "mfProfile", "tabRoutes", "hProfile", "hRelays"]) {
    assert.ok(!new RegExp("^\\s+" + key + ":", "m").test(src), key);
  }
});

test("aba Mudfish tem fluxo guiado, Auto Selection, Multi-Path, WebUI, rota e ping", () => {
  const src = read("MudfishTab.tsx");
  for (const s of ["mudfishInstall", "mudfishConfirmLogin", "mudfishSetEnabled", 'mudfishSetOption("auto_selection"',
    'mudfishSetOption("multipath"', "NavigateToExternalWeb", "http://127.0.0.1:8282", "mudfishGetRoute", "mudfishTestPing",
    "t.mfPingBefore", "t.mfPingAfter", "mudfishGetLogs", "t.mfAdvTitle", "t.mfAutoSel", "t.mfMultiPath"]) {
    assert.ok(src.includes(s), s);
  }
  assert.ok(src.includes("hMfAutoSel") && src.includes("hMfMultiPath") && src.includes("hMfWarn"));
});

test("Auto Selection começa ligado e Multi-Path desligado quando o backend ainda não respondeu", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes("status?.auto_selection !== false"));
  assert.ok(src.includes("status?.multipath === true"));
});

test("avisos de crédito: sem downloads e sem VPN total, visíveis na UI", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes("t.mfWarnDownload") && src.includes("t.mfWarnSplit") && src.includes("t.mfFullVpnWarn"));
  const i18n = read("i18n.tsx");
  assert.ok(/mfWarnDownload: ".*(baixe|baixar).*"/i.test(i18n) && /mfWarnSplit: ".*VPN total/i.test(i18n));
  assert.ok(read("api.ts").includes("full_vpn"));
});

test("Mudfish e Wi-Fi não dependem um do outro no frontend", () => {
  const mud = read("MudfishTab.tsx");
  const wifi = read("WifiTab.tsx");
  assert.ok(!/from "\.\/WifiTab"/.test(mud) && !/wifi[A-Z]\w+\(/.test(mud));
  assert.ok(!/mudfish/i.test(wifi) && !/MudfishTab/.test(wifi));
});

test("nenhum segredo trafega: sem usuário nem senha no status", () => {
  const api = read("api.ts");
  const iface = api.match(/export interface MudfishStatus \{[\s\S]*?\n\}/)[0];
  assert.ok(!/\bpassword\b\??:/.test(iface) && !iface.includes("has_password"));
  assert.ok(!api.includes("mudfish_set_credentials") && !api.includes("mudfish_set_profile"));
});

test("api.ts expõe todos os métodos do roteador do main.py", () => {
  const api = read("api.ts");
  const py = read("main.py");
  for (const name of ["mudfish_available", "mudfish_get_status", "mudfish_install", "mudfish_set_enabled",
    "mudfish_set_option", "mudfish_confirm_login", "mudfish_set_ping_target", "mudfish_get_route", "mudfish_test_ping",
    "mudfish_get_logs", "mudfish_probe_api", "get_snapshot", "get_current_game", "set_game_module"]) {
    assert.ok(api.includes('"' + name + '"'), "api " + name);
    assert.ok(py.includes("async def " + name + "("), "main " + name);
  }
});

test("build.yml empacota todos os .py", () => {
  let yml = "";
  for (const p of [path.join(__dirname, "..", ".github", "workflows", "build.yml"), path.join(__dirname, "..", "build.yml")]) {
    if (fs.existsSync(p)) { yml = fs.readFileSync(p, "utf8"); break; }
  }
  if (!yml) return;
  for (const f of ["mudfish_mgr.py", "core_state.py", "game_profiles.py", "wifi_mgr.py", "wifi_dispatcher.py"]) {
    assert.ok(yml.includes(f), f);
  }
});

test("a falha mostra o motivo exato (detail) na mensagem e na tabela de status", () => {
  const tab = read("MudfishTab.tsx");
  const api = read("api.ts");
  assert.ok(tab.includes("mudfishErrorFull"));
  assert.ok(tab.includes("status.detail") && tab.includes("r?.detail"));
  assert.ok((api.match(/detail\?: string;/g) || []).length >= 2);
});
