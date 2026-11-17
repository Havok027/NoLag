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

test("v0.13.0: versão do package.json", () => {
  assert.strictEqual(JSON.parse(read("package.json")).version, "0.13.0");
  assert.ok(read("RELEASE_NOTES.md").includes("## v0.13.0"));
});

test("v0.13.0: seletores de rota saíram da interface; backend e api.ts intactos", () => {
  for (const f of ["MudfishTab.tsx", "DashControls.tsx", "ConfTab.tsx", "Content.tsx"]) {
    const s = read(f);
    assert.ok(!s.includes('"auto_selection"') && !s.includes('"multipath"'), f);
  }
  assert.ok(read("api.ts").includes("mudfishSetOption"), "api.ts não muda nesta versão");
  assert.ok(read("mudfish_mgr.py").includes("auto_selection"), "backend não muda nesta versão");
});

test("v0.13.0: botão da WebUI no Painel e na aba Mudfish, ambos pela mesma função", () => {
  const dash = read("DashControls.tsx");
  const mud = read("MudfishTab.tsx");
  assert.ok(dash.includes("openMudfishWeb(status?.webui)") && mud.includes("openMudfishWeb(status?.webui)"));
  assert.ok(mud.includes("export function openMudfishWeb") && mud.includes("Navigation.NavigateToExternalWeb"));
});

test("v0.13.0: telemetria mostra só o ping atual, com a origem da medida", () => {
  const mud = read("MudfishTab.tsx");
  assert.ok(mud.includes("t.chartSrcMudfish") && mud.includes("t.chartSrcLocal") && mud.includes("t.chartNow"));
  assert.ok(!/live\??\.tunnel_(idle|blocked|waiting)/.test(mud));
  const i18n = read("i18n.tsx");
  for (const k of ["chartNow", "chartSrcMudfish", "chartSrcLocal"]) assert.strictEqual(keysOf(i18n, k).length, 3, k);
  for (const k of ["chartWith", "chartWithout", "mfAutoSel", "mfMultiPath", "hMfAutoSel", "hMfMultiPath", "mfPingBefore"]) assert.strictEqual(keysOf(i18n, k).length, 0, k);
});

test("v0.13.0: Wi-Fi começa pelas ações rápidas e deixa o avançado por último", () => {
  const w = read("WifiTab.tsx");
  const order = ["wifiSecActions", "wifiSecMain", "wifiSecStream", "wifiSecAdv"].map((k) => w.indexOf("title={t." + k + "}"));
  assert.ok(order.every((n) => n > 0) && order.every((n, i) => i === 0 || order[i - 1] < n), order.join());
});

test("v0.13.0: textos novos explicam que a configuração do túnel fica no painel do Mudfish", () => {
  const i18n = read("i18n.tsx");
  for (const k of ["mfFirstSteps", "hMfFirst", "mfOpenWebDesc"]) {
    const v = keysOf(i18n, k);
    assert.strictEqual(v.length, 3, k);
    for (const t of v) assert.ok(/127\.0\.0\.1:8282|painel|panel/i.test(t), k);
  }
});
