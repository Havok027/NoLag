const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

test("v0.16.5: aviso mostra o motivo antes do texto fixo", () => {
  const m = fs.readFileSync(path.join(root, "src", "MudfishTab.tsx"), "utf8");
  assert.ok(m.includes("`${detail}\\n${t.mfBrowserFailBody}`"));
});

test("v0.16.5: versão 0.16.5 e notas só da versão atual", () => {
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "0.16.5");
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.ok(/^## v0\.16\.5\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
