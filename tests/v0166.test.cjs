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
const SPEC = { name: "NoLag - Painel Mudfish", exe: "/usr/bin/flatpak", start_dir: "/usr/bin", launch_options: "run org.mozilla.firefox http://127.0.0.1:8282", sig: "abc12345", saved: null };

function fake(opts = {}) {
  const calls = [];
  const known = new Set(opts.known || []);
  const apps = {
    AddShortcut: async (...a) => { calls.push(["add", ...a]); if (opts.addFails) throw new Error("x"); known.add(777); return opts.addReturn ?? 777; },
    RemoveShortcut: (id) => { calls.push(["remove", id]); known.delete(id); },
    SetShortcutName: (id, n) => calls.push(["name", id, n]),
    SetShortcutLaunchOptions: (id, o) => calls.push(["opts", id, o]),
    RunGame: async (...a) => { calls.push(["run", ...a]); if (opts.runFails) throw new Error("x"); },
  };
  const saved = [];
  const deps = {
    apps: opts.noApps ? undefined : apps,
    gameIdOf: (id) => (known.has(id) ? "G" + id : null),
    save: async (id, sig) => { saved.push([id, sig]); },
    wait: async () => {},
  };
  return { deps, calls, saved };
}

test("v0.16.6: primeira vez cria o atalho com o executável e as opções do navegador detectado, salva e executa", async () => {
  const { launchPanelShortcut } = load();
  const f = fake();
  const r = await launchPanelShortcut(SPEC, f.deps);
  assert.equal(r.ok, true);
  assert.deepEqual(f.calls[0], ["add", "NoLag - Painel Mudfish", "/usr/bin/flatpak", "/usr/bin", SPEC.launch_options]);
  assert.deepEqual(f.saved, [[777, "abc12345"]]);
  assert.deepEqual(f.calls[f.calls.length - 1], ["run", "G777", "", -1, 100]);
});

test("v0.16.6: atalho salvo e existente é reaproveitado (não cria outro)", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ known: [555] });
  const r = await launchPanelShortcut({ ...SPEC, saved: { appid: 555, sig: "abc12345" } }, f.deps);
  assert.equal(r.ok, true);
  assert.ok(!f.calls.some((c) => c[0] === "add" || c[0] === "remove"));
  assert.deepEqual(f.calls[f.calls.length - 1], ["run", "G555", "", -1, 100]);
});

test("v0.16.6: navegador trocado (assinatura diferente) remove o atalho antigo e cria o novo", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ known: [555] });
  const r = await launchPanelShortcut({ ...SPEC, saved: { appid: 555, sig: "outra" } }, f.deps);
  assert.equal(r.ok, true);
  assert.deepEqual(f.calls[0], ["remove", 555]);
  assert.equal(f.calls[1][0], "add");
  assert.deepEqual(f.saved, [[777, "abc12345"]]);
});

test("v0.16.6: atalho apagado pelo usuário é recriado", async () => {
  const { launchPanelShortcut } = load();
  const f = fake({ known: [] });
  const r = await launchPanelShortcut({ ...SPEC, saved: { appid: 555, sig: "abc12345" } }, f.deps);
  assert.equal(r.ok, true);
  assert.ok(f.calls.some((c) => c[0] === "add"));
});

test("v0.16.6: falhas voltam com código (o frontend avisa e abre no navegador do Steam)", async () => {
  const { launchPanelShortcut } = load();
  assert.equal((await launchPanelShortcut(SPEC, fake({ noApps: true }).deps)).error, "steam_api_missing");
  assert.equal((await launchPanelShortcut(SPEC, fake({ addFails: true }).deps)).error, "add_shortcut_failed");
  assert.equal((await launchPanelShortcut(SPEC, fake({ addReturn: 0 }).deps)).error, "add_shortcut_failed");
  assert.equal((await launchPanelShortcut(SPEC, fake({ runFails: true }).deps)).error, "run_failed");
  assert.equal((await launchPanelShortcut({ ...SPEC, exe: "" }, fake().deps)).error, "bad_spec");
});

test("v0.16.6: gameid de atalho = (appid << 32) | 0x02000000", () => {
  const { shortcutGameId } = load();
  assert.equal(shortcutGameId(1), String(2 ** 32 + 33554432));
});

test("v0.16.6: openMudfishWeb usa o atalho e api.ts/main.py expõem os 3 métodos", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes('from "./panelShortcut"') && m.includes("mudfishSavePanelShortcut(appid, sig)"));
  const a = read("api.ts");
  const main = fs.readFileSync(path.join(root, "main.py"), "utf8");
  for (const n of ["mudfish_panel_launch_spec", "mudfish_save_panel_shortcut", "mudfish_clear_panel_shortcut"]) {
    assert.ok(a.includes(`"${n}"`), n);
    assert.ok(main.includes(`async def ${n}`), n);
  }
});

test("v0.16.6: versão válida e notas só da versão atual", () => {
  const v = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
  assert.ok(/^0\.\d+\.\d+$/.test(v));
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
