## v0.14.1

- **Interface simplificada:** removida a seção "Conta Mudfish (opcional)" (usuário, senha, salvar e apagar conta). O login é feito só no painel web do Mudfish (porta 8282). A aba mostra apenas o controle básico, o atalho para o painel e o ping atual. Textos e chaves de i18n correspondentes removidos nos 3 idiomas; o backend não mudou.
- **Build (`build.yml`):** exige a seção da versão em `RELEASE_NOTES.md`; apaga `relay-setup.sh`/`relay-code.txt` do repositório sozinho; recusa `.py` novo na raiz fora da lista de empacotamento; limpa `out/` e zips antigos, ignora `__pycache__` e inclui os 3 READMEs no pacote.
- **Validador do pacote (`check_direct_updater.py`):** agora também recusa resquícios (`tests/`, `src/`, zips, `test_*`, `__pycache__`), erro de sintaxe nos `.py` e import de módulo local ausente.
- READMEs atualizados; novo `tests/v0141.test.cjs`.
