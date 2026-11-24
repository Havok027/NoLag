import { toaster } from "@decky/api";
import { ButtonItem, ConfirmModal, Navigation, PanelSectionRow, TextField, ToggleField, showModal } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Metrics,
  MudfishLive,
  MudfishResult,
  MudfishStatus,
  RouteInfo,
  Snapshot,
  getSnapshot,
  mudfishAvailable,
  mudfishGetLive,
  mudfishResetSession,
  mudfishGetLogs,
  mudfishGetRoute,
  mudfishGetStatus,
  mudfishCheckUpdate,
  mudfishInstall,
  mudfishOpenPanelBrowser,
  mudfishUpdate,
  mudfishUninstall,
  mudfishSetEnabled,
  mudfishSetPingTarget,
} from "./api";
import { FaCheck, FaCog, FaFileAlt, FaPercent, FaWaveSquare } from "react-icons/fa";
import { bestConnection, fromHistory } from "./bestConn";
import { HistData, historyGet } from "./historyApi";
import { HistoryExpandButton } from "./HistoryView";
import { Box, Card, ChartLine, Collapsible, Help, LineChart, MiniCard, MiniRow, PanelButton, Ring, TipButton } from "./components";
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
    case "uninstall_failed":
      return t.mfErrUninstall;
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
        <ButtonItem layout="below" label={t.connTitle} disabled={loading} onClick={load}>
          {t.mfRefresh}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}

const WEBUI_URL = "http://127.0.0.1:8282";

/** Abre o painel web nativo do Mudfish (porta 8282) no navegador do Steam, fora do QAM. */
function openMudfishNative(url?: string) {
  try {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url || WEBUI_URL);
  } catch {
    /* sem navegador interno, nada a fazer */
  }
}

/** Abre o painel do Mudfish: no navegador escolhido na Conf ou, por padrão (e se o comando falhar), no navegador do Steam. */
export async function openMudfishWeb(url?: string) {
  try {
    const r = await mudfishOpenPanelBrowser();
    if (r?.ok && r.external) {
      try {
        Navigation.CloseSideMenus();
      } catch {
        /* sem menu para fechar */
      }
      return;
    }
  } catch {
    /* cai no navegador do Steam */
  }
  openMudfishNative(url);
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
  overflowWrap: "anywhere",
  boxSizing: "border-box",
  maxWidth: "100%",
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

const INFO_BOX: CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  margin: "0 0 10px 0",
  lineHeight: 1.4,
  whiteSpace: "pre-line",
  borderRadius: 8,
  border: "1px solid rgba(26,159,255,0.45)",
  background: "rgba(26,159,255,0.10)",
  color: "#9ad4ff",
  overflowWrap: "anywhere",
  boxSizing: "border-box",
  maxWidth: "100%",
};

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

const BEST_BADGE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  padding: "6px 10px",
  margin: "0 0 10px 0",
  borderRadius: 8,
  boxSizing: "border-box",
  maxWidth: "100%",
  overflowWrap: "anywhere",
};

const CHART_MAX = 30;
const avg = (xs: number[]) => (xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : null);


/** Telemetria do Painel: só o ping atual (anel e gráfico), com jitter e perda de pacotes ao lado. */
interface Sample {
  base: Metrics | null;
  tunnel: Metrics | null;
}

const hasAvg = (m: Metrics | null | undefined): m is Metrics => !!m && typeof m.avg === "number";

