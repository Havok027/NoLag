## v0.16.7

- **Navegador do painel em tela cheia:** o atalho "NoLag - Painel Mudfish" agora abre o navegador escolhido já em tela cheia no Modo Jogo. As opções são montadas conforme o navegador detectado (Flatpak ou nativo): Firefox e derivados usam `--kiosk`; Chrome, Chromium, Edge, Brave, Opera e Vivaldi usam `--start-fullscreen` e `--window-size=1280,800` (mantendo `--ozone-platform-hint=auto`); navegador desconhecido recebe só a URL, sem flags que possam quebrar a execução.
- O atalho já criado é atualizado sozinho na próxima abertura (as opções mudaram, então a assinatura muda), sem duplicar.
- **Layout de controle "Navegação Web":** ao criar o atalho, o plugin tenta aplicar o template de navegação web do Steam Deck. É melhor esforço: se a API do Steam não existir ou falhar, o navegador abre normalmente, sem aviso.
- Nenhum texto novo; nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
