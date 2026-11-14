import {
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import {
  Metrics,
  Status,
  getSettings,
  getStatus,
  setRouteEnabled,
  setSettings,
} from "./api";
import { LANGS, LANG_NAMES, Lang, TEXTS, Texts, normalizeLang } from "./i18n";

const DASH = "—";

function metricsText(m: Metrics | null): string {
  if (!m) return DASH;
  if (m.avg === null) return `${m.loss.toFixed(0)}%`;
  return `${m.avg.toFixed(0)} ms · ${(m.jitter ?? 0).toFixed(1)} · ${m.loss.toFixed(0)}%`;
}

function stateText(t: Texts, s: Status | null): string {
  switch (s?.phase) {
    case "starting":
      return t.stateStarting;
    case "running":
      return t.stateRunning;
    case "error":
      return t.stateError;
    default:
      return t.stateOff;
  }
}

function errorText(t: Texts, s: Status): string {
  switch (s.error) {
    case "tools_missing":
      return `${t.errToolsMissing}: ${s.detail}`;
    case "no_target":
      return t.errNoTarget;
    case "no_relays":
      return `${t.errNoRelays} ${s.detail}`;
    case "setup_failed":
      return t.errSetup;
    default:
      return t.errUnexpected;
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <PanelSectionRow>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
    </PanelSectionRow>
  );
}

export function Content() {
  const [lang, setLang] = useState<Lang>("pt");
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState("");
  const [targetBad, setTargetBad] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setLang(normalizeLang(s?.language));
        setEnabled(s?.enabled === true);
        setTarget(s?.target ?? "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = () =>
      getStatus()
        .then((s) => {
          if (alive) setStatus(s);
        })
        .catch(() => {});
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const t = TEXTS[lang];

  const changeLanguage = (value: Lang) => {
    setLang(value);
    setSettings({ language: value })
      .then((s) => setLang(normalizeLang(s?.language)))
      .catch(() => {});
  };

  const changeEnabled = (value: boolean) => {
    setEnabled(value);
    setRouteEnabled(value)
      .then(setStatus)
      .catch(() => {});
  };

  const changeTarget = (value: string) => {
    setTarget(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSettings({ target: value })
        .then((s) => setTargetBad(value.trim() !== "" && s.target !== value.trim()))
        .catch(() => {});
    }, 800);
  };

  const active =
    status?.active && status.active !== "direct"
      ? status.relays.find((r) => r.iface === status.active)?.name ?? t.routeDirect
      : t.routeDirect;

  return (
    <>
      <PanelSection title={t.status}>
        <Row label={t.state} value={stateText(t, status)} />
        {status?.phase === "error" && <Row label={t.stateError} value={errorText(t, status)} />}
        {status?.phase === "running" && (
          <>
            <Row label={t.activeRoute} value={active} />
            <Row label={t.metricsHint} value="" />
            <Row label={t.direct} value={metricsText(status.direct)} />
            {status.relays.map((r) => (
              <Row
                key={r.iface}
                label={r.name}
                value={r.valid ? metricsText(r.metrics) : t.relayInvalid}
              />
            ))}
          </>
        )}
      </PanelSection>
      <PanelSection title={t.route}>
        <PanelSectionRow>
          <ToggleField
            label={t.enable}
            description={t.enableDesc}
            checked={enabled}
            onChange={changeEnabled}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <TextField
            label={t.target}
            description={targetBad ? t.errTargetInvalid : t.targetDesc}
            value={target}
            onChange={(e) => changeTarget(e.target.value)}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t.settings}>
        <PanelSectionRow>
          <DropdownItem
            label={t.language}
            rgOptions={LANGS.map((l) => ({ data: l, label: LANG_NAMES[l] }))}
            selectedOption={lang}
            onChange={(opt) => changeLanguage(normalizeLang(opt.data))}
          />
        </PanelSectionRow>
      </PanelSection>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          opacity: 0.6,
          padding: "8px 0",
        }}
      >
        {t.createdBy}
      </div>
    </>
  );
}
