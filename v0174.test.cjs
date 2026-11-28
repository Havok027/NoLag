const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const readRoot = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("v0.17.4: lista de releases é a fonte principal e a página de download a reserva", () => {
  const m = readRoot("mudfish_mgr.py");
  assert.ok(/LATEST_SOURCES = \(RELEASES_URL, DOWNLOAD_URL\)/.test(m));
  assert.ok(m.includes("return [RELEASES_URL + name, DOWNLOAD_URL"));
  assert.ok(m.includes("PAGE_MAX = 8_000_000"));
});

test("v0.17.4: versão e notas só da versão atual", () => {
  assert.strictEqual(JSON.parse(readRoot("package.json")).version, "0.17.4");
  const n = readRoot("RELEASE_NOTES.md");
  assert.strictEqual((n.match(/^## v/gm) || []).length, 1);
  assert.ok(n.startsWith("## v0.17.4"));
});
