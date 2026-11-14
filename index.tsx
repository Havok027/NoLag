import { callable, definePlugin } from "@decky/api";
import {
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "@decky/ui";
import { useEffect, useState } from "react";
import { FaNetworkWired } from "react-icons/fa";
import { LANGS, LANG_NAMES, Lang, TEXTS, normalizeLang } from "./i18n";

interface Settings {
  language: Lang;
}

const getSettings = callable<[], Settings>("get_settings");
const setSettings = callable<[Partial<Settings>], Settings>("set_settings");

function Content() {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    getSettings()
      .then((s) => setLang(normalizeLang(s?.language)))
      .catch(() => {});
  }, []);

  const t = TEXTS[lang];

  const changeLanguage = (value: Lang) => {
    setLang(value);
    setSettings({ language: value })
      .then((s) => setLang(normalizeLang(s?.language)))
      .catch(() => {});
  };

  return (
    <>
      <PanelSection title={t.status}>
        <PanelSectionRow>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t.state}</span>
            <span>{t.stateValue}</span>
          </div>
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

export default definePlugin(() => ({
  name: "NoLag",
  titleView: <div className={staticClasses.Title}>NoLag</div>,
  content: <Content />,
  icon: <FaNetworkWired />,
  onDismount() {},
}));
