## v0.16.2

- **Destaque "Melhor conexão" no topo do Painel:** faixa compacta acima do gráfico indica qual lado teve o melhor desempenho nos últimos 30 min do histórico (Com Mudfish ou Sem Mudfish), com a média de ping de referência.
- **Regra de comparação:** compara a média de ping dos 30 min de histórico (mesma fonte do histórico em tela cheia, atualizada a cada 8 s) dos dois lados (mínimo de 3 amostras válidas em cada um). Se a diferença for menor que 3 ms, desempata por jitter e depois por perda; se ainda empatar, mostra "empate técnico".
- **Sem comparação falsa:** com o Mudfish desligado, sem medição do túnel ou com poucas amostras, a faixa fica neutra ("Ligue o Mudfish para comparar" / "Reunindo amostras…").
- Textos novos em PT, EN e ES. Só frontend; nenhuma mudança no backend nem no `build.yml`.
