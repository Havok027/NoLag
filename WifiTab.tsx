import { ButtonItem, DropdownItem, PanelSectionRow, ToggleField } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import {
  WifiResult,
  WifiStatus,
  wifiAvailable,
  wifiGetStatus,
  wifiOptimizeSafe,
  wifiReset,
  wifiSetAutoFix,
  wifiSetBand,
  wifiSetBssidLock,
  wifiSetBuffers,
  wifiSetCake,
  wifiSetDns,
  wifiSetIpv6,
  wifiSetPowerSave,
  wifiSetStreaming,
  wifiSetWatchdog,
} from "./api";
import { Card, Collapsible, Help } from "./components";
import type { Texts } from "./i18n";

const DASH = "—";
const POLL_MS = 6000;
const DNS_OPTIONS = ["cloudflare", "google", "quad9"];

interface Props {
  t: Texts;
  helpOn: boolean;
  isCollapsed: (key: string) => boolean;
  toggleSection: (key: string, value: boolean) => void;
}

export function activeCount(s: WifiStatus | null): number {
  const c = s?.settings;
  if (!c) return 0;
  return [
    c.power_save_disabled,
    c.buffer_tuning_enabled,
    c.cake_enabled,
    c.ipv6_disabled,
    c.bssid_lock_enabled,
    c.band_preference_enabled,
    c.dns_enabled,
    c.streaming_mode_enabled,
    c.link_watchdog_enabled,
    c.auto_fix_on_wake,
  ].filter(Boolean).length;
}

export function useWifi(t: Texts) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<WifiStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const alive = useRef(true);

  const refresh = async () => {
    try {
      const s = await wifiGetStatus();
      if (alive.current && s && s.success !== false) setStatus(s);
    } catch {
      /* o próximo ciclo tenta de novo */
    }
  };

  useEffect(() => {
    alive.current = true;
    wifiAvailable()
      .then((r) => {
        if (!alive.current) return;
        setAvailable(!!r?.available);
        setLoadError(r?.error || "");
      })
      .catch((e) => {
        if (!alive.current) return;
        setAvailable(false);
        setLoadError(`wifi_available: ${String(e).slice(0, 160)}`);
      });
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, []);

  const run = async (job: () => Promise<WifiResult>) => {
    if (busy) return;
    setBusy(true);
    setNote(t.wifiWorking);
    try {
      const r = await job();
      setNote(r && r.success ? t.wifiDone : r?.message || r?.error || t.wifiFailed);
    } catch {
      setNote(t.wifiFailed);
    }
    await refresh();
    if (alive.current) setBusy(false);
  };

  return { available, loadError, status, busy, note, run };
}

function badgeOf(t: Texts, status: WifiStatus | null) {
  if (!status) return { text: DASH, tone: "off" as const };
  if (!status.connected) return { text: t.wifiBadgeDown, tone: "warn" as const };
  return activeCount(status) > 0
    ? { text: t.wifiBadgeOn, tone: "good" as const }
    : { text: t.wifiBadgeOff, tone: "off" as const };
}

/** Cartão do Painel: independente da rota do NoLag. */
export function WifiCard({ t }: { t: Texts }) {
  const { available, status, busy, run } = useWifi(t);
  if (available === false) return <Card rows={[[t.tabWifi, t.wifiBadgeUnavailable]]} />;
  const badge = badgeOf(t, status);
  const on = activeCount(status) > 0;
  return (
    <>
      <Card badge={badge.text} tone={badge.tone} rows={[[t.tabWifi, `${t.wifiActiveCount}: ${status ? activeCount(status) : DASH}`]]} />
      <PanelSectionRow>
        <ToggleField
          label={t.wifiCardToggle}
          description={t.wifiCardToggleDesc}
          checked={on}
          disabled={busy || !status}
          onChange={(v) => run(() => (v ? wifiOptimizeSafe() : wifiReset()))}
        />
      </PanelSectionRow>
    </>
  );
}

