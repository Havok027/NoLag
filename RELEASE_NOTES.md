## v0.12.5

- Conexão automática com as rotas oficiais do painel: ao abrir o jogo (perfil com "Ativar ao abrir jogo") o plugin sobe o serviço, espera sessão ativa e núcleo pronto, envia `POST /do/mudfish/start` (200 = iniciado, 201 = já em execução) e confere `core_running`. Qualquer recusa (409, sessão inativa, erro) mostra o aviso para clicar em Conectar no painel, sem travar o menu.
- Encerramento limpo: ao fechar o jogo envia `POST /do/mudfish/stop` (200 = encerrado) e em seguida encerra o serviço, liberando a porta 8282 e cortando o consumo mesmo se a API recusar.
- Telemetria no formato real do `/do/status/pingstat` (Mudfish 6.6.4): RTT, jitter e perda reais do túnel preenchem o gráfico e os mini-cards ao lado de "Sem Mudfish" (0 = sem medição, acima de 2800 = perda de pacotes; usa a rota de menor mediana nas últimas 5 leituras). O ping ICMP pelo túnel fica só como reserva.
- Layout do QAM mantido: sem rolagem lateral, botões em coluna e quebra de palavras.
- Testes novos, incluindo a amostra real do pingstat.
