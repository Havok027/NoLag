import { DialogButton, Focusable } from "@decky/ui";
import { useEffect, useRef } from "react";

export type TabKey = "dash" | "wifi" | "routes" | "settings";
export const TAB_KEYS: TabKey[] = ["dash", "wifi", "routes", "settings"];

interface Props {
  labels: Record<TabKey, string>;
  hint: string;
  active: TabKey;
  onSelect: (tab: TabKey) => void;
}

export function TabNav({ labels, hint, active, onSelect }: Props) {
  const box = useRef<HTMLDivElement | null>(null);
  const first = useRef(true);

  // Troca por L1/R1: o foco acompanha a aba ativa, senão a anterior continua
  // destacada. Só move o foco se ele já estava na barra de abas.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const row = box.current?.firstElementChild as HTMLElement | null;
    const target = row?.children[TAB_KEYS.indexOf(active)] as HTMLElement | undefined;
    const current = document.activeElement;
    if (target && row && current && row.contains(current) && current !== target) target.focus();
  }, [active]);

  return (
    <div ref={box} style={{ marginBottom: 6 }}>
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
              background: active === key ? "#4b3fe0" : undefined,
              fontWeight: active === key ? 700 : 400,
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
