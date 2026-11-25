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

test("v0.12.4: overflow horizontal bloqueado na raiz", () => {
  const c = read("Content.tsx");
  assert.ok(c.includes("overflow-x: hidden") && c.includes("overflowX"));
  assert.ok(c.includes("resetScrollX") && c.includes("nolag-root"));
  assert.ok(read("components.tsx").includes('wordBreak: "break-word"'));
});

test("v0.12.4: botões não usam layout inline (largura do QAM)", () => {
  for (const f of ["ConfTab.tsx", "MudfishTab.tsx"]) assert.ok(!read(f).includes('layout="inline"'), f);
});

test("v0.12.4: textos novos nos 3 idiomas", () => {
  const i = read("i18n.tsx");
  assert.strictEqual((i.match(/mfConnectManual:/g) || []).length, 0); // removido na v0.17.1 (conexão automática por jogo saiu)
});

test("v0.12.4: versão do package.json", () => {
  const dir = fs.existsSync(path.join(__dirname, "..", "package.json")) ? ".." : ".";
  assert.ok(JSON.parse(fs.readFileSync(path.join(__dirname, dir, "package.json"), "utf8")).version.match(/^\d+\.\d+\.\d+$/) !== null);
});
