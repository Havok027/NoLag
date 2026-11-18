const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", /\.tsx?$/.test(f) ? "src/" + f : f), "utf8");

test("v0.15.0: Full VPN só informa, sem erro nem aviso amarelo", () => {
  const tab = read("MudfishTab.tsx");
  assert.ok(tab.includes("INFO_BOX") && tab.includes("t.mfFullVpnWarn"));
  assert.ok(!tab.includes("fullvpn_blocked") && !read("i18n.tsx").includes("mfErrFullVpn"));
  assert.ok(!/WARN_BOX[^\n]*mfFullVpnWarn/.test(tab));
});

test("v0.15.0: botão ? da seção Mudfish abre o guia só sob demanda", () => {
  const tab = read("MudfishTab.tsx");
  assert.ok(tab.includes("useState(false)") && tab.includes("tipOpen") && tab.includes("<TipButton"));
  assert.ok(/\{tipOpen && \(/.test(tab));
  assert.ok(read("components.tsx").includes("export function TipButton"));
});

test("v0.15.0: textos do guia nos 3 idiomas e usados", () => {
  const i18n = read("i18n.tsx"), tab = read("MudfishTab.tsx");
  for (const k of ["mfTipBtn", "mfTipTitle", "mfTipItem", "mfTipFull", "mfTipDiff", "mfFullVpnWarn"]) {
    assert.strictEqual((i18n.match(new RegExp("^\\s*" + k + ":", "gm")) || []).length, 4, k);
    assert.ok(tab.includes("t." + k), k);
  }
});
