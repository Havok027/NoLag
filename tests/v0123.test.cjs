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

test("v0.12.3: aviso de túnel ocioso nos 3 idiomas, no tipo e na tela", () => {
  const i18n = read("i18n.tsx");
  assert.strictEqual((i18n.match(/chartTunnelIdle:/g) || []).length, 4); // interface + pt, en, es
  assert.ok(read("api.ts").includes("tunnel_idle?: boolean"));
  assert.ok(read("MudfishTab.tsx").includes("live.tunnel_idle") && read("MudfishTab.tsx").includes("t.chartTunnelIdle"));
});

test("v0.12.3: versão do package.json", () => {
  const dir = fs.existsSync(path.join(__dirname, "..", "package.json")) ? ".." : ".";
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(__dirname, dir, "package.json"), "utf8")).version, "0.12.3");
});
