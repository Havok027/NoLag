import { callable } from "@decky/api";
import type { Lang } from "./i18n";

export interface GameProfile {
  name: string;
  wifi?: boolean;
  mudfish?: boolean;
}

export interface Settings {
  language: Lang;
  collapsed: Record<string, boolean>;
  games: Record<string, GameProfile>;
}

export interface Metrics {
  avg: number | null;
  jitter: number | null;
  loss: number;
}

export const getSettings = callable<[], Settings>("get_settings");
export const setSettings = callable<[Partial<Settings>], Settings>("set_settings");
export const deleteGame = callable<[string], Settings>("delete_game");

// ---- Módulo Wi-Fi (independente do Mudfish) ----

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

// ---- Módulo Mudfish (independente do Wi-Fi) ----

export interface MudfishResult {
  ok: boolean;
  error: string;
  detail?: string;
  version?: string;
}

export interface MudfishRtt {
  static: "unknown" | "pending" | "ready" | "error";
  vnodes: "unknown" | "pending" | "ready" | "error";
  n_static?: number;
  n_vnodes?: number;
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
  auto_selection?: boolean;
  multipath?: boolean;
  auto_on_game?: boolean;
  session?: "active" | "inactive" | "unknown";
  api_ok?: boolean;
  full_vpn_api?: boolean;
  core_ready?: boolean | null;
  rtt?: MudfishRtt;
  user?: string;
  has_password?: boolean;
  option_state?: "" | "applied" | "api_unmapped" | "failed";
  login_done?: boolean;
  step?: "install" | "login" | "activate";
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
  full_vpn?: boolean;
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
export type MudfishOption = "auto_selection" | "multipath" | "auto_on_game" | "keep_on";
export const mudfishSetOption = callable<[key: MudfishOption, value: boolean], MudfishResult & { applied?: boolean; state?: string }>(
  "mudfish_set_option"
);
export interface MudfishLive {
  ok: boolean;
  running: boolean;
  base: Metrics | null;
  tunnel: Metrics | null;
  base_iface: string;
  tunnel_iface: string;
  full_vpn: boolean;
  only_game: boolean;
  tunnel_blocked?: boolean;
  rtt?: MudfishRtt;
}
export const mudfishGetLive = callable<[], MudfishLive>("mudfish_get_live");
export const mudfishSetCredentials = callable<[user: string, password: string], MudfishResult & { has_password?: boolean }>(
  "mudfish_set_credentials"
);
export const mudfishClearCredentials = callable<[], MudfishResult>("mudfish_clear_credentials");
export const mudfishResetSession = callable<[], MudfishResult & { logged_out?: boolean }>("mudfish_reset_session");
export const mudfishConfirmLogin = callable<[done: boolean], MudfishResult>("mudfish_confirm_login");
export const mudfishGetLogs = callable<[], { ok: boolean; service: string; install: string }>("mudfish_get_logs");
export const mudfishProbeApi = callable<[], { ok: boolean; error: string; detail?: string; requests?: number; paths?: number; file?: string }>(
  "mudfish_probe_api"
);
export const mudfishSetPingTarget = callable<[target: string], { ok: boolean; target: string }>("mudfish_set_ping_target");
export const mudfishGetRoute = callable<[], RouteInfo & { running: boolean }>("mudfish_get_route");
export const mudfishTestPing = callable<[], MudfishPing>("mudfish_test_ping");
export const getSnapshot = callable<[], Snapshot>("get_snapshot");
export const getCurrentGame = callable<[], CurrentGame>("get_current_game");
export const setGameModule = callable<[appid: string, module: "wifi" | "mudfish", value: boolean], Settings>("set_game_module");
