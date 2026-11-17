import { toaster } from "@decky/api";
import { ButtonItem, Navigation, PanelSectionRow, TextField, ToggleField } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Metrics,
  MudfishLive,
  MudfishPing,
  MudfishResult,
  MudfishStatus,
  RouteInfo,
  Snapshot,
  getSnapshot,
  mudfishAvailable,
  mudfishClearCredentials,
  mudfishGetLive,
  mudfishResetSession,
  mudfishSetCredentials,
  mudfishGetLogs,
  mudfishGetRoute,
  mudfishGetStatus,
  mudfishCheckUpdate,
  mudfishInstall,
  mudfishUpdate,
  mudfishSetEnabled,
  mudfishSetPingTarget,
  mudfishSetOption,
  mudfishTestPing,
} from "./api";
import { FaCog, FaFileAlt, FaPercent, FaUser, FaWaveSquare } from "react-icons/fa";
import { Box, Card, ChartLine, Collapsible, Help, LineChart, MiniCard, Ring } from "./components";
import type { Texts } from "./i18n";

const DASH = "—";
const POLL_MS = 4000;
const SNAP_MS = 8000;

interface Props {
  t: Texts;
  helpOn: boolean;
  isCollapsed: (key: string) => boolean;
  toggleSection: (key: string, value: boolean) => void;
}

export function mudfishError(t: Texts, code: string): string {
  switch (code) {
    case "not_installed":
      return t.mfErrNotInstalled;
    case "mount_failed":
      return t.mfErrMount;
    case "download_failed":
      return t.mfErrDownload;
    case "install_failed":
      return t.mfErrInstall;
    case "start_failed":
      return t.mfErrStart;
    case "exited":
      return t.mfErrExited;
    case "busy":
      return t.mfErrBusy;
    case "unsupported_arch":
      return t.mfErrArch;
    case "bad_option":
      return t.mfErrBadOption;
    case "bad_credentials":
      return t.mfErrBadCreds;
    case "port_closed":
      return t.mfErrPortClosed;
    case "fullvpn_blocked":
      return t.mfErrFullVpn;
    case "update_check_failed":
      return t.mfErrUpdateCheck;
    default:
      return t.mfErrGeneric;
  }
}

// Mensagem da falha + o motivo exato vindo do backend (rede, extração, montagem, log do serviço).
export function mudfishErrorFull(t: Texts, code: string, detail?: string): string {
  const base = mudfishError(t, code);
  const why = (detail || "").trim();
  return why ? `${base}: ${why}` : base;
}

function msText(m: Metrics | null | undefined): string {
  return m && m.avg !== null ? `${m.avg.toFixed(0)} ms` : DASH;
}

function jitterText(m: Metrics | null | undefined): string {
  return m && m.jitter !== null ? `${m.jitter.toFixed(1)} ms` : DASH;
}

export function mfBadge(t: Texts, s: MudfishStatus | null) {
  if (!s) return { text: DASH, tone: "off" as const };
  if (s.phase === "error" && s.error) return { text: t.mfBadgeError, tone: "bad" as const };
  if (s.phase === "installing" || s.phase === "starting" || s.phase === "stopping")
    return { text: t.mfBadgeBusy, tone: "warn" as const };
  if (!s.installed) return { text: t.mfBadgeMissing, tone: "off" as const };
  return s.running ? { text: t.mfBadgeOn, tone: "good" as const } : { text: t.mfBadgeOff, tone: "off" as const };
}

