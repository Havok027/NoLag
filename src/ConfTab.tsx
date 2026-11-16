import { ButtonItem, DropdownItem, PanelSectionRow, ToggleField } from "@decky/ui";
import { useState } from "react";
import { CurrentGame, GameProfile, mudfishProbeApi, mudfishSetOption } from "./api";
import { FaGamepad, FaHeartbeat } from "react-icons/fa";
import { Box, Card, Collapsible, Help } from "./components";
import { LANGS, LANG_NAMES, Lang, Texts } from "./i18n";
import { MfWarning, mudfishErrorFull, useMudfish } from "./MudfishTab";

const DASH = "—";

interface Props {
  t: Texts;
  helpOn: boolean;
  lang: Lang;
  onLang: (value: Lang) => void;
  isCollapsed: (key: string) => boolean;
  toggleSection: (key: string, value: boolean) => void;
  games: Record<string, GameProfile>;
  current: CurrentGame;
  onGameModule: (appid: string, module: "wifi" | "mudfish", value: boolean) => void;
  onDropGame: (appid: string) => void;
}

/** Aba Conf: ativação automática (desligada por padrão), perfis por jogo, idioma, manter ligado e diagnóstico. */
export function ConfTab(p: Props) {
  const { t, helpOn } = p;
  const { status, busy, run } = useMudfish(t);
  const [probeNote, setProbeNote] = useState("");

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

  const diag: [string, string][] = [
    [t.mfStepInstall, status?.installed ? `${t.mfDone} · ${status?.version ?? ""}` : t.mfPending],
    [t.mfDaemon, status?.running ? t.mfRunning : t.mfStopped],
    [t.mfPort, status?.port_open ? t.mfPortOpen : t.mfPortClosed],
  ];
  if (status?.phase === "error" && status.error) diag.push([t.mfBadgeError, mudfishErrorFull(t, status.error, status.detail)]);

  return (
    <>
      <Box>
      <PanelSectionRow>
        <DropdownItem
          label={t.language}
          rgOptions={LANGS.map((l) => ({ data: l, label: LANG_NAMES[l] }))}
          selectedOption={p.lang}
          onChange={(opt) => p.onLang(opt.data as Lang)}
        />
      </PanelSectionRow>
      </Box>
      <Help show={helpOn} text={t.hLang} />
      <MfWarning t={t} helpOn={helpOn} />
      <PanelSectionRow>
        <ToggleField
          label={t.confAutoGame}
          description={t.confAutoGameDesc}
          checked={status?.auto_on_game === true}
          disabled={busy || !status}
          onChange={(v) => run(() => mudfishSetOption("auto_on_game", v), t.mfOptSaved)}
        />
      </PanelSectionRow>
      <Help show={helpOn} text={t.hConfAutoGame} />
      <PanelSectionRow>
        <ToggleField
          label={t.confKeepOn}
          description={t.confKeepOnDesc}
          checked={status?.keep_on === true}
          disabled={busy || !status}
          onChange={(v) => run(() => mudfishSetOption("keep_on", v), t.mfOptSaved)}
        />
      </PanelSectionRow>
      <Help show={helpOn} text={t.hConfKeepOn} />
      <Collapsible
        title={t.gamesTitle}
        icon={<FaGamepad size={14} />}
        summary={`${Object.keys(p.games).length} ${t.sumGames}`}
        collapsed={p.isCollapsed("confGames")} onToggle={(v) => p.toggleSection("confGames", v)}>
        <Help show={helpOn} text={t.hGameModules} />
        {p.current.appid && (
          <>
            <Card rows={[[t.gameCurrent, p.current.name || p.current.appid]]} />
            {!p.games[p.current.appid] && (
              <PanelSectionRow>
                <ButtonItem
                  layout="inline"
                  label={p.current.name || p.current.appid}
                  onClick={() => p.onGameModule(p.current.appid, "wifi", false)}
                >
                  {t.gameAddCurrent}
                </ButtonItem>
              </PanelSectionRow>
            )}
          </>
        )}
        {Object.keys(p.games).length === 0 && <Card rows={[[t.gamesNone, DASH]]} />}
        {Object.entries(p.games).map(([appid, g]) => (
          <div key={appid}>
            <PanelSectionRow>
              <ToggleField
                label={`${g.name} · ${t.gameWifi}`}
                description={t.gameModulesDesc}
                checked={g.wifi === true}
                onChange={(v) => p.onGameModule(appid, "wifi", v)}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <ToggleField
                label={`${g.name} · ${t.gameMudfish}`}
                description={t.gameModulesDesc}
                checked={g.mudfish === true}
                onChange={(v) => p.onGameModule(appid, "mudfish", v)}
              />
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem layout="inline" label={g.name} onClick={() => p.onDropGame(appid)}>
                {t.gameDelete}
              </ButtonItem>
            </PanelSectionRow>
          </div>
        ))}
      </Collapsible>
      <Collapsible
        title={t.confDiagTitle}
        icon={<FaHeartbeat size={14} />}
        summary={status?.running ? t.mfRunning : t.mfStopped}
        collapsed={p.isCollapsed("confDiag")} onToggle={(v) => p.toggleSection("confDiag", v)}>
        <Card rows={diag} />
        <PanelSectionRow>
          <ButtonItem
            layout="inline"
            label={t.mfProbe}
            description={probeNote || t.mfProbeDesc}
            disabled={!status?.port_open}
            onClick={probe}
          >
            {t.mfProbe}
          </ButtonItem>
        </PanelSectionRow>
        <Help show={helpOn} text={t.hConfDiag} />
      </Collapsible>
    </>
  );
}
