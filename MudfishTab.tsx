import { toaster } from "@decky/api";
import { ButtonItem, Navigation, PanelSectionRow, TextField, ToggleField } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import {
  Metrics,
  MudfishPing,
  MudfishResult,
  MudfishStatus,
  RouteInfo,
  Snapshot,
  getSnapshot,
  mudfishAvailable,
  mudfishClearCredentials,
  mudfishGetRoute,
  mudfishGetStatus,
  mudfishInstall,
  mudfishSetCredentials,
  mudfishSetEnabled,
  mudfishSetPingTarget,
  mudfishTestPing,
} from "./api";
import { Card, Collapsible, Help } from "./components";
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
    case "no_credentials":
      return t.mfErrNoCreds;
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
    case "bad_user":
      return t.mfErrBadUser;
    case "bad_password":
      return t.mfErrBadPass;
    default:
      return t.mfErrGeneric;
  }
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
      msg = ok ? okText || t.mfToastOk : mudfishError(t, r?.error || "");
    } catch {
      ok = false;
    }
    setNote(msg);
    try {
      toaster.toast({ title: ok ? t.mfToastOk : t.mfToastFail, body: msg, duration: 4000 });
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

export function MudfishTab({ t, helpOn, isCollapsed, toggleSection }: Props) {
  const { available, loadError, status, busy, note, run, refresh } = useMudfish(t);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [target, setTarget] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const [pingNote, setPingNote] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const filled = useRef(false);

  useEffect(() => {
    if (status && !filled.current) {
      filled.current = true;
      setUser(status.user ?? "");
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
        {loadError && (
          <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", wordBreak: "break-word" }}>{loadError}</div>
        )}
      </>
    );
  }

  const badge = mfBadge(t, status);
  const working = status?.phase === "installing" || status?.phase === "starting" || status?.phase === "stopping";
  const installed = !!status?.installed;
  const rows: [string, string][] = [
    [t.mfInstalledRow, installed ? `${t.mfInstalledYes} · ${status?.version ?? ""}` : t.mfInstalledNo],
    [t.mfDaemon, status?.running ? t.mfRunning : t.mfStopped],
    [t.mfPort, status?.port_open ? t.mfPortOpen : t.mfPortClosed],
  ];
  if (status?.phase === "error" && status.error) rows.push([t.mfBadgeError, mudfishError(t, status.error)]);

  const saveLogin = () =>
    run(async () => {
      const r = await mudfishSetCredentials(user, pass);
      if (r.ok) setPass("");
      return r;
    }, t.mfLoginSaved);

  const clearLogin = () =>
    run(async () => {
      const r = await mudfishClearCredentials();
      if (r.ok) {
        setUser("");
        setPass("");
      }
      return r;
    }, t.mfLoginCleared);

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

  return (
    <>
      <Card badge={badge.text} tone={badge.tone} rows={rows} />
      {status?.phase === "installing" && (
        <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 6 }}>{t.mfInstalling}</div>
      )}
      {status?.phase !== "installing" && note && <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 6 }}>{note}</div>}
      {status && status.arch_ok === false ? (
        <Card rows={[[t.mfErrArch, DASH]]} />
      ) : (
        <>
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
          <Help show={helpOn} text={t.hMfInstall} />
          <PanelSectionRow>
            <ToggleField
              label={t.mfToggle}
              description={t.mfToggleDesc}
              checked={!!status?.running}
              disabled={busy || working || !installed}
              onChange={(v) => run(() => mudfishSetEnabled(v), v ? t.mfOn : t.mfOff)}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hMfToggle} />
          <Collapsible
            title={t.mfLoginTitle}
            collapsed={isCollapsed("mudfishLogin")}
            onToggle={(v) => toggleSection("mudfishLogin", v)}
          >
            <PanelSectionRow>
              <TextField label={t.mfUser} description={t.mfUserDesc} value={user} onChange={(e) => setUser(e.target.value)} />
            </PanelSectionRow>
            <PanelSectionRow>
              <TextField
                label={t.mfPass}
                description={status?.has_password ? t.mfPassSaved : t.mfPassEmpty}
                bIsPassword
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem layout="inline" label={t.mfLoginTitle} disabled={busy || !user.trim()} onClick={saveLogin}>
                {t.mfSave}
              </ButtonItem>
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem
                layout="inline"
                label={t.mfLoginTitle}
                disabled={busy || (!status?.user && !status?.has_password)}
                onClick={clearLogin}
              >
                {t.mfClear}
              </ButtonItem>
            </PanelSectionRow>
            <Help show={helpOn} text={t.hMfLogin} />
          </Collapsible>
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
          <Collapsible
            title={t.mfNetTitle}
            collapsed={isCollapsed("mudfishNet")}
            onToggle={(v) => toggleSection("mudfishNet", v)}
          >
            <Card
              rows={[
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
          </Collapsible>
        </>
      )}
    </>
  );
}