export function useMudfish(t: Texts) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<MudfishStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const alive = useRef(true);

  const refresh = async () => {
    try {
      const s = await mudfishGetStatus();
      if (alive.current && s) setStatus(s);
    } catch {
      /* o próximo ciclo tenta de novo */
    }
  };

  useEffect(() => {
    alive.current = true;
    mudfishAvailable()
      .then((r) => {
        if (!alive.current) return;
        setAvailable(!!r?.available);
        setLoadError(r?.error || "");
      })
      .catch((e) => {
        if (!alive.current) return;
        setAvailable(false);
        setLoadError(`mudfish_available: ${String(e).slice(0, 160)}`);
      });
    refresh();
    // Confere a versão nova do núcleo (o backend guarda o resultado por 6 h; só informa, não instala).
    mudfishCheckUpdate()
      .then(() => refresh())
      .catch(() => {
        /* sem rede ou sem módulo: o aviso simplesmente não aparece */
      });
    const id = setInterval(refresh, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, []);

  const run = async (job: () => Promise<MudfishResult>, okText?: string) => {
    if (busy) return;
    setBusy(true);
    let ok = false;
    let msg = t.mfErrGeneric;
    try {
      const r = await job();
      ok = !!r && r.ok === true;
      msg = ok ? okText || t.mfToastOk : mudfishErrorFull(t, r?.error || "", r?.detail);
    } catch {
      ok = false;
    }
    setNote(msg);
    try {
      toaster.toast({ title: ok ? t.mfToastOk : t.mfToastFail, body: msg, duration: ok ? 4000 : 10000 });
    } catch {
      /* sem aviso na tela, o texto da aba continua */
    }
    await refresh();
    if (alive.current) setBusy(false);
  };

  return { available, loadError, status, busy, note, run, refresh };
}

/** Tabela de métricas da conexão no Painel, sob demanda e a cada poucos segundos. */
export function ConnCard({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const alive = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
      const s = await getSnapshot();
      if (alive.current && s) setSnap(s);
    } catch {
      /* mantém a última leitura */
    }
    if (alive.current) setLoading(false);
  };

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(load, SNAP_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, []);

  const mud = snap?.modules?.mudfish;
  const wifi = snap?.modules?.wifi;
  const route = snap?.route;
  const rows: [string, string][] = [
    [t.connWifi, wifi ? (wifi.connected ? t.wifiBadgeOn : t.wifiBadgeDown) : DASH],
    [t.connMudfish, mud ? (mud.running ? t.mfRunning : t.mfStopped) : DASH],
    [t.connIface, route?.dev || DASH],
    [t.connIp, route?.src || DASH],
    [t.connRoute, route?.via || DASH],
    [t.connPing, msText(snap?.ping)],
    [t.connJitter, jitterText(snap?.ping)],
  ];
  return (
    <>
      <Card rows={rows} />
      <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 12 }}>{t.connHint}</div>
      <Help show={helpOn} text={t.hConn} />
      <PanelSectionRow>
        <ButtonItem layout="inline" label={t.connTitle} disabled={loading} onClick={load}>
          {t.mfRefresh}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}

function pingRows(t: Texts, s: MudfishStatus | null): [string, string][] {
  const before = s?.ping_before ?? null;
  const after = s?.ping_after ?? null;
  return [
    [t.mfPingBefore, before ? `${msText(before)} · ${jitterText(before)}` : DASH],
    [t.mfPingAfter, after ? `${msText(after)} · ${jitterText(after)}` : DASH],
  ];
}

const WARN_BOX: CSSProperties = {
  fontSize: 12,
  padding: "8px 10px",
  margin: "0 0 12px 0",
  lineHeight: 1.45,
  whiteSpace: "pre-line",
  borderRadius: 8,
  border: "1px solid rgba(255,200,0,0.7)",
  background: "rgba(255,200,0,0.12)",
  color: "#ffd84a",
  wordBreak: "break-word",
};

/** Aviso fixo de créditos: sem downloads com o Mudfish ligado e sem VPN total. */
export function MfWarning({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  return (
    <>
      <div style={WARN_BOX}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.mfWarnTitle}</div>
        <div style={{ marginBottom: 6 }}>{t.mfWarnDownload}</div>
        <div>{t.mfWarnSplit}</div>
      </div>
      <Help show={helpOn} text={t.hMfWarn} />
    </>
  );
}

const PILL: CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 700,
  padding: "3px 10px",
  margin: "0 0 10px 0",
  borderRadius: 12,
  color: "#eafff3",
  background: "rgba(31, 143, 85, 0.75)",
  border: "1px solid #3ddc84",
};

