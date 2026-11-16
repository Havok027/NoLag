import { toaster } from "@decky/api";
import { ButtonItem, Navigation, PanelSectionRow, TextField, ToggleField } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Metrics,
  MudfishPing,
  MudfishResult,
  MudfishStatus,
  RouteInfo,
  Snapshot,
  getSnapshot,
  mudfishAvailable,
  mudfishConfirmLogin,
  mudfishGetLogs,
  mudfishGetRoute,
  mudfishGetStatus,
  mudfishInstall,
  mudfishProbeApi,
  mudfishSetEnabled,
  mudfishSetPingTarget,
  mudfishSetOption,
  mudfishTestPing,
} from "./api";
import { Card, ChartLine, Collapsible, Help, LineChart } from "./components";
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
    case "port_closed":
      return t.mfErrPortClosed;
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

/** Cartão do Painel: liga e desliga o Mudfish, independente do Wi-Fi e da rota. */
export function MudfishCard({ t }: { t: Texts }) {
  const { available, status, busy, run } = useMudfish(t);
  if (available === false) return <Card rows={[[t.mfStatusTitle, t.wifiBadgeUnavailable]]} />;
  const badge = mfBadge(t, status);
  const working = status?.phase === "installing" || status?.phase === "starting" || status?.phase === "stopping";
  return (
    <>
      <Card
        badge={badge.text}
        tone={badge.tone}
        rows={[[t.mfStatusTitle, status?.running ? t.mfRunning : status?.installed ? t.mfStopped : t.mfInstalledNo]]}
      />
      <PanelSectionRow>
        <ToggleField
          label={t.mfCardToggle}
          description={t.mfCardToggleDesc}
          checked={!!status?.running}
          disabled={busy || working || !status?.installed}
          onChange={(v) => run(() => mudfishSetEnabled(v), v ? t.mfOn : t.mfOff)}
        />
      </PanelSectionRow>
    </>
  );
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
      <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 8 }}>{t.connHint}</div>
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
  margin: "0 0 8px 0",
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
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.mfWarnTitle}</div>
        <div>{t.mfWarnDownload}</div>
        <div>{t.mfWarnSplit}</div>
      </div>
      <Help show={helpOn} text={t.hMfWarn} />
    </>
  );
}

