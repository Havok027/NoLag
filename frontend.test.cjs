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

test("plugin.json é válido, sem version e com root", () => {
  const plugin = JSON.parse(read("plugin.json"));
  assert.strictEqual(plugin.name, "NoLag");
  assert.strictEqual(plugin.api_version, 1);
  assert.ok(!("version" in plugin));
  assert.ok(plugin.flags.includes("_root"));
});

function langKeys(src) {
  const keys = {};
  for (const lang of ["pt", "en", "es"]) {
    const m = src.match(new RegExp("\\n  " + lang + ": \\{([\\s\\S]*?)\\n  \\},"));
    assert.ok(m, "bloco " + lang + " não encontrado");
    keys[lang] = [...m[1].matchAll(/^\s{4}(\w+):/gm)].map((x) => x[1]).sort();
    assert.ok(keys[lang].length > 0);
  }
  return keys;
}

test("i18n tem as mesmas chaves em pt, en e es", () => {
  const keys = langKeys(read("src/i18n.tsx"));
  assert.deepStrictEqual(keys.en, keys.pt);
  assert.deepStrictEqual(keys.es, keys.pt);
});

test("todo t.chave usado nas telas existe no i18n", () => {
  const keys = langKeys(read("src/i18n.tsx")).pt;
  for (const file of ["src/Content.tsx", "src/index.tsx"]) {
    for (const m of read(file).matchAll(/\bt\.(\w+)/g)) {
      assert.ok(keys.includes(m[1]), file + ": t." + m[1] + " sem tradução");
    }
  }
});

test("todo callable do api.ts existe no main.py", () => {
  const api = read("src/api.ts");
  const py = read("main.py");
  const names = [...api.matchAll(/callable<[^(]*\("(\w+)"\)/g)].map((m) => m[1]);
  assert.ok(names.length >= 7);
  for (const n of names) {
    assert.ok(new RegExp("async def " + n + "\\(").test(py), n + " ausente no main.py");
  }
});

test("READMEs nos 3 idiomas existem", () => {
  for (const f of ["README.md", "README.en.md", "README.es.md"]) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});

test("RELEASE_NOTES cita a versão atual", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(read("RELEASE_NOTES.md").includes("## v" + pkg.version));
});

test("relay-setup.sh existe e gera o código esperado pelo plugin", () => {
  const sh = read("relay-setup.sh");
  assert.ok(sh.includes("nolag1:"));
  assert.ok(read("main.py").includes("nolag1:"));
});
