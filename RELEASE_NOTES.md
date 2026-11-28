## v0.17.2

- **Atualização do Mudfish corrigida:** a última versão agora vem da página oficial de download (`mudfish.net/download`), que sempre traz a versão atual. A página `mudfish.net/releases/` é só o arquivo de versões antigas e fica como reserva.
- **Download pelo link oficial:** o instalador é baixado do link da página de download; se falhar, tenta o endereço do arquivo de versões (urllib e depois curl em cada um). O erro mostra o motivo de cada tentativa.
- **Você decide:** o plugin não atualiza mais sozinho ao iniciar; só consulta e avisa. Com versão nova, o Painel e a aba Mudfish mostram o aviso e o botão "Atualizar para X", que pede confirmação antes de baixar e instalar. Se o serviço estiver ligado, ele é religado no final.
- Textos novos nos 3 idiomas (`mfUpdateConfirm`, `mfUpdateConfirmOk`).
- Nenhum `.py` novo na raiz; nenhuma mudança no `build.yml`.
