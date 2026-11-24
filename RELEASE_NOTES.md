## v0.16.5

- **Aviso de falha do navegador externo mais útil:** o motivo (começo da saída de erro do navegador e o código de saída) agora vem primeiro no aviso, antes do texto fixo, porque a notificação do Steam mostra só uma linha.
- **`browser-launch.log`:** quando o navegador externo falha, o plugin grava na pasta de runtime o comando usado, o ambiente gráfico (DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR, DBUS, HOME) e a saída completa do erro.
- Nenhuma chave de texto nova; nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
