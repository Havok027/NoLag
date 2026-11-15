import {
  ButtonItem,
  DropdownItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import {
  Metrics,
  Profile,
  Relay,
  Status,
  addRelay,
  CurrentGame,
  getCurrentGame,
  getRelays,
  getSettings,
  getStatus,
  removeRelay,
  setGameAuto,
  setGameModule,
  deleteGame,
  GameProfile,
  setRouteEnabled,
  setSettings,
} from "./api";
import { BadgeTone, Card, ChartLine, Collapsible, Footer, Help, LineChart } from "./components";
import { HelpToggle, TAB_KEYS, TabKey, TabNav } from "./TabNav";
import { ConnCard, MudfishCard, MudfishTab } from "./MudfishTab";
import { WifiCard, WifiTab } from "./WifiTab";
import { LANGS, LANG_NAMES, Lang, TEXTS, Texts, normalizeLang } from "./i18n";

const DASH = "—";

function metricsText(m: Metrics | null): string {
  if (!m) return DASH;
  if (m.avg === null) return `${m.loss.toFixed(0)}%`;
  return `${m.avg.toFixed(0)} ms · ${(m.jitter ?? 0).toFixed(1)} · ${m.loss.toFixed(0)}%`;
}

function stateText(t: Texts, s: Status | null): string {
  switch (s?.phase) {
    case "starting":
      return t.stateStarting;
    case "waiting":
      return s.game ? t.waitTraffic : t.waitGame;
    case "running":
      return t.stateRunning;
    case "error":
      return t.stateError;
    default:
      return t.stateOff;
  }
}

function noticeText(t: Texts, s: Status): string {
  switch (s.notice) {
    case "no_relays":
      return t.noticeNoRelays;
    case "tools_missing":
      return `${t.noticeTools}: ${s.detail}`;
    case "setup_failed":
      return t.noticeSetup;
    case "enroll_failed":
      return t.noticeEnroll;
    default:
      return "";
  }
}

function errorText(t: Texts, s: Status): string {
  switch (s.error) {
    case "tools_missing":
      return `${t.errToolsMissing}: ${s.detail}`;
    case "sniff_failed":
      return s.detail ? `${t.errSniff}: ${s.detail}` : t.errSniff;
    default:
      return t.errUnexpected;
  }
}

function badgeOf(t: Texts, s: Status | null): { text: string; tone: BadgeTone } {
  switch (s?.phase) {
    case "running":
      return { text: t.badgeActive, tone: "good" };
    case "waiting":
      return { text: t.badgeWaiting, tone: "warn" };
    case "starting":
      return { text: t.badgeStarting, tone: "warn" };
    case "error":
      return { text: t.badgeError, tone: "bad" };
    default:
      return { text: t.badgeOff, tone: "off" };
  }
}

function activeMetrics(s: Status | null): Metrics | null {
  if (!s || s.phase !== "running") return null;
  if (!s.active || s.active === "direct") return s.direct;
  return s.relays.find((r) => r.iface === s.active)?.metrics ?? null;
}

function msText(m: Metrics | null): string {
  return m && m.avg !== null ? `${m.avg.toFixed(0)} ms` : DASH;
}

function jitterText(m: Metrics | null): string {
  return m && m.jitter !== null ? `${m.jitter.toFixed(1)} ms` : DASH;
}

function lossText(m: Metrics | null): string {
  return m ? `${m.loss.toFixed(0)}%` : DASH;
}

const DEFAULT_COLLAPSED: Record<string, boolean> = { diag: true, relays: true };
const COLORS = ["#4cc9f0", "#ffc857", "#f472b6", "#a78bfa", "#34d399"];

function avgLast(values: (number | null)[]): number | null {
  const nums = values.slice(-5).filter((v): v is number => v !== null);
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function qualityOf(t: Texts, m: Metrics | null): string {
  if (!m || m.avg === null) return DASH;
  if (m.loss >= 5 || m.avg > 150) return t.qualBad;
  if (m.loss >= 1 || m.avg > 80 || (m.jitter ?? 0) > 15) return t.qualFair;
  return t.qualGood;
}

export function Content() {
  const [lang, setLang] = useState<Lang>("pt");
  const [enabled, setEnabled] = useState(false);
  const [profile, setProfile] = useState<Profile>("balanced");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<TabKey>("dash");
  const [status, setStatus] = useState<Status | null>(null);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [games, setGames] = useState<Record<string, GameProfile>>({});
  const [code, setCode] = useState("");
  const [relayMsg, setRelayMsg] = useState("");
  const [current, setCurrent] = useState<CurrentGame>({ appid: "", name: "" });
  const timer = useRef<number | undefined>(undefined);
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setLang(normalizeLang(s?.language));
        setEnabled(s?.enabled === true);
        setProfile(s?.profile ?? "balanced");
        setCollapsed(s?.collapsed ?? {});
        setGames(s?.games ?? {});
      })
      .catch(() => {});
    getRelays()
      .then(setRelays)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = () =>
      getStatus()
        .then((s) => {
          if (alive) setStatus(s);
        })
        .catch(() => {});
    tick();
    const id = window.setInterval(tick, 2000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  // O backend liga e desliga sozinho (jogo com perfil automático, saída do jogo): atualiza os perfis salvos.
  useEffect(() => {
    getSettings()
      .then((s) => {
        setGames(s?.games ?? {});
        setProfile(s?.profile ?? "balanced");
      })
      .catch(() => {});
  }, [status?.appid, status?.phase]);

  // Jogo aberto no momento (para salvar o perfil dele com Wi-Fi e Mudfish), só na aba Rotas.
  useEffect(() => {
    if (tab !== "routes") return;
    let alive = true;
    const tick = () =>
      getCurrentGame()
        .then((g) => {
          if (alive && g) setCurrent(g);
        })
        .catch(() => {});
    tick();
    const id = window.setInterval(tick, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [tab]);

  // L1/R1 troca de aba. Toque e botão A nas abas sempre funcionam.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onButton = (e: Event) => {
      const button = (e as CustomEvent).detail?.button;
      const step = button === 5 ? -1 : button === 6 ? 1 : 0;
      if (!step) return;
      setTab((cur) => {
        const next = TAB_KEYS.indexOf(cur) + step;
        return TAB_KEYS[Math.min(TAB_KEYS.length - 1, Math.max(0, next))];
      });
    };
    el.addEventListener("vgp_onbuttondown", onButton);
    return () => el.removeEventListener("vgp_onbuttondown", onButton);
  }, []);

  const t = TEXTS[lang];

  const isCollapsed = (key: string) => collapsed[key] ?? DEFAULT_COLLAPSED[key] ?? false;
  const helpOn = !isCollapsed("help");
  const toggleHelp = () => toggleSection("help", helpOn);

  const toggleSection = (key: string, value: boolean) => {
    const next = { ...collapsed, [key]: value };
    setCollapsed(next);
    setSettings({ collapsed: next }).catch(() => {});
  };

  const changeLanguage = (value: Lang) => {
    setLang(value);
    setSettings({ language: value })
      .then((s) => setLang(normalizeLang(s?.language)))
      .catch(() => {});
  };

  const changeEnabled = (value: boolean) => {
    setEnabled(value);
    setRouteEnabled(value)
      .then(setStatus)
      .catch(() => {});
  };

  const changeProfile = (value: Profile) => {
    setProfile(value);
    setSettings({ profile: value })
      .then((s) => {
        setGames(s?.games ?? {});
        setProfile(s?.profile ?? "balanced");
      })
      .catch(() => {});
  };

  const changeGameAuto = (appid: string, value: boolean) => {
    setGameAuto(appid, value)
      .then((s) => setGames(s?.games ?? {}))
      .catch(() => {});
  };

  const changeGameModule = (appid: string, module: "wifi" | "mudfish", value: boolean) => {
    setGameModule(appid, module, value)
      .then((s) => setGames(s?.games ?? {}))
      .catch(() => {});
  };

  const dropGame = (appid: string) => {
    deleteGame(appid)
      .then((s) => setGames(s?.games ?? {}))
      .catch(() => {});
  };

  const changeCode = (value: string) => {
    setCode(value);
    setRelayMsg("");
    window.clearTimeout(timer.current);
    if (!value.trim()) return;
    timer.current = window.setTimeout(() => {
      addRelay(value)
        .then((r) => {
          setRelays(r.relays);
          if (r.ok) {
            setCode("");
            setRelayMsg(t.relayAdded);
          } else {
            setRelayMsg(r.error === "too_many" ? t.relayLimit : t.relayBad);
          }
        })
        .catch(() => {});
    }, 800);
  };

  const dropRelay = (name: string) => {
    removeRelay(name)
      .then(setRelays)
      .catch(() => {});
  };

  const active =
    status?.active && status.active !== "direct"
      ? status.relays.find((r) => r.iface === status.active)?.name ?? t.routeDirect
      : t.routeDirect;
  const live = activeMetrics(status);
  const badge = badgeOf(t, status);
  const gameProf = status?.appid ? games[status.appid] : undefined;
  const shownProfile: Profile = gameProf?.profile ?? profile;
  const profileLabel = (p: Profile) =>
    p === "stable" ? t.profileStable : p === "aggressive" ? t.profileAggressive : t.profileBalanced;
  const profileName = profileLabel(shownProfile);
  // Quem manda é o backend: ele liga sozinho (perfil automático) e desliga ao sair do jogo.
  const enabledNow = status ? status.phase !== "off" : enabled;

  const dashRows: [string, string][] = [[t.state, stateText(t, status)]];
  if (status?.phase === "error") dashRows.push([t.stateError, errorText(t, status)]);
  if (status?.notice && status.phase !== "off") dashRows.push([t.notice, noticeText(t, status)]);
  if (status?.game) dashRows.push([t.game, status.game]);
  if (status?.appid) {
    dashRows.push([t.gameProfile, gameProf ? (gameProf.auto ? t.gameSavedAuto : t.gameSavedManual) : t.gameNotSaved]);
  }
  if (status?.phase === "running") {
    dashRows.push([t.server, status.target]);
    dashRows.push([t.activeRoute, active]);
    dashRows.push([t.pingNow, msText(live)]);
    dashRows.push([t.jitter, jitterText(live)]);
    dashRows.push([t.loss, lossText(live)]);
    dashRows.push([t.quality, qualityOf(t, live)]);
  }

  const liveRows: [string, string][] = [];
  if (status?.phase === "running") {
    const inUse = (key: string) => (status.active === key ? ` · ${t.inUse}` : "");
    liveRows.push([t.direct + inUse("direct"), metricsText(status.direct)]);
    status.relays.forEach((r) =>
      liveRows.push([r.name + inUse(r.iface), r.valid ? metricsText(r.metrics) : t.relayInvalid])
    );
  }

  const chartLines: ChartLine[] = [];
  if (status?.phase === "running" && status.history) {
    const entries: { key: string; label: string; values: (number | null)[] }[] = [
      { key: "direct", label: t.direct, values: status.history["direct"] ?? [] },
      ...status.relays.map((r) => ({ key: r.iface, label: r.name, values: status.history[r.iface] ?? [] })),
    ];
    const avgs = entries.map((e) => avgLast(e.values));
    const known = avgs.filter((a): a is number => a !== null);
    const bestAvg = known.length ? Math.min(...known) : null;
    entries.forEach((e, i) => {
      const a = avgs[i];
      chartLines.push({
        key: e.key,
        label: e.label,
        color: COLORS[i % COLORS.length],
        values: e.values,
        avg: a === null ? DASH : `${a.toFixed(0)} ms`,
        best: a !== null && bestAvg !== null && a === bestAvg && entries.length > 1,
      });
    });
  }
  const bestLine = chartLines.find((l) => l.best);

  const diag = status?.diag;
  const diagRows: [string, string][] = [
    [t.diagProcs, String(diag?.pids ?? 0)],
    [t.diagPorts, String(diag?.ports ?? 0)],
    [t.diagPackets, String(diag?.seen ?? 0)],
    [t.diagTop, diag && diag.top.length ? diag.top.map(([ip, n]) => `${ip} (${n})`).join(", ") : DASH],
  ];

  return (
    <PanelSection>
    <Focusable style={{ width: "100%", boxSizing: "border-box" }}>
    <div ref={root}>
      <TabNav
        labels={{ dash: t.tabDash, wifi: t.tabWifi, routes: t.tabRoutes, settings: t.settings }}
        hint={t.tabHint}
        active={tab}
        onSelect={setTab}
      />
      <HelpToggle label={t.helpBtn} on={helpOn} onToggle={toggleHelp} />
      {tab === "dash" && (
        <>
          <Card badge={badge.text} tone={badge.tone} rows={dashRows} />
          <Help show={helpOn} text={t.hStatus} />
          <Help show={helpOn} text={t.hPing} />
          <PanelSectionRow>
            <ToggleField
              label={t.enable}
              description={t.enableDesc}
              checked={enabledNow}
              onChange={changeEnabled}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hEnable} />
          <WifiCard t={t} />
          <MudfishCard t={t} />
          <Collapsible title={t.connTitle} collapsed={isCollapsed("conn")} onToggle={(v) => toggleSection("conn", v)}>
            <ConnCard t={t} helpOn={helpOn} />
          </Collapsible>
          <Collapsible title={t.liveRoutes} collapsed={isCollapsed("routes")} onToggle={(v) => toggleSection("routes", v)}>
            <Card rows={liveRows.length ? liveRows : [[t.noLive, DASH]]} />
            <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 8 }}>{t.metricsHint}</div>
            <Help show={helpOn} text={t.hRoutes} />
          </Collapsible>
          <Collapsible title={t.chartTitle} collapsed={isCollapsed("chart")} onToggle={(v) => toggleSection("chart", v)}>
            {bestLine && (
              <div style={{ textAlign: "center", fontSize: 13, marginBottom: 8 }}>
                {t.chartBest}: <b>{bestLine.label}</b> ({bestLine.avg})
              </div>
            )}
            <LineChart lines={chartLines} emptyText={t.chartEmpty} bestTag={t.best} />
            <Help show={helpOn} text={t.hChart} />
          </Collapsible>
          <Collapsible title={t.diagTitle} collapsed={isCollapsed("diag")} onToggle={(v) => toggleSection("diag", v)}>
            <Card rows={diagRows} />
            <div style={{ fontSize: 11, opacity: 0.7, textAlign: "center", marginBottom: 8 }}>{t.diagHint}</div>
            <Help show={helpOn} text={t.hDiag} />
          </Collapsible>
        </>
      )}
      {tab === "wifi" && (
        <WifiTab t={t} helpOn={helpOn} isCollapsed={isCollapsed} toggleSection={toggleSection} />
      )}
      {tab === "routes" && (
        <>
          <Collapsible
            title={t.mfStatusTitle}
            collapsed={isCollapsed("mudfishMain")}
            onToggle={(v) => toggleSection("mudfishMain", v)}
          >
            <MudfishTab t={t} helpOn={helpOn} isCollapsed={isCollapsed} toggleSection={toggleSection} />
          </Collapsible>
          <Card
            rows={[
              [t.relaysCount, String(relays.length)],
              [t.profile, profileName],
              [t.activeRoute, active],
            ]}
          />
          <PanelSectionRow>
            <DropdownItem
              label={t.profile}
              description={t.profileDesc}
              rgOptions={[
                { data: "stable", label: t.profileStable },
                { data: "balanced", label: t.profileBalanced },
                { data: "aggressive", label: t.profileAggressive },
              ]}
              selectedOption={shownProfile}
              onChange={(opt) => changeProfile(opt.data as Profile)}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hProfile} />
          <Collapsible title={t.gamesTitle} collapsed={isCollapsed("games")} onToggle={(v) => toggleSection("games", v)}>
            <Help show={helpOn} text={t.hGames} />
            <Help show={helpOn} text={t.hGameModules} />
            {current.appid && (
              <>
                <Card rows={[[t.gameCurrent, current.name || current.appid]]} />
                {!games[current.appid] && (
                  <PanelSectionRow>
                    <ButtonItem
                      layout="inline"
                      label={current.name || current.appid}
                      onClick={() => changeGameModule(current.appid, "wifi", false)}
                    >
                      {t.gameAddCurrent}
                    </ButtonItem>
                  </PanelSectionRow>
                )}
              </>
            )}
            {Object.keys(games).length === 0 && <Card rows={[[t.gamesNone, DASH]]} />}
            {Object.entries(games).map(([appid, g]) => (
              <div key={appid}>
                <PanelSectionRow>
                  <ToggleField
                    label={g.name}
                    description={`${profileLabel(g.profile)} · ${t.gameSavedAuto}`}
                    checked={g.auto}
                    onChange={(v) => changeGameAuto(appid, v)}
                  />
                </PanelSectionRow>
                <PanelSectionRow>
                  <ToggleField
                    label={`${g.name} · ${t.gameWifi}`}
                    description={t.gameModulesDesc}
                    checked={g.wifi === true}
                    onChange={(v) => changeGameModule(appid, "wifi", v)}
                  />
                </PanelSectionRow>
                <PanelSectionRow>
                  <ToggleField
                    label={`${g.name} · ${t.gameMudfish}`}
                    description={t.gameModulesDesc}
                    checked={g.mudfish === true}
                    onChange={(v) => changeGameModule(appid, "mudfish", v)}
                  />
                </PanelSectionRow>
                <PanelSectionRow>
                  <ButtonItem layout="inline" label={g.name} onClick={() => dropGame(appid)}>
                    {t.gameDelete}
                  </ButtonItem>
                </PanelSectionRow>
              </div>
            ))}
          </Collapsible>
          <Collapsible title={t.relaysTitle} collapsed={isCollapsed("relays")} onToggle={(v) => toggleSection("relays", v)}>
            <Help show={helpOn} text={t.hRelays} />
            {relays.length === 0 && <Card rows={[[t.relaysNone, DASH]]} />}
            {relays.map((r) => (
              <PanelSectionRow key={r.name}>
                {r.builtin ? (
                  <Card rows={[[r.name, t.relayBuiltin]]} />
                ) : (
                  <ButtonItem
                    layout="inline"
                    label={r.name}
                    description={r.endpoint}
                    onClick={() => dropRelay(r.name)}
                  >
                    {t.relayRemove}
                  </ButtonItem>
                )}
              </PanelSectionRow>
            ))}
            <PanelSectionRow>
              <TextField
                label={t.relayCode}
                description={relayMsg || t.relayCodeDesc}
                value={code}
                onChange={(e) => changeCode(e.target.value)}
              />
            </PanelSectionRow>
            <Help show={helpOn} text={t.hRelayCode} />
          </Collapsible>
        </>
      )}
      {tab === "settings" && (
        <>
          <Card rows={[[t.language, LANG_NAMES[lang]]]} />
          <PanelSectionRow>
            <DropdownItem
              label={t.language}
              rgOptions={LANGS.map((l) => ({ data: l, label: LANG_NAMES[l] }))}
              selectedOption={lang}
              onChange={(opt) => changeLanguage(normalizeLang(opt.data))}
            />
          </PanelSectionRow>
          <Help show={helpOn} text={t.hLang} />
        </>
      )}
      <Footer text={t.createdBy} />
    </div>
    </Focusable>
    </PanelSection>
  );
}
