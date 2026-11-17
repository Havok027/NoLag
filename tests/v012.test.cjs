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

test("botão de restauração do Wi-Fi tem o texto curto nos 3 idiomas", () => {
  const src = read("i18n.tsx");
  for (const text of ["Restaurar padrão", "Restore default", "Restaurar predeterminado"]) {
    assert.ok(src.includes(`wifiRestore: "${text}",`), text);
  }
  assert.ok(!src.includes("Restaurar tudo ao padrão"));
});

test("Corrigir ao acordar não conta como otimização ativa (Painel volta ao padrão após restaurar)", () => {
  const src = read("WifiTab.tsx");
  const body = src.slice(src.indexOf("export function activeCount"), src.indexOf("export function useWifi"));
  assert.ok(!/c\.auto_fix_on_wake,/.test(body));
  assert.ok(/c\.link_watchdog_enabled,/.test(body));
});

test("textos novos da v0.12.0 existem nos 3 idiomas e são usados", () => {
  const src = read("i18n.tsx");
  const tab = read("MudfishTab.tsx");
  for (const key of ["mfErrFullVpn", "mfRttRow", "mfRttReady", "mfRttPending", "mfRttError"]) {
    assert.strictEqual((src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length, 3, key);
    assert.ok(tab.includes("t." + key), "não usado: " + key);
  }
  assert.ok(tab.includes('case "fullvpn_blocked"'));
});

test("tipos da API incluem RTT, Full VPN e túnel sem resposta", () => {
  const api = read("api.ts");
  assert.ok(api.includes("interface MudfishRtt"));
  assert.ok(api.includes("full_vpn_api"));
  assert.ok(api.includes("tunnel_blocked"));
});
