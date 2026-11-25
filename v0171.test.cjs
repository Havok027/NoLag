const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");
const readRoot = (f) => fs.readFileSync(path.join(root, f), "utf8");

function loadTs() {
  try { return require("typescript"); } catch { /* tenta o global */ }
  const g = require("child_process").execSync("npm root -g").toString().trim();
  return require(path.join(g, "typescript"));
}
function loadGameName() {
  const ts = loadTs();
  const js = ts.transpileModule(read("gameName.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function("module", "exports", "window", js)(m, m.exports, {});
  return m.exports;
}

test("v0.17.1: steamGameName lê display_name do appStore e nunca lança", () => {
  const { steamGameName } = loadGameName();
  const store = { GetAppOverviewByAppID: (id) => (id === 594650 ? { display_name: "  Hunt: Showdown 1896 " } : null) };
  assert.equal(steamGameName("594650", store), "Hunt: Showdown 1896");
  assert.equal(steamGameName("1", store), "");
  assert.equal(steamGameName("594650", {}), "");
  assert.equal(steamGameName("594650", { GetAppOverviewByAppID: () => { throw new Error("x"); } }), "");
  assert.equal(steamGameName("594650"), ""); // sem appStore no ambiente
});

test("v0.17.1: Content usa o nome do Steam no jogo aberto e nos perfis salvos; api expõe set_game_name", () => {
  const c = read("Content.tsx");
  assert.ok(c.includes("steamGameName(g.appid)") && c.includes("setGameName(g.appid, real)"));
  assert.ok(c.includes("steamGameName(appid)") && c.includes("setGameName(appid, steamGameName(appid))"));
  assert.ok(read("api.ts").includes('callable<[appid: string, name: string], Settings>("set_game_name")'));
  assert.ok(readRoot("main.py").includes("async def set_game_name"));
});

test("v0.17.1: código morto do Mudfish por jogo removido (backend, api, tela e textos)", () => {
  const py = readRoot("mudfish_mgr.py");
  for (const gone of ["_game_on", "_auto_connect", "_cancel_connect", "CONNECT_WAIT", "CORE_WAIT", "connect_state", "auto_on_game", "def connect(", "def disconnect("]) {
    assert.ok(!py.includes(gone), gone);
  }
  assert.ok(py.includes("async def _game_off") && py.includes("disable=self._game_off"));
  for (const f of ["api.ts", "MudfishTab.tsx", "ConfTab.tsx", "i18n.tsx"]) {
    assert.ok(!read(f).includes("auto_on_game") && !read(f).includes("mfConnectManual"), f);
  }
});

test("v0.17.1: versão 0.17.1 e notas só da versão atual", () => {
  assert.equal(JSON.parse(readRoot("package.json")).version, "0.17.1");
  const notes = readRoot("RELEASE_NOTES.md");
  assert.ok(/^## v0\.17\.1\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
