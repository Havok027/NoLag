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
  for (const f of ["MudfishTab.tsx", "ConfTab.tsx", "Content.tsx", "DashControls.tsx"]) {
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

test("aba Mudfish tem fluxo guiado, serviço, WebUI, rota e logs, sem controles de rota", () => {
  const src = read("MudfishTab.tsx");
  for (const s of ["mudfishInstall", "mudfishSetEnabled", "NavigateToExternalWeb", "http://127.0.0.1:8282", "mudfishGetRoute", "mudfishGetLogs", "t.mfAdvTitle", "t.mfOpenWeb", "t.hMfFlow", "MfWarning"]) {
    assert.ok(src.includes(s), s);
  }
  for (const s of ["mudfishSetOption", "mfAutoSel", "mfMultiPath", "mudfishTestPing", "mfPingBefore", "mfPingAfter"]) {
    assert.ok(!src.includes(s), "não deveria existir: " + s);
  }
});

test("avisos de crédito: sem downloads e sem VPN total, visíveis na UI", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes("t.mfWarnDownload") && src.includes("t.mfWarnSplit") && src.includes("t.mfFullVpnWarn"));
  const i18n = read("i18n.tsx");
  assert.ok(/mfWarnDownload: ".*(baixe|baixar).*"/i.test(i18n) && /mfWarnSplit: ".*Full VPN/i.test(i18n));
  assert.ok(read("api.ts").includes("full_vpn"));
});

test("Mudfish e Wi-Fi não dependem um do outro no frontend", () => {
  const mud = read("MudfishTab.tsx");
  const wifi = read("WifiTab.tsx");
  assert.ok(!/from "\.\/WifiTab"/.test(mud) && !/wifi[A-Z]\w+\(/.test(mud));
  assert.ok(!/mudfish/i.test(wifi) && !/MudfishTab/.test(wifi));
});

test("a senha nunca volta do backend para a tela", () => {
  const api = read("api.ts");
  const iface = api.match(/export interface MudfishStatus \{[\s\S]*?\n\}/)[0];
  assert.ok(!/\bpassword\b\??:/.test(iface));
  assert.ok(iface.includes("has_password") && iface.includes("user?: string"));
  assert.ok(!api.includes("mudfish_set_profile"));
});

test("aba Mudfish sem campos de login nem conta salva (v0.14.1)", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(!src.includes("bIsPassword") && !src.includes("mudfishSetCredentials") && !src.includes("mudfishClearCredentials"));
  assert.ok(!src.includes('isCollapsed("mudfishAcc")'));
  assert.ok(!read("api.ts").includes("mudfishSetCredentials"));
});

test("primeiro uso explica o cadastro único dos jogos no painel, nos 3 idiomas", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes("t.mfFirstTitle") && src.includes("t.mfFirstSteps") && src.includes("t.hMfFirst"));
  const i18n = read("i18n.tsx");
  const steps = [...i18n.matchAll(/^\s+mfFirstSteps: "(.*)",$/gm)].map((m) => m[1]);
  assert.strictEqual(steps.length, 3);
  for (const text of steps) {
    assert.ok(text.includes("Basic") && text.includes("Multi-Path") && text.includes("Auto / South America"));
  }
});

test("Opções Avançadas do Mudfish não repetem controles da Conf nem do Painel", () => {
  const src = read("MudfishTab.tsx");
  const adv = src.slice(src.indexOf("t.mfAdvTitle"), src.indexOf("t.hMfAdv"));
  assert.ok(adv.includes("t.mfAdvWebui") && adv.includes("mudfishInstall") && adv.includes("mudfishResetSession"));
  for (const dup of ["mudfishSetEnabled", "ToggleField", "mudfishProbeApi", "mudfishSetOption", "NavigateToExternalWeb"]) {
    assert.ok(!adv.includes(dup), dup);
  }
});

test("sessão do painel e API aparecem no status", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes("t.mfAccConnected") && src.includes("t.mfAccWaiting") && src.includes("t.mfApiRow"));
  const api = read("api.ts");
  assert.ok(api.includes("session?:") && api.includes("api_ok?:"));
});

test("api.ts expõe todos os métodos do roteador do main.py", () => {
  const api = read("api.ts");
  const py = read("main.py");
  for (const name of ["mudfish_available", "mudfish_get_status", "mudfish_install", "mudfish_set_enabled",
    "mudfish_set_option", "mudfish_reset_session", "mudfish_get_live", "mudfish_confirm_login", "mudfish_set_ping_target", "mudfish_get_route", "mudfish_test_ping",
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

test("v0.11.1: sem botão manual de login; conta é só indicador passivo e detecção é automática", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(!src.includes("mudfishConfirmLogin") && !src.includes("mfLoginDone"));
  const i18n = read("i18n.tsx");
  assert.ok(!/mfLoginDone|mfLoginConfirmed/.test(i18n));
  const mgr = fs.readFileSync(path.join(__dirname, "..", "mudfish_mgr.py"), "utf8");
  assert.ok(mgr.includes("_watch_session") && mgr.includes("_sync_login"));
});

test("v0.11.1: botão Abrir Mudfish aparece sempre que instalado ou ativo, fora das condições de passo", () => {
  const src = read("MudfishTab.tsx");
  const i = src.indexOf("label={t.mfOpenWeb}");
  assert.ok(i > 0);
  const before = src.slice(src.lastIndexOf("<PanelSectionRow>", i) - 140, i);
  assert.ok(before.includes("installed ||") && !/step === "(login|activate|install)"/.test(before));
});

test("v0.11.1: textos de ajuda quebram linha (pre-line) e têm \\n nos 3 idiomas", () => {
  const comp = read("components.tsx");
  assert.ok(/whiteSpace: "pre-line"/.test(comp));
  const mud = read("MudfishTab.tsx");
  assert.ok((mud.match(/whiteSpace: "pre-line"/g) || []).length >= 2);
  const i18n = read("i18n.tsx");
  for (const key of ["mfFirstSteps", "hMfFirst", "hDashBtns", "hMfFlow", "hMfAdv"]) {
    const lines = [...i18n.matchAll(new RegExp("^\\s+" + key + ': "(.*)",$', "gm"))].map((m) => m[1]);
    assert.strictEqual(lines.length, 3, key);
    for (const l of lines) assert.ok(l.includes("\\n"), key);
  }
});
