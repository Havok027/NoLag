## v0.16.6

- **Navegador externo pelo Steam:** o Firefox/Chrome lançado direto pelo plugin caía no sandbox (EPERM) no Modo Jogo. Agora, com um navegador escolhido na Conf, o plugin cria um atalho do Steam ("NoLag - Painel Mudfish") para ele, com a URL `127.0.0.1:8282`, e o executa pelo Steam, dentro da sessão de jogo, como qualquer atalho não-Steam. A lista de navegadores continua vindo dos que estão instalados no aparelho (Flatpak ou nativo), e o atalho usa o executável e as opções do navegador detectado.
- O atalho é criado na primeira vez e reaproveitado depois. Se você trocar de navegador (ou o atalho for apagado), o antigo é removido e um novo é criado.
- O atalho do painel não conta como jogo: abrir ou fechar o navegador não liga nem desliga o Mudfish nem o Wi-Fi.
- Se o Steam recusar criar ou executar o atalho, o aviso mostra o motivo e o painel abre no navegador do Steam.
- O navegador do Steam (padrão) continua igual. Nenhum texto novo; nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
