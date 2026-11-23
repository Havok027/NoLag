const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.16.0: API do histórico e tipos", () => {
  const api = read("historyApi.ts");
  assert.ok(api.includes('callable<[], HistData>("history_get")'));
  assert.ok(api.includes("export interface HistSample") && api.includes("b: HistPack | null") && api.includes("w: HistPack | null"));
});

test("v0.16.0: gráfico responde ao toque e marca o valor", () => {
  const c = read("HistoryChart.tsx");
  for (const s of ["onPointerDown", "onPointerMove", "setPointerCapture", 'touchAction: "none"', "nearestSample", "cursorT", "strokeDasharray"]) {
    assert.ok(c.includes(s), s);
  }
  assert.ok(c.includes("p.interval * 3"), "buraco quebra a linha");
  assert.ok(c.includes("aW < aO"), "menor é melhor");
  assert.ok(c.includes("Math.max(120, p.now - first)"), "eixo X se ajusta ao histórico curto");
});

test("v0.16.0: tela cheia com ping, jitter e perda, Sem e Com, janela de 30 min e botão de fechar", () => {
  const v = read("HistoryView.tsx");
  assert.ok(v.includes("Navigation.CloseSideMenus()") && v.includes("showModal(<HistoryModal"));
  assert.ok(v.includes("FaExpandAlt") && v.includes("FaTimes"));
  assert.ok(v.includes("historyGet()") && v.includes("REFRESH_MS"));
  assert.ok(v.includes("index: 0") && v.includes("index: 1") && v.includes("index: 2"));
  assert.ok(v.includes("t.chartWith") && v.includes("t.chartWithout"));
  assert.ok(v.includes("1800"));
  assert.ok(v.includes("PAGE_WIDTH") && !/\b\d+v[wh]\b/.test(v), "tamanho em px, sem vw/vh (fora de escala no modal)");
});

test("v0.16.0: Painel só ganha o botão; módulos novos não são importados pelo código antigo além disso", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("<HistoryExpandButton t={t} />") && mud.includes('position: "relative"'));
  for (const f of ["Content.tsx", "DashControls.tsx", "components.tsx", "api.ts", "ConfTab.tsx", "WifiTab.tsx"]) {
    assert.ok(!/History(View|Chart)|historyApi/.test(read(f)), f);
  }
});

test("v0.16.0: textos do histórico nos 3 idiomas", () => {
  const i18n = read("i18n.tsx");
  for (const k of ["histOpen", "histTitle", "histHint", "histClose", "histEmpty", "histPing"]) {
    assert.strictEqual((i18n.match(new RegExp(`\\b${k}: "`, "g")) || []).length, 3, k);
    assert.ok(new RegExp(`\\b${k}: string`).test(i18n), k);
  }
});
