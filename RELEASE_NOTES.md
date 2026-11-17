## v0.12.3

- Falso 100% de perda no túnel corrigido: quando o túnel não responde mas o cliente do Mudfish quase não trafega dados (sem jogo ou item usando a rota), a tela mostra "Túnel ocioso" em vez de tratar isso como perda de pacotes. Se há tráfego e o túnel não responde, continua o aviso para usar o IP do servidor do jogo.
- Diagnóstico v5 em Conf: captura o começo das chamadas `axios` do painel (só a URL, sem corpo nem cabeçalhos, com JWT removido) e as palavras `graphql` e `mudfishVpnVersion`, para descobrir de onde vêm os itens (`iid`).
- Sem mudança no Wi-Fi, no `build.yml` nem em chamadas que alteram estado: o plugin continua só lendo a API local do Mudfish.
- Textos novos nos três idiomas e testes novos.
