import { Focusable, PanelSection } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { CurrentGame, GameProfile, deleteGame, getCurrentGame, getSettings, setGameModule, setSettings } from "./api";
import { FaNetworkWired } from "react-icons/fa";
import { Collapsible, Footer } from "./components";
import { HelpToggle, TAB_KEYS, TabKey, TabNav } from "./TabNav";
import { ConfTab } from "./ConfTab";
import { ConnCard, LiveChart, MfWarning, MudfishTab } from "./MudfishTab";
import { MudfishButton, WifiButton } from "./DashControls";
import { WifiTab } from "./WifiTab";
import { Lang, TEXTS, normalizeLang } from "./i18n";

// v0.12.4: impede o arrasto lateral do QAM (foco de botões largos) e força quebra de linha na largura estreita (~300px).
const ROOT_CSS = `
.nolag-root, .nolag-root * { box-sizing: border-box; max-width: 100%; }
.nolag-root { width: 100%; overflow-x: hidden; word-break: break-word; overflow-wrap: anywhere; }
.nolag-root button, .nolag-root [class*="Field"], .nolag-root [class*="Label"], .nolag-root [class*="Description"] {
  white-space: normal; min-width: 0; word-break: break-word; overflow-wrap: anywhere;
}
.nolag-root [class*="FieldChildren"], .nolag-root [class*="FieldLabelRow"] { flex-wrap: wrap; min-width: 0; }
`;

// Zera qualquer deslocamento horizontal que o navegador aplique ao focar um elemento largo.
function resetScrollX(e: { currentTarget: HTMLElement }) {
  let el: HTMLElement | null = e.currentTarget;
  for (let i = 0; el && i < 8; i++, el = el.parentElement) {
    if (el.scrollLeft !== 0) el.scrollLeft = 0;
  }
}

const DEFAULT_COLLAPSED: Record<string, boolean> = { mudfishAdv: true, mudfishLogs: true };

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
    <Focusable
      style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}
      onFocusCapture={resetScrollX as any}
      onScrollCapture={resetScrollX as any}
    >
    <style>{ROOT_CSS}</style>
    <div ref={root} className="nolag-root" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
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
          <Collapsible title={t.connTitle} icon={<FaNetworkWired size={14} />} summary={t.sumCollapsed} collapsed={isCollapsed("conn")} onToggle={(v) => toggleSection("conn", v)}>
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
