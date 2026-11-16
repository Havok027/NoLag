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

test("Painel tem só 2 chaves rápidas (Wi-Fi e Mudfish), o gráfico ao vivo e o aviso de créditos", () => {
  const src = read("Content.tsx");
  const dash = src.slice(src.indexOf('tab === "dash"'), src.indexOf('tab === "wifi"'));
  assert.ok(dash.includes("<WifiCard") && dash.includes("<MudfishCard"));
  assert.ok(dash.includes("<LiveChart") && dash.includes("<MfWarning") && dash.includes("<ConnCard"));
  assert.ok(!dash.includes("ToggleField"), "as chaves ficam dentro dos cartões, só 2");
  const mud = read("MudfishTab.tsx");
  const card = (fn) => mud.slice(mud.indexOf("export function " + fn));
  assert.strictEqual((card("MudfishCard").split("export function ConnCard")[0].match(/<ToggleField/g) || []).length, 1);
});

test("gráfico ao vivo reaproveita o LineChart e compara com e sem Mudfish", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("LineChart") && mud.includes("t.chartWith") && mud.includes("t.chartWithout"));
  assert.ok(mud.includes("t.connJitter") && mud.includes("getSnapshot"));
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
