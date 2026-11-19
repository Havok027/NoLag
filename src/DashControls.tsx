import { Focusable, PanelSectionRow } from "@decky/ui";
import { useRef } from "react";
import type { CSSProperties } from "react";
import { wifiReset, wifiOptimizeSafe, mudfishSetEnabled } from "./api";
import { Card, Help, PanelButton } from "./components";
import type { Texts } from "./i18n";
import { openMudfishWeb, useMudfish } from "./MudfishTab";
import { activeCount, useWifi } from "./WifiTab";

const DASH = "—";

// Toque e botão A chegam por eventos diferentes; este filtro evita acionar duas vezes.
function useTap(action: () => void) {
  const last = useRef(0);
  return () => {
    const now = Date.now();
    if (now - last.current < 500) return;
    last.current = now;
    action();
  };
}

/** Botão de ação com estado visual claro: verde e com marca quando ativo, neutro quando inativo. */
export function ActionButton(props: { label: string; active: boolean; disabled?: boolean; onPress: () => void }) {
  const tap = useTap(() => {
    if (!props.disabled) props.onPress();
  });
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    userSelect: "none",
    opacity: props.disabled ? 0.5 : 1,
    color: props.active ? "#eafff3" : "inherit",
    background: props.active ? "rgba(31, 143, 85, 0.85)" : "rgba(255,255,255,0.10)",
    border: props.active ? "2px solid #3ddc84" : "1px solid rgba(255,255,255,0.25)",
    margin: "4px 0 10px",
  };
  return (
    <PanelSectionRow>
      <Focusable onActivate={tap} onClick={tap} style={style} role="button" aria-pressed={props.active}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            flexShrink: 0,
            background: props.active ? "#3ddc84" : "rgba(255,255,255,0.35)",
          }}
        />
        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{props.label}</span>
      </Focusable>
    </PanelSectionRow>
  );
}

/** Botão do Painel que liga e desliga o serviço do Mudfish (não toca no Wi-Fi). */
export function MudfishButton({ t, helpOn }: { t: Texts; helpOn: boolean }) {
  const { available, status, busy, run } = useMudfish(t);
  if (available === false) return <Card rows={[[t.mfStatusTitle, t.wifiBadgeUnavailable]]} />;
  const running = !!status?.running;
  const working = status?.phase === "installing" || status?.phase === "starting" || status?.phase === "stopping";
  const ready = !!status?.installed;
  const label = !ready && !running ? t.btnMfSetup : running ? t.btnMfOn : t.btnMfOff;
  return (
    <>
      <ActionButton
        label={label}
        active={running}
        disabled={busy || working || !status || (!ready && !running)}
        onPress={() => run(() => mudfishSetEnabled(!running), running ? t.mfOff : t.mfOn)}
      />
      {(ready || running) && (
        <PanelSectionRow>
          <PanelButton label={t.mfOpenWeb} description={t.mfOpenWebDesc} disabled={!status?.port_open} onPress={() => openMudfishWeb(status?.webui)} />
        </PanelSectionRow>
      )}
      {status?.update?.available && (
        <div style={{ fontSize: 11, color: "#ffd84a", textAlign: "center", margin: "-4px 0 10px", whiteSpace: "pre-line" }}>
          {t.mfUpdateAvail.replace("{v}", status.update.latest).replace("{c}", status.update.installed)}
        </div>
      )}
      <div style={{ height: 10 }} />
      <Help show={helpOn} text={t.hDashBtns} />
    </>
  );
}

/** Botão do Painel que aplica ou restaura as otimizações de Wi-Fi (módulo à parte do Mudfish). */
export function WifiButton({ t }: { t: Texts }) {
  const { available, status, busy, run } = useWifi(t);
  if (available === false) return <Card rows={[[t.tabWifi, t.wifiBadgeUnavailable]]} />;
  const on = activeCount(status) > 0;
  return (
    <ActionButton
      label={status ? (on ? t.btnWifiOn : t.btnWifiOff) : DASH}
      active={on}
      disabled={busy || !status}
      onPress={() => run(() => (on ? wifiReset() : wifiOptimizeSafe()), () => (on ? t.wifiRestored : t.wifiToastOk))}
    />
  );
}
