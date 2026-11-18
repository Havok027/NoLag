const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", f.endsWith(".tsx") || f.endsWith(".ts") ? "src/" + f : f), "utf8");

test("v0.14.1: versão e notas enxutas", () => {
  assert.match(JSON.parse(read("package.json")).version, /^\d+\.\d+\.\d+$/);
  const n = read("RELEASE_NOTES.md");
  assert.ok(/^## v\d+\.\d+\.\d+/m.test(n));
  assert.strictEqual((n.match(/^## v/gm) || []).length, 1);
});

test("v0.14.1: sem conta salva nem campos de login na interface", () => {
  const ui = read("MudfishTab.tsx") + read("ConfTab.tsx") + read("api.ts");
  for (const w of ["bIsPassword", "mudfishSetCredentials", "mudfishClearCredentials", "mfAccSave", "mfUser", "mfPass"]) {
    assert.ok(!ui.includes(w), w);
  }
  const i18n = read("i18n.tsx");
  for (const w of ["mfAccTitle", "hMfAcc", "mfAccSaved", "mfErrBadCreds"]) assert.ok(!i18n.includes(w), w);
});

test("v0.14.1: sem seletores de rota na interface", () => {
  const ui = read("MudfishTab.tsx") + read("ConfTab.tsx") + read("DashControls.tsx");
  for (const w of ["auto_selection", "multipath", "mudfishTestPing"]) assert.ok(!ui.includes(w), w);
});

test("v0.14.1: build.yml limpa artefatos e confere as notas", () => {
  const y = read(".github/workflows/build.yml");
  assert.ok(y.includes("rm -rf out NoLag-v*.zip") && y.includes("zip -qrX") && y.includes("check_direct_updater.py"));
  assert.ok(y.includes("RELEASE_NOTES.md precisa"));
});
