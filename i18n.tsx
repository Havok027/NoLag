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
  wifiBandRow: string;
  wifiRate: string;
  wifiActiveCount: string;
  wifiDevice: string;
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
  wifiCardToggle: string;
  wifiCardToggleDesc: string;
  wifiRestore: string;
  wifiWorking: string;
  wifiDone: string;
  wifiFailed: string;
  hWifiStatus: string;
  hWifiMain: string;
  hWifiAdv: string;
  hWifiStream: string;
  hWifiActions: string;
  noticeEnroll: string;
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
    helpBtn: "Ajuda (Y)",
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
    wifiBandRow: "Banda",
    wifiRate: "Taxa",
    wifiActiveCount: "Otimizações ativas",
    wifiDevice: "Aparelho",
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
    wifiCardToggle: "Otimizar Wi-Fi",
    wifiCardToggleDesc: "Liga os ajustes seguros; desligar restaura o padrão",
    wifiRestore: "Restaurar tudo ao padrão",
    wifiWorking: "Aplicando…",
    wifiDone: "Pronto",
    wifiFailed: "Não foi possível aplicar",
    hWifiStatus: "Resumo do Wi-Fi agora. As otimizações daqui não dependem da rota do NoLag nem do Mudfish.",
    hWifiMain: "Cada chave liga ou desliga um ajuste. Eles sobrevivem a suspensão, reconexão e atualização do sistema.",
    hWifiAdv: "Ajustes que mudam a conexão desta rede. Mudar a banda ou travar o ponto de acesso reconecta o Wi-Fi por alguns segundos.",
    hWifiStream: "Para jogar por streaming (Moonlight, Steam Link). Com o modo streaming, os ajustes só ficam ligados durante o stream.",
    hWifiActions: "Aplicar liga os ajustes seguros de uma vez. Restaurar devolve tudo ao padrão do sistema.",
    noticeEnroll: "Não foi possível registrar no relay; só monitorando o ping",
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
    helpBtn: "Help (Y)",
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
    wifiBandRow: "Band",
    wifiRate: "Link rate",
    wifiActiveCount: "Active optimizations",
    wifiDevice: "Device",
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
    wifiCardToggle: "Optimize Wi-Fi",
    wifiCardToggleDesc: "Turns on the safe tweaks; turning off restores the default",
    wifiRestore: "Restore everything to default",
    wifiWorking: "Applying…",
    wifiDone: "Done",
    wifiFailed: "Could not apply",
    hWifiStatus: "Wi-Fi summary right now. These optimizations do not depend on the NoLag route or Mudfish.",
    hWifiMain: "Each switch turns one tweak on or off. They survive sleep, reconnects and system updates.",
    hWifiAdv: "Tweaks that change this network connection. Changing the band or locking the access point reconnects Wi-Fi for a few seconds.",
    hWifiStream: "For streaming play (Moonlight, Steam Link). With streaming mode, the fixes are only on during the stream.",
    hWifiActions: "Apply turns on the safe tweaks at once. Restore puts everything back to the system default.",
    noticeEnroll: "Could not register with the relay; only monitoring ping",
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
    helpBtn: "Ayuda (Y)",
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
    wifiBandRow: "Banda",
    wifiRate: "Velocidad",
    wifiActiveCount: "Optimizaciones activas",
    wifiDevice: "Dispositivo",
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
    wifiCardToggle: "Optimizar Wi-Fi",
    wifiCardToggleDesc: "Activa los ajustes seguros; desactivar restaura lo predeterminado",
    wifiRestore: "Restaurar todo a lo predeterminado",
    wifiWorking: "Aplicando…",
    wifiDone: "Listo",
    wifiFailed: "No se pudo aplicar",
    hWifiStatus: "Resumen del Wi-Fi ahora. Estas optimizaciones no dependen de la ruta de NoLag ni de Mudfish.",
    hWifiMain: "Cada interruptor activa o desactiva un ajuste. Sobreviven a suspensión, reconexión y actualizaciones del sistema.",
    hWifiAdv: "Ajustes que cambian la conexión de esta red. Cambiar la banda o fijar el punto de acceso reconecta el Wi-Fi unos segundos.",
    hWifiStream: "Para jugar por streaming (Moonlight, Steam Link). Con el modo streaming, los ajustes solo se activan durante el stream.",
    hWifiActions: "Aplicar activa los ajustes seguros de una vez. Restaurar devuelve todo a lo predeterminado del sistema.",
    noticeEnroll: "No se pudo registrar en el relay; solo monitoreando el ping",
  },
};

export function normalizeLang(value: unknown): Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value)
    ? (value as Lang)
    : "pt";
}
