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

test("textos do Wi-Fi existem nos 3 idiomas", () => {
  const src = read("i18n.tsx");
  const keys = [...src.matchAll(/^  (tabWifi|wifi\w+|hWifi\w+): string;/gm)].map((m) => m[1]);
  assert.ok(keys.length >= 50, "poucas chaves wifi: " + keys.length);
  for (const key of keys) {
    const count = (src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length;
    assert.strictEqual(count, 3, key);
  }
});

test("todo t.chave de WifiTab e TabNav existe no i18n", () => {
  const i18n = read("i18n.tsx");
  for (const file of ["WifiTab.tsx", "TabNav.tsx"]) {
    for (const m of read(file).matchAll(/\bt\.(\w+)/g)) {
      assert.ok(new RegExp("^\\s+" + m[1] + ': "', "m").test(i18n), file + ": t." + m[1]);
    }
  }
});

test("api do Wi-Fi usa o prefixo wifi_ e existe no main.py", () => {
  const api = read("api.ts");
  const py = read("main.py");
  const names = [...api.matchAll(/callable<[^(]*\("(wifi_\w+)"\)/g)].map((m) => m[1]);
  assert.ok(names.length >= 14);
  for (const n of names) assert.ok(new RegExp("async def " + n + "\\(").test(py), n);
});

test("aba Wi-Fi e cartão do Painel estão ligados no Content", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes('tab === "wifi"') && src.includes("<WifiTab") && src.includes("<WifiCard"));
  assert.ok(src.includes("t.tabWifi") && src.includes("TAB_KEYS"));
  const nav = read("TabNav.tsx");
  assert.ok(/TAB_KEYS: TabKey\[\] = \["dash", "wifi", "routes", "settings"\]/.test(nav));
});

test("Wi-Fi não depende da rota: chamadas próprias e sem checar o status do NoLag", () => {
  const tab = read("WifiTab.tsx");
  assert.ok(!tab.includes("getStatus(") && !tab.includes("setRouteEnabled"));
  assert.ok(tab.includes("wifiOptimizeSafe") && tab.includes("wifiReset"));
});

test("seções do Wi-Fi são salvas pelo backend", () => {
  const py = read("main.py");
  for (const k of ["wifiMain", "wifiAdv", "wifiStream", "wifiActions"]) assert.ok(py.includes('"' + k + '"'), k);
});
