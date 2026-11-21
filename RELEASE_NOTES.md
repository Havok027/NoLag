## v0.15.4

- **Painel volta a comparar Sem Mudfish e Com Mudfish:** o gráfico mostra duas linhas, **Sem Mudfish** (tracejada cinza, conexão normal, não gasta créditos) e **Com Mudfish** (verde, medida pelo túnel, só com o serviço ligado), com a média de cada uma logo abaixo.
- O anel, o Jitter e a Perda de pacotes mostram o Mudfish quando ele está medindo e a conexão normal quando não está; o rótulo do anel diz qual das duas é ("Com Mudfish" ou "Sem Mudfish").
- Ajuda do gráfico e linha de origem da medida atualizadas. Textos novos nos 3 idiomas: `chartWith` e `chartWithout`.
- Só frontend; nenhuma mudança no backend. Teste novo: `v0154.test.cjs`.
