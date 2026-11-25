const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");

test("v0.16.9: run devolve se deu certo e toggleMudfish só abre o painel ao ligar com sucesso", () => {
  const m = read("MudfishTab.tsx");
  assert.ok(m.includes("Promise<boolean> => {") && m.includes("return ok;"));
  const fn = m.slice(m.indexOf("export async function toggleMudfish"));
  assert.ok(fn.includes("mudfishSetEnabled(enable)"));
  assert.ok(fn.includes("if (ok && enable) await openMudfishWeb();"));
  assert.ok(!/openMudfishWeb\(\)[\s\S]*else/.test(fn.split("\n").slice(0, 4).join("\n")));
});

test("v0.16.9: botão do Painel e chave da aba Mudfish usam toggleMudfish", () => {
  assert.ok(read("DashControls.tsx").includes("toggleMudfish(run, t, !running)"));
  assert.ok(read("MudfishTab.tsx").includes("onChange={(v) => toggleMudfish(run, t, v)}"));
  assert.ok(!read("DashControls.tsx").includes("mudfishSetEnabled"));
});

test("v0.16.9: backend só devolve ok depois que a porta 8282 abre (o navegador não abre numa página morta)", () => {
  const py = fs.readFileSync(path.join(root, "mudfish_mgr.py"), "utf8");
  const start = py.slice(py.indexOf("async def _start_locked"));
  assert.ok(start.indexOf("port_open") < start.indexOf('return {"ok": True, "error": ""}', start.indexOf("port_open")));
});

test("v0.16.9: versão 0.16.9 e notas só da versão atual", () => {
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "0.16.9");
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.ok(/^## v0\.16\.9\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
