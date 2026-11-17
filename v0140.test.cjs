const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = fs.existsSync(path.join(__dirname, "..", "package.json")) ? path.join(__dirname, "..") : __dirname;
const read = (f) => {
  for (const d of ["src", "."]) {
    const p = path.join(root, d, f);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  throw new Error("arquivo não encontrado: " + f);
};
const keysOf = (src, key) => [...src.matchAll(new RegExp("^\\s+" + key + ': "(.*)",$', "gm"))].map((m) => m[1]);

test("v0.14.0: versão do package.json e notas", () => {
  assert.strictEqual(JSON.parse(read("package.json")).version, "0.14.0");
  assert.ok(read("RELEASE_NOTES.md").includes("## v0.14.0"));
});

test("v0.14.0: botão Desinstalar Mudfish pede confirmação antes de chamar o backend", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("ConfirmModal") && m.includes("showModal") && m.includes("bDestructiveWarning"));
  assert.ok(m.includes("mudfishUninstall()") && m.includes("onOK"));
  // o backend só é chamado dentro do onOK do modal
  const calls = m.split("mudfishUninstall()").length - 1;
  assert.strictEqual(calls, 1);
  assert.ok(m.indexOf("mudfishUninstall()") > m.indexOf("onOK"));
  assert.ok(m.includes("onClick={askUninstall}") && m.includes('case "uninstall_failed"'));
  assert.ok(read("api.ts").includes('"mudfish_uninstall"'));
});

test("v0.14.0: versão mais recente aparece na aba Mudfish", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("t.mfLatestRow") && m.includes("status.update.latest"));
});

test("v0.14.0: textos novos nos 3 idiomas e usados", () => {
  const i18n = read("i18n.tsx");
  const tab = read("MudfishTab.tsx");
  for (const k of ["mfLatestRow", "mfUninstall", "mfUninstallDesc", "mfUninstallTitle", "mfUninstallConfirm", "mfUninstallOk", "mfCancel", "mfUninstalled", "mfErrUninstall", "hMfUninstall"]) {
    assert.strictEqual(keysOf(i18n, k).length, 3, k);
    assert.ok(tab.includes("t." + k), "não usado: " + k);
  }
  for (const t of keysOf(i18n, "mfUninstallConfirm")) assert.ok(t.includes("/opt/mudfish"));
  for (const t of keysOf(i18n, "hMfUninstall")) assert.ok(t.includes("\\n"));
});

test("v0.14.0: main.py expõe a desinstalação", () => {
  assert.ok(read("main.py").includes("async def mudfish_uninstall"));
});
