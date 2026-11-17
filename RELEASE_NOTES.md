## v0.12.0

- Sessão do Mudfish lida direto do status da API local (`isSignedIn`): a detecção deixa de depender da página de itens. O JWT e o token do painel nunca são guardados, registrados nem repetidos, e o diagnóstico os remove do `mudfish-api.json`.
- Full VPN travado em desligado: se o painel o ativar, o serviço é encerrado e a tela explica o motivo, para proteger os créditos. O tráfego fica restrito aos itens e jogos do painel.
- Latência dos nós: o plugin acompanha a medição de RTT dos nós estáticos e virtuais do cliente (medindo, medida ou indisponível) e mostra o estado na aba Mudfish.
- Medição "Com Mudfish" corrigida: a interface `msk` do Mudfish passa a ser reconhecida como túnel. Se o túnel não responder ao alvo de ping (no modo por jogo só o IP do item passa pelo Mudfish), o gráfico deixa de exibir 100% de perda como qualidade do túnel e orienta a usar o IP do servidor do jogo.
- Diagnóstico v3 em Conf: além do status, captura em leitura as páginas de itens e o contexto de `iid`, `fullvpn`, `autoselect` e `conf_onoff` para mapear as escritas que faltam.
- Wi-Fi: botão de restauração agora se chama "Restaurar padrão" (EN: "Restore default", ES: "Restaurar predeterminado"). "Corrigir ao acordar" continua ligado ao restaurar, e o Painel volta ao estado padrão porque essa opção deixou de contar como otimização ativa.
- Textos novos nos três idiomas e testes novos.
