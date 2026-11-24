const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");

test("v0.16.8: api expõe history_reset e a tela chama historyReset e limpa o cursor", () => {
  assert.ok(read("historyApi.ts").includes('callable<[], HistData>("history_reset")'));
  const v = read("HistoryView.tsx");
  assert.ok(v.includes("historyReset()") && v.includes("setCursorT(null)") && v.includes("FaRedoAlt"));
  assert.ok(v.includes("onPress={reset}"));
});

test("v0.16.8: histReset existe nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  assert.equal((i.match(/histReset: "/g) || []).length, 3);
  assert.ok(i.includes("histReset: string;"));
});

test("v0.16.8: versão 0.16.8 e notas só da versão atual", () => {
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "0.16.8");
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.ok(/^## v0\.16\.8\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
