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

// ---- Módulo Wi-Fi (independente da rota e do Mudfish) ----

export interface WifiResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface WifiSettings {
  device_label: string;
  supports_6ghz: boolean;
  power_save_disabled: boolean;
  auto_fix_on_wake: boolean;
  bssid_lock_enabled: boolean;
  band_preference: string;
  band_preference_enabled: boolean;
  dns_provider: string;
  dns_enabled: boolean;
  ipv6_disabled: boolean;
  buffer_tuning_enabled: boolean;
  cake_enabled: boolean;
  streaming_mode_enabled: boolean;
  link_watchdog_enabled: boolean;
}

export interface WifiLive {
  signal_dbm?: string;
  tx_bitrate?: string;
  band?: string;
  streaming_active?: boolean;
}

export interface WifiStatus {
  success: boolean;
  connected: boolean;
  initializing?: boolean;
  settings: WifiSettings;
  live: WifiLive;
}

export interface WifiOptimizeResult extends WifiResult {
  total: number;
  applied: number;
}

export const wifiAvailable = callable<[], { available: boolean; error: string }>("wifi_available");
export const wifiGetStatus = callable<[], WifiStatus>("wifi_get_status");
export const wifiSetPowerSave = callable<[disabled: boolean], WifiResult>("wifi_set_power_save");
export const wifiSetAutoFix = callable<[enabled: boolean], WifiResult>("wifi_set_auto_fix");
export const wifiSetBssidLock = callable<[enabled: boolean], WifiResult>("wifi_set_bssid_lock");
export const wifiSetBand = callable<[enabled: boolean, band: string], WifiResult>("wifi_set_band_preference");
export const wifiSetDns = callable<[enabled: boolean, provider: string, servers: string], WifiResult>("wifi_set_dns");
export const wifiSetIpv6 = callable<[disabled: boolean], WifiResult>("wifi_set_ipv6");
export const wifiSetBuffers = callable<[enabled: boolean], WifiResult>("wifi_set_buffer_tuning");
export const wifiSetCake = callable<[enabled: boolean], WifiResult>("wifi_set_cake");
export const wifiSetStreaming = callable<[enabled: boolean], WifiResult>("wifi_set_streaming_mode");
export const wifiSetWatchdog = callable<[enabled: boolean], WifiResult>("wifi_set_link_watchdog");
export const wifiOptimizeSafe = callable<[], WifiOptimizeResult>("wifi_optimize_safe");
export const wifiReset = callable<[], WifiResult>("wifi_reset_settings");
