## v0.16.1

- **Histórico em tela cheia na escala certa:** o conteúdo era dimensionado em `vw`/`vh` e saía maior que a moldura do modal (gráficos cortados e botão de fechar fora do painel). Agora usa largura fixa em px, e os três gráficos (ping, jitter e perda) cabem inteiros.
- **Eixo do tempo se ajusta ao histórico acumulado:** com pouco histórico (por exemplo, logo após ligar), o eixo mostra só o intervalo medido (mínimo de 2 min) com marcas de 30 s, 1 min, 2 min, 5 min ou 10 min, em vez de espremer tudo num trecho minúsculo à direita. Quando há 30 min de dados, o eixo mostra os 30 min.
- Gráficos um pouco mais baixos e com textos maiores. Só frontend; nenhuma mudança no backend, no `build.yml` nem no i18n.
