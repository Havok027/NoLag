const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");

function loadTs() {
  try { return require("typescript"); } catch { /* tenta o global */ }
  const g = require("child_process").execSync("npm root -g").toString().trim();
  return require(path.join(g, "typescript"));
}
function load() {
  const ts = loadTs();
  const js = ts.transpileModule(read("panelShortcut.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function("module", "exports", js)(m, m.exports);
  return m.exports;
}
const SPEC = { name: "NoLag - Painel Mudfish", exe: "/usr/bin/firefox", start_dir: "/usr/bin", launch_options: "--kiosk http://127.0.0.1:8282", sig: "abc12345", saved: null };

function fake(opts = {}) {
  const calls = [];
  const known = new Set(opts.known || []);
  const apps = {
    AddShortcut: async (...a) => { calls.push(["add", ...a]); known.add(777); return 777; },
    RemoveShortcut: (id) => { calls.push(["remove", id]); known.delete(id); },
    SetShortcutName: () => {},
    SetShortcutLaunchOptions: () => {},
    RunGame: async (...a) => { calls.push(["run", ...a]); },
  };
  const layout = [];
  let input;
  if (opts.input === "ok") input = { SetAppControllerConfiguration: (...a) => { layout.push(a); } };
  else if (opts.input === "alt") input = { SetControllerMapping: (...a) => { layout.push(a); } };
  else if (opts.input === "throws") input = { SetAppControllerConfiguration: () => { throw new Error("x"); }, SetControllerMapping: () => Promise.reject(new Error("y")) };
  else if (opts.input === "empty") input = {};
  const deps = { apps, input, gameIdOf: (id) => (known.has(id) ? "G" + id : null), save: async () => {}, wait: async () => {} };
  return { deps, calls, layout };
}

test("v0.16.7: com SteamClient.Input, cria o atalho e aplica o layout de Navegação Web", async () => {
  const { launchPanelShortcut, WEB_BROWSER_TEMPLATE } = load();
  const f = fake({ input: "ok" });
  const r = await launchPanelShortcut(SPEC, f.deps);
  assert.equal(r.ok, true);
  assert.deepEqual(f.layout, [[777, WEB_BROWSER_TEMPLATE]]);
  assert.ok(WEB_BROWSER_TEMPLATE.includes("web_browser"));
});

test("v0.16.7: usa o método alternativo quando o primeiro não existe", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ input: "alt" });
  assert.equal((await launchPanelShortcut(SPEC, f.deps)).ok, true);
  assert.equal(f.layout.length, 1);
});

test("v0.16.7: sem SteamClient.Input (ou sem os métodos) o navegador abre normalmente", async () => {
  const { launchPanelShortcut } = load();
  for (const input of [undefined, "empty"]) {
    const f = fake({ input });
    const r = await launchPanelShortcut(SPEC, f.deps);
    assert.equal(r.ok, true);
    assert.deepEqual(f.calls[f.calls.length - 1], ["run", "G777", "", -1, 100]);
  }
});

test("v0.16.7: erro síncrono ou promessa rejeitada no layout não impede o lançamento nem gera falha", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ input: "throws" });
  const r = await launchPanelShortcut(SPEC, f.deps);
  assert.deepEqual(r, { ok: true });
  assert.deepEqual(f.calls[f.calls.length - 1], ["run", "G777", "", -1, 100]);
});

test("v0.16.7: atalho reaproveitado não reaplica o layout", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ input: "ok", known: [555] });
  await launchPanelShortcut({ ...SPEC, saved: { appid: 555, sig: "abc12345" } }, f.deps);
  assert.equal(f.layout.length, 0);
});

test("v0.16.7: MudfishTab repassa SteamClient.Input", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("input: w.SteamClient?.Input") && m.includes("input: g.input"));
});

test("v0.16.7: versão válida e notas só da versão atual", () => {
  assert.ok(/^0\.\d+\.\d+$/.test(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version));
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
