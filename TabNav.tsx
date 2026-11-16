export type TabKey = "dash" | "wifi" | "mudfish" | "conf";
export const TAB_KEYS: TabKey[] = ["dash", "wifi", "mudfish", "conf"];

interface Props {
  labels: Record<TabKey, string>;
  hint: string;
  active: TabKey;
  onSelect: (tab: TabKey) => void;
}

// As abas não recebem o foco do controle: L1/R1 troca a aba e o toque também.
// Assim só a aba ativa fica destacada e o botão A nunca age na aba errada.
export function TabNav({ labels, hint, active, onSelect }: Props) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 4 }} role="tablist">
        {TAB_KEYS.map((key) => {
          const on = active === key;
          return (
            <div
              key={key}
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(key)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 2px",
                fontSize: 12,
                textAlign: "center",
                borderRadius: 16,
                cursor: "pointer",
                userSelect: "none",
                fontWeight: on ? 700 : 400,
                opacity: on ? 1 : 0.6,
                background: on ? "#4b3fe0" : "rgba(255,255,255,0.08)",
              }}
            >
              {labels[key]}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, opacity: 0.6, textAlign: "center", marginTop: 3 }}>{hint}</div>
    </div>
  );
}

// Ajuda só por toque (o botão Y não é usado).
export function HelpToggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div
      role="button"
      aria-pressed={on}
      onClick={onToggle}
      style={{
        margin: "0 0 12px 0",
        padding: "9px 8px",
        textAlign: "center",
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 8,
        cursor: "pointer",
        userSelect: "none",
        border: "1px solid rgba(255,200,0,0.7)",
        color: on ? "#ffd84a" : "inherit",
        background: on ? "rgba(255,200,0,0.18)" : "transparent",
      }}
    >
      ? {label}
    </div>
  );
}
