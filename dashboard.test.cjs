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

const NEW_KEYS = ["tabDash", "tabRoutes", "tabHint", "badgeActive", "badgeWaiting", "badgeOff", "badgeError",
  "badgeStarting", "pingNow", "jitter", "loss", "liveRoutes", "inUse", "noLive", "diagTitle", "diagProcs",
  "diagPorts", "diagPackets", "diagTop", "diagHint", "relaysCount"];

test("textos do painel existem nos 3 idiomas", () => {
  const src = read("i18n.tsx");
  for (const key of NEW_KEYS) {
    const count = (src.match(new RegExp("^\\s+" + key + ': "', "gm")) || []).length;
    assert.strictEqual(count, 3, key);
  }
});

test("painel mostra ping atual e rotas ao vivo", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("t.pingNow") && src.includes("t.liveRoutes") && src.includes("t.diagTitle"));
  assert.ok(src.includes("TabBar") && src.includes("Collapsible"));
});

test("seções recolhíveis salvam o estado", () => {
  const src = read("Content.tsx");
  assert.ok(src.includes("setSettings({ collapsed: next })"));
});
