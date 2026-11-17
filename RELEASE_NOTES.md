## v0.12.2 (inclui a v0.12.1)

### v0.12.2: núcleo do Mudfish e medição do túnel
- Versão do núcleo dinâmica: o plugin consulta a página oficial de versões do Mudfish (no máximo a cada 6 horas) e compara com a instalada. A versão fixa 5.11.0 passa a ser só o último recurso de uma instalação nova.
- Aviso de atualização no Painel (abaixo do botão do Mudfish) e na aba Mudfish, com a versão nova e a instalada.
- Atualização em um clique na aba Mudfish: baixa exatamente a versão anunciada, troca o binário e religa o serviço se ele estava ligado. Atualizar nunca volta para uma versão anterior.
- Falso 100% de perda corrigido na origem: o túnel só é medido depois que o cliente informa que o núcleo e o cliente estão prontos (`core_ready` e `client_ready`). Enquanto isso, a tela mostra "Mudfish iniciando".
- Diagnóstico v4 em Conf: captura de onde vêm os itens (`iid`), do interruptor de Full VPN e de qualquer informação de versão da interface, com limite por página para que uma página grande não esconda as outras.

### v0.12.1: interface
- Ícones nas abas do topo: velocímetro (Painel), sinal sem fio (Wi-Fi), globo (Mudfish) e engrenagem (Conf).
- Mini-cards de Com e Sem Mudfish alinhados: colunas iguais, valores à direita e sem estouro de texto.
- Botão "Abrir painel do Mudfish" removido do Painel; continua na aba Mudfish.
- Perfis de jogos sem sobreposição: o nome do jogo fica em um título próprio, com os botões abaixo dos controles.
- Textos novos nos três idiomas e testes novos.
