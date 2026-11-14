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