export function LiveChart({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [live, setLive] = useState<MudfishLive | null>(null);
  const [hist, setHist] = useState<HistData | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const tickHist = async () => {
      try {
        const h = await historyGet();
        if (alive.current && h && h.ok !== false) setHist(h);
      } catch {
        /* mantém o último histórico */
      }
    };
    tickHist();
    const hid = setInterval(tickHist, SNAP_MS);
    const tick = async () => {
      try {
        const r = await mudfishGetLive();
        if (!alive.current || !r || r.ok === false) return;
        setLive(r);
        // "Com Mudfish" só existe com o serviço ligado e o túnel medido; "Sem Mudfish" é sempre a conexão normal.
        const viaNow = !!r.running && hasAvg(r.tunnel);
        setSamples((cur) => [...cur, { base: r.base ?? null, tunnel: viaNow ? r.tunnel : null }].slice(-CHART_MAX));
      } catch {
        /* mantém o gráfico como está */
      }
    };
    tick();
    const id = setInterval(tick, SNAP_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
      clearInterval(hid);
    };
  }, []);

  const last = samples.length ? samples[samples.length - 1] : null;
  const viaMudfish = !!live?.running && hasAvg(last?.tunnel);
  const color = viaMudfish ? "#3ddc84" : "#7c8cff";
  const numsOf = (pick: (s: Sample) => Metrics | null) => samples.map((x) => (hasAvg(pick(x)) ? (pick(x) as Metrics).avg : null));
  const withVals = numsOf((x) => x.tunnel);
  const withoutVals = numsOf((x) => x.base);
  const avgText = (vals: (number | null)[]) => {
    const a = avg(vals.filter((v): v is number => v !== null));
    return a === null ? DASH : `${a.toFixed(0)} ms`;
  };
  const avgNum = (vals: (number | null)[]) => avg(vals.filter((v): v is number => v !== null));
  const wAvg = avgNum(withVals);
  const oAvg = avgNum(withoutVals);
  // Menor é melhor (ping, jitter e perda); só marca quando os dois lados foram medidos e diferem.
  const winner = (w: number | null | undefined, o: number | null | undefined): "with" | "without" | null =>
    typeof w === "number" && typeof o === "number" && w !== o ? (w < o ? "with" : "without") : null;
  const pingWin = winner(wAvg, oAvg);
  // Destaque "Melhor conexão": média dos últimos 30 min do histórico; só compara com os dois lados medidos.
  const best = hist ? bestConnection(fromHistory(hist.samples, hist.now)) : bestConnection([]);
  const bestOn = best.state === "winner" && !!live?.running;
  const bestText = bestOn
    ? `${t.bestTitle}: ${best.side === "with" ? t.bestWith : t.bestWithout} · ${(best.side === "with" ? best.withAvg : best.withoutAvg)?.toFixed(0)} ms`
    : best.state === "tie" && live?.running
      ? `${t.bestTitle}: ${t.bestTie}`
      : `${t.bestTitle}: ${live?.running ? t.bestWaiting : t.bestOff}`;
  const lines: ChartLine[] = [
    { key: "without", label: t.chartWithout, color: "#9aa0a6", dashed: true, values: withoutVals, avg: avgText(withoutVals), best: pingWin === "without" },
  ];
  if (withVals.some((v) => v !== null)) {
    lines.push({ key: "with", label: t.chartWith, color: "#3ddc84", dashed: false, values: withVals, avg: avgText(withVals), best: pingWin === "with" });
  }
  // Anel segue o Mudfish quando ele está medindo; senão, a conexão normal.
  const now = viaMudfish ? last?.tunnel ?? null : last?.base ?? null;
  const pingNow = hasAvg(now) ? now.avg : null;
  // Jitter e perda: último valor de cada lado, lado a lado.
  const wm = viaMudfish ? last?.tunnel ?? null : null;
  const om = last?.base ?? null;
  const cmpRows = (w: number | null | undefined, o: number | null | undefined, fmt: (n: number) => string): MiniRow[] => {
    const win = winner(w, o);
    const show = (n: number | null | undefined) => (typeof n === "number" ? fmt(n) : DASH);
    return [
      { label: t.chartWithout, color: "#9aa0a6", value: show(o), best: win === "without" },
      { label: t.chartWith, color: "#3ddc84", value: show(w), best: win === "with" },
    ];
  };

  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 14, margin: "6px 0 10px" }}>{t.chartTitle}</div>
      {live?.only_game && <div style={PILL}>{t.onlyGameBadge}</div>}
      {live?.full_vpn && <div style={INFO_BOX}>{t.mfFullVpnWarn}</div>}
      <div
        data-best={best.state}
        style={{
          ...BEST_BADGE,
          fontWeight: bestOn ? 700 : 500,
          color: bestOn ? "#eafff3" : "rgba(255,255,255,0.65)",
          background: bestOn ? "rgba(31, 143, 85, 0.75)" : "rgba(255,255,255,0.04)",
          border: bestOn ? "1px solid #3ddc84" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <FaCheck size={11} style={{ flexShrink: 0, opacity: bestOn ? 1 : 0.4 }} />
        <span style={{ minWidth: 0 }}>{bestText}</span>
      </div>
      <Box style={{ padding: "12px 10px", position: "relative" }}>
        <HistoryExpandButton t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Ring value={pingNow} max={200} color={color} unit="ms" sub={viaMudfish ? t.chartWith : t.chartWithout} />
          </div>
          <div style={{ minWidth: 0 }}>
            <LineChart lines={lines} emptyText={t.chartEmpty} bestTag={t.chartBest} compact />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          {lines.map((l) => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "2px 2px" }}>
              <span style={{ width: 16, height: 0, borderTop: `3px ${l.dashed ? "dashed" : "solid"} ${l.color}`, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{l.label}</span>
              {l.best && <span style={{ fontSize: 10, fontWeight: 800, color: "#3ddc84" }}>{t.chartBest}</span>}
              <span style={{ fontWeight: 600 }}>{l.avg}</span>
            </div>
          ))}
        </div>
      </Box>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8, marginBottom: 10, alignItems: "stretch" }}>
        <MiniCard icon={<FaWaveSquare size={13} />} title={`${t.connJitter} (ms)`} rows={cmpRows(wm?.jitter, om?.jitter, (n) => `${n.toFixed(1)} ms`)} />
        <MiniCard icon={<FaPercent size={12} />} title={t.tmLoss} rows={cmpRows(wm?.loss, om?.loss, (n) => `${+n.toFixed(1)} %`)} />
      </div>
      <div style={SMALL}>{viaMudfish ? `${t.chartSrcMudfish}\n${t.chartSrcLocal}` : t.chartSrcLocal}</div>
      {live?.running && live.connect === "manual" && <div style={{ ...WARN_BOX, marginBottom: 10 }}>{t.mfConnectManual}</div>}
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

