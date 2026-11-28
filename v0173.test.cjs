const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");
const readRoot = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("v0.17.3: botão Verificar atualização força a consulta e só aparece com o Mudfish instalado", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("mudfishCheckUpdate(true)"));
  assert.ok(m.includes("t.mfCheckBtn") && m.includes("t.mfChecking") && m.includes("t.mfUpToDate"));
  const i = m.indexOf("onClick={checkNow}");
  assert.ok(i > 0 && m.lastIndexOf("{installed && (", i) > m.lastIndexOf("5. Atualização do núcleo"));
  // a consulta automática (ao montar) continua sem forçar
  assert.ok(/mudfishCheckUpdate\(\)/.test(m));
});

test("v0.17.3: api e main aceitam force", () => {
  assert.ok(read("api.ts").includes("callable<[force?: boolean]"));
  assert.ok(readRoot("main.py").includes("async def mudfish_check_update(self, force=False)"));
});

test("v0.17.3: textos nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  for (const k of ["mfCheckBtn", "mfChecking", "mfUpToDate"]) assert.strictEqual((i.match(new RegExp(k + ":", "g")) || []).length, 4, k);
});

test("v0.17.3: versão e notas só da versão atual", () => {
  assert.strictEqual(JSON.parse(readRoot("package.json")).version, "0.17.3");
  const n = readRoot("RELEASE_NOTES.md");
  assert.strictEqual((n.match(/^## v/gm) || []).length, 1);
  assert.ok(n.startsWith("## v0.17.3"));
});
