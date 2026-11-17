## v0.14.0

- **Versão do núcleo sempre dinâmica:** a URL do instalador é montada a partir da versão encontrada em `mudfish.net/releases/` (nova função `installer_url`), sem versão fixa. Se a consulta falhar, a instalação nova usa o fallback 6.6.4 (nunca a 5.11.0). A aba Mudfish mostra a versão instalada e a **última versão** detectada.
- **Desinstalar Mudfish:** novo botão na aba Mudfish, com janela de confirmação. Encerra todos os processos (`mudrun`, `mudrun-headless`, `mudflow`, `mudfish`), desmonta e apaga `/opt/mudfish` e a pasta persistente, e limpa logs, instaladores e restos. Zera a conta salva no plugin, o login e "Manter ligado"; as demais preferências ficam. Sua conta e seus itens na nuvem do Mudfish não são afetados. Depois, o passo 1 (Instalar) volta e baixa a versão mais recente.
- Novo método `mudfish_uninstall` no `main.py` (roteador fino) e texto nos 3 idiomas.
- Testes novos: `tests/test_mudfish_v0140.py` (resolução da URL, página de releases, fallback, desinstalação, processos) e `tests/v0140.test.cjs`.
