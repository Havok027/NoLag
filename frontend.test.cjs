const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf-8");

test("package.json tem versão semver", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
});

test("plugin.json é válido e não diverge do nome", () => {
  const plugin = JSON.parse(read("plugin.json"));
  assert.strictEqual(plugin.name, "NoLag");
  assert.strictEqual(plugin.api_version, 1);
  assert.ok(!("version" in plugin));
});

test("i18n tem as mesmas chaves em pt, en e es", () => {
  const src = read("src/i18n.tsx");
  const keys = {};
  for (const lang of ["pt", "en", "es"]) {
    const m = src.match(new RegExp("\\n  " + lang + ": \\{([\\s\\S]*?)\\n  \\},"));
    assert.ok(m, "bloco " + lang + " não encontrado");
    keys[lang] = [...m[1].matchAll(/^\s{4}(\w+):/gm)].map((x) => x[1]).sort();
    assert.ok(keys[lang].length > 0);
  }
  assert.deepStrictEqual(keys.en, keys.pt);
  assert.deepStrictEqual(keys.es, keys.pt);
});

test("READMEs nos 3 idiomas existem", () => {
  for (const f of ["README.md", "README.en.md", "README.es.md"]) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});

test("RELEASE_NOTES cita a versão atual", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(read("RELEASE_NOTES.md").includes(pkg.version));
});
