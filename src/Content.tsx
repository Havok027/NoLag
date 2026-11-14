import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import {
  Metrics,
  Profile,
  Relay,
  Status,
  addRelay,
  getRelays,
  getSettings,
  getStatus,
  removeRelay,
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
    case "waiting":
      return s.game ? t.waitTraffic : t.waitGame;
    case "running":
      return t.stateRunning;
    case "error":
      return t.stateError;
    default:
      return t.stateOff;
  }
}

function noticeText(t: Texts, s: Status): string {
  switch (s.notice) {
    case "no_relays":
      return t.noticeNoRelays;
    case "tools_missing":
      return `${t.noticeTools}: ${s.detail}`;
    case "setup_failed":
      return t.noticeSetup;
    default:
      return "";
  }
}

function errorText(t: Texts, s: Status): string {
  switch (s.error) {
    case "tools_missing":
      return `${t.errToolsMissing}: ${s.detail}`;
    case "sniff_failed":
      return t.errSniff;
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
  const [profile, setProfile] = useState<Profile>("balanced");
  const [status, setStatus] = useState<Status | null>(null);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [code, setCode] = useState("");
  const [relayMsg, setRelayMsg] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setLang(normalizeLang(s?.language));
        setEnabled(s?.enabled === true);
        setProfile(s?.profile ?? "balanced");
      })
      .catch(() => {});
    getRelays()
      .then(setRelays)
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

  const changeProfile = (value: Profile) => {
    setProfile(value);
    setSettings({ profile: value }).catch(() => {});
  };

  const changeCode = (value: string) => {
    setCode(value);
    setRelayMsg("");
    window.clearTimeout(timer.current);
    if (!value.trim()) return;
    timer.current = window.setTimeout(() => {
      addRelay(value)
        .then((r) => {
          setRelays(r.relays);
          if (r.ok) {
            setCode("");
            setRelayMsg(t.relayAdded);
          } else {
            setRelayMsg(r.error === "too_many" ? t.relayLimit : t.relayBad);
          }
        })
        .catch(() => {});
    }, 800);
  };

  const dropRelay = (name: string) => {
    removeRelay(name)
      .then(setRelays)
      .catch(() => {});
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
        {status?.notice && status.phase !== "off" ? (
          <Row label={t.notice} value={noticeText(t, status)} />
        ) : null}
        {status?.game ? <Row label={t.game} value={status.game} /> : null}
        {status?.phase === "running" && (
          <>
            <Row label={t.server} value={status.target} />
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
          <DropdownItem
            label={t.profile}
            description={t.profileDesc}
            rgOptions={[
              { data: "stable", label: t.profileStable },
              { data: "balanced", label: t.profileBalanced },
              { data: "aggressive", label: t.profileAggressive },
            ]}
            selectedOption={profile}
            onChange={(opt) => changeProfile(opt.data as Profile)}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t.relaysTitle}>
        {relays.length === 0 && <Row label={t.relaysNone} value="" />}
        {relays.map((r) => (
          <PanelSectionRow key={r.name}>
            {r.builtin ? (
              <Row label={r.name} value={t.relayBuiltin} />
            ) : (
              <ButtonItem
                layout="inline"
                label={r.name}
                description={r.endpoint}
                onClick={() => dropRelay(r.name)}
              >
                {t.relayRemove}
              </ButtonItem>
            )}
          </PanelSectionRow>
        ))}
        <PanelSectionRow>
          <TextField
            label={t.relayCode}
            description={relayMsg || t.relayCodeDesc}
            value={code}
            onChange={(e) => changeCode(e.target.value)}
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
