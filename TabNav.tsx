import { DialogButton, Focusable } from "@decky/ui";

export type TabKey = "dash" | "wifi" | "routes" | "settings";
export const TAB_KEYS: TabKey[] = ["dash", "wifi", "routes", "settings"];

interface Props {
  labels: Record<TabKey, string>;
  hint: string;
  active: TabKey;
  onSelect: (tab: TabKey) => void;
}

export function TabNav({ labels, hint, active, onSelect }: Props) {
  return (
    <div style={{ marginBottom: 6 }}>
      <Focusable style={{ display: "flex", gap: 4 }} flow-children="horizontal">
        {TAB_KEYS.map((key) => (
          <DialogButton
            key={key}
            onClick={() => onSelect(key)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "8px 2px",
              fontSize: 12,
              opacity: active === key ? 1 : 0.6,
              background: active === key ? "rgba(255,255,255,0.2)" : undefined,
            }}
          >
            {labels[key]}
          </DialogButton>
        ))}
      </Focusable>
      <div style={{ fontSize: 10, opacity: 0.6, textAlign: "center", marginTop: 3 }}>{hint}</div>
    </div>
  );
}
