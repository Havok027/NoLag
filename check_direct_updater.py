import ast
import glob
import json
import os
import re
import sys
import zipfile

NAME = "NoLag"
REQUIRED = ("main.py", "plugin.json", "package.json", "dist/index.js")


FORBIDDEN = ("tests/", "src/", "node_modules/", ".github/", "out/", "relay-setup.sh", "relay-code.txt")


def fail(msg):
    print("ERRO: " + msg)
    sys.exit(1)


def check(path):
    base = os.path.basename(path)
    if not zipfile.is_zipfile(path):
        fail(base + " não é um zip válido")
    with zipfile.ZipFile(path) as z:
        if z.testzip() is not None:
            fail(base + " está corrompido")
        names = z.namelist()
        for n in names:
            if not n.startswith(NAME + "/"):
                fail(n + " fora da pasta " + NAME + "/")
        for r in REQUIRED:
            if NAME + "/" + r not in names:
                fail("faltando " + NAME + "/" + r)
        for n in names:
            rel = n[len(NAME) + 1:]
            if rel.endswith(".zip") or "__pycache__" in rel or rel.startswith("test_") or any(rel.startswith(f) for f in FORBIDDEN):
                fail("resquício no pacote: " + n)
        mods = {n[len(NAME) + 1:-3] for n in names if n.endswith(".py") and "/" not in n[len(NAME) + 1:]}
        for mod in sorted(mods):
            try:
                tree = ast.parse(z.read(NAME + "/" + mod + ".py"))
            except SyntaxError as e:
                fail(mod + ".py com erro de sintaxe: " + str(e))
            for node in ast.walk(tree):
                for dep in ([a.name.split(".")[0] for a in node.names] if isinstance(node, ast.Import) else
                            [node.module.split(".")[0]] if isinstance(node, ast.ImportFrom) and node.module and not node.level else []):
                    if dep in ("core_state", "wifi_mgr", "wifi_dispatcher", "mudfish_mgr", "game_profiles") and dep not in mods:
                        fail(mod + ".py importa " + dep + ", que não está no pacote")
        if z.getinfo(NAME + "/dist/index.js").file_size == 0:
            fail("dist/index.js vazio")
        plugin = json.loads(z.read(NAME + "/plugin.json"))
        pkg = json.loads(z.read(NAME + "/package.json"))
    if plugin.get("name") != NAME:
        fail("plugin.json: name diferente de " + NAME)
    version = str(pkg.get("version", ""))
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        fail("package.json: versão inválida: " + version)
    if "version" in plugin and str(plugin["version"]) != version:
        fail("plugin.json diverge do package.json")
    m = re.search(r"-v(\d+\.\d+\.\d+)\.zip$", base)
    if m and m.group(1) != version:
        fail("nome do zip diverge da versão " + version)
    print("OK: " + base + " (v" + version + ")")


def main():
    paths = sys.argv[1:] or sorted(glob.glob("*.zip"))
    if not paths:
        fail("nenhum zip encontrado")
    for p in paths:
        check(p)


if __name__ == "__main__":
    main()
