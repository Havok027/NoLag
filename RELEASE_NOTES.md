## v0.12.4

- Layout do QAM: sem arrasto lateral (`overflow-x: hidden`, `max-width: 100%`, `box-sizing: border-box` na raiz e nos cartões, quebra de palavras e reset do deslocamento ao focar). Botões do diagnóstico e do painel passam para layout em coluna.
- Telemetria: com o túnel ativo e sem resposta do ICMP, RTT, jitter e perda do item vêm de `/do/status/pingstat` do Mudfish (só leitura) e aparecem lado a lado com "Sem Mudfish" no gráfico e nos mini-cards.
- Conexão automática: ao abrir o jogo (perfil com "Ativar ao abrir jogo"), o plugin sobe o serviço, espera núcleo pronto e sessão ativa e tenta o equivalente ao botão Conectar. O endpoint de conexão ainda não foi capturado, então nada é enviado às cegas: a tela mostra o aviso para clicar em Conectar no painel. Ao fechar o jogo o serviço é encerrado (desconecta).
- Auto-updater: o núcleo é atualizado sozinho no boot e antes de ligar por jogo (serviço desligado, no máximo a cada 6 h). Versão de reserva da instalação nova: 6.6.4.
- Diagnóstico v6: captura o caminho dos botões Conectar/Desconectar e `pingstat` para mapear a conexão.
- Textos novos nos três idiomas e testes novos.
