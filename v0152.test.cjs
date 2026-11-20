const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.15.2: linha de latência dos nós fica 'Medida' com qualquer leitura pronta ou RTT ao vivo", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes('r.live || r.static === "ready" || r.vnodes === "ready"'));
  assert.ok(!src.includes('r.static === "ready" && r.vnodes === "ready" ? t.mfRttReady'));
  assert.ok(read("api.ts").includes("live?: boolean"));
});
