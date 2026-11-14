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
    enableDesc: "Detecta o servidor do jogo e escolhe o melhor caminho",
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
    hEnable: "Deixe LIGADO. O NoLag acha o jogo e o servidor sozinho. Desligado, ele não mede nem altera nada na sua rede.",
    hRoutes: "Compara o caminho direto da sua internet com os relays (caminhos alternativos), se você tiver. A rota marcada como em uso é a que o jogo está usando agora.",
    hChart: "Cada linha é uma rota e o eixo mostra o ping em ms. Linha mais baixa = ping menor = melhor. A etiqueta MELHOR marca a rota mais rápida nos últimos instantes.",
    hDiag: "Use só se algo não funcionar. Mostra o que o plugin enxerga do jogo. Durante uma partida, os pacotes UDP vistos devem aumentar.",
    hProfile: "Define o quanto uma rota precisa ser melhor para o plugin trocar. Estável: troca pouco, só com ganho grande. Equilibrado: recomendado para a maioria. Agressivo: troca com ganho pequeno, então pode trocar mais vezes.",
    hRelays: "Relay é um servidor seu que serve de caminho alternativo. É opcional: sem relay, o NoLag só mede a sua conexão.",
    hRelayCode: "Cole aqui o código gerado pelo relay-setup.sh. Só é preciso se você criou um relay.",
    hLang: "Idioma da interface do plugin.",
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
    enableDesc: "Detects the game server and picks the best path",
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
    hEnable: "Leave it ON. NoLag finds the game and the server by itself. When off, it measures and changes nothing on your network.",
    hRoutes: "Compares your direct internet path with relays (alternative paths), if you have any. The route marked in use is the one the game is using now.",
    hChart: "Each line is a route and the axis shows ping in ms. Lower line = lower ping = better. The BEST tag marks the fastest route lately.",
    hDiag: "Use only if something does not work. It shows what the plugin sees from the game. During a match, the UDP packets seen should go up.",
    hProfile: "Sets how much better a route must be before the plugin switches. Stable: switches rarely, only for a big gain. Balanced: recommended for most people. Aggressive: switches for a small gain, so it may switch more often.",
    hRelays: "A relay is a server of your own that works as an alternative path. It is optional: without a relay, NoLag only measures your connection.",
    hRelayCode: "Paste the code generated by relay-setup.sh here. Only needed if you created a relay.",
    hLang: "Plugin interface language.",
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
    enableDesc: "Detecta el servidor del juego y elige el mejor camino",
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
    hEnable: "Déjalo ACTIVADO. NoLag encuentra el juego y el servidor solo. Apagado, no mide ni cambia nada en tu red.",
    hRoutes: "Compara el camino directo de tu internet con los relays (caminos alternativos), si tienes. La ruta marcada en uso es la que el juego usa ahora.",
    hChart: "Cada línea es una ruta y el eje muestra el ping en ms. Línea más baja = menos ping = mejor. La etiqueta MEJOR marca la ruta más rápida últimamente.",
    hDiag: "Úsalo solo si algo no funciona. Muestra lo que el plugin ve del juego. Durante una partida, los paquetes UDP vistos deben aumentar.",
    hProfile: "Define cuánto mejor debe ser una ruta para que el plugin cambie. Estable: cambia poco, solo con gran mejora. Equilibrado: recomendado para la mayoría. Agresivo: cambia con poca mejora, así que puede cambiar más veces.",
    hRelays: "Un relay es un servidor tuyo que sirve de camino alternativo. Es opcional: sin relay, NoLag solo mide tu conexión.",
    hRelayCode: "Pega aquí el código generado por relay-setup.sh. Solo hace falta si creaste un relay.",
    hLang: "Idioma de la interfaz del plugin.",
  },
};

export function normalizeLang(value: unknown): Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value)
    ? (value as Lang)
    : "pt";
}
