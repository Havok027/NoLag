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

test("v0.12.3: versão do package.json", () => {
  const dir = fs.existsSync(path.join(__dirname, "..", "package.json")) ? ".." : ".";
  assert.ok(JSON.parse(fs.readFileSync(path.join(__dirname, dir, "package.json"), "utf8")).version.match(/^\d+\.\d+\.\d+$/) !== null);
});
