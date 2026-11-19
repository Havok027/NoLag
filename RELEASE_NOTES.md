## v0.15.1

- **Botão "Abrir painel do Mudfish" padronizado (aba Painel e aba Mudfish):** deixou o estilo genérico de pílula cinza do Decky e passou a usar o mesmo container dos demais cards do plugin (borda de 1 px, fundo translúcido, cantos de 10 px, mesma tipografia e brilho de foco do controle).
- **Texto não se repete mais:** o título "Abrir painel do Mudfish" fica só dentro do botão, com um ícone de link externo; abaixo dele fica apenas a descrição discreta (login, itens, região e rotas em 127.0.0.1:8282).
- Novo componente `PanelButton` em `components.tsx`, usado nas duas telas. Comportamento inalterado (abre o painel no navegador do Steam; desabilitado só com a porta 8282 fechada).
- Só frontend. Nenhum texto novo de i18n. Novo teste: `v0151.test.cjs`.
