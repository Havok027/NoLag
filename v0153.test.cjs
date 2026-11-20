const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const read = (f) => fs.readFileSync(path.join(__dirname, "..", "src", f), "utf8");

test("v0.15.3: linha de latência dos nós mostra o valor em ms", () => {
  const src = read("MudfishTab.tsx");
  assert.ok(src.includes('typeof r.ms === "number"') && src.includes("${r.ms} ms"));
  const api = read("api.ts");
  assert.ok(api.includes("ms?: number") && api.includes("best?: number"));
});
