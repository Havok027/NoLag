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
  route: string;
  enable: string;
  enableDesc: string;
  relaysTitle: string;
  relaysNone: string;
  relayCode: string;
  relayCodeDesc: string;
  relayAdded: string;
  relayBad: string;
  relayLimit: string;
  relayRemove: string;
  relayInvalid: string;
  errToolsMissing: string;
  errNoRelays: string;
  errSetup: string;
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
    route: "Rota",
    enable: "Rota automática",
    enableDesc: "Detecta o servidor do jogo e escolhe o melhor caminho",
    relaysTitle: "Relays",
    relaysNone: "Nenhum relay",
    relayCode: "Código do relay",
    relayCodeDesc: "Cole o código gerado pelo relay-setup.sh",
    relayAdded: "Relay adicionado",
    relayBad: "Código inválido",
    relayLimit: "Limite de 4 relays",
    relayRemove: "Remover",
    relayInvalid: "Falhou ao iniciar",
    errToolsMissing: "Faltam ferramentas",
    errNoRelays: "Adicione um relay em Relays",
    errSetup: "Nenhum relay funcionou",
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
    route: "Route",
    enable: "Automatic route",
    enableDesc: "Detects the game server and picks the best path",
    relaysTitle: "Relays",
    relaysNone: "No relays",
    relayCode: "Relay code",
    relayCodeDesc: "Paste the code printed by relay-setup.sh",
    relayAdded: "Relay added",
    relayBad: "Invalid code",
    relayLimit: "Limit of 4 relays",
    relayRemove: "Remove",
    relayInvalid: "Failed to start",
    errToolsMissing: "Missing tools",
    errNoRelays: "Add a relay under Relays",
    errSetup: "No relay worked",
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
    route: "Ruta",
    enable: "Ruta automática",
    enableDesc: "Detecta el servidor del juego y elige el mejor camino",
    relaysTitle: "Relays",
    relaysNone: "Sin relays",
    relayCode: "Código del relay",
    relayCodeDesc: "Pega el código generado por relay-setup.sh",
    relayAdded: "Relay añadido",
    relayBad: "Código inválido",
    relayLimit: "Límite de 4 relays",
    relayRemove: "Quitar",
    relayInvalid: "Falló al iniciar",
    errToolsMissing: "Faltan herramientas",
    errNoRelays: "Añade un relay en Relays",
    errSetup: "Ningún relay funcionó",
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
