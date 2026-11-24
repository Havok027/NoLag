const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.16.4: falha do navegador externo mostra toast com o motivo antes do fallback", () => {
  const m = read("MudfishTab.tsx");
  const body = m.slice(m.indexOf("export async function openMudfishWeb"), m.indexOf("const WARN_BOX"));
  assert.ok(body.includes("r.ok === false") && body.includes("warnBrowserFailed(r.detail || r.error)"));
  assert.ok(body.indexOf("warnBrowserFailed") < body.indexOf("openMudfishNative(url)"), "aviso antes do fallback");
  const warn = m.slice(m.indexOf("async function warnBrowserFailed"), m.indexOf("export async function openMudfishWeb"));
  assert.ok(warn.includes("toaster.toast") && warn.includes("t.mfBrowserFailTitle") && warn.includes("t.mfBrowserFailBody"));
  assert.ok(m.includes("getSettings,") && m.includes("TEXTS, normalizeLang"));
});

test("v0.16.4: i18n com as 2 chaves nos 3 idiomas, sem aspas sem escape", () => {
  const i = read("i18n.tsx");
  for (const k of ["mfBrowserFailTitle", "mfBrowserFailBody"]) assert.equal(i.split(`${k}:`).length - 1, 4, k);
  const lines = i.split("\n").filter((l) => /^\s*(mfBrowserFailTitle|mfBrowserFailBody):\s*"/.test(l));
  assert.equal(lines.length, 6);
  for (const l of lines) {
    const body = l.replace(/^\s*\w+:\s*"/, "").replace(/",\s*$/, "");
    assert.ok(!/(^|[^\\])"/.test(body), l.slice(0, 60));
  }
});

test("v0.16.4: versão 0.16.4 e notas só da versão atual", () => {
  const root = path.join(__dirname, "..");
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "0.16.4");
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.ok(/^## v0\.16\.4\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
