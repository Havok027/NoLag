import { Focusable, ModalRoot, Navigation, showModal } from "@decky/ui";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { FaExpandAlt, FaTimes } from "react-icons/fa";
import { COLOR_WITH, COLOR_WITHOUT, HistMetric, HistoryChart, Side, nearestSample, valueOf } from "./HistoryChart";
import { HistData, historyGet } from "./historyApi";
import type { Texts } from "./i18n";

const REFRESH_MS = 10000;
// Largura fixa em px (1280x800 lógicos): a moldura do modal é calculada antes do conteúdo, então vw/vh saem fora de escala.
const PAGE_WIDTH = 1040;
const FOCUS_BORDER = "1px solid rgba(124, 140, 255, 0.95)";
const FOCUS_GLOW = "0 0 0 2px rgba(124, 140, 255, 0.35)";
const PLAIN_BORDER = "1px solid rgba(255, 255, 255, 0.12)";
const PANEL: CSSProperties = {
  border: PLAIN_BORDER,
  background: "rgba(255, 255, 255, 0.04)",
  borderRadius: 10,
  boxSizing: "border-box",
  width: "100%",
};

function IconButton(props: { label: string; onPress: () => void; style?: CSSProperties; children: ReactNode }) {
  const [focused, setFocused] = useState(false);
  const last = useRef(0);
  // A mesma ação pode chegar por toque e pelo botão A; só a primeira conta.
  const press = () => {
    const now = Date.now();
    if (now - last.current < 400) return;
    last.current = now;
    props.onPress();
  };
  return (
    <Focusable
      onActivate={press}
      onClick={press}
      onGamepadFocus={() => setFocused(true)}
      onGamepadBlur={() => setFocused(false)}
      role="button"
      aria-label={props.label}
      title={props.label}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.06)",
        border: focused ? FOCUS_BORDER : PLAIN_BORDER,
        boxShadow: focused ? FOCUS_GLOW : "none",
        ...props.style,
      }}
    >
      {props.children}
    </Focusable>
  );
}

const clock = (t: number) => new Date(t * 1000).toLocaleTimeString([], { hour12: false });

function HistoryModal({ t, closeModal }: { t: Texts; closeModal?: () => void }) {
  const [data, setData] = useState<HistData | null>(null);
  const [cursorT, setCursorT] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await historyGet();
        if (alive && r) setData(r);
      } catch {
        /* mantém o que já está na tela */
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const samples = data?.samples ?? [];
  const metrics: HistMetric[] = [
    { index: 0, title: `${t.histPing} (ms)`, unit: "ms", decimals: 0, floor: 10 },
    { index: 1, title: `${t.connJitter} (ms)`, unit: "ms", decimals: 1, floor: 5 },
    { index: 2, title: `${t.tmLoss} (%)`, unit: "%", decimals: 1, floor: 2 },
  ];
  const shown = (cursorT !== null ? nearestSample(samples, cursorT) : null) ?? (samples.length ? samples[samples.length - 1] : null);
  const sides: { side: Side; label: string; color: string }[] = [
    { side: "b", label: t.chartWithout, color: COLOR_WITHOUT },
    { side: "w", label: t.chartWith, color: COLOR_WITH },
  ];

  return (
    <ModalRoot closeModal={closeModal} {...({ bAllowFullSize: true } as any)}>
      <div style={{ width: PAGE_WIDTH, maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t.histTitle}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{t.histHint}</div>
          </div>
          <IconButton label={t.histClose} onPress={() => closeModal?.()}>
            <FaTimes size={14} />
          </IconButton>
        </div>

        <div style={{ ...PANEL, padding: "8px 10px" }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
            {shown ? (cursorT !== null ? clock(shown.t) : `${t.chartNow} · ${clock(shown.t)}`) : "—"}
          </div>
          {sides.map((s) => (
            <div key={s.side} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: "24px", flexWrap: "wrap" }}>
              <span style={{ width: 16, height: 0, borderTop: `3px ${s.side === "b" ? "dashed" : "solid"} ${s.color}`, flexShrink: 0 }} />
              <span style={{ minWidth: 96, fontWeight: 700, color: s.color }}>{s.label}</span>
              {metrics.map((m) => {
                const v = valueOf(shown, s.side, m.index);
                return (
                  <span key={m.index} style={{ marginRight: 14 }}>
                    <span style={{ opacity: 0.7 }}>{m.index === 0 ? t.histPing : m.index === 1 ? t.connJitter : t.tmLoss} </span>
                    <span style={{ fontWeight: 800 }}>{v === null ? "—" : `${v.toFixed(m.decimals)} ${m.unit}`}</span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        {samples.length < 2 ? (
          <div style={{ ...PANEL, padding: "28px 14px", textAlign: "center", fontSize: 13, opacity: 0.8, whiteSpace: "pre-line" }}>{t.histEmpty}</div>
        ) : (
          metrics.map((m) => (
            <div key={m.index} style={{ ...PANEL, padding: "2px 6px" }}>
              <HistoryChart
                samples={samples}
                now={data?.now ?? samples[samples.length - 1].t}
                window={data?.window ?? 1800}
                interval={data?.interval ?? 10}
                metric={m}
                withLabel={t.chartWith}
                withoutLabel={t.chartWithout}
                nowLabel={t.chartNow}
                cursorT={cursorT}
                onCursor={setCursorT}
              />
            </div>
          ))
        )}
      </div>
    </ModalRoot>
  );
}

/** Abre o histórico em tela cheia (fecha o menu rápido antes, para o painel ocupar a tela). */
export function openHistory(t: Texts) {
  try {
    Navigation.CloseSideMenus();
  } catch {
    /* sem menu lateral para fechar */
  }
  showModal(<HistoryModal t={t} />);
}

/** Botão discreto (setas na diagonal) para o canto superior do gráfico do Painel. O pai precisa ter position: relative. */
export function HistoryExpandButton({ t }: { t: Texts }) {
  return (
    <IconButton label={t.histOpen} onPress={() => openHistory(t)} style={{ position: "absolute", top: 6, right: 6, zIndex: 2 }}>
      <FaExpandAlt size={13} />
    </IconButton>
  );
}
