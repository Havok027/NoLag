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

test("v0.12.5: layout mantido (sem overflow lateral, botões em coluna)", () => {
  assert.ok(read("Content.tsx").includes("overflow-x: hidden"));
  for (const f of ["ConfTab.tsx", "MudfishTab.tsx", "DashControls.tsx"]) assert.ok(!read(f).includes('layout="inline"'), f);
});

test("v0.12.5: aviso de fallback e fonte da telemetria na tela", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes('live.connect === "manual"') && m.includes("t.mfConnectManual") && m.includes("t.chartViaApi"));
});

test("v0.12.5: versão do package.json", () => {
  const dir = fs.existsSync(path.join(__dirname, "..", "package.json")) ? ".." : ".";
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(__dirname, dir, "package.json"), "utf8")).version, "0.12.5");
});
