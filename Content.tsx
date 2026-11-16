import { Focusable, PanelSection } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { CurrentGame, GameProfile, deleteGame, getCurrentGame, getSettings, setGameModule, setSettings } from "./api";
import { Collapsible, Footer } from "./components";
import { HelpToggle, TAB_KEYS, TabKey, TabNav } from "./TabNav";
import { ConfTab } from "./ConfTab";
import { ConnCard, LiveChart, MfWarning, MudfishTab } from "./MudfishTab";
import { MudfishButton, WifiButton } from "./DashControls";
import { WifiTab } from "./WifiTab";
import { Lang, TEXTS, normalizeLang } from "./i18n";

const DEFAULT_COLLAPSED: Record<string, boolean> = { mudfishAdv: true, mudfishLogs: true, mudfishAcc: true };

export function Content() {
  const [lang, setLang] = useState<Lang>("pt");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<TabKey>("dash");
  const [games, setGames] = useState<Record<string, GameProfile>>({});
  const [current, setCurrent] = useState<CurrentGame>({ appid: "", name: "" });
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setLang(normalizeLang(s?.language));
        setCollapsed(s?.collapsed ?? {});
        setGames(s?.games ?? {});
      })
      .catch(() => {});
  }, []);

  // Jogo aberto no momento (para salvar o perfil dele com Wi-Fi e Mudfish), só na aba Conf.
  useEffect(() => {
    if (tab !== "conf") return;
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

  return (
    <PanelSection>
    <Focusable style={{ width: "100%", boxSizing: "border-box" }}>
    <div ref={root}>
      <TabNav
        labels={{ dash: t.tabDash, wifi: t.tabWifi, mudfish: t.tabMudfish, conf: t.tabConf }}
        hint={t.tabHint}
        active={tab}
        onSelect={setTab}
      />
      <HelpToggle label={t.helpBtn} on={helpOn} onToggle={toggleHelp} />
      {tab === "dash" && (
        <>
          <LiveChart t={t} helpOn={helpOn} />
          <MudfishButton t={t} helpOn={helpOn} />
          <MfWarning t={t} helpOn={helpOn} />
          <Collapsible title={t.connTitle} collapsed={isCollapsed("conn")} onToggle={(v) => toggleSection("conn", v)}>
            <ConnCard t={t} helpOn={helpOn} />
          </Collapsible>
          <WifiButton t={t} />
        </>
      )}
      {tab === "wifi" && (
        <WifiTab t={t} helpOn={helpOn} isCollapsed={isCollapsed} toggleSection={toggleSection} />
      )}
      {tab === "mudfish" && (
        <MudfishTab t={t} helpOn={helpOn} isCollapsed={isCollapsed} toggleSection={toggleSection} />
      )}
      {tab === "conf" && (
        <ConfTab
          t={t}
          helpOn={helpOn}
          lang={lang}
          onLang={changeLanguage}
          isCollapsed={isCollapsed}
          toggleSection={toggleSection}
          games={games}
          current={current}
          onGameModule={changeGameModule}
          onDropGame={dropGame}
        />
      )}
      <Footer text={t.createdBy} />
    </div>
    </Focusable>
    </PanelSection>
  );
}
