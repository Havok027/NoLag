import { Focusable } from "@decky/ui";
import { ReactNode, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FaCheck, FaChevronDown, FaChevronRight, FaCog, FaRoute, FaTachometerAlt } from "react-icons/fa";

const LINE = "rgba(255, 255, 255, 0.10)";
const ACCENT = "#2aa7c9";

export type BadgeTone = "good" | "warn" | "bad" | "off";

const TONES: Record<BadgeTone, string> = {
  good: "#3ddc84",
  warn: "#ffc857",
  bad: "#ff5d6c",
  off: "#9aa4b2",
};

// A mesma ação pode chegar por toque e pelo botão A; só a primeira conta.
function useTap(fn: () => void) {
  const last = useRef(0);
  return () => {
    const now = Date.now();
    if (now - last.current < 250) return;
    last.current = now;
    fn();
  };
}

export type TabId = "dash" | "routes" | "settings";

export const TAB_ORDER: TabId[] = ["dash", "routes", "settings"];

const TAB_ICONS: Record<TabId, ReactNode> = {
  dash: <FaTachometerAlt size={22} />,
  routes: <FaRoute size={22} />,
  settings: <FaCog size={22} />,
};

function TabButton(props: { icon: ReactNode; label: string; selected: boolean; onSelect: () => void }) {
  const tap = useTap(props.onSelect);
  return (
    <Focusable
      onActivate={tap}
      onClick={tap}
      style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 4px 8px",
        borderRadius: 8,
        border: `1px solid ${ACCENT}`,
        background: props.selected
          ? "linear-gradient(180deg, #1f7fb5 0%, #135a8a 100%)"
          : "rgba(14, 50, 90, 0.7)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {props.selected && <FaCheck size={10} style={{ position: "absolute", top: 6, right: 7 }} />}
      {props.icon}
      <span>{props.label}</span>
    </Focusable>
  );
}

export function TabBar(props: {
  labels: Record<TabId, string>;
  hint: string;
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Focusable style={{ display: "flex", gap: 6 }} flow-children="horizontal">
        {TAB_ORDER.map((id) => (
          <TabButton
            key={id}
            icon={TAB_ICONS[id]}
            label={props.labels[id]}
            selected={props.active === id}
            onSelect={() => props.onSelect(id)}
          />
        ))}
      </Focusable>
      <div style={{ textAlign: "center", fontSize: 11, opacity: 0.7, marginTop: 6 }}>{props.hint}</div>
    </div>
  );
}

export function Card(props: { badge?: string; tone?: BadgeTone; rows: [string, string][] }) {
  const color = TONES[props.tone ?? "off"];
  return (
    <div
      style={{
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 10,
        background: "rgba(255, 255, 255, 0.04)",
        overflow: "hidden",
        marginBottom: 10,
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {props.badge ? (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderBottom: `1px solid ${LINE}`,
            fontWeight: 700,
            fontSize: 13,
            color,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
          {props.badge}
        </div>
      ) : null}
      {props.rows.map(([label, value], i) => (
        <div
          key={label + i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            padding: "8px 12px",
            borderTop: i === 0 && !props.badge ? "none" : i === 0 ? "none" : `1px solid ${LINE}`,
            fontSize: 14,
          }}
        >
          <span style={{ opacity: 0.9, flexShrink: 0 }}>{label}</span>
          <span style={{ fontWeight: 600, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15, margin: "8px 0 10px" }}>
      {title}
      <div style={{ height: 3, borderRadius: 2, background: "#a35cf0", marginTop: 4 }} />
    </div>
  );
}

/** Container unificado: borda fina, fundo translúcido, cantos de 10 px. */
export const BOX: CSSProperties = {
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
  borderRadius: 10,
  boxSizing: "border-box",
  width: "100%",
  marginBottom: 10,
};

export function Box({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...BOX, padding: "6px 8px", ...style }}>{children}</div>;
}

const FOCUS_BORDER = "1px solid rgba(124, 140, 255, 0.95)";
const FOCUS_GLOW = "0 0 0 2px rgba(124, 140, 255, 0.35)";

/** Seção recolhível. Fechada: ícone e nome à esquerda; resumo e seta à direita. Aberta: controles no mesmo container. */
export function Collapsible(props: {
  title: string;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  children: ReactNode;
  icon?: ReactNode;
  summary?: string;
}) {
  const tap = useTap(() => props.onToggle(!props.collapsed));
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ ...BOX, overflow: "hidden", border: focused ? FOCUS_BORDER : BOX.border, boxShadow: focused ? FOCUS_GLOW : "none" }}>
      <Focusable
        onActivate={tap}
        onClick={tap}
        onGamepadFocus={() => setFocused(true)}
        onGamepadBlur={() => setFocused(false)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", fontSize: 14, fontWeight: 700 }}
      >
        {props.icon ? <span style={{ display: "flex", flexShrink: 0, color: ACCENT }}>{props.icon}</span> : null}
        <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{props.title}</span>
        {props.summary ? (
          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, textAlign: "right", maxWidth: "45%", overflowWrap: "anywhere" }}>
            {props.summary}
          </span>
        ) : null}
        <span style={{ display: "flex", flexShrink: 0, opacity: 0.85 }}>
          {props.collapsed ? <FaChevronRight size={12} /> : <FaChevronDown size={12} />}
        </span>
      </Focusable>
      {!props.collapsed && <div style={{ padding: "8px 8px 4px", borderTop: `1px solid ${LINE}` }}>{props.children}</div>}
    </div>
  );
}

export function Footer({ text }: { text: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 12,
        color: ACCENT,
        padding: "10px 0 6px",
        marginTop: 6,
        borderTop: `1px solid ${LINE}`,
      }}
    >
      {text}
    </div>
  );
}

