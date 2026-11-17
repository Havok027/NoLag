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
  mfPingBefore: string;
  mfPingAfter: string;
  mfPingTest: string;
  mfPingTestDesc: string;
  mfPingTesting: string;
  mfPingFail: string;
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
  chartNoTunnel: string;
  chartTunnelBlocked: string;
  chartTunnelWaiting: string;
  chartTunnelIdle: string;
  mfConnectManual: string;
  chartViaApi: string;
  mfUpdateTitle: string;
  mfUpdateAvail: string;
  mfUpdateBtn: string;
  mfUpdateOk: string;
  mfErrUpdateCheck: string;
  mfErrFullVpn: string;
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
  mfAccTitle: string;
  mfAccDesc: string;
  hMfAcc: string;
  mfUser: string;
  mfPass: string;
  mfPassKept: string;
  mfAccSave: string;
  mfAccClear: string;
  mfAccSaved: string;
  mfAccCleared: string;
  mfErrBadCreds: string;
  mfAdvWebui: string;
  mfResetSessionDesc: string;
  tabMudfish: string;
  tabConf: string;
  mfAutoSel: string;
  mfAutoSelDesc: string;
  mfMultiPath: string;
  mfMultiPathDesc: string;
  mfOptSaved: string;
  mfOptApplied: string;
  mfOptPending: string;
  mfOptFailed: string;
  mfErrBadOption: string;
  mfWarnTitle: string;
  mfWarnDownload: string;
  mfWarnSplit: string;
  mfFullVpnWarn: string;
  hMfWarn: string;
  hMfAutoSel: string;
  hMfMultiPath: string;
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
  chartWith: string;
  chartWithout: string;
  chartEmpty: string;
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
    wifiIndep: "Funciona sem a rota do NoLag e sem o Mudfish.",
    wifiSecMain: "Otimizações",
    wifiSecAdv: "Avançado",
    wifiSecStream: "Streaming",
    wifiSecActions: "Ações",
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
    hWifiStatus: "Resumo do Wi-Fi agora.\nAs otimizações daqui não dependem da rota do NoLag nem do Mudfish.",
    hWifiActions: "Aplicar liga os ajustes seguros de uma vez.\nRestaurar padrão desliga os ajustes de rede e mantém \"Corrigir ao acordar\" ligado.",
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
    mfOpenWebDesc: "Escolha o nó e veja o saldo em 127.0.0.1:8282",
    mfRouteIface: "Interface",
    mfRouteIp: "IP local",
    mfRouteGw: "Gateway",
    mfPingTarget: "Alvo do ping",
    mfPingTargetDesc: "IP ou site do servidor do jogo. Padrão: 1.1.1.1",
    mfPingBefore: "Ping antes",
    mfPingAfter: "Ping depois",
    mfPingTest: "Testar ping",
    mfPingTestDesc: "Desligado guarda o antes; ligado guarda o depois",
    mfPingTesting: "Testando…",
    mfPingFail: "Sem resposta do alvo",
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
    chartNoTunnel: "Mudfish ligado, mas nenhum túnel foi detectado: só a linha base é medida",
    chartTunnelBlocked: "O túnel não respondeu a esse alvo: no modo por jogo só o IP do item passa pelo Mudfish. Troque o alvo de ping pelo IP do servidor do jogo (Avançadas)",
    mfErrFullVpn: "Full VPN estava ativo no painel e o Mudfish foi encerrado para proteger seus créditos. Desative o Full VPN e ligue de novo",
    mfRttRow: "Latência dos nós",
    mfRttReady: "Medida",
    mfRttPending: "Medindo…",
    mfRttError: "Indisponível",
    chartTunnelWaiting: "Mudfish iniciando: o túnel só é medido quando o núcleo ficar pronto",
    chartTunnelIdle: "Túnel ocioso: nenhum jogo ou item do Mudfish está usando a rota agora. Sem tráfego tunelado não há o que medir (isso não é perda de pacotes)",
    mfConnectManual: "Configure e equipe o item do jogo previamente no painel web do Mudfish. Caso o túnel não conecte automaticamente ao iniciar o jogo, abra o painel e clique em Conectar.",
    chartViaApi: "medido pelo Mudfish",
    mfUpdateTitle: "Atualização do Mudfish",
    mfUpdateAvail: "Nova versão do núcleo disponível: {v} (instalada: {c})",
    mfUpdateBtn: "Atualizar para {v}",
    mfUpdateOk: "Mudfish atualizado",
    mfErrUpdateCheck: "Não foi possível consultar a versão mais recente",
    btnMfOn: "Mudfish ATIVO · toque para desligar",
    btnMfOff: "Ligar Mudfish",
    btnMfSetup: "Mudfish: conclua a instalação na aba Mudfish",
    btnWifiOn: "Wi-Fi otimizado · toque para restaurar",
    btnWifiOff: "Otimizar Wi-Fi",
    hDashBtns: "O botão do Mudfish liga e desliga só o serviço dele e gasta créditos enquanto estiver ativo.\nO botão Abrir painel do Mudfish abre 127.0.0.1:8282 (nós, saldo e login); fica ativo quando a porta responde.\nO botão de Wi-Fi aplica as otimizações e elas continuam mesmo ao fechar o jogo ou desligar o Mudfish: só você as restaura.",
    mfFirstTitle: "Primeiro uso (só uma vez)",
    mfFirstSteps: "1) Abra o painel (127.0.0.1:8282) e entre na conta.\n2) Escolha o modo Basic ou Multi-Path.\n3) Adicione à mão os jogos que quer otimizar, conferindo a região Auto / South America.\nEsse cadastro é feito uma única vez e fica salvo na nuvem da sua conta Mudfish.",
    hMfFirst: "Depois desse cadastro único, o plugin cuida dos jogos equipados por faixa de IP: você só liga e desliga o Mudfish.\nSe trocar de conta ou de região, repita o passo no painel.",
    mfApiRow: "API do painel",
    mfApiOk: "Responde",
    mfApiDown: "Sem resposta",
    mfAccTitle: "Conta Mudfish (opcional)",
    mfAccDesc: "Fica só neste aparelho.\nO login automático com estes dados chega na próxima etapa. Por enquanto, entre pelo painel: o plugin detecta o login sozinho.",
    hMfAcc: "Opcional.\nSalvar estes dados faz o plugin conferir a sessão na hora.\nO login automático com eles chega na próxima etapa.\nA senha nunca volta para a tela.",
    mfUser: "Usuário",
    mfPass: "Senha",
    mfPassKept: "Senha salva (deixe vazio para manter)",
    mfAccSave: "Salvar conta",
    mfAccClear: "Apagar conta",
    mfAccSaved: "Conta salva neste aparelho",
    mfAccCleared: "Conta apagada",
    mfErrBadCreds: "Usuário ou senha inválidos",
    mfAdvWebui: "Painel (WebUI)",
    mfResetSessionDesc: "Sai do painel e volta ao passo de login",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Seleção automática",
    mfAutoSelDesc: "O Mudfish escolhe o nó mais rápido sozinho (recomendado)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Envia o tráfego do jogo por mais de um caminho contra picos de lag",
    mfOptSaved: "Preferência salva",
    mfOptApplied: "Aplicado no Mudfish",
    mfOptPending: "Salvo neste aparelho. O painel do Mudfish não tem esse comando conferido ainda: ative a mesma opção lá",
    mfOptFailed: "Salvo, mas não foi possível aplicar no Mudfish",
    mfErrBadOption: "Opção inválida",
    mfWarnTitle: "Cuidado com os créditos",
    mfWarnDownload: "Nunca baixe jogos, atualizações ou arquivos com o Mudfish ligado: o tráfego é cobrado.",
    mfWarnSplit: "Use só o roteamento por jogo no painel do Mudfish. Não ative VPN total do sistema.",
    mfFullVpnWarn: "Atenção: o tráfego do sistema parece passar pelo Mudfish (VPN total). Desligue e use só o modo por jogo.",
    hMfWarn: "O Mudfish cobra por tráfego.\nLigado só enquanto joga e com roteamento por jogo, gasta pouco.\nDownloads e VPN total gastam seus créditos rápido.",
    hMfAutoSel: "Melhora: escolhe o nó de menor ping sem você testar.\nCusto: pode trocar de nó no meio da partida, com uma pequena oscilação.",
    hMfMultiPath: "Melhora: estabilidade e jitter, porque o tráfego segue por caminhos redundantes.\nCusto: gasta mais créditos (o tráfego é duplicado).\nUse só quando o lag atrapalha.",
    confAutoGame: "Ativar ao abrir jogo",
    confAutoGameDesc: "Liga o Mudfish sozinho nos jogos marcados. Desligado por padrão",
    hConfAutoGame: "Desligado, o Mudfish nunca liga sozinho.\nLigado, abre só nos jogos marcados com a chave Mudfish e é encerrado ao fechar qualquer jogo.\nGasta créditos enquanto o jogo estiver aberto.",
    confKeepOn: "Manter ligado ao reiniciar",
    confKeepOnDesc: "Religa o Mudfish quando o Decky reinicia. Desligado por padrão",
    hConfKeepOn: "Cuidado: ligado, o Mudfish volta a gastar créditos mesmo sem jogo aberto.\nPrefira deixar desligado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Mostra o estado da instalação e captura o que o painel do Mudfish expõe, para mapear a API local.\nNão gasta créditos.",
    chartTitle: "Ping ao vivo",
    sumCollapsed: "Recolhido",
    sumActive: "ativos",
    sumGames: "jogos",
    tmLoss: "Perda de pacotes",
    chartWith: "Com Mudfish",
    chartWithout: "Sem Mudfish",
    chartEmpty: "Aguardando medições…",
    chartBest: "MELHOR",
    hChart: "Mede sem parar, a cada 8 s.\nA linha 'Sem Mudfish' é medida pela conexão normal e não gasta créditos, mesmo com o Mudfish desligado.\nCom ele ligado, a outra linha mede pelo túnel ao mesmo tempo, para mostrar o ganho real.",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Entrar na conta",
    mfAccConnected: "Conta conectada",
    mfAccWaiting: "Aguardando login na WebUI",
    mfStepActivate: "3. Ativar a rota",
    mfDone: "Feito",
    mfPending: "Pendente",
    mfHintInstall: "Passo 1: toque em Instalar Mudfish.\nSó precisa fazer uma vez.",
    mfHintLogin: "Passo 2: ligue o serviço e entre na sua conta pelo painel do Mudfish.\nO plugin detecta o login sozinho.",
    mfHintActivate: "Tudo pronto.\nUse a chave para ativar a rota e escolha o perfil.",
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
    hMfFlow: "O fluxo tem 3 passos: instalar, entrar na conta pelo painel do Mudfish e ativar a rota.\nCada passo aparece sozinho.",
    hMfAdv: "Aqui ficam a escolha manual de nó e FastConnect (pelo painel), ping antes e depois, logs e a captura da API.",
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
    wifiIndep: "Works without the NoLag route and without Mudfish.",
    wifiSecMain: "Optimizations",
    wifiSecAdv: "Advanced",
    wifiSecStream: "Streaming",
    wifiSecActions: "Actions",
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
    hWifiStatus: "Wi-Fi summary right now.\nThese optimizations do not depend on the NoLag route or Mudfish.",
    hWifiActions: "Apply turns on the safe tweaks at once.\nRestore default turns the network tweaks off and keeps \"Fix on wake\" on.",
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
    mfOpenWebDesc: "Pick the node and see your balance at 127.0.0.1:8282",
    mfRouteIface: "Interface",
    mfRouteIp: "Local IP",
    mfRouteGw: "Gateway",
    mfPingTarget: "Ping target",
    mfPingTargetDesc: "IP or host of the game server. Default: 1.1.1.1",
    mfPingBefore: "Ping before",
    mfPingAfter: "Ping after",
    mfPingTest: "Test ping",
    mfPingTestDesc: "Off saves the before; on saves the after",
    mfPingTesting: "Testing…",
    mfPingFail: "No reply from the target",
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
    chartNoTunnel: "Mudfish is on but no tunnel was detected: only the baseline is measured",
    chartTunnelBlocked: "The tunnel did not answer this target: in per-game mode only the item IP goes through Mudfish. Set the ping target to the game server IP (Advanced)",
    mfErrFullVpn: "Full VPN was on in the panel and Mudfish was stopped to protect your credits. Turn Full VPN off and start again",
    mfRttRow: "Node latency",
    mfRttReady: "Measured",
    mfRttPending: "Measuring…",
    mfRttError: "Unavailable",
    chartTunnelWaiting: "Mudfish is starting: the tunnel is only measured once the core is ready",
    chartTunnelIdle: "Tunnel idle: no Mudfish game or item is using the route right now. With no tunneled traffic there is nothing to measure (this is not packet loss)",
    mfConnectManual: "Set up and equip the game item beforehand in the Mudfish web panel. If the tunnel does not connect automatically when the game starts, open the panel and click Connect.",
    chartViaApi: "measured by Mudfish",
    mfUpdateTitle: "Mudfish update",
    mfUpdateAvail: "New core version available: {v} (installed: {c})",
    mfUpdateBtn: "Update to {v}",
    mfUpdateOk: "Mudfish updated",
    mfErrUpdateCheck: "Could not check the latest version",
    btnMfOn: "Mudfish ON · tap to turn off",
    btnMfOff: "Turn on Mudfish",
    btnMfSetup: "Mudfish: finish setup in the Mudfish tab",
    btnWifiOn: "Wi-Fi tuned · tap to restore",
    btnWifiOff: "Optimize Wi-Fi",
    hDashBtns: "The Mudfish button only starts and stops its service and uses credits while on.\nThe Open Mudfish panel button opens 127.0.0.1:8282 (nodes, balance, sign-in); it is enabled when the port responds.\nThe Wi-Fi button applies the tweaks and they stay even when the game closes or Mudfish turns off: only you restore them.",
    mfFirstTitle: "First use (only once)",
    mfFirstSteps: "1) Open the panel (127.0.0.1:8282) and sign in.\n2) Pick Basic or Multi-Path mode.\n3) Add the games you want to optimize by hand, checking the Auto / South America region.\nThis setup is done only once and is saved in your Mudfish account cloud.",
    hMfFirst: "After this one-time setup, the plugin handles the equipped games by IP range: you only turn Mudfish on and off.\nIf you change account or region, repeat the step in the panel.",
    mfApiRow: "Panel API",
    mfApiOk: "Responding",
    mfApiDown: "No response",
    mfAccTitle: "Mudfish account (optional)",
    mfAccDesc: "Stays on this device only.\nAuto-login with these details comes in the next step. For now, sign in on the panel: the plugin detects the sign-in by itself.",
    hMfAcc: "Optional.\nSaving these makes the plugin re-check the session right away.\nAuto-login with them comes in the next step.\nThe password never comes back to the screen.",
    mfUser: "Username",
    mfPass: "Password",
    mfPassKept: "Password saved (leave empty to keep)",
    mfAccSave: "Save account",
    mfAccClear: "Delete account",
    mfAccSaved: "Account saved on this device",
    mfAccCleared: "Account deleted",
    mfErrBadCreds: "Invalid username or password",
    mfAdvWebui: "Panel (WebUI)",
    mfResetSessionDesc: "Signs out of the panel and returns to the login step",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Auto Selection",
    mfAutoSelDesc: "Mudfish picks the fastest node by itself (recommended)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Sends game traffic over more than one path against lag spikes",
    mfOptSaved: "Preference saved",
    mfOptApplied: "Applied in Mudfish",
    mfOptPending: "Saved on this device. The Mudfish panel's command for this is not verified yet: turn on the same option there",
    mfOptFailed: "Saved, but it could not be applied in Mudfish",
    mfErrBadOption: "Invalid option",
    mfWarnTitle: "Mind your credits",
    mfWarnDownload: "Never download games, updates or files while Mudfish is on: traffic is billed.",
    mfWarnSplit: "Use only per-game routing in the Mudfish panel. Do not enable full-system VPN.",
    mfFullVpnWarn: "Warning: system traffic seems to go through Mudfish (full VPN). Turn it off and use per-game mode only.",
    hMfWarn: "Mudfish bills by traffic.\nOn only while you play and with per-game routing, it costs little.\nDownloads and full VPN burn credits fast.",
    hMfAutoSel: "Improves: picks the lowest-ping node without you testing.\nCost: it may switch nodes mid-match, with a small hiccup.",
    hMfMultiPath: "Improves: stability and jitter, since traffic follows redundant paths.\nCost: uses more credits (traffic is duplicated).\nUse it only when lag hurts.",
    confAutoGame: "Turn on when a game opens",
    confAutoGameDesc: "Turns Mudfish on by itself in the marked games. Off by default",
    hConfAutoGame: "Off, Mudfish never turns on by itself.\nOn, it opens only in games marked with the Mudfish switch and is stopped when any game closes.\nIt uses credits while the game is open.",
    confKeepOn: "Keep on after restart",
    confKeepOnDesc: "Turns Mudfish back on when Decky restarts. Off by default",
    hConfKeepOn: "Careful: when on, Mudfish uses credits again even with no game open.\nPrefer leaving it off.",
    confDiagTitle: "Diagnostics",
    hConfDiag: "Shows the install state and captures what the Mudfish panel exposes, to map the local API.\nIt does not use credits.",
    chartTitle: "Live ping",
    sumCollapsed: "Collapsed",
    sumActive: "active",
    sumGames: "games",
    tmLoss: "Packet loss",
    chartWith: "With Mudfish",
    chartWithout: "Without Mudfish",
    chartEmpty: "Waiting for measurements…",
    chartBest: "BEST",
    hChart: "Measures nonstop, every 8 s.\nThe 'Without Mudfish' line uses the normal connection and costs no credits, even with Mudfish off.\nWith it on, the other line measures through the tunnel at the same time to show the real gain.",
    mfStepInstall: "1. Install",
    mfStepLogin: "2. Sign in",
    mfAccConnected: "Account connected",
    mfAccWaiting: "Waiting for WebUI sign-in",
    mfStepActivate: "3. Turn on the route",
    mfDone: "Done",
    mfPending: "Pending",
    mfHintInstall: "Step 1: tap Install Mudfish.\nYou only need to do this once.",
    mfHintLogin: "Step 2: turn the service on and sign in on the Mudfish panel.\nThe plugin detects the sign-in by itself.",
    mfHintActivate: "All set.\nUse the switch to turn the route on and pick a profile.",
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
    hMfFlow: "The flow has 3 steps: install, sign in on the Mudfish panel and turn the route on.\nEach step shows up by itself.",
    hMfAdv: "Manual node and FastConnect choice (on the panel), ping before and after, logs and the API capture live here.",
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
    wifiIndep: "Funciona sin la ruta de NoLag y sin Mudfish.",
    wifiSecMain: "Optimizaciones",
    wifiSecAdv: "Avanzado",
    wifiSecStream: "Streaming",
    wifiSecActions: "Acciones",
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
    hWifiStatus: "Resumen del Wi-Fi ahora.\nEstas optimizaciones no dependen de la ruta de NoLag ni de Mudfish.",
    hWifiActions: "Aplicar activa los ajustes seguros de una vez.\nRestaurar predeterminado apaga los ajustes de red y mantiene \"Corregir al despertar\" activado.",
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
    mfOpenWebDesc: "Elige el nodo y mira tu saldo en 127.0.0.1:8282",
    mfRouteIface: "Interfaz",
    mfRouteIp: "IP local",
    mfRouteGw: "Puerta de enlace",
    mfPingTarget: "Destino del ping",
    mfPingTargetDesc: "IP o sitio del servidor del juego. Predeterminado: 1.1.1.1",
    mfPingBefore: "Ping antes",
    mfPingAfter: "Ping después",
    mfPingTest: "Probar ping",
    mfPingTestDesc: "Apagado guarda el antes; activado guarda el después",
    mfPingTesting: "Probando…",
    mfPingFail: "Sin respuesta del destino",
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
    chartNoTunnel: "Mudfish activo, pero no se detectó túnel: solo se mide la línea base",
    chartTunnelBlocked: "El túnel no respondió a este destino: en el modo por juego solo la IP del ítem pasa por Mudfish. Cambia el destino del ping por la IP del servidor del juego (Avanzadas)",
    mfErrFullVpn: "Full VPN estaba activo en el panel y Mudfish se detuvo para proteger tus créditos. Desactiva Full VPN y vuelve a encender",
    mfRttRow: "Latencia de nodos",
    mfRttReady: "Medida",
    mfRttPending: "Midiendo…",
    mfRttError: "No disponible",
    chartTunnelWaiting: "Mudfish iniciando: el túnel solo se mide cuando el núcleo esté listo",
    chartTunnelIdle: "Túnel inactivo: ningún juego o ítem de Mudfish usa la ruta ahora. Sin tráfico por el túnel no hay nada que medir (esto no es pérdida de paquetes)",
    mfConnectManual: "Configura y equipa antes el ítem del juego en el panel web de Mudfish. Si el túnel no se conecta solo al iniciar el juego, abre el panel y pulsa Conectar.",
    chartViaApi: "medido por Mudfish",
    mfUpdateTitle: "Actualización de Mudfish",
    mfUpdateAvail: "Nueva versión del núcleo disponible: {v} (instalada: {c})",
    mfUpdateBtn: "Actualizar a {v}",
    mfUpdateOk: "Mudfish actualizado",
    mfErrUpdateCheck: "No se pudo consultar la versión más reciente",
    btnMfOn: "Mudfish ACTIVO · toca para apagar",
    btnMfOff: "Activar Mudfish",
    btnMfSetup: "Mudfish: termina la instalación en la pestaña Mudfish",
    btnWifiOn: "Wi-Fi optimizado · toca para restaurar",
    btnWifiOff: "Optimizar Wi-Fi",
    hDashBtns: "El botón de Mudfish solo inicia y detiene su servicio y gasta créditos mientras esté activo.\nEl botón Abrir panel de Mudfish abre 127.0.0.1:8282 (nodos, saldo e inicio de sesión); se activa cuando el puerto responde.\nEl botón de Wi-Fi aplica los ajustes y permanecen aunque se cierre el juego o se apague Mudfish: solo tú los restauras.",
    mfFirstTitle: "Primer uso (solo una vez)",
    mfFirstSteps: "1) Abre el panel (127.0.0.1:8282) y entra en la cuenta.\n2) Elige el modo Basic o Multi-Path.\n3) Añade a mano los juegos que quieres optimizar, revisando la región Auto / South America.\nEste registro se hace una sola vez y queda guardado en la nube de tu cuenta Mudfish.",
    hMfFirst: "Tras este registro único, el plugin gestiona los juegos equipados por rango de IP: solo enciendes y apagas Mudfish.\nSi cambias de cuenta o de región, repite el paso en el panel.",
    mfApiRow: "API del panel",
    mfApiOk: "Responde",
    mfApiDown: "Sin respuesta",
    mfAccTitle: "Cuenta Mudfish (opcional)",
    mfAccDesc: "Queda solo en este equipo.\nEl acceso automático con estos datos llega en la próxima etapa. Por ahora, entra por el panel: el plugin detecta el inicio de sesión solo.",
    hMfAcc: "Opcional.\nAl guardar estos datos, el plugin vuelve a comprobar la sesión al momento.\nEl acceso automático con ellos llega en la próxima etapa.\nLa contraseña nunca vuelve a la pantalla.",
    mfUser: "Usuario",
    mfPass: "Contraseña",
    mfPassKept: "Contraseña guardada (déjalo vacío para mantener)",
    mfAccSave: "Guardar cuenta",
    mfAccClear: "Borrar cuenta",
    mfAccSaved: "Cuenta guardada en este equipo",
    mfAccCleared: "Cuenta borrada",
    mfErrBadCreds: "Usuario o contraseña no válidos",
    mfAdvWebui: "Panel (WebUI)",
    mfResetSessionDesc: "Sale del panel y vuelve al paso de acceso",
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Selección automática",
    mfAutoSelDesc: "Mudfish elige el nodo más rápido solo (recomendado)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Envía el tráfico del juego por más de un camino contra picos de lag",
    mfOptSaved: "Preferencia guardada",
    mfOptApplied: "Aplicado en Mudfish",
    mfOptPending: "Guardado en este equipo. El comando del panel de Mudfish aún no está verificado: activa la misma opción allí",
    mfOptFailed: "Guardado, pero no se pudo aplicar en Mudfish",
    mfErrBadOption: "Opción no válida",
    mfWarnTitle: "Cuidado con los créditos",
    mfWarnDownload: "Nunca descargues juegos, actualizaciones ni archivos con Mudfish activo: el tráfico se cobra.",
    mfWarnSplit: "Usa solo el enrutamiento por juego en el panel de Mudfish. No actives VPN total del sistema.",
    mfFullVpnWarn: "Atención: el tráfico del sistema parece pasar por Mudfish (VPN total). Apágalo y usa solo el modo por juego.",
    hMfWarn: "Mudfish cobra por tráfico.\nActivo solo mientras juegas y con enrutamiento por juego, gasta poco.\nLas descargas y la VPN total gastan créditos rápido.",
    hMfAutoSel: "Mejora: elige el nodo de menor ping sin que pruebes.\nCosto: puede cambiar de nodo en plena partida, con una pequeña oscilación.",
    hMfMultiPath: "Mejora: estabilidad y jitter, porque el tráfico sigue caminos redundantes.\nCosto: gasta más créditos (el tráfico se duplica).\nÚsalo solo cuando el lag molesta.",
    confAutoGame: "Activar al abrir un juego",
    confAutoGameDesc: "Activa Mudfish solo en los juegos marcados. Desactivado por defecto",
    hConfAutoGame: "Apagado, Mudfish nunca se activa solo.\nActivo, se abre solo en los juegos marcados con el interruptor Mudfish y se detiene al cerrar cualquier juego.\nGasta créditos mientras el juego está abierto.",
    confKeepOn: "Mantener activo al reiniciar",
    confKeepOnDesc: "Reactiva Mudfish cuando Decky se reinicia. Desactivado por defecto",
    hConfKeepOn: "Cuidado: activo, Mudfish vuelve a gastar créditos aun sin juego abierto.\nMejor déjalo apagado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Muestra el estado de la instalación y captura lo que expone el panel de Mudfish, para mapear la API local.\nNo gasta créditos.",
    chartTitle: "Ping en vivo",
    sumCollapsed: "Contraído",
    sumActive: "activos",
    sumGames: "juegos",
    tmLoss: "Pérdida de paquetes",
    chartWith: "Con Mudfish",
    chartWithout: "Sin Mudfish",
    chartEmpty: "Esperando mediciones…",
    chartBest: "MEJOR",
    hChart: "Mide sin parar, cada 8 s.\nLa línea 'Sin Mudfish' usa la conexión normal y no gasta créditos, aun con Mudfish apagado.\nCon él activo, la otra línea mide por el túnel a la vez para mostrar la ganancia real.",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Iniciar sesión",
    mfAccConnected: "Cuenta conectada",
    mfAccWaiting: "Esperando inicio de sesión en la WebUI",
    mfStepActivate: "3. Activar la ruta",
    mfDone: "Listo",
    mfPending: "Pendiente",
    mfHintInstall: "Paso 1: toca Instalar Mudfish.\nSolo hace falta una vez.",
    mfHintLogin: "Paso 2: enciende el servicio e inicia sesión en el panel de Mudfish.\nEl plugin detecta el inicio de sesión solo.",
    mfHintActivate: "Todo listo.\nUsa el interruptor para activar la ruta y elige el perfil.",
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
    hMfFlow: "El flujo tiene 3 pasos: instalar, iniciar sesión en el panel de Mudfish y activar la ruta.\nCada paso aparece solo.",
    hMfAdv: "Aquí están la elección manual de nodo y FastConnect (en el panel), ping antes y después, logs y la captura de la API.",
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