const CHART_MAX = 30;
type Sample = { b: Metrics | null; t: Metrics | null };
const avg = (xs: number[]) => (xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : null);

const lossText = (m: Metrics | null | undefined) => (m && typeof m.loss === "number" ? `${+m.loss.toFixed(1)} %` : DASH);

/** Telemetria do Painel: anel de ping com gráfico ao vivo e, abaixo, jitter e perda de pacotes (Com / Sem Mudfish). */
export function LiveChart({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [live, setLive] = useState<MudfishLive | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const tick = async () => {
      try {
        const r = await mudfishGetLive();
        if (!alive.current || !r || r.ok === false) return;
        setLive(r);
        setSamples((cur) => [...cur, { b: r.base ?? null, t: r.tunnel ?? null }].slice(-CHART_MAX));
      } catch {
        /* mantém o gráfico como está */
      }
    };
    tick();
    const id = setInterval(tick, SNAP_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, []);

  const build = (key: string, label: string, color: string, dashed: boolean, pick: (x: Sample) => Metrics | null): ChartLine => {
    const ms = samples.map(pick);
    const pa = avg(ms.map((m) => m?.avg).filter((v): v is number => typeof v === "number"));
    return {
      key,
      label,
      color,
      dashed,
      values: ms.map((m) => (typeof m?.avg === "number" ? m.avg : null)),
      avg: pa === null ? DASH : `${pa.toFixed(0)} ms`,
      best: false,
    };
  };
  const without = build("off", t.chartWithout, "#9aa4b2", true, (x) => x.b);
  const lines = [without];
  const withOn = !!live?.running && samples.some((x) => x.t !== null);
  if (withOn) lines.push(build("on", t.chartWith, "#3ddc84", false, (x) => x.t));

  const last = samples.length ? samples[samples.length - 1] : null;
  const lastBase = last?.b ?? null;
  const lastWith = withOn ? last?.t ?? null : null;
  const main = lastWith ?? lastBase;
  const ringColor = lastWith ? "#3ddc84" : "#7c8cff";
  const pingNow = main && typeof main.avg === "number" ? main.avg : null;

  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 14, margin: "6px 0 10px" }}>{t.chartTitle}</div>
      {live?.only_game && <div style={PILL}>{t.onlyGameBadge}</div>}
      {live?.full_vpn && <div style={WARN_BOX}>{t.mfFullVpnWarn}</div>}
      <Box style={{ padding: "12px 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Ring value={pingNow} max={200} color={ringColor} unit="ms" sub={lastWith ? t.chartWith : t.chartWithout} />
            {lastWith && (
              <div style={{ fontSize: 11, color: "#9aa4b2", textAlign: "center" }}>
                {t.chartWithout}: {msText(lastBase)}
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <LineChart lines={lines} emptyText={t.chartEmpty} bestTag={t.chartBest} compact />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 10, opacity: 0.85, marginTop: 4 }}>
              <span style={{ color: "#9aa4b2" }}>- - {t.chartWithout}</span>
              {withOn && <span style={{ color: "#3ddc84" }}>— {t.chartWith}</span>}
            </div>
          </div>
        </div>
      </Box>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8, marginBottom: 10, alignItems: "stretch" }}>
        <MiniCard
          icon={<FaWaveSquare size={13} />}
          title={`${t.connJitter} (ms)`}
          value={jitterText(main)}
          withLabel={t.chartWith}
          withValue={jitterText(lastWith)}
          withoutLabel={t.chartWithout}
          withoutValue={jitterText(lastBase)}
          withOn={!!lastWith}
        />
        <MiniCard
          icon={<FaPercent size={12} />}
          title={t.tmLoss}
          value={lossText(main)}
          withLabel={t.chartWith}
          withValue={lossText(lastWith)}
          withoutLabel={t.chartWithout}
          withoutValue={lossText(lastBase)}
          withOn={!!lastWith}
        />
      </div>
      {live?.running && !live.tunnel_iface && !live.full_vpn && <div style={SMALL}>{t.chartNoTunnel}</div>}
      {live?.running && live.tunnel_waiting && <div style={SMALL}>{t.chartTunnelWaiting}</div>}
      {live?.running && live.tunnel_blocked && <div style={SMALL}>{t.chartTunnelBlocked}</div>}
      <Help show={helpOn} text={t.hChart} />
    </>
  );
}

