## v0.9.0

- Novo módulo Mudfish na aba Rotas, independente do Wi-Fi e da rota do NoLag: instalação e atualização do Mudfish oficial em pasta persistente (montada em /opt/mudfish), login salvo para entrar sozinho, chave liga/desliga do serviço, status da porta 8282 e botão para abrir o painel do Mudfish.
- Rota ativa (interface, IP e gateway) e teste de ping antes e depois, com alvo configurável.
- Painel: uma chave para o Wi-Fi e outra para o Mudfish, e a tabela Conexão com Wi-Fi, Mudfish, interface ativa, IP, gateway, ping e jitter.
- Perfis por jogo: cada jogo salvo liga o Wi-Fi e/ou o Mudfish por conta própria ao abrir e só desliga o que ele mesmo ligou.
- Módulos conversam por um estado compartilhado (core_state.py): se um falhar ou for desativado, o outro segue normal. O módulo Wi-Fi não foi alterado.
- Testes novos: Mudfish, estado compartilhado, perfis por jogo, roteador do main.py e textos nos 3 idiomas.

## v0.8.2

- Abas: só a aba ativa fica em destaque. L1/R1 e o toque trocam de aba, e o botão A não volta mais para a aba anterior.
- Ajuda: agora só por toque, sem o botão Y.
- Wi-Fi: o resumo mostra só conexão, otimizações ativas e a qualidade do sinal (Bom, Médio ou Fraco), sem termos técnicos.
- Wi-Fi: com a Ajuda ligada, cada ajuste explica em uma frase em que situação ajuda.
- Wi-Fi: Aplicar otimizações seguras, Restaurar e cada chave mostram um aviso na tela dizendo se deu certo ou errado.

## v0.8.1

- Abas: ao trocar com L1/R1, o foco acompanha a aba nova e a aba ativa fica em destaque (a anterior não fica mais marcada).
- Wi-Fi: quando o módulo não carrega, a aba mostra o motivo e os arquivos Python presentes, para facilitar o diagnóstico.

## v0.8.0

- Novo módulo Wi-Fi, independente da rota e do Mudfish: economia de energia, corrigir ao acordar, buffers, CAKE, IPv6, trava no ponto de acesso, banda preferida, DNS, modo streaming e correção de streams travados.
- Aplicar otimizações seguras e Restaurar tudo ao padrão, em um toque.
- Os ajustes sobrevivem a suspensão, reconexão e atualização do sistema, no SteamOS e no Bazzite; ao desinstalar, tudo é desfeito.
- Configuração própria (wifi.json) e arquivos de sistema próprios (99-nolag-wifi), sem conflito com o WiFi Optimizer original.
- Se o módulo Wi-Fi falhar ao carregar, o resto do NoLag continua funcionando.
- Sem atualizador próprio, envio de relatório ou qualquer acesso à internet no módulo.
- Testes novos: módulo Wi-Fi, dispatcher embutido, independência e textos nos 3 idiomas.

## v0.7.0

- Perfil por jogo: ao ligar a chave dentro de um jogo, o NoLag salva o perfil dele (nome, sensibilidade e início automático).
- Início automático: com a chave desligada, o plugin espera um jogo com perfil automático abrir e liga sozinho.
- Ao sair do jogo, a chave desliga sozinha e tudo é removido da rede. Se o jogo tem perfil automático, liga de novo na próxima vez.
- Desligar a chave dentro de um jogo também desliga o início automático dele.
- A sensibilidade, dentro de um jogo salvo, vale só para esse jogo.
- Aba Rotas: seção Perfis de jogos, com início automático por jogo e botão Excluir.
- A chave do Painel acompanha o estado real do plugin e mostra se o jogo atual tem perfil salvo.
- Testes novos: perfis, leitura do appid, ligar e desligar sozinho e perfil por jogo.

## v0.6.0

- Relay automático: o plugin gera a própria chave WireGuard e se cadastra sozinho nos relays públicos (linhas `nolag2:` do relay-code.txt). O usuário só liga a chave.
- Novo servidor de relay gratuito: `relay-server.sh` e `enroll_server.py`. Cadastro por aparelho, limite de aparelhos e de pedidos, e remoção de quem some por 30 dias.
- O relay só encaminha UDP e ping, com limite de velocidade por aparelho, e bloqueia redes internas.
- O desvio para o servidor do jogo passa a valer só para UDP.
- Aviso quando o cadastro no relay falha; o plugin segue monitorando.
- A área de relays do app fica recolhida por padrão (só para quem tem relay próprio) e a ajuda foi reescrita.
- Os códigos `nolag1:` e relays manuais continuam funcionando.
- Testes novos para a geração de chaves (vetores da RFC 7748), códigos públicos, cadastro e servidor.

