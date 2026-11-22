## v0.15.5

- **Jitter e Perda de pacotes agora comparam Sem Mudfish e Com Mudfish**, lado a lado, nos dois mini-cartões do Painel (antes mostravam só um valor).
- **O melhor valor é marcado:** em ping (média), jitter e perda, o menor valor ganha um ✓ verde (e a etiqueta MELHOR na legenda do gráfico), só quando os dois lados foram medidos e diferem. Com o Mudfish desligado, o lado "Com" aparece como "—".
- O anel segue o Mudfish quando ele está medindo; senão, a conexão normal. Ajuda do gráfico atualizada nos 3 idiomas.
- Só frontend; nenhuma mudança no backend nem chave nova de i18n. Teste novo: `v0155.test.cjs`.
