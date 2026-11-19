const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.15.1: PanelButton existe no padrão BOX, com ícone, foco e descrição abaixo", () => {
  const c = read("components.tsx");
  const i = c.indexOf("export function PanelButton");
  assert.ok(i > 0);
  const body = c.slice(i, c.indexOf("export function Footer"));
  for (const s of ["...BOX", "FOCUS_BORDER", "FOCUS_GLOW", "FaExternalLinkAlt", "props.description", "onGamepadFocus", "useTap"]) {
    assert.ok(body.includes(s), s);
  }
});

test("v0.15.1: Painel e aba Mudfish usam PanelButton, sem ButtonItem e sem rótulo duplicado", () => {
  for (const f of ["DashControls.tsx", "MudfishTab.tsx"]) {
    const src = read(f);
    assert.ok(src.includes("<PanelButton"), f);
    assert.ok(src.includes("openMudfishWeb(status?.webui)"), f);
    assert.ok(src.includes("!status?.port_open"), f);
    const j = src.indexOf("<PanelButton");
    const tag = src.slice(j, src.indexOf("/>", j));
    assert.ok(tag.includes("label={t.mfOpenWeb}") && tag.includes("description={t.mfOpenWebDesc}"), f);
    assert.ok(!/<ButtonItem[^>]*mfOpenWeb/s.test(src), f);
  }
  assert.ok(!read("DashControls.tsx").includes("ButtonItem"));
});
