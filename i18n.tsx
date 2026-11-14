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
  activeRoute: string;
  routeDirect: string;
  direct: string;
  metricsHint: string;
  route: string;
  enable: string;
  enableDesc: string;
  target: string;
  targetDesc: string;
  errTargetInvalid: string;
  errToolsMissing: string;
  errNoTarget: string;
  errNoRelays: string;
  errSetup: string;
  errUnexpected: string;
  relayInvalid: string;
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
    activeRoute: "Rota atual",
    routeDirect: "Direta",
    direct: "Direta",
    metricsHint: "ping · jitter · perda",
    route: "Rota",
    enable: "Rota automática",
    enableDesc: "Escolhe sozinha o melhor caminho até o servidor do jogo",
    target: "IP do servidor do jogo",
    targetDesc: "Só o tráfego para este IP é desviado",
    errTargetInvalid: "IP inválido ou privado",
    errToolsMissing: "Faltam ferramentas",
    errNoTarget: "Informe o IP do servidor",
    errNoRelays: "Coloque os arquivos .conf do WireGuard em",
    errSetup: "Nenhum relay funcionou",
    errUnexpected: "Erro inesperado, veja o log",
    relayInvalid: "Arquivo inválido",
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
    activeRoute: "Current route",
    routeDirect: "Direct",
    direct: "Direct",
    metricsHint: "ping · jitter · loss",
    route: "Route",
    enable: "Automatic route",
    enableDesc: "Picks the best path to the game server on its own",
    target: "Game server IP",
    targetDesc: "Only traffic to this IP is rerouted",
    errTargetInvalid: "Invalid or private IP",
    errToolsMissing: "Missing tools",
    errNoTarget: "Enter the server IP",
    errNoRelays: "Put the WireGuard .conf files in",
    errSetup: "No relay worked",
    errUnexpected: "Unexpected error, check the log",
    relayInvalid: "Invalid file",
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
    activeRoute: "Ruta actual",
    routeDirect: "Directa",
    direct: "Directa",
    metricsHint: "ping · jitter · pérdida",
    route: "Ruta",
    enable: "Ruta automática",
    enableDesc: "Elige sola el mejor camino hasta el servidor del juego",
    target: "IP del servidor del juego",
    targetDesc: "Solo se desvía el tráfico hacia esta IP",
    errTargetInvalid: "IP inválida o privada",
    errToolsMissing: "Faltan herramientas",
    errNoTarget: "Indica la IP del servidor",
    errNoRelays: "Pon los archivos .conf de WireGuard en",
    errSetup: "Ningún relay funcionó",
    errUnexpected: "Error inesperado, revisa el log",
    relayInvalid: "Archivo inválido",
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
