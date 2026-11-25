const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, "src", f), "utf8");

test("v0.17.0: Conf sem a chave Mudfish por jogo e sem 'Ativar ao abrir jogo'; mantém Wi-Fi e Manter ligado", () => {
  const c = read("ConfTab.tsx");
  for (const gone of ["gameMudfish", "confAutoGame", "hConfAutoGame", '"auto_on_game"', '"mudfish", v']) assert.ok(!c.includes(gone), gone);
  for (const kept of ["t.gameWifi", "t.confKeepOn", '"keep_on"', "p.onDropGame(appid)"]) assert.ok(c.includes(kept), kept);
  assert.ok(c.includes('module: "wifi", value'));
  assert.ok(read("Content.tsx").includes('module: "wifi", value'));
});

test("v0.17.0: chaves removidas saem do i18n e os textos dos jogos não citam ligar o Mudfish", () => {
  const i = read("i18n.tsx");
  for (const k of ["confAutoGame", "confAutoGameDesc", "hConfAutoGame", "gameMudfish"]) assert.ok(!i.includes(k + ":"), k);
  const descs = i.match(/gameModulesDesc: ".*",/g) || [];
  assert.equal(descs.length, 3);
  for (const d of descs) assert.ok(!/mudfish/i.test(d), d);
});

test("v0.17.0: READMEs não citam mais ativar ao abrir jogo", () => {
  for (const f of ["README.md", "README.en.md", "README.es.md"]) {
    const r = fs.readFileSync(path.join(root, f), "utf8");
    assert.ok(!/ativar ao abrir jogo|enable on game launch|activar al abrir un juego/i.test(r), f);
  }
});

test("v0.17.0: versão 0.17.0 e notas só da versão atual", () => {
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version, "0.17.0");
  const notes = fs.readFileSync(path.join(root, "RELEASE_NOTES.md"), "utf8");
  assert.ok(/^## v0\.17\.0\b/m.test(notes));
  assert.equal((notes.match(/^## v/gm) || []).length, 1);
});
