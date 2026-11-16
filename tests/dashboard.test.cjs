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

test("4 abas: Painel, Wi-Fi, Mudfish e Conf", () => {
  const nav = read("TabNav.tsx");
  assert.ok(/TAB_KEYS: TabKey\[\] = \["dash", "wifi", "mudfish", "conf"\]/.test(nav));
  const src = read("Content.tsx");
  for (const k of ["t.tabDash", "t.tabWifi", "t.tabMudfish", "t.tabConf"]) assert.ok(src.includes(k), k);
  for (const tab of ["dash", "wifi", "mudfish", "conf"]) assert.ok(src.includes('tab === "' + tab + '"'), tab);
  assert.ok(src.includes("<ConfTab") && src.includes("<MudfishTab") && src.includes("<WifiTab"));
});

test("Painel: gráfico no topo, botão do Mudfish, status e botão Otimizar Wi-Fi mais ao final", () => {
  const src = read("Content.tsx");
  const dash = src.slice(src.indexOf('tab === "dash"'), src.indexOf('tab === "wifi"'));
  const at = (tag) => dash.indexOf(tag);
  for (const tag of ["<LiveChart", "<MudfishButton", "<MfWarning", "<ConnCard", "<WifiButton"]) assert.ok(at(tag) >= 0, tag);
  assert.ok(at("<LiveChart") < at("<MudfishButton") && at("<MudfishButton") < at("<ConnCard") && at("<ConnCard") < at("<WifiButton"));
  assert.ok(!dash.includes("ToggleField") && !dash.includes("<WifiCard") && !dash.includes("<MudfishCard"), "sem switches no Painel");
});

test("os dois controles do Painel são botões de ação com estado ativo/inativo", () => {
  const src = read("DashControls.tsx");
  assert.ok(src.includes("export function ActionButton") && src.includes("aria-pressed") && src.includes("active"));
  assert.ok(src.includes("mudfishSetEnabled") && src.includes("wifiOptimizeSafe") && src.includes("wifiReset"));
  assert.ok(!src.includes("ToggleField"));
  for (const k of ["btnMfOn", "btnMfOff", "btnWifiOn", "btnWifiOff"]) assert.ok(src.includes("t." + k), k);
});

test("selo Modo Apenas Jogo aparece só com o Mudfish ativo sem VPN total", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("live?.only_game") && mud.includes("t.onlyGameBadge"));
  const py = read("mudfish_mgr.py");
  assert.ok(py.includes('"only_game": bool(running and not full_vpn)'));
});

test("gráfico ao vivo reaproveita o LineChart e compara com e sem Mudfish", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("LineChart") && mud.includes("t.chartWith") && mud.includes("t.chartWithout"));
  assert.ok(mud.includes("t.connJitter") && mud.includes("mudfishGetLive"));
  assert.ok(mud.includes("live?.running && samples.some"), "a linha com Mudfish só entra com ele ligado e medindo");
});

test("aba Conf tem ativação ao abrir jogo e manter ligado, ambas opcionais, jogos, idioma e diagnóstico", () => {
  const src = read("ConfTab.tsx");
  for (const s of ['"auto_on_game"', '"keep_on"', "t.confAutoGame", "t.confKeepOn", "DropdownItem", "onGameModule",
    "t.confDiagTitle", "mudfishProbeApi", "t.gameWifi", "t.gameMudfish"]) {
    assert.ok(src.includes(s), s);
  }
  assert.ok(src.includes("hConfAutoGame") && src.includes("hConfKeepOn") && src.includes("hConfDiag"));
});

test("seções recolhíveis salvam o estado e o backend conhece as novas", () => {
  assert.ok(read("Content.tsx").includes("setSettings({ collapsed: next })"));
  const py = read("main.py");
  for (const k of ["confGames", "confDiag", "mudfishAdv", "mudfishLogs", "conn"]) assert.ok(py.includes('"' + k + '"'), k);
});

test("a rota interna antiga não existe mais no frontend", () => {
  for (const f of ["Content.tsx", "MudfishTab.tsx", "ConfTab.tsx", "api.ts", "TabNav.tsx"]) {
    const src = read(f).toLowerCase();
    for (const w of ["relay", "wireguard", "setgameauto", "set_game_auto", "tabroutes", "routes\""]) {
      assert.ok(!src.includes(w), f + ": " + w);
    }
  }
});

test("v0.11.2: Painel tem botão Abrir painel do Mudfish sempre visível, e a aba Mudfish mantém o dela", () => {
  const dash = fs.readFileSync(path.join(__dirname, "..", "src", "DashControls.tsx"), "utf8");
  assert.ok(dash.includes("t.mfOpenWeb") && dash.includes("NavigateToExternalWeb") && dash.includes("http://127.0.0.1:8282"));
  const i = dash.indexOf("label={t.mfOpenWeb}");
  assert.ok(!/(running|installed|ready|session|login_done)\s*&&/.test(dash.slice(i - 120, i)));
  assert.ok(fs.readFileSync(path.join(__dirname, "..", "src", "MudfishTab.tsx"), "utf8").includes("label={t.mfOpenWeb}"));
  const i18n = fs.readFileSync(path.join(__dirname, "..", "src", "i18n.tsx"), "utf8");
  for (const w of ["Abrir painel do Mudfish abre", "Open Mudfish panel button", "Abrir panel de Mudfish abre"]) assert.ok(i18n.includes(w), w);
});

