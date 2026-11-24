## v0.16.3

- **Navegador do painel Mudfish (aba Conf):** novo seletor "Navegador do painel Mudfish". O padrão continua sendo o navegador do Steam; o plugin também lista os navegadores encontrados no aparelho (Google Chrome, Firefox, Edge, Brave, Chromium, Opera e Vivaldi, via Flatpak ou binário nativo).
- **Botão "Abrir painel do Mudfish" (Painel e aba Mudfish):** com um navegador externo escolhido, abre `127.0.0.1:8282` nele (em segundo plano, na sessão gráfica ativa) e fecha o menu rápido. Se o comando falhar, abre no navegador do Steam como antes.
- A escolha é salva ao trocar e, se o navegador for desinstalado, volta sozinha para o do Steam.
- Textos novos em PT, EN e ES. Nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
