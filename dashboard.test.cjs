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

const NEW_KEYS = ["tabDash", "tabRoutes", "tabHint", "badgeActive", "badgeWaiting", "badgeOff", "badgeError",
  "badgeStarting", "pingNow", "jitter", "loss", "liveRoutes", "inUse", "noLive", "diagTitle", "diagProcs",
  "diagPorts", "diagPackets", "diagTop", "diagHint", "relaysCount", "chartTitle", "chartBest", "chartEmpty",
  "best", "quality", "qualGood", "qualFair", "qualBad", "helpBtn", "helpLegend", "hStatus", "hPing", "hEnable",
  "hRoutes", "hChart", "hDiag", "hProfile", "hRelays", "hRelayCode", "hLang", "gamesTitle", "gamesNone",
  "gameProfile", "gameSavedAuto", "gameSavedManual", "gameNotSaved", "gameDelete", "hGames"];

test("textos do painel existem nos 3 idiomas", () => {
  const src = read("i18n.tsx");
  for (const key of NEW_KEYS) {
    const count = (src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length;
    assert.strictEqual(count, 3, key);
  }
});

test("painel mostra ping atual e rotas ao vivo", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("t.pingNow") && src.includes("t.liveRoutes") && src.includes("t.diagTitle"));
  assert.ok(src.includes("TabNav") && src.includes("Collapsible"));
});

test("seções recolhíveis salvam o estado", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("setSettings({ collapsed: next })"));
});

test("gráfico, ajuda e botão Y estão ligados", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("LineChart") && src.includes("t.chartTitle"));
  assert.ok(src.includes("onSecondaryButton") && src.includes("toggleHelp"));
  assert.ok(src.includes("button === 3") && src.includes("pressY"));
  assert.ok(src.includes("<PanelSection>"));
  for (const key of ["hStatus", "hPing", "hEnable", "hRoutes", "hChart", "hDiag", "hProfile", "hRelays", "hRelayCode", "hLang"]) {
    assert.ok(src.includes("t." + key), key);
  }
});

test("perfis por jogo e chave sincronizada com o backend", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("setGameAuto") && src.includes("deleteGame") && src.includes("t.gamesTitle"));
  assert.ok(src.includes("enabledNow") && src.includes("status.phase !== \"off\""));
  const api = read("api.ts");
  assert.ok(api.includes("set_game_auto") && api.includes("delete_game") && api.includes("appid"));
});