export function Help({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <div
      style={{
        fontSize: 12,
        lineHeight: 1.45,
        opacity: 0.92,
        padding: "8px 10px",
        margin: "0 0 12px",
        whiteSpace: "pre-line",
        overflowWrap: "anywhere",
        borderLeft: "3px solid #ffc857",
        background: "rgba(255, 200, 87, 0.08)",
        borderRadius: 4,
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
}

export function HelpBar(props: { label: string; visible: boolean; onToggle: () => void }) {
  const tap = useTap(props.onToggle);
  return (
    <Focusable
      onActivate={tap}
      onClick={tap}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "6px 0",
        marginBottom: 10,
        borderRadius: 8,
        border: "1px solid rgba(255, 200, 87, 0.6)",
        fontSize: 13,
        fontWeight: 600,
        color: props.visible ? "#ffc857" : "inherit",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          lineHeight: "20px",
          borderRadius: 10,
          textAlign: "center",
          background: "#ffc857",
          color: "#1b1b1b",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        Y
      </span>
      {props.label}
    </Focusable>
  );
}

export interface ChartLine {
  key: string;
  label: string;
  color: string;
  values: (number | null)[];
  avg: string;
  best: boolean;
  dashed?: boolean;
}

export function LineChart(props: { lines: ChartLine[]; emptyText: string; bestTag: string; compact?: boolean }) {
  const W = props.compact ? 200 : 300;
  const H = props.compact ? 100 : 110;
  const PAD = 6;
  const nums = props.lines.flatMap((l) => l.values.filter((v): v is number => v !== null));
  if (!nums.length) {
    return <div style={{ textAlign: "center", fontSize: 13, opacity: 0.8, padding: props.compact ? "30px 0" : "14px 0" }}>{props.emptyText}</div>;
  }
  let lo = Math.min(...nums);
  let hi = Math.max(...nums);
  if (hi - lo < 10) {
    const mid = (hi + lo) / 2;
    lo = Math.max(0, mid - 5);
    hi = mid + 5;
  }
  const n = Math.max(...props.lines.map((l) => l.values.length), 2);
  const xAt = (i: number, len: number) => PAD + ((i + (n - len)) / (n - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - ((v - lo) / (hi - lo)) * (H - PAD * 2);
  const pathOf = (values: (number | null)[]) => {
    let d = "";
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${xAt(i, values.length).toFixed(1)} ${yAt(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  return (
    <div style={{ marginBottom: props.compact ? 0 : 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", background: props.compact ? "transparent" : "rgba(255,255,255,0.04)", borderRadius: 8 }}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        ))}
        <text x={W - PAD} y={PAD + 9} fontSize={9} fill="rgba(255,255,255,0.7)" textAnchor="end">{`${hi.toFixed(0)} ms`}</text>
        <text x={W - PAD} y={H - PAD - 2} fontSize={9} fill="rgba(255,255,255,0.7)" textAnchor="end">{`${lo.toFixed(0)} ms`}</text>
        {props.lines.map((l) => (
          <path key={l.key} d={pathOf(l.values)} fill="none" stroke={l.color} strokeWidth={l.best ? 3 : 2} strokeDasharray={l.dashed ? "4 3" : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
      {!props.compact && (
      <div style={{ marginTop: 8 }}>
        {props.lines.map((l) => (
          <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "3px 2px" }}>
            <span style={{ width: 18, height: 4, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{l.label}</span>
            {l.best && <span style={{ fontSize: 11, fontWeight: 800, color: "#3ddc84" }}>{props.bestTag}</span>}
            <span style={{ fontWeight: 600 }}>{l.avg}</span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

/** Medidor circular (anel) com o valor em destaque no centro. */
export function Ring(props: { value: number | null; max: number; color: string; unit: string; sub?: string }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const frac = props.value === null ? 0 : Math.max(0.04, Math.min(1, props.value / props.max));
  return (
    <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
      <svg viewBox="0 0 112 112" width={112} height={112} style={{ display: "block" }}>
        <circle cx={56} cy={56} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={9} />
        <circle
          cx={56}
          cy={56}
          r={R}
          fill="none"
          stroke={props.color}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`}
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.05, color: props.color }}>
          {props.value === null ? "—" : props.value.toFixed(0)}
        </span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>{props.unit}</span>
        {props.sub ? <span style={{ fontSize: 9, opacity: 0.65, marginTop: 1 }}>{props.sub}</span> : null}
      </div>
    </div>
  );
}

/** Mini-card de telemetria: ícone, valor atual e comparação Com / Sem Mudfish. */
export function MiniCard(props: {
  icon: ReactNode;
  title: string;
  value: string;
  withLabel: string;
  withValue: string;
  withoutLabel: string;
  withoutValue: string;
  withOn: boolean;
}) {
  return (
    <div style={{ ...BOX, marginBottom: 0, padding: "10px 10px", minWidth: 0, boxSizing: "border-box", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.85, minWidth: 0, height: 16 }}>
        <span style={{ display: "flex", flexShrink: 0, width: 14, justifyContent: "center", color: ACCENT }}>{props.icon}</span>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.title}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: "28px", margin: "6px 0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{props.value}</div>
      <div style={{ marginTop: "auto", display: "grid", rowGap: 3 }}>
        <div style={{ fontSize: 11, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: 8, color: props.withOn ? "#3ddc84" : "inherit", opacity: props.withOn ? 1 : 0.6 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.withLabel}</span>
          <span style={{ fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{props.withValue}</span>
        </div>
        <div style={{ fontSize: 11, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: 8, color: "#9aa4b2" }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.withoutLabel}</span>
          <span style={{ fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{props.withoutValue}</span>
        </div>
      </div>
    </div>
  );
}