const SMALL: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.45,
  opacity: 0.75,
  textAlign: "center",
  marginBottom: 10,
  wordBreak: "break-word",
  whiteSpace: "pre-line",
};
const MONO: CSSProperties = { fontSize: 10, opacity: 0.8, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 12 };

/** Aba Rotas: fluxo guiado (instalar, entrar, ativar), perfil de desempenho e opções avançadas. */
export function MudfishTab({ t, helpOn, isCollapsed, toggleSection }: Props) {
  const { available, loadError, status, busy, note, run, refresh } = useMudfish(t);
  const [target, setTarget] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const [pingNote, setPingNote] = useState("");
  const [logs, setLogs] = useState<{ service: string; install: string } | null>(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const filled = useRef(false);

  useEffect(() => {
    if (status && !filled.current) {
      filled.current = true;
      setTarget(status.ping_target ?? "");
      setUser(status.user ?? "");
    }
  }, [status]);

  const loadRoute = () =>
    mudfishGetRoute()
      .then((r) => setRoute(r))
      .catch(() => {});

  useEffect(() => {
    loadRoute();
  }, [status?.running]);

  if (available === false) {
    return (
      <>
        <Card rows={[[t.mfUnavailable, DASH]]} />
        {loadError && <div style={SMALL}>{loadError}</div>}
      </>
    );
  }

  const badge = mfBadge(t, status);
  const working = status?.phase === "installing" || status?.phase === "starting" || status?.phase === "stopping";
  const installed = !!status?.installed;
  const step = status?.step ?? "install";
  const done = (v: boolean) => (v ? t.mfDone : t.mfPending);

  const rows: [string, string][] = [
    [t.mfStepInstall, installed ? `${t.mfDone} · ${status?.version ?? ""}` : t.mfPending],
    [t.mfStepLogin, status?.login_done ? t.mfAccConnected : t.mfAccWaiting],
    [t.mfStepActivate, done(!!status?.running)],
  ];
  if (status?.running) {
    rows.push([t.mfApiRow, status.api_ok ? t.mfApiOk : t.mfApiDown]);
    const r = status.rtt;
    if (status.api_ok && r) {
      const st = r.static === "ready" && r.vnodes === "ready" ? t.mfRttReady : r.static === "error" && r.vnodes === "error" ? t.mfRttError : t.mfRttPending;
      rows.push([t.mfRttRow, st]);
    }
  }
  if (status?.phase === "error" && status.error) rows.push([t.mfBadgeError, mudfishErrorFull(t, status.error, status.detail)]);

  const hint = step === "install" ? t.mfHintInstall : step === "login" ? t.mfHintLogin : t.mfHintActivate;
  const optNote =
    status?.option_state === "applied"
      ? t.mfOptApplied
      : status?.option_state === "api_unmapped"
      ? t.mfOptPending
      : status?.option_state === "failed"
      ? t.mfOptFailed
      : "";
  const autoSel = status?.auto_selection !== false;
  const multipath = status?.multipath === true;

  const changeTarget = (value: string) => {
    setTarget(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      mudfishSetPingTarget(value)
        .then((r) => {
          if (r?.target) setTarget(r.target);
          return refresh().then(loadRoute);
        })
        .catch(() => {});
    }, 900);
  };

  const testPing = async () => {
    if (testing) return;
    setTesting(true);
    setPingNote(t.mfPingTesting);
    let msg = t.mfPingFail;
    try {
      const r: MudfishPing = await mudfishTestPing();
      if (r?.ok) msg = `${r.which === "after" ? t.mfPingAfter : t.mfPingBefore}: ${msText(r.metrics)}`;
    } catch {
      /* mantém o aviso de falha */
    }
    setPingNote(msg);
    await refresh();
    setTesting(false);
  };

  const openWeb = () => {
    try {
      Navigation.CloseSideMenus();
      Navigation.NavigateToExternalWeb(status?.webui || "http://127.0.0.1:8282");
    } catch {
      /* sem navegador interno, nada a fazer */
    }
  };

  const loadLogs = () =>
    mudfishGetLogs()
      .then((r) => setLogs({ service: r?.service ?? "", install: r?.install ?? "" }))
      .catch(() => setLogs({ service: "", install: "" }));

  const saveAccount = () =>
    run(async () => {
      const r = await mudfishSetCredentials(user, pass);
      if (r?.ok) setPass("");
      return r;
    }, t.mfAccSaved);

  const clearAccount = () =>
    run(async () => {
      const r = await mudfishClearCredentials();
      if (r?.ok) {
        setUser("");
        setPass("");
      }
      return r;
    }, t.mfAccCleared);

  if (status && status.arch_ok === false) return <Card rows={[[t.mfErrArch, DASH]]} />;

  return (
    <>
      <MfWarning t={t} helpOn={helpOn} />
      <Card badge={badge.text} tone={badge.tone} rows={rows} />
      {status?.update?.available && (
        <>
          <div style={WARN_BOX}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.mfUpdateTitle}</div>
            <div>{t.mfUpdateAvail.replace("{v}", status.update.latest).replace("{c}", status.update.installed)}</div>
          </div>
          <PanelSectionRow>
            <ButtonItem layout="below" disabled={busy || working} onClick={() => run(() => mudfishUpdate(), t.mfUpdateOk)}>
              {t.mfUpdateBtn.replace("{v}", status.update.latest)}
            </ButtonItem>
          </PanelSectionRow>
        </>
      )}
      {status?.phase === "installing" && <div style={SMALL}>{t.mfInstalling}</div>}
      {status?.phase !== "installing" && note && <div style={SMALL}>{note}</div>}
      <div style={SMALL}>{hint}</div>
      {step !== "activate" && (
        <div style={WARN_BOX}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.mfFirstTitle}</div>
          <div>{t.mfFirstSteps}</div>
        </div>
      )}
      <Help show={helpOn} text={t.hMfFirst} />
      {step === "install" && (
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfInstall}
            description={t.mfInstallDesc}
            disabled={busy || working}
            onClick={() => run(() => mudfishInstall(), t.mfInstallOk)}
          >
            {t.mfInstall}
          </ButtonItem>
        </PanelSectionRow>
      )}
      {step === "login" && (
        <>
          <PanelSectionRow>
            <ToggleField
              label={t.mfToggle}
              description={t.mfToggleDesc}
              checked={!!status?.running}
              disabled={busy || working || !installed}
              onChange={(v) => run(() => mudfishSetEnabled(v), v ? t.mfOn : t.mfOff)}
            />
          </PanelSectionRow>
        </>
      )}
      {step === "activate" && (
        <PanelSectionRow>
          <ToggleField
            label={t.mfToggle}
            description={t.mfToggleDesc}
            checked={!!status?.running}
            disabled={busy || working || !installed}
            onChange={(v) => run(() => mudfishSetEnabled(v), v ? t.mfOn : t.mfOff)}
          />
        </PanelSectionRow>
      )}
      {(installed || !!status?.running) && (
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfOpenWeb}
            description={t.mfOpenWebDesc}
            disabled={!status?.port_open}
            onClick={openWeb}
          >
            {t.mfOpenWeb}
          </ButtonItem>
        </PanelSectionRow>
      )}
      <Help show={helpOn} text={t.hMfFlow} />
      {installed && (
        <>
          <PanelSectionRow>
            <ToggleField
              label={t.mfAutoSel}
              description={t.mfAutoSelDesc}
              checked={autoSel}
              disabled={busy}
              onChange={(v) => run(() => mudfishSetOption("auto_selection", v), t.mfOptSaved)}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hMfAutoSel} />
          <PanelSectionRow>
            <ToggleField
              label={t.mfMultiPath}
              description={t.mfMultiPathDesc}
              checked={multipath}
              disabled={busy}
              onChange={(v) => run(() => mudfishSetOption("multipath", v), t.mfOptSaved)}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hMfMultiPath} />
          {optNote && <div style={SMALL}>{optNote}</div>}
        </>
      )}
      {route?.full_vpn && <div style={WARN_BOX}>{t.mfFullVpnWarn}</div>}
      <Collapsible
        title={t.mfAccTitle}
        icon={<FaUser size={14} />}
        summary={status?.login_done ? t.mfAccConnected : t.mfAccWaiting}
        collapsed={isCollapsed("mudfishAcc")} onToggle={(v) => toggleSection("mudfishAcc", v)}>
        <div style={SMALL}>{t.mfAccDesc}</div>
        <PanelSectionRow>
          <TextField label={t.mfUser} value={user} onChange={(e) => setUser(e.target.value)} />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label={status?.has_password ? t.mfPassKept : t.mfPass}
            bIsPassword
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="inline" label={t.mfAccSave} disabled={busy || !user.trim()} onClick={saveAccount}>
            {t.mfAccSave}
          </ButtonItem>
        </PanelSectionRow>
        {(status?.user || status?.has_password) && (
          <PanelSectionRow>
            <ButtonItem layout="inline" label={t.mfAccClear} disabled={busy} onClick={clearAccount}>
              {t.mfAccClear}
            </ButtonItem>
          </PanelSectionRow>
        )}
        <Help show={helpOn} text={t.hMfAcc} />
      </Collapsible>
      <Collapsible
        title={t.mfAdvTitle}
        icon={<FaCog size={14} />}
        summary={`${t.mfPort} 8282`}
        collapsed={isCollapsed("mudfishAdv")} onToggle={(v) => toggleSection("mudfishAdv", v)}>
        <Card
          rows={[
            [t.mfAdvWebui, status?.webui || "http://127.0.0.1:8282"],
            [t.mfPort, status?.port_open ? t.mfPortOpen : t.mfPortClosed],
            [t.mfRouteIface, route?.dev || DASH],
            [t.mfRouteIp, route?.src || DASH],
            [t.mfRouteGw, route?.via || DASH],
            ...pingRows(t, status),
          ]}
        />
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={installed ? t.mfUpdate : t.mfInstall}
            description={t.mfInstallDesc}
            disabled={busy || working}
            onClick={() => run(() => mudfishInstall(), t.mfInstallOk)}
          >
            {installed ? t.mfUpdate : t.mfInstall}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfLoginReset}
            description={t.mfResetSessionDesc}
            disabled={busy}
            onClick={() => run(() => mudfishResetSession(), t.mfLoginResetDone)}
          >
            {t.mfLoginReset}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label={t.mfPingTarget}
            description={t.mfPingTargetDesc}
            value={target}
            onChange={(e) => changeTarget(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfPingTest}
            description={pingNote || t.mfPingTestDesc}
            disabled={testing}
            onClick={testPing}
          >
            {t.mfPingTest}
          </ButtonItem>
        </PanelSectionRow>
        <Collapsible
          title={t.mfLogsTitle}
          icon={<FaFileAlt size={14} />}
          summary={logs ? undefined : t.sumCollapsed}
          collapsed={isCollapsed("mudfishLogs")} onToggle={(v) => toggleSection("mudfishLogs", v)}>
          <PanelSectionRow>
            <ButtonItem layout="inline" label={t.mfLogsTitle} onClick={loadLogs}>
              {t.mfLogsLoad}
            </ButtonItem>
          </PanelSectionRow>
          {logs && (
            <>
              <div style={SMALL}>{t.mfLogService}</div>
              <div style={MONO}>{logs.service || t.mfLogEmpty}</div>
              <div style={SMALL}>{t.mfLogInstall}</div>
              <div style={MONO}>{logs.install || t.mfLogEmpty}</div>
            </>
          )}
        </Collapsible>
        <Help show={helpOn} text={t.hMfAdv} />
      </Collapsible>
    </>
  );
}
