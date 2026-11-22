const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.15.5: MiniCard aceita linhas de comparação com ✓ no melhor", () => {
  const c = read("components.tsx");
  const body = c.slice(c.indexOf("export function MiniCard"));
  assert.ok(body.includes("props.rows") && body.includes("r.best") && body.includes("FaCheck"));
  assert.ok(c.includes("export interface MiniRow"));
});

test("v0.15.5: Painel compara jitter e perda dos dois lados e marca o menor", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("rows={cmpRows(wm?.jitter, om?.jitter") && mud.includes("rows={cmpRows(wm?.loss, om?.loss"));
  assert.ok(mud.includes("w < o ? \"with\" : \"without\""), "menor é melhor");
  assert.ok(mud.includes("best: pingWin"), "ping também marca o melhor");
  assert.ok(mud.includes("t.chartBest"));
});
