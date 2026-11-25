## v0.17.1

- **Nome do jogo corrigido:** a aba Conf mostrava o nome do processo (ex.: "Main") em vez do jogo. Agora o plugin lê o título real no Steam (ex.: Hunt: Showdown) para o "Jogo aberto" e para os perfis salvos, e corrige sozinho perfis antigos que ficaram com o nome do processo. Se o Steam não informar o título, continua o nome anterior.
- **Limpeza do código do Mudfish por jogo:** removidos o ligar ao abrir jogo, a conexão automática e a opção interna `auto_on_game` (backend, tipos e o aviso "Conectar no painel"), sem uso desde a v0.17.0. O Mudfish continua sendo encerrado ao fechar qualquer jogo, e "Manter ligado ao reiniciar" não mudou.
- Configurações antigas com `auto_on_game` são lidas normalmente: o valor é descartado.
- Nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