## v0.5.2

- Botão Y passa a mostrar e ocultar a ajuda também pelo evento de botões do Steam (o mesmo caminho que já funciona para L1/R1).
- Teste novo para a ligação do botão Y.

## v0.5.1

- Corrige a interface cortada na lateral: o conteúdo agora usa as margens padrão do menu.
- Gráfico ao vivo: uma linha por rota (direta e relays) com o ping dos últimos instantes e a etiqueta MELHOR na rota mais rápida. O histórico fica no plugin e não some ao fechar o menu.
- Qualidade da conexão (Ótima, Regular ou Ruim) no Painel.
- Ajuda em linguagem simples para cada opção, com recomendação. O botão Y (ou o botão Ajuda na tela) mostra e oculta; o estado fica salvo.
- Testes novos para o histórico do gráfico, a ajuda e os textos nos 3 idiomas.

## v0.5.0

- Painel no início, no estilo de cartões: estado, jogo, servidor, rota em uso, ping atual, jitter e perda ao vivo.
- Rotas ao vivo: ping, jitter e perda da rota direta e de cada relay, com a rota em uso marcada.
- Abas Painel, Rotas e Config., trocadas por toque, botão A ou L1/R1.
- Seções recolhíveis com seta; o estado fica salvo.
- Diagnóstico: processos do jogo, portas UDP, pacotes vistos e destinos mais frequentes, para entender o "Aguardando tráfego do jogo".
- Atualização do status a cada 2 segundos.
- Testes novos para textos nos 3 idiomas, painel e seções recolhíveis.

## v0.4.2

- plugin.json passa a declarar as duas flags de root (_root e root), para o Decky Loader executar o backend como root em qualquer versão.
- O erro de observação do tráfego mostra o usuário em que o backend está rodando (uid), para diagnóstico.

## v0.4.1

- Corrige o erro "Não foi possível observar o tráfego do jogo": o plugin agora roda o backend como root (plugin.json), necessário para observar os pacotes UDP do jogo.
- O motivo do erro passa a aparecer na tela junto da mensagem.
- Teste que garante a flag root no plugin.json.

## v0.4.0

- Sem relay, a rota automática não dá mais erro: o plugin só monitora ping, jitter e perda até o servidor do jogo.
- Relays pré-configurados: o plugin lê o arquivo relay-code.txt incluído na release, sem digitar nada no aparelho.
- Perfil de sensibilidade (Estável, Equilibrado, Agressivo) com Equilibrado pré-selecionado.
- Avisos em vez de erros quando faltam ferramentas ou os relays não iniciam.

## v0.3.0

- O servidor do jogo é detectado sozinho: o plugin acha o jogo aberto pelo Steam e observa para qual IP ele envia dados.
- O IP do servidor não precisa mais ser digitado.
- Relays gerenciados pelo plugin: basta colar um código (gerado por relay-setup.sh) e os arquivos são criados e guardados pelo plugin.
- Não exige mais o wg-quick; usa só ip, wg, iptables e ping.
- Quando o jogo fecha, a rota volta ao normal.
- Testes de detecção, relays e rotas.

## v0.2.0

- Rota automática com chave ativar/desativar.
- Mede ping, jitter e perda pela rota direta e por cada relay WireGuard, e usa o melhor caminho.
- Só o tráfego para o IP do servidor é desviado; o resto da rede não muda.
- Volta para a rota direta se o relay piorar, ao desativar ou ao descarregar o plugin.
- Relays lidos de arquivos .conf na pasta de configurações do plugin.
- Testes do backend.

## v0.1.2

- Ajuste interno no processo de build.

## v0.1.1

- Base do plugin NoLag para o Decky Loader.
- Painel inicial com status e aba de configuração.
- Idioma em Português, English e Español.
- Configurações salvas e validadas no backend.
- Licença, .gitignore e validação do pacote da release.
