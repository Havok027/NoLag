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
  },
};

export function normalizeLang(value: unknown): Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value)
    ? (value as Lang)
    : "pt";
}
