import { callable } from "@decky/api";
import type { Lang } from "./i18n";

export interface Settings {
  language: Lang;
  enabled: boolean;
  target: string;
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

export interface Status {
  phase: "off" | "starting" | "running" | "error";
  active: string;
  direct: Metrics | null;
  direct_score: number | null;
  relays: RelayStatus[];
  error: string;
  detail: string;
}

export const getSettings = callable<[], Settings>("get_settings");
export const setSettings = callable<[Partial<Settings>], Settings>("set_settings");
export const setRouteEnabled = callable<[boolean], Status>("set_enabled");
export const getStatus = callable<[], Status>("get_status");
