import { callable } from "@decky/api";
import type { Lang } from "./i18n";

export type Profile = "stable" | "balanced" | "aggressive";

export interface GameProfile {
  name: string;
  auto: boolean;
  profile: Profile;
}

export interface Settings {
  language: Lang;
  enabled: boolean;
  profile: Profile;
  collapsed: Record<string, boolean>;
  games: Record<string, GameProfile>;
}

export interface Metrics {
  avg: number | null;
  jitter: number | null;
  loss: number;
}

export interface RelayStatus {
  name: string;
  iface: string;
  endpoint: string;
  valid: boolean;
  error: string;
  metrics: Metrics | null;
  score: number | null;
}

export interface Diag {
  pids: number;
  ports: number;
  seen: number;
  top: [string, number][];
}

export interface Status {
  phase: "off" | "starting" | "waiting" | "running" | "error";
  active: string;
  game: string;
  appid: string;
  target: string;
  direct: Metrics | null;
  direct_score: number | null;
  relays: RelayStatus[];
  error: string;
  detail: string;
  notice: string;
  diag: Diag;
  history: Record<string, (number | null)[]>;
}

export interface Relay {
  name: string;
  endpoint: string;
  builtin: boolean;
}

export interface AddRelayResult {
  ok: boolean;
  error: string;
  relays: Relay[];
}

export const getSettings = callable<[], Settings>("get_settings");
export const setSettings = callable<[Partial<Settings>], Settings>("set_settings");
export const setRouteEnabled = callable<[boolean], Status>("set_enabled");
export const getStatus = callable<[], Status>("get_status");
export const getRelays = callable<[], Relay[]>("get_relays");
export const addRelay = callable<[string], AddRelayResult>("add_relay");
export const removeRelay = callable<[string], Relay[]>("remove_relay");
export const setGameAuto = callable<[string, boolean], Settings>("set_game_auto");
export const deleteGame = callable<[string], Settings>("delete_game");
