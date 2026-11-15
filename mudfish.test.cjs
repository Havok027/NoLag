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

const KEYS = [
  "mfBadgeOn", "mfBadgeOff", "mfBadgeBusy", "mfBadgeError", "mfBadgeMissing", "mfUnavailable", "mfStatusTitle",
  "mfVersion", "mfInstalledRow", "mfInstalledYes", "mfInstalledNo", "mfDaemon", "mfRunning", "mfStopped", "mfPort",
  "mfPortOpen", "mfPortClosed", "mfInstall", "mfUpdate", "mfInstallDesc", "mfInstalling", "mfInstallOk", "mfToggle",
  "mfToggleDesc", "mfCardToggle", "mfCardToggleDesc", "mfOn", "mfOff", "mfLoginTitle", "mfUser", "mfUserDesc",
  "mfPass", "mfPassSaved", "mfPassEmpty", "mfSave", "mfClear", "mfLoginSaved", "mfLoginCleared", "mfOpenWeb",
  "mfOpenWebDesc", "mfNetTitle", "mfRouteIface", "mfRouteIp", "mfRouteGw", "mfPingTarget", "mfPingTargetDesc",
  "mfPingBefore", "mfPingAfter", "mfPingTest", "mfPingTestDesc", "mfPingTesting", "mfPingFail", "mfRefresh",
  "mfErrNotInstalled", "mfErrNoCreds", "mfErrMount", "mfErrDownload", "mfErrInstall", "mfErrStart", "mfErrExited",
  "mfErrBusy", "mfErrArch", "mfErrBadUser", "mfErrBadPass", "mfErrGeneric", "mfToastOk", "mfToastFail",
  "hMfInstall", "hMfLogin", "hMfToggle", "hMfNet", "gameWifi", "gameMudfish", "gameModulesDesc", "gameCurrent",
  "gameAddCurrent", "hGameModules", "connTitle", "connWifi", "connMudfish", "connIface", "connIp", "connRoute",
  "connPing", "connJitter", "connHint", "hConn",
];

test("textos do Mudfish e do Painel existem nos 3 idiomas, sem repetir chave", () => {
  const src = read("i18n.tsx");
  for (const key of KEYS) {
    const count = (src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length;
    assert.strictEqual(count, 3, key);
    assert.ok(new RegExp("^\\s+" + key + ": string;", "m").test(src), "interface " + key);
  }
});

test("Painel tem chaves separadas para Wi-Fi e Mudfish e a tabela Conexão", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("<WifiCard") && src.includes("<MudfishCard") && src.includes("<ConnCard"));
  assert.ok(src.includes('isCollapsed("conn")'));
});

test("aba Rotas mostra o Mudfish e os perfis por jogo com wifi e mudfish separados", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("<MudfishTab"));
  assert.ok(src.includes('changeGameModule(appid, "wifi"') && src.includes('changeGameModule(appid, "mudfish"'));
  assert.ok(src.includes("setGameModule"));
});

test("aba Mudfish tem instalar, login, liga/desliga, WebUI, rota e ping", () => {
  const src = read("MudfishTab.tsx");
  for (const s of ["mudfishInstall", "mudfishSetCredentials", "mudfishSetEnabled", "NavigateToExternalWeb",
    "http://127.0.0.1:8282", "mudfishGetRoute", "mudfishTestPing", "t.mfPingBefore", "t.mfPingAfter", "bIsPassword"]) {
    assert.ok(src.includes(s), s);
  }
});

test("Mudfish e Wi-Fi não dependem um do outro no frontend", () => {
  const mud = read("MudfishTab.tsx");
  const wifi = read("WifiTab.tsx");
  assert.ok(!/from "\.\/WifiTab"/.test(mud) && !/wifi[A-Z]\w+\(/.test(mud));
  assert.ok(!/mudfish/i.test(wifi) && !/MudfishTab/.test(wifi));
  assert.ok(!mud.includes("getStatus(") && !mud.includes("setRouteEnabled"));
});

test("senha nunca volta do backend para a tela", () => {
  const api = read("api.ts");
  const iface = api.match(/export interface MudfishStatus \{[\s\S]*?\n\}/)[0];
  assert.ok(!/\bpassword\b\??:/.test(iface));
  assert.ok(iface.includes("has_password"));
});

test("api.ts expõe todos os métodos do roteador do main.py", () => {
  const api = read("api.ts");
  const py = read("main.py");
  for (const name of ["mudfish_available", "mudfish_get_status", "mudfish_install", "mudfish_set_enabled",
    "mudfish_set_credentials", "mudfish_clear_credentials", "mudfish_set_ping_target", "mudfish_get_route",
    "mudfish_test_ping", "get_snapshot", "get_current_game", "set_game_module"]) {
    assert.ok(api.includes('"' + name + '"'), "api " + name);
    assert.ok(py.includes("async def " + name + "("), "main " + name);
  }
});

test("seções novas são salvas pelo backend", () => {
  const py = read("main.py");
  for (const k of ["mudfishMain", "mudfishLogin", "mudfishNet", "conn"]) assert.ok(py.includes('"' + k + '"'), k);
});

test("build.yml empacota todos os .py novos", () => {
  let yml = "";
  for (const p of [path.join(__dirname, "..", ".github", "workflows", "build.yml"), path.join(__dirname, "..", "build.yml")]) {
    if (fs.existsSync(p)) { yml = fs.readFileSync(p, "utf8"); break; }
  }
  if (!yml) return;
  for (const f of ["mudfish_mgr.py", "core_state.py", "game_profiles.py", "wifi_mgr.py", "wifi_dispatcher.py"]) {
    assert.ok(yml.includes(f), f);
  }
});
