const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.15.4: Painel compara Sem e Com Mudfish em duas linhas", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes('key: "without"') && mud.includes('key: "with"'));
  assert.ok(mud.includes("dashed: true") && mud.includes("lines={lines}"));
  assert.ok(mud.includes("t.chartWith") && mud.includes("t.chartWithout"));
  assert.ok(mud.includes("tunnel: viaNow ? r.tunnel : null"), "Com só existe com o túnel medido");
});

test("v0.15.4: chaves de i18n chartWith/chartWithout nos 3 idiomas", () => {
  const i18n = read("i18n.tsx");
  for (const k of ["chartWith", "chartWithout"]) {
    assert.strictEqual((i18n.match(new RegExp(`\\b${k}: "`, "g")) || []).length, 3, k);
    assert.ok(new RegExp(`\\b${k}: string`).test(i18n), k);
  }
});
