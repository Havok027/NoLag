export type Lang = "pt" | "en" | "es";

export const LANGS: Lang[] = ["pt", "en", "es"];

export const LANG_NAMES: Record<Lang, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export interface Texts {
  language: string;
  createdBy: string;
  tabDash: string;
  tabHint: string;
  helpBtn: string;
  hLang: string;
  gamesTitle: string;
  gamesNone: string;
  gameDelete: string;
  tabWifi: string;
  wifiBadgeOn: string;
  wifiBadgeOff: string;
  wifiBadgeDown: string;
  wifiBadgeUnavailable: string;
  wifiConn: string;
  wifiConnected: string;
  wifiDisconnected: string;
  wifiSignal: string;
  wifiActiveCount: string;
  wifiUnavailable: string;
  wifiIndep: string;
  wifiSecMain: string;
  wifiSecAdv: string;
  wifiSecStream: string;
  wifiSecActions: string;
  wifiPowerSave: string;
  wifiPowerSaveDesc: string;
  wifiAutoFix: string;
  wifiAutoFixDesc: string;
  wifiBuffers: string;
  wifiBuffersDesc: string;
  wifiCake: string;
  wifiCakeDesc: string;
  wifiIpv6: string;
  wifiIpv6Desc: string;
  wifiLock: string;
  wifiLockDesc: string;
  wifiBand: string;
  wifiBandDesc: string;
  wifiDns: string;
  wifiDnsDesc: string;
  wifiOff: string;
  wifiStreaming: string;
  wifiStreamingDesc: string;
  wifiStreamingNow: string;
  wifiWatchdog: string;
  wifiWatchdogDesc: string;
  wifiOptimizeAll: string;
  wifiSigGood: string;
  wifiSigFair: string;
  wifiSigWeak: string;
  wifiAppliedCount: string;
  wifiToastOk: string;
  wifiToastFail: string;
  wifiRestored: string;
  hWifiPowerSave: string;
  hWifiAutoFix: string;
  hWifiBuffers: string;
  hWifiCake: string;
  hWifiIpv6: string;
  hWifiLock: string;
  hWifiBand: string;
  hWifiDns: string;
  hWifiStreaming: string;
  hWifiWatchdog: string;
  wifiCardToggle: string;
  wifiCardToggleDesc: string;
  wifiRestore: string;
  wifiWorking: string;
  wifiDone: string;
  wifiFailed: string;
  hWifiStatus: string;
  hWifiActions: string;
  mfBadgeOn: string;
  mfBadgeOff: string;
  mfBadgeBusy: string;
  mfBadgeError: string;
  mfBadgeMissing: string;
  mfUnavailable: string;
  mfStatusTitle: string;
  mfInstalledNo: string;
  mfDaemon: string;
  mfRunning: string;
  mfStopped: string;
  mfPort: string;
  mfPortOpen: string;
  mfPortClosed: string;
  mfInstall: string;
  mfUpdate: string;
  mfInstallDesc: string;
  mfInstalling: string;
  mfInstallOk: string;
  mfToggle: string;
  mfToggleDesc: string;
  mfOn: string;
  mfOff: string;
  mfOpenWeb: string;
  mfOpenWebDesc: string;
  mfRouteIface: string;
  mfRouteIp: string;
  mfRouteGw: string;
  mfPingTarget: string;
  mfPingTargetDesc: string;
  mfRefresh: string;
  mfErrNotInstalled: string;
  mfErrMount: string;
  mfErrDownload: string;
  mfErrInstall: string;
  mfErrStart: string;
  mfErrExited: string;
  mfErrBusy: string;
  mfErrArch: string;
  mfErrGeneric: string;
  onlyGameBadge: string;
  mfConnectManual: string;
  mfUpdateTitle: string;
  mfLatestRow: string;
  mfUninstall: string;
  mfUninstallDesc: string;
  mfUninstallTitle: string;
  mfUninstallConfirm: string;
  mfUninstallOk: string;
  mfCancel: string;
  mfUninstalled: string;
  mfErrUninstall: string;
  hMfUninstall: string;
  mfUpdateAvail: string;
  mfUpdateBtn: string;
  mfUpdateOk: string;
  mfErrUpdateCheck: string;
  mfRttRow: string;
  mfRttReady: string;
  mfRttPending: string;
  mfRttError: string;
  btnMfOn: string;
  btnMfOff: string;
  btnMfSetup: string;
  btnWifiOn: string;
  btnWifiOff: string;
  hDashBtns: string;
  mfFirstTitle: string;
  mfFirstSteps: string;
  hMfFirst: string;
  mfApiRow: string;
  mfApiOk: string;
  mfApiDown: string;
  mfAdvWebui: string;
  mfResetSessionDesc: string;
  tabMudfish: string;
  tabConf: string;
  mfOptSaved: string;
  mfErrBadOption: string;
  mfWarnTitle: string;
  mfWarnDownload: string;
  mfWarnSplit: string;
  mfFullVpnWarn: string;
  mfTipBtn: string;
  mfTipTitle: string;
  mfTipItem: string;
  mfTipFull: string;
  mfTipDiff: string;
  hMfWarn: string;
  confAutoGame: string;
  confAutoGameDesc: string;
  hConfAutoGame: string;
  confKeepOn: string;
  confKeepOnDesc: string;
  hConfKeepOn: string;
  confDiagTitle: string;
  hConfDiag: string;
  chartTitle: string;
  sumCollapsed: string;
  sumActive: string;
  sumGames: string;
  tmLoss: string;
  chartEmpty: string;
  chartNow: string;
  chartWith: string;
  chartWithout: string;
  histOpen: string;
  histTitle: string;
  histHint: string;
  histClose: string;
  histEmpty: string;
  histPing: string;
  chartSrcMudfish: string;
  chartSrcLocal: string;
  chartBest: string;
  hChart: string;
  mfStepInstall: string;
  mfStepLogin: string;
  mfAccConnected: string;
  mfAccWaiting: string;
  mfStepActivate: string;
  mfDone: string;
  mfPending: string;
  mfHintInstall: string;
  mfHintLogin: string;
  mfHintActivate: string;
  mfLoginReset: string;
  mfLoginResetDone: string;
  mfAdvTitle: string;
  mfAdvPanelDesc: string;
  mfLogsTitle: string;
  mfLogsLoad: string;
  mfLogService: string;
  mfLogInstall: string;
  mfLogEmpty: string;
  mfProbe: string;
  mfProbeDesc: string;
  mfProbing: string;
  mfProbeOk: string;
  mfProbeFail: string;
  mfErrPortClosed: string;
  hMfFlow: string;
  hMfAdv: string;
  mfToastOk: string;
  mfToastFail: string;
  hMfNet: string;
  gameWifi: string;
  gameMudfish: string;
  gameModulesDesc: string;
  gameCurrent: string;
  gameAddCurrent: string;
  hGameModules: string;
  connTitle: string;
  connWifi: string;
  connMudfish: string;
  connIface: string;
  connIp: string;
  connRoute: string;
  connPing: string;
  connJitter: string;
  connHint: string;
  hConn: string;
}

