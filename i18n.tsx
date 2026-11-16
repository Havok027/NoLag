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
  mfCardToggle: string;
  mfCardToggleDesc: string;
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
  chartWith: string;
  chartWithout: string;
  chartEmpty: string;
  chartBest: string;
  hChart: string;
  mfStepInstall: string;
  mfStepLogin: string;
  mfStepActivate: string;
  mfDone: string;
  mfPending: string;
  mfHintInstall: string;
  mfHintLogin: string;
  mfHintActivate: string;
  mfLoginDone: string;
  mfLoginConfirmed: string;
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
    wifiRestore: "Restaurar tudo ao padrão",
    wifiWorking: "Aplicando…",
    wifiDone: "Pronto",
    wifiFailed: "Não foi possível aplicar",
    hWifiStatus: "Resumo do Wi-Fi agora. As otimizações daqui não dependem da rota do NoLag nem do Mudfish.",
    hWifiActions: "Aplicar liga os ajustes seguros de uma vez. Restaurar devolve tudo ao padrão do sistema.",
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
    mfCardToggle: "Rotas (Mudfish)",
    mfCardToggleDesc: "Liga ou desliga o Mudfish",
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
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Seleção automática",
    mfAutoSelDesc: "O Mudfish escolhe o nó mais rápido sozinho (recomendado)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Envia o tráfego do jogo por mais de um caminho contra picos de lag",
    mfOptSaved: "Preferência salva",
    mfOptApplied: "Aplicado no Mudfish",
    mfOptPending: "Salvo. O Mudfish ainda não permite aplicar isso de fora: ative a mesma opção no painel",
    mfOptFailed: "Salvo, mas não foi possível aplicar no Mudfish",
    mfErrBadOption: "Opção inválida",
    mfWarnTitle: "Cuidado com os créditos",
    mfWarnDownload: "Nunca baixe jogos, atualizações ou arquivos com o Mudfish ligado: o tráfego é cobrado.",
    mfWarnSplit: "Use só o roteamento por jogo no painel do Mudfish. Não ative VPN total do sistema.",
    mfFullVpnWarn: "Atenção: o tráfego do sistema parece passar pelo Mudfish (VPN total). Desligue e use só o modo por jogo.",
    hMfWarn: "O Mudfish cobra por tráfego. Ligado só enquanto joga e com roteamento por jogo, gasta pouco. Downloads e VPN total gastam seus créditos rápido.",
    hMfAutoSel: "Melhora: escolhe o nó de menor ping sem você testar. Custo: pode trocar de nó no meio da partida, com uma pequena oscilação.",
    hMfMultiPath: "Melhora: estabilidade e jitter, porque o tráfego segue por caminhos redundantes. Custo: gasta mais créditos (o tráfego é duplicado). Use só quando o lag atrapalha.",
    confAutoGame: "Ativar ao abrir jogo",
    confAutoGameDesc: "Liga o Mudfish sozinho nos jogos marcados. Desligado por padrão",
    hConfAutoGame: "Desligado, o Mudfish nunca liga sozinho. Ligado, abre só nos jogos marcados com a chave Mudfish e é encerrado ao fechar qualquer jogo. Gasta créditos enquanto o jogo estiver aberto.",
    confKeepOn: "Manter ligado ao reiniciar",
    confKeepOnDesc: "Religa o Mudfish quando o Decky reinicia. Desligado por padrão",
    hConfKeepOn: "Cuidado: ligado, o Mudfish volta a gastar créditos mesmo sem jogo aberto. Prefira deixar desligado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Mostra o estado da instalação e captura o que o painel do Mudfish expõe, para mapear a API local. Não gasta créditos.",
    chartTitle: "Ping ao vivo",
    chartWith: "Com Mudfish",
    chartWithout: "Sem Mudfish",
    chartEmpty: "Aguardando medições…",
    chartBest: "MELHOR",
    hChart: "Compara o ping médio e o jitter com e sem o Mudfish, medidos a cada 8 s no alvo configurado. Ligue e desligue o Mudfish para ver a diferença.",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Entrar na conta",
    mfStepActivate: "3. Ativar a rota",
    mfDone: "Feito",
    mfPending: "Pendente",
    mfHintInstall: "Passo 1: toque em Instalar Mudfish. Só precisa fazer uma vez.",
    mfHintLogin: "Passo 2: ligue o serviço, abra o painel do Mudfish, entre na sua conta e volte aqui.",
    mfHintActivate: "Tudo pronto. Use a chave para ativar a rota e escolha o perfil.",
    mfLoginDone: "Já entrei na minha conta",
    mfLoginConfirmed: "Login confirmado",
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
    mfProbeDesc: "Salva as respostas do painel local para mapear nós e FastConnect",
    mfProbing: "Capturando…",
    mfProbeOk: "API capturada (respostas / caminhos)",
    mfProbeFail: "Não foi possível capturar",
    mfErrPortClosed: "O painel do Mudfish não está aberto: ligue o serviço",
    hMfFlow: "O fluxo tem 3 passos: instalar, entrar na conta pelo painel do Mudfish e ativar a rota. Cada passo aparece sozinho.",
    hMfAdv: "Aqui ficam a escolha manual de nó e FastConnect (pelo painel), ping antes e depois, logs e a captura da API.",
    mfToastOk: "Mudfish: tudo certo",
    mfToastFail: "Mudfish: não deu certo",
    hMfNet: "Compare o ping com o Mudfish desligado e ligado para ver se a rota ajuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Liga ao abrir o jogo; só desliga o que ele mesmo ligou",
    gameCurrent: "Jogo aberto",
    gameAddCurrent: "Salvar jogo aberto",
    hGameModules: "Cada jogo salvo pode ligar o Wi-Fi e o Mudfish por conta própria ao abrir.",
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
    wifiRestore: "Restore everything to default",
    wifiWorking: "Applying…",
    wifiDone: "Done",
    wifiFailed: "Could not apply",
    hWifiStatus: "Wi-Fi summary right now. These optimizations do not depend on the NoLag route or Mudfish.",
    hWifiActions: "Apply turns on the safe tweaks at once. Restore puts everything back to the system default.",
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
    mfCardToggle: "Routes (Mudfish)",
    mfCardToggleDesc: "Turns Mudfish on or off",
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
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Auto Selection",
    mfAutoSelDesc: "Mudfish picks the fastest node by itself (recommended)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Sends game traffic over more than one path against lag spikes",
    mfOptSaved: "Preference saved",
    mfOptApplied: "Applied in Mudfish",
    mfOptPending: "Saved. Mudfish does not allow applying this from outside yet: turn on the same option in its panel",
    mfOptFailed: "Saved, but it could not be applied in Mudfish",
    mfErrBadOption: "Invalid option",
    mfWarnTitle: "Mind your credits",
    mfWarnDownload: "Never download games, updates or files while Mudfish is on: traffic is billed.",
    mfWarnSplit: "Use only per-game routing in the Mudfish panel. Do not enable full-system VPN.",
    mfFullVpnWarn: "Warning: system traffic seems to go through Mudfish (full VPN). Turn it off and use per-game mode only.",
    hMfWarn: "Mudfish bills by traffic. On only while you play and with per-game routing, it costs little. Downloads and full VPN burn credits fast.",
    hMfAutoSel: "Improves: picks the lowest-ping node without you testing. Cost: it may switch nodes mid-match, with a small hiccup.",
    hMfMultiPath: "Improves: stability and jitter, since traffic follows redundant paths. Cost: uses more credits (traffic is duplicated). Use it only when lag hurts.",
    confAutoGame: "Turn on when a game opens",
    confAutoGameDesc: "Turns Mudfish on by itself in the marked games. Off by default",
    hConfAutoGame: "Off, Mudfish never turns on by itself. On, it opens only in games marked with the Mudfish switch and is stopped when any game closes. It uses credits while the game is open.",
    confKeepOn: "Keep on after restart",
    confKeepOnDesc: "Turns Mudfish back on when Decky restarts. Off by default",
    hConfKeepOn: "Careful: when on, Mudfish uses credits again even with no game open. Prefer leaving it off.",
    confDiagTitle: "Diagnostics",
    hConfDiag: "Shows the install state and captures what the Mudfish panel exposes, to map the local API. It does not use credits.",
    chartTitle: "Live ping",
    chartWith: "With Mudfish",
    chartWithout: "Without Mudfish",
    chartEmpty: "Waiting for measurements…",
    chartBest: "BEST",
    hChart: "Compares average ping and jitter with and without Mudfish, measured every 8 s on the configured target. Turn Mudfish on and off to see the difference.",
    mfStepInstall: "1. Install",
    mfStepLogin: "2. Sign in",
    mfStepActivate: "3. Turn on the route",
    mfDone: "Done",
    mfPending: "Pending",
    mfHintInstall: "Step 1: tap Install Mudfish. You only need to do this once.",
    mfHintLogin: "Step 2: turn the service on, open the Mudfish panel, sign in to your account and come back here.",
    mfHintActivate: "All set. Use the switch to turn the route on and pick a profile.",
    mfLoginDone: "I'm signed in",
    mfLoginConfirmed: "Sign-in confirmed",
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
    mfProbeDesc: "Saves the local panel's responses so nodes and FastConnect can be mapped",
    mfProbing: "Capturing…",
    mfProbeOk: "API captured (responses / paths)",
    mfProbeFail: "Could not capture",
    mfErrPortClosed: "The Mudfish panel is not open: turn the service on",
    hMfFlow: "The flow has 3 steps: install, sign in on the Mudfish panel and turn the route on. Each step shows up by itself.",
    hMfAdv: "Manual node and FastConnect choice (on the panel), ping before and after, logs and the API capture live here.",
    mfToastOk: "Mudfish: all good",
    mfToastFail: "Mudfish: it did not work",
    hMfNet: "Compare the ping with Mudfish off and on to see if the route helps.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Turns on when the game opens; only turns off what it turned on",
    gameCurrent: "Open game",
    gameAddCurrent: "Save open game",
    hGameModules: "Each saved game can turn on Wi-Fi and Mudfish on its own when it opens.",
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
    wifiRestore: "Restaurar todo a lo predeterminado",
    wifiWorking: "Aplicando…",
    wifiDone: "Listo",
    wifiFailed: "No se pudo aplicar",
    hWifiStatus: "Resumen del Wi-Fi ahora. Estas optimizaciones no dependen de la ruta de NoLag ni de Mudfish.",
    hWifiActions: "Aplicar activa los ajustes seguros de una vez. Restaurar devuelve todo a lo predeterminado del sistema.",
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
    mfCardToggle: "Rutas (Mudfish)",
    mfCardToggleDesc: "Activa o desactiva Mudfish",
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
    tabMudfish: "Mudfish",
    tabConf: "Conf",
    mfAutoSel: "Selección automática",
    mfAutoSelDesc: "Mudfish elige el nodo más rápido solo (recomendado)",
    mfMultiPath: "Multi-Path",
    mfMultiPathDesc: "Envía el tráfico del juego por más de un camino contra picos de lag",
    mfOptSaved: "Preferencia guardada",
    mfOptApplied: "Aplicado en Mudfish",
    mfOptPending: "Guardado. Mudfish aún no permite aplicarlo desde fuera: activa la misma opción en su panel",
    mfOptFailed: "Guardado, pero no se pudo aplicar en Mudfish",
    mfErrBadOption: "Opción no válida",
    mfWarnTitle: "Cuidado con los créditos",
    mfWarnDownload: "Nunca descargues juegos, actualizaciones ni archivos con Mudfish activo: el tráfico se cobra.",
    mfWarnSplit: "Usa solo el enrutamiento por juego en el panel de Mudfish. No actives VPN total del sistema.",
    mfFullVpnWarn: "Atención: el tráfico del sistema parece pasar por Mudfish (VPN total). Apágalo y usa solo el modo por juego.",
    hMfWarn: "Mudfish cobra por tráfico. Activo solo mientras juegas y con enrutamiento por juego, gasta poco. Las descargas y la VPN total gastan créditos rápido.",
    hMfAutoSel: "Mejora: elige el nodo de menor ping sin que pruebes. Costo: puede cambiar de nodo en plena partida, con una pequeña oscilación.",
    hMfMultiPath: "Mejora: estabilidad y jitter, porque el tráfico sigue caminos redundantes. Costo: gasta más créditos (el tráfico se duplica). Úsalo solo cuando el lag molesta.",
    confAutoGame: "Activar al abrir un juego",
    confAutoGameDesc: "Activa Mudfish solo en los juegos marcados. Desactivado por defecto",
    hConfAutoGame: "Apagado, Mudfish nunca se activa solo. Activo, se abre solo en los juegos marcados con el interruptor Mudfish y se detiene al cerrar cualquier juego. Gasta créditos mientras el juego está abierto.",
    confKeepOn: "Mantener activo al reiniciar",
    confKeepOnDesc: "Reactiva Mudfish cuando Decky se reinicia. Desactivado por defecto",
    hConfKeepOn: "Cuidado: activo, Mudfish vuelve a gastar créditos aun sin juego abierto. Mejor déjalo apagado.",
    confDiagTitle: "Diagnóstico",
    hConfDiag: "Muestra el estado de la instalación y captura lo que expone el panel de Mudfish, para mapear la API local. No gasta créditos.",
    chartTitle: "Ping en vivo",
    chartWith: "Con Mudfish",
    chartWithout: "Sin Mudfish",
    chartEmpty: "Esperando mediciones…",
    chartBest: "MEJOR",
    hChart: "Compara el ping medio y el jitter con y sin Mudfish, medidos cada 8 s en el destino configurado. Enciende y apaga Mudfish para ver la diferencia.",
    mfStepInstall: "1. Instalar",
    mfStepLogin: "2. Iniciar sesión",
    mfStepActivate: "3. Activar la ruta",
    mfDone: "Listo",
    mfPending: "Pendiente",
    mfHintInstall: "Paso 1: toca Instalar Mudfish. Solo hace falta una vez.",
    mfHintLogin: "Paso 2: enciende el servicio, abre el panel de Mudfish, inicia sesión y vuelve aquí.",
    mfHintActivate: "Todo listo. Usa el interruptor para activar la ruta y elige el perfil.",
    mfLoginDone: "Ya inicié sesión",
    mfLoginConfirmed: "Sesión confirmada",
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
    mfProbeDesc: "Guarda las respuestas del panel local para mapear nodos y FastConnect",
    mfProbing: "Capturando…",
    mfProbeOk: "API capturada (respuestas / rutas)",
    mfProbeFail: "No se pudo capturar",
    mfErrPortClosed: "El panel de Mudfish no está abierto: enciende el servicio",
    hMfFlow: "El flujo tiene 3 pasos: instalar, iniciar sesión en el panel de Mudfish y activar la ruta. Cada paso aparece solo.",
    hMfAdv: "Aquí están la elección manual de nodo y FastConnect (en el panel), ping antes y después, logs y la captura de la API.",
    mfToastOk: "Mudfish: todo bien",
    mfToastFail: "Mudfish: no funcionó",
    hMfNet: "Compara el ping con Mudfish apagado y activado para ver si la ruta ayuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Se activa al abrir el juego; solo apaga lo que activó",
    gameCurrent: "Juego abierto",
    gameAddCurrent: "Guardar juego abierto",
    hGameModules: "Cada juego guardado puede activar Wi-Fi y Mudfish por su cuenta al abrirse.",
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
