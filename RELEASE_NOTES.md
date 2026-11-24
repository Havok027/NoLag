## v0.16.4

- **Navegador externo no Modo Jogo (Gamescope/Wayland/Flatpak):** o plugin agora detecta a sessão gráfica ativa do usuário em vez de assumir valores fixos: socket Wayland (`gamescope-0`, `wayland-0` ou `wayland-1` em `/run/user/<uid>`), display X11 ativo (`/tmp/.X11-unix`), barramento DBus (`unix:path=/run/user/<uid>/bus`), `XDG_RUNTIME_DIR` e `HOME`. Essas variáveis também vão para `runuser -u <usuário> -- env ...`, inclusive para Flatpak.
- **Chromium e derivados** (Chrome, Edge, Brave, Chromium, Opera, Vivaldi, nativos ou Flatpak): abrem com `--ozone-platform-hint=auto --new-window` antes da URL.
- **Diagnóstico de falha:** se o navegador encerrar com erro nos primeiros 500 ms, o motivo (stderr) é devolvido em `browser_launch_failed` em vez de um sucesso cego.
- **Aviso na tela:** quando o navegador externo escolhido falha, aparece um aviso com o motivo antes de abrir o painel no navegador do Steam.
- Textos novos em PT, EN e ES. Nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