/** Aba Mudfish: serviço (instalar, ligar), atalho para o painel web, aviso de créditos e opções avançadas. */
export function MudfishTab({ t, helpOn, isCollapsed, toggleSection }: Props) {
  const { available, loadError, status, busy, note, run, refresh } = useMudfish(t);
  const [target, setTarget] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [logs, setLogs] = useState<{ service: string; install: string } | null>(null);
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
    [t.mfStepLogin, status?.login_done ? t.mfAccConnected : t.mfAccWaiting],
    [t.mfStepActivate, done(!!status?.running)],
  ];
  if (installed && status?.update?.latest) rows.splice(1, 0, [t.mfLatestRow, status.update.latest]);
  if (status?.running) {
    rows.push([t.mfApiRow, status.api_ok ? t.mfApiOk : t.mfApiDown]);
    const r = status.rtt;
    if (status.api_ok && r) {
      const anyReady = r.live || r.static === "ready" || r.vnodes === "ready";
      const st = anyReady ? t.mfRttReady : r.static === "error" && r.vnodes === "error" ? t.mfRttError : t.mfRttPending;
      rows.push([t.mfRttRow, anyReady && typeof r.ms === "number" ? `${st} · ${r.ms} ms` : st]);
    }
  }
  if (status?.phase === "error" && status.error) rows.push([t.mfBadgeError, mudfishErrorFull(t, status.error, status.detail)]);

  const hint = step === "install" ? t.mfHintInstall : step === "login" ? t.mfHintLogin : t.mfHintActivate;

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

  const loadLogs = () =>
    mudfishGetLogs()
      .then((r) => setLogs({ service: r?.service ?? "", install: r?.install ?? "" }))
      .catch(() => setLogs({ service: "", install: "" }));

  const askUninstall = () =>
    showModal(
      <ConfirmModal
        strTitle={t.mfUninstallTitle}
        strDescription={t.mfUninstallConfirm}
        strOKButtonText={t.mfUninstallOk}
        strCancelButtonText={t.mfCancel}
        bDestructiveWarning={true}
        onOK={() => {
          run(() => mudfishUninstall(), t.mfUninstalled);
        }}
      />
    );

  if (status && status.arch_ok === false) return <Card rows={[[t.mfErrArch, DASH]]} />;

  return (
    <>
      {/* 1. Estado e próximo passo */}
      <Card badge={badge.text} tone={badge.tone} rows={rows} />
      {status?.phase === "installing" && <div style={SMALL}>{t.mfInstalling}</div>}
      {status?.phase !== "installing" && note && <div style={SMALL}>{note}</div>}
      <div style={SMALL}>{hint}</div>

      {/* 2. Serviço: instalar ou ligar/desligar */}
      {step === "install" ? (
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            label={t.mfInstall}
            description={t.mfInstallDesc}
            disabled={busy || working}
            onClick={() => run(() => mudfishInstall(), t.mfInstallOk)}
          >
            {t.mfInstall}
          </ButtonItem>
        </PanelSectionRow>
      ) : (
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

      {/* 3. Painel web: onde ficam login, itens, nós e rotas */}
      {(installed || !!status?.running) && (
        <PanelSectionRow>
          <PanelButton
            label={t.mfOpenWeb}
            description={t.mfOpenWebDesc}
            disabled={!status?.port_open}
            onPress={() => openMudfishWeb(status?.webui)}
          />
        </PanelSectionRow>
      )}
      <Help show={helpOn} text={t.hMfFlow} />
      <TipButton label={t.mfTipBtn} title={t.mfTipTitle} open={tipOpen} onToggle={() => setTipOpen((v) => !v)} />
      {tipOpen && (
        <div style={INFO_BOX}>
          <div>{t.mfTipItem}</div>
          <div style={{ marginTop: 6 }}>{t.mfTipFull}</div>
          <div style={{ marginTop: 6 }}>{t.mfTipDiff}</div>
        </div>
      )}
      {step !== "install" && (
        <>
          <div style={WARN_BOX}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.mfFirstTitle}</div>
            <div>{t.mfFirstSteps}</div>
          </div>
          <Help show={helpOn} text={t.hMfFirst} />
        </>
      )}
      {(route?.full_vpn || status?.full_vpn_api) && <div style={INFO_BOX}>{t.mfFullVpnWarn}</div>}

      {/* 4. Cuidados com os créditos */}
      <MfWarning t={t} helpOn={helpOn} />

      {/* 5. Atualização do núcleo */}
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

      {/* 6. Desinstalar (com confirmação) */}
      {installed && (
        <>
          <PanelSectionRow>
            <ButtonItem layout="below" label={t.mfUninstall} description={t.mfUninstallDesc} disabled={busy || working} onClick={askUninstall}>
              {t.mfUninstall}
            </ButtonItem>
          </PanelSectionRow>
          <Help show={helpOn} text={t.hMfUninstall} />
        </>
      )}

      {/* 7. Opções avançadas (recolhidas) */}
      <Collapsible
        title={t.mfAdvTitle}
        icon={<FaCog size={14} />}
        summary={`${t.mfPort} 8282`}
        collapsed={isCollapsed("mudfishAdv")} onToggle={(v) => toggleSection("mudfishAdv", v)}>
        <Card
          rows={[
            [t.mfAdvWebui, status?.webui || WEBUI_URL],
            [t.mfPort, status?.port_open ? t.mfPortOpen : t.mfPortClosed],
            [t.mfRouteIface, route?.dev || DASH],
            [t.mfRouteIp, route?.src || DASH],
            [t.mfRouteGw, route?.via || DASH],
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
            layout="below"
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
            layout="below"
            label={t.mfLoginReset}
            description={t.mfResetSessionDesc}
            disabled={busy}
            onClick={() => run(() => mudfishResetSession(), t.mfLoginResetDone)}
          >
            {t.mfLoginReset}
          </ButtonItem>
        </PanelSectionRow>
        <Collapsible
          title={t.mfLogsTitle}
          icon={<FaFileAlt size={14} />}
          summary={logs ? undefined : t.sumCollapsed}
          collapsed={isCollapsed("mudfishLogs")} onToggle={(v) => toggleSection("mudfishLogs", v)}>
          <PanelSectionRow>
            <ButtonItem layout="below" label={t.mfLogsTitle} onClick={loadLogs}>
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