const CHART_MAX = 30;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Gráfico ao vivo do Painel: ping e jitter com e sem o Mudfish, a cada 8 s. */
export function LiveChart({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  const [samples, setSamples] = useState<{ ping: number | null; jit: number | null; on: boolean }[]>([]);
  const [warn, setWarn] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const tick = async () => {
      try {
        const s = await getSnapshot();
        if (!alive.current || !s) return;
        const on = !!s.modules?.mudfish?.running;
        setWarn(on && !!s.route?.full_vpn);
        setSamples((cur) => [...cur, { ping: s.ping?.avg ?? null, jit: s.ping?.jitter ?? null, on }].slice(-CHART_MAX));
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

  const build = (on: boolean, key: string, label: string, color: string): ChartLine => {
    const mine = samples.filter((x) => x.on === on);
    const pa = avg(mine.map((x) => x.ping).filter((v): v is number => v !== null));
    const ja = avg(mine.map((x) => x.jit).filter((v): v is number => v !== null));
    return {
      key,
      label,
      color,
      values: samples.map((x) => (x.on === on ? x.ping : null)),
      avg: pa === null ? DASH : `${pa.toFixed(0)} ms · ${t.connJitter} ${ja === null ? DASH : ja.toFixed(1)} ms`,
      best: false,
    };
  };
  const without = build(false, "off", t.chartWithout, "#9aa4b2");
  const withMf = build(true, "on", t.chartWith, "#3ddc84");
  const mean = (l: ChartLine) => avg(l.values.filter((v): v is number => v !== null));
  const a = mean(without);
  const b = mean(withMf);
  if (a !== null && b !== null) {
    if (b < a) withMf.best = true;
    else if (a < b) without.best = true;
  }
  return (
    <>
      <div style={{ fontWeight: 600, fontSize: 13, margin: "4px 0" }}>{t.chartTitle}</div>
      {warn && <div style={WARN_BOX}>{t.mfFullVpnWarn}</div>}
      <LineChart lines={[without, withMf]} emptyText={t.chartEmpty} bestTag={t.chartBest} />
      <Help show={helpOn} text={t.hChart} />
    </>
  );
}

const SMALL: CSSProperties = { fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 6, wordBreak: "break-word" };
const MONO: CSSProperties = { fontSize: 10, opacity: 0.8, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 8 };

/** Aba Rotas: fluxo guiado (instalar, entrar, ativar), perfil de desempenho e opções avançadas. */
export function MudfishTab({ t, helpOn, isCollapsed, toggleSection }: Props) {
  const { available, loadError, status, busy, note, run, refresh } = useMudfish(t);
  const [target, setTarget] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const [pingNote, setPingNote] = useState("");
  const [logs, setLogs] = useState<{ service: string; install: string } | null>(null);
  const [probeNote, setProbeNote] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const filled = useRef(false);

  useEffect(() => {
    if (status && !filled.current) {
      filled.current = true;
      setTarget(status.ping_target ?? "");
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
    [t.mfStepLogin, done(!!status?.login_done)],
    [t.mfStepActivate, done(!!status?.running)],
  ];
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

  const probe = async () => {
    setProbeNote(t.mfProbing);
    let msg = t.mfProbeFail;
    try {
      const r = await mudfishProbeApi();
      if (r?.ok) msg = `${t.mfProbeOk}: ${r.requests ?? 0} / ${r.paths ?? 0}`;
      else msg = `${t.mfProbeFail}: ${mudfishErrorFull(t, r?.error ?? "", r?.detail)}`;
    } catch {
      /* mantém o aviso de falha */
    }
    setProbeNote(msg);
  };

  if (status && status.arch_ok === false) return <Card rows={[[t.mfErrArch, DASH]]} />;

  return (
    <>
      <MfWarning t={t} helpOn={helpOn} />
      <Card badge={badge.text} tone={badge.tone} rows={rows} />
      {status?.phase === "installing" && <div style={SMALL}>{t.mfInstalling}</div>}
      {status?.phase !== "installing" && note && <div style={SMALL}>{note}</div>}
      <div style={SMALL}>{hint}</div>
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
          <PanelSectionRow>
            <ButtonItem
              layout="inline"
              label={t.mfLoginDone}
              disabled={busy || !status?.running}
              onClick={() => run(() => mudfishConfirmLogin(true), t.mfLoginConfirmed)}
            >
              {t.mfLoginDone}
            </ButtonItem>
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
      <Collapsible title={t.mfAdvTitle} collapsed={isCollapsed("mudfishAdv")} onToggle={(v) => toggleSection("mudfishAdv", v)}>
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
          <ToggleField
            label={t.mfToggle}
            description={t.mfToggleDesc}
            checked={!!status?.running}
            disabled={busy || working || !installed}
            onChange={(v) => run(() => mudfishSetEnabled(v), v ? t.mfOn : t.mfOff)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfOpenWeb}
            description={t.mfAdvPanelDesc}
            disabled={!status?.port_open}
            onClick={openWeb}
          >
            {t.mfOpenWeb}
          </ButtonItem>
        </PanelSectionRow>
        {status?.login_done && (
          <PanelSectionRow>
            <ButtonItem
              layout="inline"
              label={t.mfLoginReset}
              disabled={busy}
              onClick={() => run(() => mudfishConfirmLogin(false), t.mfLoginResetDone)}
            >
              {t.mfLoginReset}
            </ButtonItem>
          </PanelSectionRow>
        )}
        <Card
          rows={[
            [t.mfDaemon, status?.running ? t.mfRunning : t.mfStopped],
            [t.mfPort, status?.port_open ? t.mfPortOpen : t.mfPortClosed],
            [t.mfRouteIface, route?.dev || DASH],
            [t.mfRouteIp, route?.src || DASH],
            [t.mfRouteGw, route?.via || DASH],
            ...pingRows(t, status),
          ]}
        />
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
        <Help show={helpOn} text={t.hMfNet} />
        <Collapsible title={t.mfLogsTitle} collapsed={isCollapsed("mudfishLogs")} onToggle={(v) => toggleSection("mudfishLogs", v)}>
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
        <PanelSectionRow>
          <ButtonItem layout="inline" label={t.mfProbe} description={probeNote || t.mfProbeDesc} disabled={!status?.port_open} onClick={probe}>
            {t.mfProbe}
          </ButtonItem>
        </PanelSectionRow>
        <Help show={helpOn} text={t.hMfAdv} />
      </Collapsible>
    </>
  );
}
