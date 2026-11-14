import { Focusable } from "@decky/ui";
import { ReactNode, useRef } from "react";
import { FaCheck, FaChevronDown, FaChevronUp, FaCog, FaRoute, FaTachometerAlt } from "react-icons/fa";

const LINE = "rgba(42, 167, 201, 0.35)";
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
        border: `1px solid ${ACCENT}`,
        borderRadius: 10,
        background: "rgba(14, 50, 90, 0.75)",
        overflow: "hidden",
        marginBottom: 12,
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
          <span style={{ opacity: 0.9 }}>{label}</span>
          <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15, margin: "6px 0 8px" }}>
      {title}
      <div style={{ height: 3, borderRadius: 2, background: "#a35cf0", marginTop: 4 }} />
    </div>
  );
}

export function Collapsible(props: {
  title: string;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  children: ReactNode;
}) {
  const tap = useTap(() => props.onToggle(!props.collapsed));
  return (
    <div style={{ marginBottom: 12 }}>
      <SectionTitle title={props.title} />
      <Focusable
        onActivate={tap}
        onClick={tap}
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "8px 0",
          marginBottom: 8,
          borderRadius: 20,
          background: "linear-gradient(180deg, #4a5fd6 0%, #3a49b8 100%)",
        }}
      >
        {props.collapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
      </Focusable>
      {!props.collapsed && props.children}
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