export const TEXTS: Record<Lang, Texts> = {
  pt: {
    language: "Idioma",
    createdBy: "Criado por Havok",
    tabDash: "Painel",
    tabHint: "L1 / R1 · trocar guia",
    helpBtn: "Ajuda",
    hLang: "Idioma da interface do plugin.",
    gamesTitle: "Perfis de jogos",
    gamesNone: "Nenhum jogo salvo ainda",
    gameDelete: "Excluir",
    tabWifi: "Wi-Fi",
    wifiBadgeOn: "Otimizado",
    wifiBadgeOff: "Padrão",
    wifiBadgeDown: "Sem Wi-Fi",
    wifiBadgeUnavailable: "Indisponível",
    wifiConn: "Conexão",
    wifiConnected: "Conectado",
    wifiDisconnected: "Desconectado",
    wifiSignal: "Sinal",
    wifiActiveCount: "Otimizações ativas",
    wifiUnavailable: "O módulo Wi-Fi não carregou",
    wifiIndep: "Independente do Mudfish: funciona com ele ligado ou desligado.",
    wifiSecMain: "Otimizações",
    wifiSecAdv: "Avançado",
    wifiSecStream: "Streaming",
    wifiSecActions: "Ações rápidas",
    wifiPowerSave: "Desligar economia de energia",
    wifiPowerSaveDesc: "Evita picos de ping causados pela economia do Wi-Fi",
    wifiAutoFix: "Corrigir ao acordar",
    wifiAutoFixDesc: "Reaplica os ajustes depois de suspender",
    wifiBuffers: "Buffers de rede maiores",
    wifiBuffersDesc: "Absorve rajadas de pacotes em jogos e streaming",
    wifiCake: "Fila CAKE",
    wifiCakeDesc: "Reduz o ping quando a rede está cheia",
    wifiIpv6: "Desligar IPv6",
    wifiIpv6Desc: "Só nesta rede; ajuda quando o IPv6 do provedor é instável",
    wifiLock: "Travar no ponto de acesso",
    wifiLockDesc: "Evita saltos entre roteadores da mesma rede",
    wifiBand: "Banda preferida",
    wifiBandDesc: "Força a banda nesta rede",
    wifiDns: "DNS",
    wifiDnsDesc: "Servidor DNS usado nesta rede",
    wifiOff: "Desligado",
    wifiStreaming: "Modo streaming",
    wifiStreamingDesc: "Liga os ajustes só enquanto um stream está ativo",
    wifiStreamingNow: "Streaming detectado",
    wifiWatchdog: "Corrigir streams travados",
    wifiWatchdogDesc: "Reconecta o Wi-Fi quando o link trava durante um stream",
    wifiOptimizeAll: "Aplicar otimizações seguras",
    wifiSigGood: "Bom",
    wifiSigFair: "Médio",
    wifiSigWeak: "Fraco",
    wifiAppliedCount: "{a} de {b} otimizações aplicadas",
    wifiToastOk: "Wi-Fi: tudo certo",
    wifiToastFail: "Wi-Fi: não foi possível aplicar",
    wifiRestored: "Wi-Fi restaurado ao padrão",
    hWifiPowerSave: "Ajuda se o ping sobe do nada ou o jogo engasga em partidas online.",
    hWifiAutoFix: "Ajuda se o Wi-Fi fica pior depois de suspender o aparelho.",
    hWifiBuffers: "Ajuda em jogos e streaming que perdem quadros quando a rede dá picos.",
    hWifiCake: "Ajuda quando alguém usa a internet em casa e seu ping sobe.",
    hWifiIpv6: "Ajuda se alguns jogos ou sites demoram para conectar ou caem.",
    hWifiLock: "Ajuda se a conexão cai ao andar pela casa com mais de um roteador.",
    hWifiBand: "Ajuda a escolher o Wi-Fi mais rápido (5 GHz) ou o de maior alcance (2.4 GHz).",
    hWifiDns: "Ajuda se os sites e jogos demoram para abrir ou o provedor está lento.",
    hWifiStreaming: "Ajuda quem joga por Moonlight ou Steam Link: os ajustes só ligam durante o stream.",
    hWifiWatchdog: "Ajuda quando a imagem do stream congela e não volta sozinha.",
    wifiCardToggle: "Otimizar Wi-Fi",
    wifiCardToggleDesc: "Liga os ajustes seguros; desligar restaura o padrão",
    wifiRestore: "Restaurar padrão",
    wifiWorking: "Aplicando…",
    wifiDone: "Pronto",
    wifiFailed: "Não foi possível aplicar",
    hWifiStatus: "Resumo do Wi-Fi agora.\nAs otimizações daqui não dependem do Mudfish e não são desfeitas por ele nem pelo jogo.",
    hWifiActions: "Aplicar liga os ajustes seguros de uma vez.\nRestaurar padrão desliga os ajustes de rede e mantém \"Corrigir ao acordar\" ligado.\nDepois, ajuste cada item nas seções abaixo, se quiser.",
    mfBadgeOn: "Ativo",
    mfBadgeOff: "Desligado",
    mfBadgeBusy: "Aguarde",
    mfBadgeError: "Erro",
    mfBadgeMissing: "Sem instalação",
    mfUnavailable: "O módulo Mudfish não carregou",
    mfStatusTitle: "Mudfish",
    mfInstalledNo: "Não instalado",
    mfDaemon: "Serviço",
    mfRunning: "Rodando",
    mfStopped: "Parado",
    mfPort: "Porta 8282",
    mfPortOpen: "Aberta",
    mfPortClosed: "Fechada",
    mfInstall: "Instalar Mudfish",
    mfUpdate: "Atualizar Mudfish",
    mfInstallDesc: "Baixa o instalador oficial e guarda em pasta persistente",
    mfInstalling: "Instalando, pode levar um minuto…",
    mfInstallOk: "Mudfish instalado",
    mfToggle: "Mudfish ligado",
    mfToggleDesc: "Liga o serviço do Mudfish. O Mudfish cobra por tráfego.",
    mfOn: "Mudfish ligado",
    mfOff: "Mudfish desligado",
    mfOpenWeb: "Abrir painel do Mudfish",
    mfOpenWebDesc: "Aqui você faz o login, os itens, a região e as rotas (127.0.0.1:8282)",
    mfRouteIface: "Interface",
    mfRouteIp: "IP local",
    mfRouteGw: "Gateway",
    mfPingTarget: "Alvo do ping",
    mfPingTargetDesc: "IP ou site do servidor do jogo. Padrão: 1.1.1.1",
    mfRefresh: "Atualizar",
    mfErrNotInstalled: "Instale o Mudfish primeiro",
    mfErrMount: "Não foi possível montar a pasta persistente",
    mfErrDownload: "Falha ao baixar o instalador",
    mfErrInstall: "A instalação falhou",
    mfErrStart: "O Mudfish não abriu a porta 8282",
    mfErrExited: "O Mudfish fechou ao iniciar",
    mfErrBusy: "Outra ação em andamento",
    mfErrArch: "Só funciona em aparelhos x86_64",
    mfErrGeneric: "Não foi possível concluir",
    onlyGameBadge: "Modo Apenas Jogo (Créditos Protegidos)",
    mfRttRow: "Latência dos nós",
    mfRttReady: "Medida",
    mfRttPending: "Medindo…",
    mfRttError: "Indisponível",
    mfConnectManual: "Configure e equipe o item do jogo previamente no painel web do Mudfish. Caso o túnel não conecte automaticamente ao iniciar o jogo, abra o painel e clique em Conectar.",
    mfUpdateTitle: "Atualização do Mudfish",
    hMfUninstall: "Encerra todos os processos do Mudfish, desmonta e apaga /opt/mudfish e a pasta persistente e limpa logs e restos.\nPede confirmação antes. Depois, o passo 1 volta a aparecer para reinstalar a versão mais recente.",
    mfErrUninstall: "Não foi possível desinstalar",
    mfUninstalled: "Mudfish desinstalado",
    mfCancel: "Cancelar",
    mfUninstallOk: "Desinstalar",
    mfUninstallConfirm: "Isto encerra o Mudfish e apaga os arquivos locais dele (pasta /opt/mudfish, instalação, logs e a conta salva no plugin). Sua conta e seus itens na nuvem do Mudfish não são afetados. Você poderá instalar de novo quando quiser.",
    mfUninstallTitle: "Desinstalar o Mudfish?",
    mfUninstallDesc: "Apaga o Mudfish deste aparelho. Para uma instalação limpa",
    mfUninstall: "Desinstalar Mudfish",
    mfLatestRow: "Última versão",
    mfUpdateAvail: "Nova versão do núcleo disponível: {v} (instalada: {c})",
    mfUpdateBtn: "Atualizar para {v}",
    mfUpdateOk: "Mudfish atualizado",
    mfErrUpdateCheck: "Não foi possível consultar a versão mais recente",
    btnMfOn: "Mudfish ATIVO · toque para desligar",
    btnMfOff: "Ligar Mudfish",
    btnMfSetup: "Mudfish: conclua a instalação na aba Mudfish",
    btnWifiOn: "Wi-Fi otimizado · toque para restaurar",
    btnWifiOff: "Otimizar Wi-Fi",
    hDashBtns: "O botão do Mudfish liga e desliga só o serviço dele e gasta créditos enquanto estiver ativo.\nAbrir painel do Mudfish abre 127.0.0.1:8282, onde ficam login, itens, nós e rotas; fica ativo quando a porta responde.\nO botão de Wi-Fi aplica as otimizações e elas continuam mesmo ao fechar o jogo ou desligar o Mudfish: só você as restaura.",
    mfFirstTitle: "Configure no painel do Mudfish",
    mfFirstSteps: "1) Toque em Abrir painel do Mudfish e entre na conta.\n2) No painel, adicione o jogo e escolha a região (Auto / South America), a seleção de nó e o modo (Basic ou Multi-Path).\n3) Volte ao jogo. Isso é feito uma vez e fica salvo na nuvem da sua conta.\nO NoLag não altera essas opções.",
    hMfFirst: "Toda a configuração de rota, itens e nós é feita no painel web do Mudfish.\nDepois do cadastro, o plugin só liga e desliga o serviço.\nSe trocar de conta ou de região, repita o passo no painel.",
    mfApiRow: "API do painel",
    mfApiOk: "Responde",
    mfApiDown: "Sem resposta",
    mfAdvWebui: "Painel (WebUI)",
    mfResetSessionDesc: "Sai do painel e volta ao passo de login",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfOptSaved: "Preferência salva",
    mfErrBadOption: "Opção inválida",
    mfWarnTitle: "Cuidado com os créditos",
    mfWarnDownload: "Nunca baixe jogos, atualizações ou arquivos com o Mudfish ligado: o tráfego é cobrado.",
    mfWarnSplit: "Prefira o item do jogo no painel do Mudfish. Full VPN é permitido (jogos sem item para a região), mas roteia todo o tráfego do sistema.",
    mfFullVpnWarn: "Modo Full VPN ativo — todo o tráfego está sendo roteado. Mantenha downloads em segundo plano desativados para preservar créditos.",
    mfTipBtn: "Dica",
    mfTipTitle: "Item do jogo ou Full VPN?",
    mfTipItem: "Item do jogo: use quando o Mudfish tem servidor dedicado para a região que você quer (Brasil, EUA, Europa). Adicione e equipe o item do jogo no painel web.",
    mfTipFull: "Full VPN: use quando o jogo não tem item para a região desejada (ex.: servidor no Brasil, mas sem rota brasileira no Mudfish). Ative o Full VPN no painel web apontando para o nó mais próximo do servidor (ex.: São Paulo).",
    mfTipDiff: "Diferença: o item roteia só o tráfego daquele jogo (gasta menos dados). O Full VPN roteia toda a conexão do sistema: vale para jogos sem suporte direto, desde que não haja downloads em segundo plano.",
    hMfWarn: "O Mudfish cobra por tráfego.\nLigado só enquanto joga e com roteamento por jogo, gasta pouco.\nDownloads e VPN total gastam seus créditos rápido.",
    confAutoGame: "Ativar ao abrir jogo",
    confAutoGameDesc: "Liga o Mudfish sozinho nos jogos marcados. Desligado por padrão",
    hConfAutoGame: "Desligado, o Mudfish nunca liga sozinho.\nLigado, abre só nos jogos marcados com a chave Mudfish e é encerrado ao fechar qualquer jogo.\nGasta créditos enquanto o jogo estiver aberto.",
    confKeepOn: "Manter ligado ao reiniciar",
    confKeepOnDesc: "Religa o Mudfish quando o Decky reinicia. Desligado por padrão",
    hConfKeepOn: "Cuidado: ligado, o Mudfish volta a gastar créditos mesmo sem jogo aberto.\nPrefira deixar desligado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Mostra o estado da instalação e captura o que o painel do Mudfish expõe, para mapear a API local.\nNão gasta créditos.",
    chartTitle: "Ping atual",
    sumCollapsed: "Recolhido",
    sumActive: "ativos",
    sumGames: "jogos",
    tmLoss: "Perda de pacotes",
    chartEmpty: "Aguardando medições…",
    chartNow: "agora",
    chartWith: "Com Mudfish",
    chartWithout: "Sem Mudfish",
    histOpen: "Tela cheia",
    histTitle: "Histórico · últimos 30 min",
    histHint: "Toque ou arraste no gráfico para ver os valores.",
    histClose: "Fechar",
    histEmpty: "Ainda sem medidas salvas.\nO histórico é gravado a cada 10 s enquanto o plugin estiver ativo.",
    histPing: "Ping",
    chartSrcMudfish: "Medido pelo túnel do Mudfish",
    chartSrcLocal: "Medido pela conexão normal (não gasta créditos)",
    chartBest: "MELHOR",
    hChart: "Compara o ping a cada 8 s: Sem Mudfish (linha tracejada, conexão normal, não gasta créditos) e Com Mudfish (linha verde, medida pelo túnel, só com o serviço ligado).\nO anel mostra o Mudfish quando ele está medindo; senão, a conexão normal.\nJitter e perda aparecem dos dois lados, e o ✓ marca o melhor (menor) valor.",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Entrar no painel",
    mfAccConnected: "Conta conectada",
    mfAccWaiting: "Aguardando login na WebUI",
    mfStepActivate: "3. Serviço ligado",
    mfDone: "Feito",
    mfPending: "Pendente",
    mfHintInstall: "Passo 1: toque em Instalar Mudfish.\nSó precisa fazer uma vez.",
    mfHintLogin: "Passo 2: ligue o serviço, abra o painel do Mudfish e entre na sua conta.\nO plugin detecta o login sozinho.",
    mfHintActivate: "Tudo pronto.\nConfigure jogos e rotas no painel do Mudfish; o plugin só liga e desliga o serviço e mostra o ping.",
    mfLoginReset: "Refazer login",
    mfLoginResetDone: "O login será pedido de novo",
    mfAdvTitle: "Opções avançadas",
    mfAdvPanelDesc: "Escolha o nó e o FastConnect no painel do Mudfish",
    mfLogsTitle: "Logs",
    mfLogsLoad: "Ver logs",
    mfLogService: "Serviço",
    mfLogInstall: "Instalação",
    mfLogEmpty: "Sem registros",
    mfProbe: "Capturar API do painel",
    mfProbeDesc: "Captura só leitura do painel, para mapear a API. O arquivo pode ter dados da conta: revise antes de enviar",
    mfProbing: "Capturando…",
    mfProbeOk: "API capturada (respostas / caminhos)",
    mfProbeFail: "Não foi possível capturar",
    mfErrPortClosed: "O painel do Mudfish não está aberto: ligue o serviço",
    hMfFlow: "O fluxo é simples: instalar, ligar o serviço e abrir o painel do Mudfish para entrar e configurar rotas e jogos.\nCada passo aparece sozinho.",
    hMfAdv: "Aqui ficam o alvo do ping, a rota atual, reinstalar ou atualizar, refazer o login e os logs.\nRotas e nós são escolhidos no painel do Mudfish.",
    mfToastOk: "Mudfish: tudo certo",
    mfToastFail: "Mudfish: não deu certo",
    hMfNet: "Compare o ping com o Mudfish desligado e ligado para ver se a rota ajuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Wi-Fi: otimiza ao abrir e segue otimizado ao sair. Mudfish: só liga com a opção da Conf e sempre encerra ao sair",
    gameCurrent: "Jogo aberto",
    gameAddCurrent: "Salvar jogo aberto",
    hGameModules: "Cada jogo salvo pode otimizar o Wi-Fi e ligar o Mudfish ao abrir.\nO Wi-Fi nunca é desfeito ao fechar o jogo; o Mudfish sempre é encerrado.",
    connTitle: "Conexão",
    connWifi: "Wi-Fi",
    connMudfish: "Mudfish",
    connIface: "Interface ativa",
    connIp: "IP local",
    connRoute: "Rota (gateway)",
    connPing: "Ping",
    connJitter: "Jitter",
    connHint: "Mudfish: ligado ou desligado · Wi-Fi: conexão",
    hConn: "Fotografia da conexão agora: por qual interface sai o tráfego e como está o ping até o alvo.",
  },
  en: {
    language: "Language",
    createdBy: "Created by Havok",
    tabDash: "Dashboard",
    tabHint: "L1 / R1 · switch tab",
    helpBtn: "Help",
    hLang: "Plugin interface language.",
    gamesTitle: "Game profiles",
    gamesNone: "No saved game yet",
    gameDelete: "Delete",
    tabWifi: "Wi-Fi",
    wifiBadgeOn: "Optimized",
    wifiBadgeOff: "Default",
    wifiBadgeDown: "No Wi-Fi",
    wifiBadgeUnavailable: "Unavailable",
    wifiConn: "Connection",
    wifiConnected: "Connected",
    wifiDisconnected: "Disconnected",
    wifiSignal: "Signal",
    wifiActiveCount: "Active optimizations",
    wifiUnavailable: "The Wi-Fi module did not load",
    wifiIndep: "Independent from Mudfish: works with it on or off.",
    wifiSecMain: "Optimizations",
    wifiSecAdv: "Advanced",
    wifiSecStream: "Streaming",
    wifiSecActions: "Quick actions",
    wifiPowerSave: "Turn off power save",
    wifiPowerSaveDesc: "Avoids ping spikes caused by Wi-Fi power saving",
    wifiAutoFix: "Fix on wake",
    wifiAutoFixDesc: "Reapplies the settings after sleep",
    wifiBuffers: "Larger network buffers",
    wifiBuffersDesc: "Absorbs packet bursts in games and streaming",
    wifiCake: "CAKE queue",
    wifiCakeDesc: "Lowers ping when the network is busy",
    wifiIpv6: "Turn off IPv6",
    wifiIpv6Desc: "This network only; helps when the ISP IPv6 is unstable",
    wifiLock: "Lock to access point",
    wifiLockDesc: "Stops hopping between routers of the same network",
    wifiBand: "Preferred band",
    wifiBandDesc: "Forces the band on this network",
    wifiDns: "DNS",
    wifiDnsDesc: "DNS server used on this network",
    wifiOff: "Off",
    wifiStreaming: "Streaming mode",
    wifiStreamingDesc: "Turns the fixes on only while a stream is running",
    wifiStreamingNow: "Streaming detected",
    wifiWatchdog: "Fix stalled streams",
    wifiWatchdogDesc: "Reconnects Wi-Fi when the link stalls during a stream",
    wifiOptimizeAll: "Apply safe optimizations",
    wifiSigGood: "Good",
    wifiSigFair: "Fair",
    wifiSigWeak: "Weak",
    wifiAppliedCount: "{a} of {b} optimizations applied",
    wifiToastOk: "Wi-Fi: all good",
    wifiToastFail: "Wi-Fi: could not apply",
    wifiRestored: "Wi-Fi restored to default",
    hWifiPowerSave: "Helps if ping jumps for no reason or online games stutter.",
    hWifiAutoFix: "Helps if Wi-Fi gets worse after the device sleeps.",
    hWifiBuffers: "Helps games and streaming that drop frames when the network spikes.",
    hWifiCake: "Helps when someone else uses the home internet and your ping rises.",
    hWifiIpv6: "Helps if some games or sites are slow to connect or drop.",
    hWifiLock: "Helps if the connection drops while moving around with more than one router.",
    hWifiBand: "Helps pick the faster Wi-Fi (5 GHz) or the longer-range one (2.4 GHz).",
    hWifiDns: "Helps if sites and games are slow to open or your provider is slow.",
    hWifiStreaming: "Helps Moonlight or Steam Link players: the fixes only turn on during the stream.",
    hWifiWatchdog: "Helps when the stream image freezes and does not recover.",
    wifiCardToggle: "Optimize Wi-Fi",
    wifiCardToggleDesc: "Turns on the safe tweaks; turning off restores the default",
    wifiRestore: "Restore default",
    wifiWorking: "Applying…",
    wifiDone: "Done",
    wifiFailed: "Could not apply",
    hWifiStatus: "Wi-Fi summary right now.\nThe optimizations here do not depend on Mudfish and are not undone by it or by the game.",
    hWifiActions: "Apply turns on the safe settings at once.\nRestore default turns off the network tweaks and keeps \"Fix on wake\" on.\nThen fine-tune each item in the sections below if you wish.",
    mfBadgeOn: "Active",
    mfBadgeOff: "Off",
    mfBadgeBusy: "Wait",
    mfBadgeError: "Error",
    mfBadgeMissing: "Not installed",
    mfUnavailable: "The Mudfish module did not load",
    mfStatusTitle: "Mudfish",
    mfInstalledNo: "Not installed",
    mfDaemon: "Service",
    mfRunning: "Running",
    mfStopped: "Stopped",
    mfPort: "Port 8282",
    mfPortOpen: "Open",
    mfPortClosed: "Closed",
    mfInstall: "Install Mudfish",
    mfUpdate: "Update Mudfish",
    mfInstallDesc: "Downloads the official installer and keeps it in a persistent folder",
    mfInstalling: "Installing, this can take a minute…",
    mfInstallOk: "Mudfish installed",
    mfToggle: "Mudfish on",
    mfToggleDesc: "Turns the Mudfish service on. Mudfish charges by traffic.",
    mfOn: "Mudfish is on",
    mfOff: "Mudfish is off",
    mfOpenWeb: "Open Mudfish panel",
    mfOpenWebDesc: "Where you log in and set items, region and routes (127.0.0.1:8282)",
    mfRouteIface: "Interface",
    mfRouteIp: "Local IP",
    mfRouteGw: "Gateway",
    mfPingTarget: "Ping target",
    mfPingTargetDesc: "IP or host of the game server. Default: 1.1.1.1",
    mfRefresh: "Refresh",
    mfErrNotInstalled: "Install Mudfish first",
    mfErrMount: "Could not mount the persistent folder",
    mfErrDownload: "Could not download the installer",
    mfErrInstall: "The installation failed",
    mfErrStart: "Mudfish did not open port 8282",
    mfErrExited: "Mudfish closed on start",
    mfErrBusy: "Another action is running",
    mfErrArch: "Only works on x86_64 devices",
    mfErrGeneric: "Could not complete",
    onlyGameBadge: "Game-only mode (credits protected)",
    mfRttRow: "Node latency",
    mfRttReady: "Measured",
    mfRttPending: "Measuring…",
    mfRttError: "Unavailable",
    mfConnectManual: "Set up and equip the game item beforehand in the Mudfish web panel. If the tunnel does not connect automatically when the game starts, open the panel and click Connect.",
    mfUpdateTitle: "Mudfish update",
    hMfUninstall: "Stops every Mudfish process, unmounts and deletes /opt/mudfish and the persistent folder, and clears logs and leftovers.\nAsks for confirmation first. Afterwards step 1 shows up again to reinstall the latest version.",
    mfErrUninstall: "Could not uninstall",
    mfUninstalled: "Mudfish uninstalled",
    mfCancel: "Cancel",
    mfUninstallOk: "Uninstall",
    mfUninstallConfirm: "This stops Mudfish and deletes its local files (the /opt/mudfish folder, the install, logs and the account saved in the plugin). Your account and items in the Mudfish cloud are not affected. You can install it again anytime.",
    mfUninstallTitle: "Uninstall Mudfish?",
    mfUninstallDesc: "Removes Mudfish from this device. For a clean install",
    mfUninstall: "Uninstall Mudfish",
    mfLatestRow: "Latest version",
    mfUpdateAvail: "New core version available: {v} (installed: {c})",
    mfUpdateBtn: "Update to {v}",
    mfUpdateOk: "Mudfish updated",
    mfErrUpdateCheck: "Could not check the latest version",
    btnMfOn: "Mudfish ON · tap to turn off",
    btnMfOff: "Turn on Mudfish",
    btnMfSetup: "Mudfish: finish setup in the Mudfish tab",
    btnWifiOn: "Wi-Fi tuned · tap to restore",
    btnWifiOff: "Optimize Wi-Fi",
    hDashBtns: "The Mudfish button turns only its service on and off and uses credits while active.\nOpen Mudfish panel opens 127.0.0.1:8282, where login, items, nodes and routes live; it is enabled when the port answers.\nThe Wi-Fi button applies the optimizations and they stay even when the game closes or Mudfish turns off: only you restore them.",
    mfFirstTitle: "Set up in the Mudfish panel",
    mfFirstSteps: "1) Tap Open Mudfish panel and log in.\n2) In the panel, add the game and pick the region (Auto / South America), node selection and mode (Basic or Multi-Path).\n3) Go back to the game. This is done once and saved in your account's cloud.\nNoLag does not change these options.",
    hMfFirst: "All route, item and node settings are done in the Mudfish web panel.\nAfter setup, the plugin only turns the service on and off.\nIf you change account or region, repeat the step in the panel.",
    mfApiRow: "Panel API",
    mfApiOk: "Responding",
    mfApiDown: "No response",
    mfAdvWebui: "Panel (WebUI)",
    mfResetSessionDesc: "Signs out of the panel and returns to the login step",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfOptSaved: "Preference saved",
    mfErrBadOption: "Invalid option",
    mfWarnTitle: "Mind your credits",
    mfWarnDownload: "Never download games, updates or files while Mudfish is on: traffic is billed.",
    mfWarnSplit: "Prefer the game item in the Mudfish panel. Full VPN is allowed (games with no item for the region), but it routes all system traffic.",
    mfFullVpnWarn: "Full VPN mode on — all traffic is being routed. Keep background downloads off to save credits.",
    mfTipBtn: "Tip",
    mfTipTitle: "Game item or Full VPN?",
    mfTipItem: "Game item: use it when Mudfish has a dedicated server for the region you want (Brazil, US, Europe). Add and equip the game item in the web panel.",
    mfTipFull: "Full VPN: use it when the game has no item for the region you want (e.g. a Brazil server but no Brazilian route in Mudfish). Turn on Full VPN in the web panel pointing at the node closest to the server (e.g. São Paulo).",
    mfTipDiff: "Difference: the item routes only that game's traffic (uses less data). Full VPN routes the whole system connection: good for games without direct support, as long as nothing downloads in the background.",
    hMfWarn: "Mudfish bills by traffic.\nOn only while you play and with per-game routing, it costs little.\nDownloads and full VPN burn credits fast.",
    confAutoGame: "Turn on when a game opens",
    confAutoGameDesc: "Turns Mudfish on by itself in the marked games. Off by default",
    hConfAutoGame: "Off, Mudfish never turns on by itself.\nOn, it opens only in games marked with the Mudfish switch and is stopped when any game closes.\nIt uses credits while the game is open.",
    confKeepOn: "Keep on after restart",
    confKeepOnDesc: "Turns Mudfish back on when Decky restarts. Off by default",
    hConfKeepOn: "Careful: when on, Mudfish uses credits again even with no game open.\nPrefer leaving it off.",
    confDiagTitle: "Diagnostics",
    hConfDiag: "Shows the install state and captures what the Mudfish panel exposes, to map the local API.\nIt does not use credits.",
    chartTitle: "Current ping",
    sumCollapsed: "Collapsed",
    sumActive: "active",
    sumGames: "games",
    tmLoss: "Packet loss",
    chartEmpty: "Waiting for measurements…",
    chartNow: "now",
    chartWith: "With Mudfish",
    chartWithout: "Without Mudfish",
    histOpen: "Full screen",
    histTitle: "History · last 30 min",
    histHint: "Touch or drag on a chart to see the values.",
    histClose: "Close",
    histEmpty: "No saved measurements yet.\nHistory is recorded every 10 s while the plugin is active.",
    histPing: "Ping",
    chartSrcMudfish: "Measured through the Mudfish tunnel",
    chartSrcLocal: "Measured over the normal connection (uses no credits)",
    chartBest: "BEST",
    hChart: "Compares the ping every 8 s: Without Mudfish (dashed line, normal connection, uses no credits) and With Mudfish (green line, measured through the tunnel, only while the service is on).\nThe ring shows Mudfish when it is measuring; otherwise the normal connection.\nJitter and loss appear for both sides, and the ✓ marks the better (lower) value.",
    mfStepInstall: "1. Install",
    mfStepLogin: "2. Log in on the panel",
    mfAccConnected: "Account connected",
    mfAccWaiting: "Waiting for WebUI sign-in",
    mfStepActivate: "3. Service on",
    mfDone: "Done",
    mfPending: "Pending",
    mfHintInstall: "Step 1: tap Install Mudfish.\nYou only need to do this once.",
    mfHintLogin: "Step 2: turn the service on, open the Mudfish panel and log in.\nThe plugin detects the login by itself.",
    mfHintActivate: "All set.\nSet up games and routes in the Mudfish panel; the plugin only turns the service on and off and shows the ping.",
    mfLoginReset: "Redo sign-in",
    mfLoginResetDone: "Sign-in will be asked again",
    mfAdvTitle: "Advanced options",
    mfAdvPanelDesc: "Pick the node and FastConnect on the Mudfish panel",
    mfLogsTitle: "Logs",
    mfLogsLoad: "View logs",
    mfLogService: "Service",
    mfLogInstall: "Installation",
    mfLogEmpty: "No entries",
    mfProbe: "Capture panel API",
    mfProbeDesc: "Read-only capture of the panel, to map the API. The file may hold account data: review it before sending",
    mfProbing: "Capturing…",
    mfProbeOk: "API captured (responses / paths)",
    mfProbeFail: "Could not capture",
    mfErrPortClosed: "The Mudfish panel is not open: turn the service on",
    hMfFlow: "The flow is simple: install, turn the service on and open the Mudfish panel to log in and set up routes and games.\nEach step shows up by itself.",
    hMfAdv: "Here you find the ping target, the current route, reinstall or update, redo login and logs.\nRoutes and nodes are chosen in the Mudfish panel.",
    mfToastOk: "Mudfish: all good",
    mfToastFail: "Mudfish: it did not work",
    hMfNet: "Compare the ping with Mudfish off and on to see if the route helps.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Wi-Fi: tunes on open and stays tuned after closing. Mudfish: turns on only with the Conf option and always stops on exit",
    gameCurrent: "Open game",
    gameAddCurrent: "Save open game",
    hGameModules: "Each saved game can tune Wi-Fi and turn on Mudfish when it opens.\nWi-Fi is never undone when the game closes; Mudfish is always stopped.",
    connTitle: "Connection",
    connWifi: "Wi-Fi",
    connMudfish: "Mudfish",
    connIface: "Active interface",
    connIp: "Local IP",
    connRoute: "Route (gateway)",
    connPing: "Ping",
    connJitter: "Jitter",
    connHint: "Mudfish: on or off · Wi-Fi: link",
    hConn: "A snapshot of the connection now: which interface the traffic uses and the ping to the target.",
  },
  es: {
    language: "Idioma",
    createdBy: "Creado por Havok",
    tabDash: "Panel",
    tabHint: "L1 / R1 · cambiar pestaña",
    helpBtn: "Ayuda",
    hLang: "Idioma de la interfaz del plugin.",
    gamesTitle: "Perfiles de juegos",
    gamesNone: "Aún no hay juegos guardados",
    gameDelete: "Eliminar",
    tabWifi: "Wi-Fi",
    wifiBadgeOn: "Optimizado",
    wifiBadgeOff: "Predeterminado",
    wifiBadgeDown: "Sin Wi-Fi",
    wifiBadgeUnavailable: "No disponible",
    wifiConn: "Conexión",
    wifiConnected: "Conectado",
    wifiDisconnected: "Desconectado",
    wifiSignal: "Señal",
    wifiActiveCount: "Optimizaciones activas",
    wifiUnavailable: "El módulo Wi-Fi no cargó",
    wifiIndep: "Independiente de Mudfish: funciona con él encendido o apagado.",
    wifiSecMain: "Optimizaciones",
    wifiSecAdv: "Avanzado",
    wifiSecStream: "Streaming",
    wifiSecActions: "Acciones rápidas",
    wifiPowerSave: "Desactivar ahorro de energía",
    wifiPowerSaveDesc: "Evita picos de ping por el ahorro del Wi-Fi",
    wifiAutoFix: "Corregir al despertar",
    wifiAutoFixDesc: "Reaplica los ajustes tras suspender",
    wifiBuffers: "Búferes de red mayores",
    wifiBuffersDesc: "Absorbe ráfagas de paquetes en juegos y streaming",
    wifiCake: "Cola CAKE",
    wifiCakeDesc: "Reduce el ping cuando la red está saturada",
    wifiIpv6: "Desactivar IPv6",
    wifiIpv6Desc: "Solo en esta red; ayuda si el IPv6 del proveedor es inestable",
    wifiLock: "Fijar al punto de acceso",
    wifiLockDesc: "Evita saltos entre routers de la misma red",
    wifiBand: "Banda preferida",
    wifiBandDesc: "Fuerza la banda en esta red",
    wifiDns: "DNS",
    wifiDnsDesc: "Servidor DNS usado en esta red",
    wifiOff: "Desactivado",
    wifiStreaming: "Modo streaming",
    wifiStreamingDesc: "Activa los ajustes solo mientras hay un stream",
    wifiStreamingNow: "Streaming detectado",
    wifiWatchdog: "Corregir streams detenidos",
    wifiWatchdogDesc: "Reconecta el Wi-Fi si el enlace se detiene durante un stream",
    wifiOptimizeAll: "Aplicar optimizaciones seguras",
    wifiSigGood: "Buena",
    wifiSigFair: "Media",
    wifiSigWeak: "Débil",
    wifiAppliedCount: "{a} de {b} optimizaciones aplicadas",
    wifiToastOk: "Wi-Fi: todo bien",
    wifiToastFail: "Wi-Fi: no se pudo aplicar",
    wifiRestored: "Wi-Fi restaurado a lo predeterminado",
    hWifiPowerSave: "Ayuda si el ping sube de la nada o el juego se traba en línea.",
    hWifiAutoFix: "Ayuda si el Wi-Fi empeora después de suspender el equipo.",
    hWifiBuffers: "Ayuda en juegos y streaming que pierden cuadros cuando la red tiene picos.",
    hWifiCake: "Ayuda cuando alguien usa el internet en casa y tu ping sube.",
    hWifiIpv6: "Ayuda si algunos juegos o sitios tardan en conectar o se caen.",
    hWifiLock: "Ayuda si la conexión se cae al moverte con más de un router.",
    hWifiBand: "Ayuda a elegir el Wi-Fi más rápido (5 GHz) o el de mayor alcance (2.4 GHz).",
    hWifiDns: "Ayuda si los sitios y juegos tardan en abrir o tu proveedor está lento.",
    hWifiStreaming: "Ayuda a quien juega con Moonlight o Steam Link: los ajustes solo se activan durante el stream.",
    hWifiWatchdog: "Ayuda cuando la imagen del stream se congela y no se recupera.",
    wifiCardToggle: "Optimizar Wi-Fi",
    wifiCardToggleDesc: "Activa los ajustes seguros; desactivar restaura lo predeterminado",
    wifiRestore: "Restaurar predeterminado",
    wifiWorking: "Aplicando…",
    wifiDone: "Listo",
    wifiFailed: "No se pudo aplicar",
    hWifiStatus: "Resumen del Wi-Fi ahora.\nLas optimizaciones de aquí no dependen de Mudfish y no las deshace él ni el juego.",
    hWifiActions: "Aplicar activa los ajustes seguros de una vez.\nRestaurar predeterminado desactiva los ajustes de red y mantiene \"Corregir al despertar\" activado.\nLuego ajusta cada elemento en las secciones de abajo si quieres.",
    mfBadgeOn: "Activo",
    mfBadgeOff: "Apagado",
    mfBadgeBusy: "Espera",
    mfBadgeError: "Error",
    mfBadgeMissing: "Sin instalar",
    mfUnavailable: "El módulo Mudfish no cargó",
    mfStatusTitle: "Mudfish",
    mfInstalledNo: "No instalado",
    mfDaemon: "Servicio",
    mfRunning: "En marcha",
    mfStopped: "Detenido",
    mfPort: "Puerto 8282",
    mfPortOpen: "Abierto",
    mfPortClosed: "Cerrado",
    mfInstall: "Instalar Mudfish",
    mfUpdate: "Actualizar Mudfish",
    mfInstallDesc: "Descarga el instalador oficial y lo guarda en una carpeta persistente",
    mfInstalling: "Instalando, puede tardar un minuto…",
    mfInstallOk: "Mudfish instalado",
    mfToggle: "Mudfish activado",
    mfToggleDesc: "Enciende el servicio de Mudfish. Mudfish cobra por tráfico.",
    mfOn: "Mudfish activado",
    mfOff: "Mudfish apagado",
    mfOpenWeb: "Abrir panel de Mudfish",
    mfOpenWebDesc: "Aquí haces el login, los ítems, la región y las rutas (127.0.0.1:8282)",
    mfRouteIface: "Interfaz",
    mfRouteIp: "IP local",
    mfRouteGw: "Puerta de enlace",
    mfPingTarget: "Destino del ping",
    mfPingTargetDesc: "IP o sitio del servidor del juego. Predeterminado: 1.1.1.1",
    mfRefresh: "Actualizar",
    mfErrNotInstalled: "Instala Mudfish primero",
    mfErrMount: "No se pudo montar la carpeta persistente",
    mfErrDownload: "Error al descargar el instalador",
    mfErrInstall: "La instalación falló",
    mfErrStart: "Mudfish no abrió el puerto 8282",
    mfErrExited: "Mudfish se cerró al iniciar",
    mfErrBusy: "Otra acción en curso",
    mfErrArch: "Solo funciona en equipos x86_64",
    mfErrGeneric: "No se pudo completar",
    onlyGameBadge: "Modo solo juego (créditos protegidos)",
    mfRttRow: "Latencia de nodos",
    mfRttReady: "Medida",
    mfRttPending: "Midiendo…",
    mfRttError: "No disponible",
    mfConnectManual: "Configura y equipa antes el ítem del juego en el panel web de Mudfish. Si el túnel no se conecta solo al iniciar el juego, abre el panel y pulsa Conectar.",
    mfUpdateTitle: "Actualización de Mudfish",
    hMfUninstall: "Cierra todos los procesos de Mudfish, desmonta y borra /opt/mudfish y la carpeta persistente, y limpia logs y restos.\nPide confirmación antes. Después vuelve a aparecer el paso 1 para reinstalar la última versión.",
    mfErrUninstall: "No se pudo desinstalar",
    mfUninstalled: "Mudfish desinstalado",
    mfCancel: "Cancelar",
    mfUninstallOk: "Desinstalar",
    mfUninstallConfirm: "Esto cierra Mudfish y borra sus archivos locales (la carpeta /opt/mudfish, la instalación, los logs y la cuenta guardada en el plugin). Tu cuenta y tus ítems en la nube de Mudfish no se ven afectados. Podrás instalarlo de nuevo cuando quieras.",
    mfUninstallTitle: "¿Desinstalar Mudfish?",
    mfUninstallDesc: "Borra Mudfish de este dispositivo. Para una instalación limpia",
    mfUninstall: "Desinstalar Mudfish",
    mfLatestRow: "Última versión",
    mfUpdateAvail: "Nueva versión del núcleo disponible: {v} (instalada: {c})",
    mfUpdateBtn: "Actualizar a {v}",
    mfUpdateOk: "Mudfish actualizado",
    mfErrUpdateCheck: "No se pudo consultar la versión más reciente",
    btnMfOn: "Mudfish ACTIVO · toca para apagar",
    btnMfOff: "Activar Mudfish",
    btnMfSetup: "Mudfish: termina la instalación en la pestaña Mudfish",
    btnWifiOn: "Wi-Fi optimizado · toca para restaurar",
    btnWifiOff: "Optimizar Wi-Fi",
    hDashBtns: "El botón de Mudfish enciende y apaga solo su servicio y gasta créditos mientras está activo.\nAbrir panel de Mudfish abre 127.0.0.1:8282, donde están el login, los ítems, los nodos y las rutas; se habilita cuando el puerto responde.\nEl botón de Wi-Fi aplica las optimizaciones y siguen aunque cierres el juego o apagues Mudfish: solo tú las restauras.",
    mfFirstTitle: "Configura en el panel de Mudfish",
    mfFirstSteps: "1) Toca Abrir panel de Mudfish y entra en la cuenta.\n2) En el panel, añade el juego y elige la región (Auto / South America), la selección de nodo y el modo (Basic o Multi-Path).\n3) Vuelve al juego. Se hace una vez y queda guardado en la nube de tu cuenta.\nNoLag no cambia estas opciones.",
    hMfFirst: "Toda la configuración de rutas, ítems y nodos se hace en el panel web de Mudfish.\nTras el registro, el plugin solo enciende y apaga el servicio.\nSi cambias de cuenta o región, repite el paso en el panel.",
    mfApiRow: "API del panel",
    mfApiOk: "Responde",
    mfApiDown: "Sin respuesta",
    mfAdvWebui: "Panel (WebUI)",
    mfResetSessionDesc: "Sale del panel y vuelve al paso de acceso",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfOptSaved: "Preferencia guardada",
    mfErrBadOption: "Opción no válida",
    mfWarnTitle: "Cuidado con los créditos",
    mfWarnDownload: "Nunca descargues juegos, actualizaciones ni archivos con Mudfish activo: el tráfico se cobra.",
    mfWarnSplit: "Prefiere el ítem del juego en el panel de Mudfish. Full VPN está permitido (juegos sin ítem para la región), pero enruta todo el tráfico del sistema.",
    mfFullVpnWarn: "Modo Full VPN activo — todo el tráfico se está enrutando. Mantén las descargas en segundo plano desactivadas para ahorrar créditos.",
    mfTipBtn: "Consejo",
    mfTipTitle: "¿Ítem del juego o Full VPN?",
    mfTipItem: "Ítem del juego: úsalo cuando Mudfish tiene servidor dedicado para la región que quieres (Brasil, EE. UU., Europa). Agrega y equipa el ítem del juego en el panel web.",
    mfTipFull: "Full VPN: úsalo cuando el juego no tiene ítem para la región que quieres (ej.: servidor en Brasil, pero sin ruta brasileña en Mudfish). Activa Full VPN en el panel web apuntando al nodo más cercano al servidor (ej.: São Paulo).",
    mfTipDiff: "Diferencia: el ítem enruta solo el tráfico de ese juego (gasta menos datos). Full VPN enruta toda la conexión del sistema: sirve para juegos sin soporte directo, siempre que no haya descargas en segundo plano.",
    hMfWarn: "Mudfish cobra por tráfico.\nActivo solo mientras juegas y con enrutamiento por juego, gasta poco.\nLas descargas y la VPN total gastan créditos rápido.",
    confAutoGame: "Activar al abrir un juego",
    confAutoGameDesc: "Activa Mudfish solo en los juegos marcados. Desactivado por defecto",
    hConfAutoGame: "Apagado, Mudfish nunca se activa solo.\nActivo, se abre solo en los juegos marcados con el interruptor Mudfish y se detiene al cerrar cualquier juego.\nGasta créditos mientras el juego está abierto.",
    confKeepOn: "Mantener activo al reiniciar",
    confKeepOnDesc: "Reactiva Mudfish cuando Decky se reinicia. Desactivado por defecto",
    hConfKeepOn: "Cuidado: activo, Mudfish vuelve a gastar créditos aun sin juego abierto.\nMejor déjalo apagado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Muestra el estado de la instalación y captura lo que expone el panel de Mudfish, para mapear la API local.\nNo gasta créditos.",
    chartTitle: "Ping actual",
    sumCollapsed: "Contraído",
    sumActive: "activos",
    sumGames: "juegos",
    tmLoss: "Pérdida de paquetes",
    chartEmpty: "Esperando mediciones…",
    chartNow: "ahora",
    chartWith: "Con Mudfish",
    chartWithout: "Sin Mudfish",
    histOpen: "Pantalla completa",
    histTitle: "Historial · últimos 30 min",
    histHint: "Toca o arrastra en el gráfico para ver los valores.",
    histClose: "Cerrar",
    histEmpty: "Aún no hay medidas guardadas.\nEl historial se graba cada 10 s mientras el plugin esté activo.",
    histPing: "Ping",
    chartSrcMudfish: "Medido por el túnel de Mudfish",
    chartSrcLocal: "Medido por la conexión normal (no gasta créditos)",
    chartBest: "MEJOR",
    hChart: "Compara el ping cada 8 s: Sin Mudfish (línea discontinua, conexión normal, no gasta créditos) y Con Mudfish (línea verde, medida por el túnel, solo con el servicio encendido).\nEl anillo muestra Mudfish cuando está midiendo; si no, la conexión normal.\nEl jitter y la pérdida aparecen en ambos lados, y el ✓ marca el mejor valor (el menor).",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Entrar en el panel",
    mfAccConnected: "Cuenta conectada",
    mfAccWaiting: "Esperando inicio de sesión en la WebUI",
    mfStepActivate: "3. Servicio encendido",
    mfDone: "Listo",
    mfPending: "Pendiente",
    mfHintInstall: "Paso 1: toca Instalar Mudfish.\nSolo hace falta una vez.",
    mfHintLogin: "Paso 2: enciende el servicio, abre el panel de Mudfish e inicia sesión.\nEl plugin detecta el login solo.",
    mfHintActivate: "Todo listo.\nConfigura juegos y rutas en el panel de Mudfish; el plugin solo enciende y apaga el servicio y muestra el ping.",
    mfLoginReset: "Repetir inicio de sesión",
    mfLoginResetDone: "Se pedirá iniciar sesión otra vez",
    mfAdvTitle: "Opciones avanzadas",
    mfAdvPanelDesc: "Elige el nodo y FastConnect en el panel de Mudfish",
    mfLogsTitle: "Logs",
    mfLogsLoad: "Ver logs",
    mfLogService: "Servicio",
    mfLogInstall: "Instalación",
    mfLogEmpty: "Sin registros",
    mfProbe: "Capturar API del panel",
    mfProbeDesc: "Captura de solo lectura del panel, para mapear la API. El archivo puede tener datos de la cuenta: revísalo antes de enviarlo",
    mfProbing: "Capturando…",
    mfProbeOk: "API capturada (respuestas / rutas)",
    mfProbeFail: "No se pudo capturar",
    mfErrPortClosed: "El panel de Mudfish no está abierto: enciende el servicio",
    hMfFlow: "El flujo es simple: instalar, encender el servicio y abrir el panel de Mudfish para entrar y configurar rutas y juegos.\nCada paso aparece solo.",
    hMfAdv: "Aquí están el objetivo del ping, la ruta actual, reinstalar o actualizar, rehacer el login y los logs.\nLas rutas y los nodos se eligen en el panel de Mudfish.",
    mfToastOk: "Mudfish: todo bien",
    mfToastFail: "Mudfish: no funcionó",
    hMfNet: "Compara el ping con Mudfish apagado y activado para ver si la ruta ayuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Wi-Fi: optimiza al abrir y sigue optimizado al salir. Mudfish: solo se activa con la opción de Conf y siempre se detiene al salir",
    gameCurrent: "Juego abierto",
    gameAddCurrent: "Guardar juego abierto",
    hGameModules: "Cada juego guardado puede optimizar el Wi-Fi y activar Mudfish al abrirse.\nEl Wi-Fi nunca se deshace al cerrar el juego; Mudfish siempre se detiene.",
    connTitle: "Conexión",
    connWifi: "Wi-Fi",
    connMudfish: "Mudfish",
    connIface: "Interfaz activa",
    connIp: "IP local",
    connRoute: "Ruta (gateway)",
    connPing: "Ping",
    connJitter: "Jitter",
    connHint: "Mudfish: activado o apagado · Wi-Fi: enlace",
    hConn: "Una foto de la conexión ahora: por qué interfaz sale el tráfico y el ping al destino.",
  },
};

export function normalizeLang(value: unknown): Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value)
    ? (value as Lang)
    : "pt";
}
