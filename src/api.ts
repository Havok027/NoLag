import { callable } from "@decky/api";
import type { Lang } from "./i18n";

export type Profile = "stable" | "balanced" | "aggressive";

export interface GameProfile {
  name: string;
  auto: boolean;
  profile: Profile;
  wifi?: boolean;
  mudfish?: boolean;
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

// ---- Módulo Mudfish (independente do Wi-Fi e da rota) ----

export interface MudfishResult {
  ok: boolean;
  error: string;
  detail?: string;
  version?: string;
}

export interface MudfishStatus {
  arch_ok?: boolean;
  installed: boolean;
  version?: string;
  mounted?: boolean;
  running: boolean;
  port_open?: boolean;
  phase: "off" | "installing" | "starting" | "running" | "stopping" | "error";
  error: string;
  detail?: string;
  user?: string;
  has_password?: boolean;
  keep_on?: boolean;
  ping_target?: string;
  ping_before?: Metrics | null;
  ping_after?: Metrics | null;
  webui?: string;
}

export interface RouteInfo {
  dev: string;
  src: string;
  via: string;
  target?: string;
}

export interface MudfishPing {
  ok: boolean;
  which?: "before" | "after";
  metrics?: Metrics | null;
}

export interface Snapshot {
  route: RouteInfo;
  ping: Metrics | null;
  modules: {
    mudfish?: MudfishStatus;
    wifi?: { connected: boolean; live?: WifiLive };
  };
}

export interface CurrentGame {
  appid: string;
  name: string;
}

export const mudfishAvailable = callable<[], { available: boolean; error: string }>("mudfish_available");
export const mudfishGetStatus = callable<[], MudfishStatus>("mudfish_get_status");
export const mudfishInstall = callable<[], MudfishResult>("mudfish_install");
export const mudfishSetEnabled = callable<[enabled: boolean], MudfishResult>("mudfish_set_enabled");
export const mudfishSetCredentials = callable<[user: string, password: string], MudfishResult>("mudfish_set_credentials");
export const mudfishClearCredentials = callable<[], MudfishResult>("mudfish_clear_credentials");
export const mudfishSetPingTarget = callable<[target: string], { ok: boolean; target: string }>("mudfish_set_ping_target");
export const mudfishGetRoute = callable<[], RouteInfo & { running: boolean }>("mudfish_get_route");
export const mudfishTestPing = callable<[], MudfishPing>("mudfish_test_ping");
export const getSnapshot = callable<[], Snapshot>("get_snapshot");
export const getCurrentGame = callable<[], CurrentGame>("get_current_game");
export const setGameModule = callable<[appid: string, module: "wifi" | "mudfish", value: boolean], Settings>("set_game_module");
