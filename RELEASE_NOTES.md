## v0.17.4

- **Fonte da versão e do download:** a lista `mudfish.net/releases/` volta a ser a fonte principal (ela traz todos os instaladores, incluindo o Linux mais recente); a página `mudfish.net/download` fica como reserva. O instalador é baixado primeiro do arquivo da lista de releases e, se falhar, do link da página de download.
- **Lista longa:** o plugin passa a ler até 8 MB da página (antes 2 MB), para não cortar a lista antes das versões novas.
- **Motivo da falha à vista:** se a consulta de versão falhar ("Verificar atualização" ou aviso automático), a tela mostra o que aconteceu em cada página (erro de rede ou "nenhum instalador encontrado") e o motivo também vai para o `mudfish-install.log`.
- Nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`; só `mudfish_mgr.py` mudou no backend.
