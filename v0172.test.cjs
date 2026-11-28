const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");
const readRoot = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("v0.17.2: atualização pede confirmação (modal) e só chama o backend no OK", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("export function askMudfishUpdate"));
  const fn = m.slice(m.indexOf("export function askMudfishUpdate"), m.indexOf("export function ConnCard"));
  assert.ok(fn.includes("ConfirmModal") && fn.includes("onOK") && fn.includes("mudfishUpdate()"));
  assert.ok(!/onClick=\{\(\) => run\(\(\) => mudfishUpdate\(\)/.test(m), "botão não atualiza direto");
  assert.ok(m.includes("askMudfishUpdate(run, t, status.update.latest, status.update.installed)"));
});

test("v0.17.2: Painel mostra o botão de atualizar que abre a confirmação", () => {
  const d = read("DashControls.tsx");
  assert.ok(d.includes("askMudfishUpdate"));
  assert.ok(d.includes("mfUpdateBtn"));
});

test("v0.17.2: textos de confirmação nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  assert.strictEqual((i.match(/mfUpdateConfirm:/g) || []).length, 4); // interface + 3 idiomas
  assert.strictEqual((i.match(/mfUpdateConfirmOk:/g) || []).length, 4);
});

test("v0.17.2: versão válida e notas só da versão atual", () => {
  assert.strictEqual(JSON.parse(readRoot("package.json")).version, "0.17.2");
  const n = readRoot("RELEASE_NOTES.md");
  assert.strictEqual((n.match(/^## v/gm) || []).length, 1);
  assert.ok(n.startsWith("## v0.17.2"));
});
