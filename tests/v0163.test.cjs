const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.16.3: ConfTab tem o dropdown de navegador dentro de Box, carrega ao abrir e salva ao trocar", () => {
  const c = read("ConfTab.tsx");
  assert.ok(c.includes("label={t.confBrowser}") && c.includes("<Help show={helpOn} text={t.hConfBrowser}"));
  assert.ok(c.indexOf("label={t.confBrowser}") > c.indexOf("<Box>"), "dentro de um Box");
  assert.ok(c.includes("mudfishListBrowsers()") && c.includes("useEffect"), "carrega na montagem");
  assert.ok(c.includes("mudfishSetPanelBrowser(id)") && c.includes("onChange={(opt) => pickBrowser("), "salva ao trocar");
  assert.ok(c.includes("t.confBrowserSteam"), "primeira opção traduzida");
});

test("v0.16.3: openMudfishWeb usa o backend e cai no navegador do Steam", () => {
  const m = read("MudfishTab.tsx");
  const body = m.slice(m.indexOf("export async function openMudfishWeb"));
  assert.ok(body.includes("mudfishOpenPanelBrowser()") && body.includes("r.external"));
  assert.ok(body.includes("openMudfishNative(url)"), "fallback");
  const native = m.slice(m.indexOf("function openMudfishNative"), m.indexOf("export async function openMudfishWeb"));
  assert.ok(native.includes("Navigation.CloseSideMenus()") && native.includes("Navigation.NavigateToExternalWeb(url || WEBUI_URL)"));
  // os dois botões continuam chamando a mesma função
  assert.ok(read("DashControls.tsx").includes("openMudfishWeb(status?.webui)") && m.includes("openMudfishWeb(status?.webui)"));
});

test("v0.16.3: api.ts expõe os 3 métodos do backend", () => {
  const a = read("api.ts");
  for (const n of ["mudfish_list_browsers", "mudfish_set_panel_browser", "mudfish_open_panel_browser"]) assert.ok(a.includes(`"${n}"`), n);
  const main = fs.readFileSync(path.join(__dirname, "..", "main.py"), "utf8");
  for (const n of ["mudfish_list_browsers", "mudfish_set_panel_browser", "mudfish_open_panel_browser"]) assert.ok(main.includes(`async def ${n}`), n);
});

test("v0.16.3: i18n com as 3 chaves nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  for (const k of ["confBrowser", "confBrowserSteam", "hConfBrowser"]) assert.equal(i.split(`${k}:`).length - 1, 4, k);
});
