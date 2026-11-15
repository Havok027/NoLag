export type Lang = "pt" | "en" | "es";

export const LANGS: Lang[] = ["pt", "en", "es"];

export const LANG_NAMES: Record<Lang, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export interface Texts {
  status: string;
  state: string;
  stateOff: string;
  stateStarting: string;
  stateRunning: string;
  stateError: string;
  waitGame: string;
  waitTraffic: string;
  game: string;
  server: string;
  activeRoute: string;
  routeDirect: string;
  direct: string;
  metricsHint: string;
  notice: string;
  noticeNoRelays: string;
  noticeTools: string;
  noticeSetup: string;
  route: string;
  enable: string;
  enableDesc: string;
  profile: string;
  profileDesc: string;
  profileStable: string;
  profileBalanced: string;
  profileAggressive: string;
  relaysTitle: string;
  relaysNone: string;
  relayCode: string;
  relayCodeDesc: string;
  relayAdded: string;
  relayBad: string;
  relayLimit: string;
  relayRemove: string;
  relayBuiltin: string;
  relayInvalid: string;
  errToolsMissing: string;
  errSniff: string;
  errUnexpected: string;
  settings: string;
  language: string;
  createdBy: string;
  tabDash: string;
  tabRoutes: string;
  tabHint: string;
  badgeActive: string;
  badgeWaiting: string;
  badgeOff: string;
  badgeError: string;
  badgeStarting: string;
  pingNow: string;
  jitter: string;
  loss: string;
  liveRoutes: string;
  inUse: string;
  noLive: string;
  diagTitle: string;
  diagProcs: string;
  diagPorts: string;
  diagPackets: string;
  diagTop: string;
  diagHint: string;
  relaysCount: string;
  chartTitle: string;
  chartBest: string;
  chartEmpty: string;
  best: string;
  quality: string;
  qualGood: string;
  qualFair: string;
  qualBad: string;
  helpBtn: string;
  helpLegend: string;
  hStatus: string;
  hPing: string;
  hEnable: string;
  hRoutes: string;
  hChart: string;
  hDiag: string;
  hProfile: string;
  hRelays: string;
  hRelayCode: string;
  hLang: string;
  gamesTitle: string;
  gamesNone: string;
  gameProfile: string;
  gameSavedAuto: string;
  gameSavedManual: string;
  gameNotSaved: string;
  gameDelete: string;
  hGames: string;
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
  noticeEnroll: string;
  mfBadgeOn: string;
  mfBadgeOff: string;
  mfBadgeBusy: string;
  mfBadgeError: string;
  mfBadgeMissing: string;
  mfUnavailable: string;
  mfStatusTitle: string;
  mfVersion: string;
  mfInstalledRow: string;
  mfInstalledYes: string;
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
  mfLoginTitle: string;
  mfUser: string;
  mfUserDesc: string;
  mfPass: string;
  mfPassSaved: string;
  mfPassEmpty: string;
  mfSave: string;
  mfClear: string;
  mfLoginSaved: string;
  mfLoginCleared: string;
  mfOpenWeb: string;
  mfOpenWebDesc: string;
  mfNetTitle: string;
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
  mfErrNoCreds: string;
  mfErrMount: string;
  mfErrDownload: string;
  mfErrInstall: string;
  mfErrStart: string;
  mfErrExited: string;
  mfErrBusy: string;
  mfErrArch: string;
  mfErrBadUser: string;
  mfErrBadPass: string;
  mfErrGeneric: string;
  mfToastOk: string;
  mfToastFail: string;
  hMfInstall: string;
  hMfLogin: string;
  hMfToggle: string;
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
    status: "Status",
    state: "Estado",
    stateOff: "Desligado",
    stateStarting: "Iniciando",
    stateRunning: "Ativo",
    stateError: "Erro",
    waitGame: "Aguardando jogo",
    waitTraffic: "Aguardando tráfego do jogo",
    game: "Jogo",
    server: "Servidor",
    activeRoute: "Rota atual",
    routeDirect: "Direta",
    direct: "Direta",
    metricsHint: "ping · jitter · perda",
    notice: "Aviso",
    noticeNoRelays: "Sem relay: só monitorando o ping",
    noticeTools: "Relays desativados, faltam",
    noticeSetup: "Relays não iniciaram, só monitorando",
    route: "Rota",
    enable: "Rota automática",
    enableDesc: "Liga o NoLag neste jogo. Ele desliga sozinho ao sair.",
    profile: "Sensibilidade",
    profileDesc: "Quanto de ganho é preciso para trocar de rota",
    profileStable: "Estável",
    profileBalanced: "Equilibrado",
    profileAggressive: "Agressivo",
    relaysTitle: "Relays",
    relaysNone: "Nenhum relay",
    relayCode: "Código do relay (opcional)",
    relayCodeDesc: "Cole o código gerado pelo relay-setup.sh",
    relayAdded: "Relay adicionado",
    relayBad: "Código inválido",
    relayLimit: "Limite de 4 relays",
    relayRemove: "Remover",
    relayBuiltin: "Incluído",
    relayInvalid: "Falhou ao iniciar",
    errToolsMissing: "Faltam ferramentas",
    errSniff: "Não foi possível observar o tráfego do jogo",
    errUnexpected: "Erro inesperado, veja o log",
    settings: "Config.",
    language: "Idioma",
    createdBy: "Criado por Havok",
    tabDash: "Painel",
    tabRoutes: "Rotas",
    tabHint: "L1 / R1 · trocar guia",
    badgeActive: "ATIVO",
    badgeWaiting: "AGUARDANDO",
    badgeOff: "DESLIGADO",
    badgeError: "ERRO",
    badgeStarting: "INICIANDO",
    pingNow: "Ping atual",
    jitter: "Jitter",
    loss: "Perda",
    liveRoutes: "Rotas ao vivo",
    inUse: "em uso",
    noLive: "Sem medição ainda",
    diagTitle: "Diagnóstico",
    diagProcs: "Processos do jogo",
    diagPorts: "Portas UDP do jogo",
    diagPackets: "Pacotes UDP vistos",
    diagTop: "Mais frequentes",
    diagHint: "Em menus costuma não haver tráfego UDP até o servidor. Entre em uma partida.",
    relaysCount: "Relays",
    chartTitle: "Gráfico ao vivo",
    chartBest: "Melhor agora",
    chartEmpty: "Coletando dados…",
    best: "MELHOR",
    quality: "Qualidade",
    qualGood: "Ótima",
    qualFair: "Regular",
    qualBad: "Ruim",
    helpBtn: "Ajuda",
    helpLegend: "Ajuda",
    hStatus: "Mostra o que o NoLag está fazendo agora. Verde: funcionando. Amarelo: esperando você abrir um jogo e entrar em uma partida.",
    hPing: "Ping é o tempo de resposta até o servidor do jogo: quanto menor, melhor. Jitter é a oscilação do ping: quanto menor, mais estável. Perda é a parte dos dados que se perde: o ideal é 0%. Qualidade resume tudo em Ótima, Regular ou Ruim.",
    hEnable: "Ligue a chave uma vez dentro do jogo. O NoLag acha o servidor sozinho, salva o perfil e, nas próximas vezes, liga sozinho ao abrir o jogo. Ao sair do jogo, ele desliga e remove tudo da rede.",
    hRoutes: "Compara o caminho direto da sua internet com os relays (caminhos alternativos), se você tiver. A rota marcada como em uso é a que o jogo está usando agora.",
    hChart: "Cada linha é uma rota e o eixo mostra o ping em ms. Linha mais baixa = ping menor = melhor. A etiqueta MELHOR marca a rota mais rápida nos últimos instantes.",
    hDiag: "Use só se algo não funcionar. Mostra o que o plugin enxerga do jogo. Durante uma partida, os pacotes UDP vistos devem aumentar.",
    hProfile: "Define o quanto uma rota precisa ser melhor para o plugin trocar. Estável: troca pouco, só com ganho grande. Equilibrado: recomendado para a maioria. Agressivo: troca com ganho pequeno, então pode trocar mais vezes.",
    hRelays: "Relay é um servidor que serve de caminho alternativo. Os relays do NoLag são cadastrados sozinhos quando você liga a chave: você não precisa fazer nada aqui. Esta área é só para quem tem um relay próprio.",
    hRelayCode: "Só para relay próprio: cole aqui o código que o seu relay gerou.",
    hLang: "Idioma da interface do plugin.",
    gamesTitle: "Perfis de jogos",
    gamesNone: "Nenhum jogo salvo ainda",
    gameProfile: "Perfil do jogo",
    gameSavedAuto: "Salvo: liga sozinho",
    gameSavedManual: "Salvo: ligar à mão",
    gameNotSaved: "Ainda não salvo",
    gameDelete: "Excluir",
    hGames: "Ao ligar a chave dentro de um jogo, o NoLag salva um perfil dele e passa a ligar sozinho sempre que você abrir esse jogo. Aqui você pode desativar o início automático de um jogo ou excluir o perfil.",
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
    noticeEnroll: "Não foi possível registrar no relay; só monitorando o ping",
    mfBadgeOn: "Ativo",
    mfBadgeOff: "Desligado",
    mfBadgeBusy: "Aguarde",
    mfBadgeError: "Erro",
    mfBadgeMissing: "Sem instalação",
    mfUnavailable: "O módulo Mudfish não carregou",
    mfStatusTitle: "Mudfish",
    mfVersion: "Versão",
    mfInstalledRow: "Instalação",
    mfInstalledYes: "Instalado",
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
    mfToggleDesc: "Inicia o serviço com o login salvo. Mudfish cobra por tráfego.",
    mfCardToggle: "Rotas (Mudfish)",
    mfCardToggleDesc: "Liga ou desliga o Mudfish",
    mfOn: "Mudfish ligado",
    mfOff: "Mudfish desligado",
    mfLoginTitle: "Login do Mudfish",
    mfUser: "Usuário",
    mfUserDesc: "Conta do Mudfish guardada neste aparelho (o login é feito no painel)",
    mfPass: "Senha",
    mfPassSaved: "Senha salva. Digite outra só para trocar.",
    mfPassEmpty: "Digite a senha do Mudfish",
    mfSave: "Salvar login",
    mfClear: "Apagar login",
    mfLoginSaved: "Login salvo",
    mfLoginCleared: "Login apagado",
    mfOpenWeb: "Abrir painel do Mudfish",
    mfOpenWebDesc: "Escolha o nó e veja o saldo em 127.0.0.1:8282",
    mfNetTitle: "Rota e ping",
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
    mfErrNoCreds: "Salve o usuário e a senha antes de ligar",
    mfErrMount: "Não foi possível montar a pasta persistente",
    mfErrDownload: "Falha ao baixar o instalador",
    mfErrInstall: "A instalação falhou",
    mfErrStart: "O Mudfish não abriu a porta 8282",
    mfErrExited: "O Mudfish fechou ao iniciar",
    mfErrBusy: "Outra ação em andamento",
    mfErrArch: "Só funciona em aparelhos x86_64",
    mfErrBadUser: "Usuário inválido",
    mfErrBadPass: "Senha inválida",
    mfErrGeneric: "Não foi possível concluir",
    mfToastOk: "Mudfish: tudo certo",
    mfToastFail: "Mudfish: não deu certo",
    hMfInstall: "Baixa o Mudfish oficial e guarda na pasta do plugin, então ele continua instalado depois de atualizar o SteamOS.",
    hMfLogin: "Como no guia oficial do SteamOS, o serviço abre sem flags e o login é feito no painel do Mudfish (porta 8282). Os dados guardados ficam só neste aparelho.",
    hMfToggle: "Liga o serviço do Mudfish. Depois escolha o nó no painel do Mudfish.",
    hMfNet: "Compare o ping com o Mudfish desligado e ligado para ver se a rota ajuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Liga ao abrir o jogo; só desliga o que ele mesmo ligou",
    gameCurrent: "Jogo aberto",
    gameAddCurrent: "Salvar jogo aberto",
    hGameModules: "Cada jogo salvo pode ligar o Wi-Fi e o Mudfish por conta própria, sem depender da rota do NoLag.",
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
    status: "Status",
    state: "State",
    stateOff: "Off",
    stateStarting: "Starting",
    stateRunning: "Active",
    stateError: "Error",
    waitGame: "Waiting for a game",
    waitTraffic: "Waiting for game traffic",
    game: "Game",
    server: "Server",
    activeRoute: "Current route",
    routeDirect: "Direct",
    direct: "Direct",
    metricsHint: "ping · jitter · loss",
    notice: "Notice",
    noticeNoRelays: "No relay: only monitoring ping",
    noticeTools: "Relays disabled, missing",
    noticeSetup: "Relays did not start, only monitoring",
    route: "Route",
    enable: "Automatic route",
    enableDesc: "Turns NoLag on for this game. It turns off by itself when you leave.",
    profile: "Sensitivity",
    profileDesc: "How much gain is needed to switch route",
    profileStable: "Stable",
    profileBalanced: "Balanced",
    profileAggressive: "Aggressive",
    relaysTitle: "Relays",
    relaysNone: "No relays",
    relayCode: "Relay code (optional)",
    relayCodeDesc: "Paste the code printed by relay-setup.sh",
    relayAdded: "Relay added",
    relayBad: "Invalid code",
    relayLimit: "Limit of 4 relays",
    relayRemove: "Remove",
    relayBuiltin: "Included",
    relayInvalid: "Failed to start",
    errToolsMissing: "Missing tools",
    errSniff: "Could not observe the game traffic",
    errUnexpected: "Unexpected error, check the log",
    settings: "Settings",
    language: "Language",
    createdBy: "Created by Havok",
    tabDash: "Dashboard",
    tabRoutes: "Routes",
    tabHint: "L1 / R1 · switch tab",
    badgeActive: "ACTIVE",
    badgeWaiting: "WAITING",
    badgeOff: "OFF",
    badgeError: "ERROR",
    badgeStarting: "STARTING",
    pingNow: "Current ping",
    jitter: "Jitter",
    loss: "Loss",
    liveRoutes: "Live routes",
    inUse: "in use",
    noLive: "No measurement yet",
    diagTitle: "Diagnostics",
    diagProcs: "Game processes",
    diagPorts: "Game UDP ports",
    diagPackets: "UDP packets seen",
    diagTop: "Most frequent",
    diagHint: "Menus usually have no UDP traffic to the server. Join a match.",
    relaysCount: "Relays",
    chartTitle: "Live chart",
    chartBest: "Best now",
    chartEmpty: "Collecting data…",
    best: "BEST",
    quality: "Quality",
    qualGood: "Great",
    qualFair: "Fair",
    qualBad: "Poor",
    helpBtn: "Help",
    helpLegend: "Help",
    hStatus: "Shows what NoLag is doing right now. Green: working. Yellow: waiting for you to open a game and join a match.",
    hPing: "Ping is the response time to the game server: lower is better. Jitter is how much the ping wobbles: lower is steadier. Loss is the share of data that gets lost: ideally 0%. Quality sums it all up as Great, Fair or Poor.",
    hEnable: "Turn the switch on once inside the game. NoLag finds the server by itself, saves the profile and, next time, turns on by itself when you open the game. When you leave the game, it turns off and removes everything from the network.",
    hRoutes: "Compares your direct internet path with relays (alternative paths), if you have any. The route marked in use is the one the game is using now.",
    hChart: "Each line is a route and the axis shows ping in ms. Lower line = lower ping = better. The BEST tag marks the fastest route lately.",
    hDiag: "Use only if something does not work. It shows what the plugin sees from the game. During a match, the UDP packets seen should go up.",
    hProfile: "Sets how much better a route must be before the plugin switches. Stable: switches rarely, only for a big gain. Balanced: recommended for most people. Aggressive: switches for a small gain, so it may switch more often.",
    hRelays: "A relay is a server that works as an alternative path. NoLag relays are registered by themselves when you turn the switch on: you do not need to do anything here. This area is only for people with their own relay.",
    hRelayCode: "Only for your own relay: paste the code your relay generated.",
    hLang: "Plugin interface language.",
    gamesTitle: "Game profiles",
    gamesNone: "No saved game yet",
    gameProfile: "Game profile",
    gameSavedAuto: "Saved: starts by itself",
    gameSavedManual: "Saved: manual start",
    gameNotSaved: "Not saved yet",
    gameDelete: "Delete",
    hGames: "When you turn the switch on inside a game, NoLag saves a profile for it and turns on by itself every time you open that game. Here you can disable auto start for a game or delete its profile.",
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
    noticeEnroll: "Could not register with the relay; only monitoring ping",
    mfBadgeOn: "Active",
    mfBadgeOff: "Off",
    mfBadgeBusy: "Wait",
    mfBadgeError: "Error",
    mfBadgeMissing: "Not installed",
    mfUnavailable: "The Mudfish module did not load",
    mfStatusTitle: "Mudfish",
    mfVersion: "Version",
    mfInstalledRow: "Install",
    mfInstalledYes: "Installed",
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
    mfToggleDesc: "Starts the service with the saved login. Mudfish charges by traffic.",
    mfCardToggle: "Routes (Mudfish)",
    mfCardToggleDesc: "Turns Mudfish on or off",
    mfOn: "Mudfish is on",
    mfOff: "Mudfish is off",
    mfLoginTitle: "Mudfish login",
    mfUser: "User",
    mfUserDesc: "Mudfish account kept on this device (sign in on the panel)",
    mfPass: "Password",
    mfPassSaved: "Password saved. Type another only to change it.",
    mfPassEmpty: "Type your Mudfish password",
    mfSave: "Save login",
    mfClear: "Clear login",
    mfLoginSaved: "Login saved",
    mfLoginCleared: "Login cleared",
    mfOpenWeb: "Open Mudfish panel",
    mfOpenWebDesc: "Pick the node and see your balance at 127.0.0.1:8282",
    mfNetTitle: "Route and ping",
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
    mfErrNoCreds: "Save the user and password before turning on",
    mfErrMount: "Could not mount the persistent folder",
    mfErrDownload: "Could not download the installer",
    mfErrInstall: "The installation failed",
    mfErrStart: "Mudfish did not open port 8282",
    mfErrExited: "Mudfish closed on start",
    mfErrBusy: "Another action is running",
    mfErrArch: "Only works on x86_64 devices",
    mfErrBadUser: "Invalid user",
    mfErrBadPass: "Invalid password",
    mfErrGeneric: "Could not complete",
    mfToastOk: "Mudfish: all good",
    mfToastFail: "Mudfish: it did not work",
    hMfInstall: "Downloads the official Mudfish and keeps it in the plugin folder, so it stays installed after a SteamOS update.",
    hMfLogin: "As in the official SteamOS guide, the service starts without flags and you sign in on the Mudfish panel (port 8282). Saved data stays on this device only.",
    hMfToggle: "Starts the Mudfish service. Then pick the node in the Mudfish panel.",
    hMfNet: "Compare the ping with Mudfish off and on to see if the route helps.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Turns on when the game opens; only turns off what it turned on",
    gameCurrent: "Open game",
    gameAddCurrent: "Save open game",
    hGameModules: "Each saved game can turn on Wi-Fi and Mudfish on its own, without depending on the NoLag route.",
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
    status: "Estado",
    state: "Situación",
    stateOff: "Apagado",
    stateStarting: "Iniciando",
    stateRunning: "Activo",
    stateError: "Error",
    waitGame: "Esperando un juego",
    waitTraffic: "Esperando tráfico del juego",
    game: "Juego",
    server: "Servidor",
    activeRoute: "Ruta actual",
    routeDirect: "Directa",
    direct: "Directa",
    metricsHint: "ping · jitter · pérdida",
    notice: "Aviso",
    noticeNoRelays: "Sin relay: solo monitoreando el ping",
    noticeTools: "Relays desactivados, faltan",
    noticeSetup: "Los relays no iniciaron, solo monitoreando",
    route: "Ruta",
    enable: "Ruta automática",
    enableDesc: "Activa NoLag en este juego. Se apaga solo al salir.",
    profile: "Sensibilidad",
    profileDesc: "Cuánta mejora hace falta para cambiar de ruta",
    profileStable: "Estable",
    profileBalanced: "Equilibrado",
    profileAggressive: "Agresivo",
    relaysTitle: "Relays",
    relaysNone: "Sin relays",
    relayCode: "Código del relay (opcional)",
    relayCodeDesc: "Pega el código generado por relay-setup.sh",
    relayAdded: "Relay añadido",
    relayBad: "Código inválido",
    relayLimit: "Límite de 4 relays",
    relayRemove: "Quitar",
    relayBuiltin: "Incluido",
    relayInvalid: "Falló al iniciar",
    errToolsMissing: "Faltan herramientas",
    errSniff: "No se pudo observar el tráfico del juego",
    errUnexpected: "Error inesperado, revisa el log",
    settings: "Config.",
    language: "Idioma",
    createdBy: "Creado por Havok",
    tabDash: "Panel",
    tabRoutes: "Rutas",
    tabHint: "L1 / R1 · cambiar pestaña",
    badgeActive: "ACTIVO",
    badgeWaiting: "ESPERANDO",
    badgeOff: "APAGADO",
    badgeError: "ERROR",
    badgeStarting: "INICIANDO",
    pingNow: "Ping actual",
    jitter: "Jitter",
    loss: "Pérdida",
    liveRoutes: "Rutas en vivo",
    inUse: "en uso",
    noLive: "Sin medición aún",
    diagTitle: "Diagnóstico",
    diagProcs: "Procesos del juego",
    diagPorts: "Puertos UDP del juego",
    diagPackets: "Paquetes UDP vistos",
    diagTop: "Más frecuentes",
    diagHint: "En los menús suele no haber tráfico UDP al servidor. Entra en una partida.",
    relaysCount: "Relays",
    chartTitle: "Gráfico en vivo",
    chartBest: "Mejor ahora",
    chartEmpty: "Recopilando datos…",
    best: "MEJOR",
    quality: "Calidad",
    qualGood: "Óptima",
    qualFair: "Regular",
    qualBad: "Mala",
    helpBtn: "Ayuda",
    helpLegend: "Ayuda",
    hStatus: "Muestra lo que NoLag está haciendo ahora. Verde: funcionando. Amarillo: esperando que abras un juego y entres en una partida.",
    hPing: "Ping es el tiempo de respuesta hasta el servidor del juego: cuanto menor, mejor. Jitter es la oscilación del ping: cuanto menor, más estable. Pérdida es la parte de los datos que se pierde: lo ideal es 0%. Calidad lo resume en Óptima, Regular o Mala.",
    hEnable: "Activa el interruptor una vez dentro del juego. NoLag encuentra el servidor solo, guarda el perfil y la próxima vez se activa solo al abrir el juego. Al salir del juego, se apaga y quita todo de la red.",
    hRoutes: "Compara el camino directo de tu internet con los relays (caminos alternativos), si tienes. La ruta marcada en uso es la que el juego usa ahora.",
    hChart: "Cada línea es una ruta y el eje muestra el ping en ms. Línea más baja = menos ping = mejor. La etiqueta MEJOR marca la ruta más rápida últimamente.",
    hDiag: "Úsalo solo si algo no funciona. Muestra lo que el plugin ve del juego. Durante una partida, los paquetes UDP vistos deben aumentar.",
    hProfile: "Define cuánto mejor debe ser una ruta para que el plugin cambie. Estable: cambia poco, solo con gran mejora. Equilibrado: recomendado para la mayoría. Agresivo: cambia con poca mejora, así que puede cambiar más veces.",
    hRelays: "Un relay es un servidor que sirve de camino alternativo. Los relays de NoLag se registran solos al activar el interruptor: no tienes que hacer nada aquí. Esta área es solo para quien tiene un relay propio.",
    hRelayCode: "Solo para relay propio: pega aquí el código que generó tu relay.",
    hLang: "Idioma de la interfaz del plugin.",
    gamesTitle: "Perfiles de juegos",
    gamesNone: "Aún no hay juegos guardados",
    gameProfile: "Perfil del juego",
    gameSavedAuto: "Guardado: se activa solo",
    gameSavedManual: "Guardado: inicio manual",
    gameNotSaved: "Aún no guardado",
    gameDelete: "Eliminar",
    hGames: "Al activar el interruptor dentro de un juego, NoLag guarda un perfil y se activa solo cada vez que abres ese juego. Aquí puedes desactivar el inicio automático de un juego o eliminar su perfil.",
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
    noticeEnroll: "No se pudo registrar en el relay; solo monitoreando el ping",
    mfBadgeOn: "Activo",
    mfBadgeOff: "Apagado",
    mfBadgeBusy: "Espera",
    mfBadgeError: "Error",
    mfBadgeMissing: "Sin instalar",
    mfUnavailable: "El módulo Mudfish no cargó",
    mfStatusTitle: "Mudfish",
    mfVersion: "Versión",
    mfInstalledRow: "Instalación",
    mfInstalledYes: "Instalado",
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
    mfToggleDesc: "Inicia el servicio con el acceso guardado. Mudfish cobra por tráfico.",
    mfCardToggle: "Rutas (Mudfish)",
    mfCardToggleDesc: "Activa o desactiva Mudfish",
    mfOn: "Mudfish activado",
    mfOff: "Mudfish apagado",
    mfLoginTitle: "Acceso a Mudfish",
    mfUser: "Usuario",
    mfUserDesc: "Cuenta de Mudfish guardada en este equipo (el acceso se hace en el panel)",
    mfPass: "Contraseña",
    mfPassSaved: "Contraseña guardada. Escribe otra solo para cambiarla.",
    mfPassEmpty: "Escribe tu contraseña de Mudfish",
    mfSave: "Guardar acceso",
    mfClear: "Borrar acceso",
    mfLoginSaved: "Acceso guardado",
    mfLoginCleared: "Acceso borrado",
    mfOpenWeb: "Abrir panel de Mudfish",
    mfOpenWebDesc: "Elige el nodo y mira tu saldo en 127.0.0.1:8282",
    mfNetTitle: "Ruta y ping",
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
    mfErrNoCreds: "Guarda usuario y contraseña antes de activar",
    mfErrMount: "No se pudo montar la carpeta persistente",
    mfErrDownload: "Error al descargar el instalador",
    mfErrInstall: "La instalación falló",
    mfErrStart: "Mudfish no abrió el puerto 8282",
    mfErrExited: "Mudfish se cerró al iniciar",
    mfErrBusy: "Otra acción en curso",
    mfErrArch: "Solo funciona en equipos x86_64",
    mfErrBadUser: "Usuario no válido",
    mfErrBadPass: "Contraseña no válida",
    mfErrGeneric: "No se pudo completar",
    mfToastOk: "Mudfish: todo bien",
    mfToastFail: "Mudfish: no funcionó",
    hMfInstall: "Descarga Mudfish oficial y lo guarda en la carpeta del plugin, así sigue instalado tras actualizar SteamOS.",
    hMfLogin: "Como en la guía oficial de SteamOS, el servicio inicia sin flags y el acceso se hace en el panel de Mudfish (puerto 8282). Los datos guardados quedan solo en este equipo.",
    hMfToggle: "Inicia el servicio de Mudfish. Luego elige el nodo en el panel de Mudfish.",
    hMfNet: "Compara el ping con Mudfish apagado y activado para ver si la ruta ayuda.",
    gameWifi: "Wi-Fi",
    gameMudfish: "Mudfish",
    gameModulesDesc: "Se activa al abrir el juego; solo apaga lo que activó",
    gameCurrent: "Juego abierto",
    gameAddCurrent: "Guardar juego abierto",
    hGameModules: "Cada juego guardado puede activar Wi-Fi y Mudfish por su cuenta, sin depender de la ruta de NoLag.",
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
