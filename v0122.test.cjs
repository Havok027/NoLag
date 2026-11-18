const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const read = (f) => {
  for (const dir of ["../src", ".."]) {
    const p = path.join(__dirname, dir, f);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  throw new Error("arquivo não encontrado: " + f);
};

test("v0.12.1: abas do topo têm ícone (painel, Wi-Fi, Mudfish, Conf)", () => {
  const nav = read("TabNav.tsx");
  for (const icon of ["FaTachometerAlt", "FaWifi", "FaGlobeAmericas", "FaCog"]) assert.ok(nav.includes(icon), icon);
  assert.ok(nav.includes("TAB_ICONS[key]") && nav.includes("flexDirection: \"column\""));
});

test("v0.12.1: mini-cards alinhados (colunas iguais, linhas em grade, sem estouro)", () => {
  const comp = read("components.tsx");
  const i = comp.indexOf("export function MiniCard");
  const body = comp.slice(i);
  assert.ok(body.includes("textOverflow") && body.includes('height: "100%"') && body.includes("minWidth: 0"));
  assert.ok(read("MudfishTab.tsx").includes('alignItems: "stretch"'));
});

test("v0.12.1: perfis de jogos sem rótulo longo ao lado de botão (sem sobreposição)", () => {
  const conf = read("ConfTab.tsx");
  assert.ok(!/layout="inline"\s+label=\{g\.name\}/.test(conf));
  assert.ok(!/label=\{p\.current\.name/.test(conf));
  assert.ok(conf.includes("overflowWrap") && conf.includes('layout="below"'));
});

test("v0.12.2: aviso e botão de atualização do núcleo, nos 3 idiomas", () => {
  const i18n = read("i18n.tsx");
  const tab = read("MudfishTab.tsx");
  const dash = read("DashControls.tsx");
  for (const key of ["mfUpdateTitle", "mfUpdateAvail", "mfUpdateBtn", "mfUpdateOk", "mfErrUpdateCheck"]) {
    assert.strictEqual((i18n.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length, 3, key);
    assert.ok(tab.includes("t." + key) || dash.includes("t." + key), "não usado: " + key);
  }
  assert.ok(tab.includes("mudfishUpdate()") && tab.includes("mudfishCheckUpdate()"));
  assert.ok(dash.includes("status?.update?.available"));
  const api = read("api.ts");
  assert.ok(api.includes("mudfish_check_update") && api.includes("mudfish_update"));
});
