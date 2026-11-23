const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

function loadTs() {
  try { return require("typescript"); } catch { /* tenta o global */ }
  const g = require("child_process").execSync("npm root -g").toString().trim();
  return require(path.join(g, "typescript"));
}
function loadBest() {
  const ts = loadTs();
  const js = ts.transpileModule(read("bestConn.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function("module", "exports", js)(m, m.exports);
  return m.exports;
}
const m = (avg, jitter = 1, loss = 0) => ({ avg, jitter, loss });
const mk = (n, base, tunnel) => Array.from({ length: n }, () => ({ base, tunnel }));

test("v0.16.2: Com Mudfish vence com ping médio menor", () => {
  const { bestConnection } = loadBest();
  const r = bestConnection(mk(5, m(60), m(30)));
  assert.equal(r.state, "winner");
  assert.equal(r.side, "with");
  assert.equal(r.withAvg, 30);
});

test("v0.16.2: Sem Mudfish vence com ping médio menor", () => {
  const { bestConnection } = loadBest();
  const r = bestConnection(mk(5, m(25), m(70)));
  assert.equal(r.side, "without");
  assert.equal(r.withoutAvg, 25);
});

test("v0.16.2: Mudfish desligado ou sem túnel medido não compara", () => {
  const { bestConnection } = loadBest();
  assert.equal(bestConnection(mk(10, m(40), null)).state, "waiting");
  assert.equal(bestConnection(mk(10, m(40), m(null, null, null))).state, "waiting");
  assert.equal(bestConnection(mk(10, null, m(40))).state, "waiting");
  assert.equal(bestConnection([]).state, "waiting");
});

test("v0.16.2: poucas amostras não declaram vencedor", () => {
  const { bestConnection } = loadBest();
  assert.equal(bestConnection(mk(2, m(60), m(30))).state, "waiting");
});

test("v0.16.2: empate no ping desempata por jitter e depois por perda", () => {
  const { bestConnection } = loadBest();
  assert.equal(bestConnection(mk(4, m(40, 8), m(41, 2))).side, "with");
  assert.equal(bestConnection(mk(4, m(40, 2), m(41, 8))).side, "without");
  assert.equal(bestConnection(mk(4, m(40, 2, 5), m(41, 2, 0))).side, "with");
  assert.equal(bestConnection(mk(4, m(40, 2, 0), m(41, 2, 0))).state, "tie");
});

test("v0.16.2: amostras alternadas com e sem túnel usam só as válidas", () => {
  const { bestConnection } = loadBest();
  const s = [...mk(3, m(50), null), ...mk(3, m(50), m(20))];
  const r = bestConnection(s);
  assert.equal(r.side, "with");
  assert.equal(r.withAvg, 20);
});

test("v0.16.2: Painel exibe o selo acima do gráfico e usa o módulo", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes('from "./bestConn"') && mud.includes("bestConnection(fromHistory"));
  assert.ok(mud.indexOf("data-best") > -1 && mud.indexOf("data-best") < mud.indexOf("<HistoryExpandButton"), "selo acima do bloco do gráfico");
  for (const k of ["bestTitle", "bestWith", "bestWithout", "bestTie", "bestOff", "bestWaiting"]) assert.ok(mud.includes(`t.${k}`), k);
});

test("v0.16.2: chaves de i18n nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  for (const k of ["bestTitle", "bestWith", "bestWithout", "bestTie", "bestOff", "bestWaiting"]) {
    assert.equal(i.split(`${k}:`).length - 1, 4, `${k}: interface + 3 idiomas`);
  }
});

test("v0.16.2: comparação usa os 30 min do histórico e ignora amostras fora da janela", () => {
  const { bestConnection, fromHistory } = loadBest();
  const now = 10000;
  const h = [
    ...Array.from({ length: 4 }, (_, i) => ({ t: now - 3000 - i, b: [10, 1, 0], w: [90, 1, 0] })), // fora dos 30 min
    ...Array.from({ length: 5 }, (_, i) => ({ t: now - 100 - i * 10, b: [60, 1, 0], w: [30, 1, 0] })),
  ];
  const conv = fromHistory(h, now);
  assert.equal(conv.length, 5);
  const r = bestConnection(conv);
  assert.equal(r.side, "with");
  assert.equal(r.withoutAvg, 60);
  // histórico sem túnel (Mudfish nunca ligado) fica sem comparação
  assert.equal(bestConnection(fromHistory(Array.from({ length: 6 }, (_, i) => ({ t: now - i * 10, b: [40, 1, 0], w: null })), now)).state, "waiting");
  // melhor lado muda conforme o histórico, não o instante atual
  const mixed = [...Array.from({ length: 20 }, (_, i) => ({ t: now - 600 - i * 10, b: [80, 1, 0], w: [30, 1, 0] })), ...Array.from({ length: 3 }, (_, i) => ({ t: now - i * 10, b: [20, 1, 0], w: [40, 1, 0] }))];
  assert.equal(bestConnection(fromHistory(mixed, now)).side, "with");
});

test("v0.16.2: Painel lê o histórico (historyGet) para a faixa", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("historyGet()") && mud.includes("fromHistory(hist.samples, hist.now)"));
  assert.ok(!mud.includes("bestConnection(samples)"));
});
