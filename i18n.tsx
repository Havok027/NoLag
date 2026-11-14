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
  stateValue: string;
  settings: string;
  language: string;
  createdBy: string;
}

export const TEXTS: Record<Lang, Texts> = {
  pt: {
    status: "Status",
    state: "Estado",
    stateValue: "Base instalada",
    settings: "Config.",
    language: "Idioma",
    createdBy: "Criado por Havok",
  },
  en: {
    status: "Status",
    state: "State",
    stateValue: "Base installed",
    settings: "Settings",
    language: "Language",
    createdBy: "Created by Havok",
  },
  es: {
    status: "Estado",
    state: "Situación",
    stateValue: "Base instalada",
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