export function WifiTab({ t, helpOn, isCollapsed, toggleSection }: Props) {
  const { available, loadError, status, busy, note, run } = useWifi(t);

  if (available === false) {
    return (
      <>
        <Card rows={[[t.wifiUnavailable, DASH]]} />
        {loadError && (
          <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", wordBreak: "break-word" }}>{loadError}</div>
        )}
      </>
    );
  }

  const cfg = status?.settings;
  const live = status?.live;
  const count = activeCount(status);
  const connected = !!status?.connected;
  const badge = badgeOf(t, status);

  const rows: [string, string][] = [
    [t.wifiConn, !status ? DASH : connected ? t.wifiConnected : t.wifiDisconnected],
    [t.wifiActiveCount, status ? String(count) : DASH],
  ];
  if (cfg?.device_label) rows.push([t.wifiDevice, cfg.device_label]);
  if (connected && live) {
    if (live.signal_dbm) rows.push([t.wifiSignal, `${live.signal_dbm}`]);
    if (live.band) rows.push([t.wifiBandRow, live.band]);
    if (live.tx_bitrate) rows.push([t.wifiRate, live.tx_bitrate]);
  }
  if (live?.streaming_active) rows.push([t.wifiStreamingNow, "✓"]);

  const bandValue = cfg?.band_preference_enabled ? cfg.band_preference : "off";
  const bandOptions = [
    { data: "off", label: t.wifiOff },
    { data: "a", label: "5 GHz" },
    { data: "bg", label: "2.4 GHz" },
    ...(cfg?.supports_6ghz ? [{ data: "6GHz", label: "6 GHz" }] : []),
  ];
  const dnsValue = cfg?.dns_enabled && DNS_OPTIONS.includes(cfg.dns_provider) ? cfg.dns_provider : "off";
  const dnsOptions = [
    { data: "off", label: t.wifiOff },
    { data: "cloudflare", label: "Cloudflare" },
    { data: "google", label: "Google" },
    { data: "quad9", label: "Quad9" },
  ];

  return (
    <>
      <Card badge={badge.text} tone={badge.tone} rows={rows} />
      {note && <div style={{ fontSize: 12, textAlign: "center", opacity: 0.8, marginBottom: 6 }}>{note}</div>}
      <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 8 }}>{t.wifiIndep}</div>
      <Help show={helpOn} text={t.hWifiStatus} />

      <Collapsible title={t.wifiSecMain} collapsed={isCollapsed("wifiMain")} onToggle={(v) => toggleSection("wifiMain", v)}>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiPowerSave}
            description={t.wifiPowerSaveDesc}
            checked={!!cfg?.power_save_disabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetPowerSave(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiAutoFix}
            description={t.wifiAutoFixDesc}
            checked={!!cfg?.auto_fix_on_wake}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetAutoFix(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiBuffers}
            description={t.wifiBuffersDesc}
            checked={!!cfg?.buffer_tuning_enabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetBuffers(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiCake}
            description={t.wifiCakeDesc}
            checked={!!cfg?.cake_enabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetCake(v))}
          />
        </PanelSectionRow>
        <Help show={helpOn} text={t.hWifiMain} />
      </Collapsible>

      <Collapsible title={t.wifiSecAdv} collapsed={isCollapsed("wifiAdv")} onToggle={(v) => toggleSection("wifiAdv", v)}>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiIpv6}
            description={t.wifiIpv6Desc}
            checked={!!cfg?.ipv6_disabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetIpv6(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiLock}
            description={t.wifiLockDesc}
            checked={!!cfg?.bssid_lock_enabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetBssidLock(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t.wifiBand}
            description={t.wifiBandDesc}
            rgOptions={bandOptions}
            selectedOption={bandValue}
            disabled={busy || !status}
            onChange={(opt) => run(() => (opt.data === "off" ? wifiSetBand(false, cfg?.band_preference || "a") : wifiSetBand(true, String(opt.data))))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label={t.wifiDns}
            description={t.wifiDnsDesc}
            rgOptions={dnsOptions}
            selectedOption={dnsValue}
            disabled={busy || !status}
            onChange={(opt) => run(() => (opt.data === "off" ? wifiSetDns(false, dnsValue === "off" ? "cloudflare" : dnsValue, "") : wifiSetDns(true, String(opt.data), "")))}
          />
        </PanelSectionRow>
        <Help show={helpOn} text={t.hWifiAdv} />
      </Collapsible>

      <Collapsible title={t.wifiSecStream} collapsed={isCollapsed("wifiStream")} onToggle={(v) => toggleSection("wifiStream", v)}>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiStreaming}
            description={t.wifiStreamingDesc}
            checked={!!cfg?.streaming_mode_enabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetStreaming(v))}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t.wifiWatchdog}
            description={t.wifiWatchdogDesc}
            checked={!!cfg?.link_watchdog_enabled}
            disabled={busy || !status}
            onChange={(v) => run(() => wifiSetWatchdog(v))}
          />
        </PanelSectionRow>
        <Help show={helpOn} text={t.hWifiStream} />
      </Collapsible>

      <Collapsible title={t.wifiSecActions} collapsed={isCollapsed("wifiActions")} onToggle={(v) => toggleSection("wifiActions", v)}>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={busy || !status} onClick={() => run(() => wifiOptimizeSafe())}>
            {t.wifiOptimizeAll}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={busy || !status} onClick={() => run(() => wifiReset())}>
            {t.wifiRestore}
          </ButtonItem>
        </PanelSectionRow>
        <Help show={helpOn} text={t.hWifiActions} />
      </Collapsible>
    </>
  );
}
