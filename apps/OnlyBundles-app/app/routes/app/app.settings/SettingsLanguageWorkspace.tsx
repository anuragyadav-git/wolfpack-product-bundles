import type { Dispatch, SetStateAction } from "react";

import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import {
  LANGUAGE_CONFIGURATION,
  type SettingsFieldGroup,
} from "../../../lib/admin-configuration-surfaces";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import { translateAdmin } from "~/i18n/config";
import { LanguageSettingsView } from "./LanguageSettingsView";
import { SettingsVariablesModal } from "./SettingsControls";
import { SettingsContextualSaveBar } from "./SettingsFeedback";
import { getInitialLanguageFieldValues } from "./settings-state";

type LocaleValues = Record<string, Record<string, string>>;

type SettingsLanguageWorkspaceProps = {
  activeLayout: string;
  activePanel: string;
  fieldGroups: SettingsFieldGroup[];
  fieldValues: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;
  languageMode: "SINGLE" | "MULTIPLE";
  localeFieldValues: LocaleValues;
  selectedLocale: string;
  taskAlert: AdminTaskAlert | null;
  variablesModal: { title: string; variables: string[] } | null;
  onBack: () => void;
  onDiscard: () => void;
  onDismissAlert: () => void;
  onSave: () => void;
  setActiveLayout: Dispatch<SetStateAction<string>>;
  setActivePanel: Dispatch<SetStateAction<string>>;
  setLanguageMode: Dispatch<SetStateAction<"SINGLE" | "MULTIPLE">>;
  setLocaleFieldValues: Dispatch<SetStateAction<LocaleValues>>;
  setSelectedLocale: Dispatch<SetStateAction<string>>;
  setVariablesModal: Dispatch<
    SetStateAction<{ title: string; variables: string[] } | null>
  >;
};

export function SettingsLanguageWorkspace({
  activeLayout,
  activePanel,
  fieldGroups,
  fieldValues,
  isDirty,
  isSaving,
  languageMode,
  localeFieldValues,
  selectedLocale,
  taskAlert,
  variablesModal,
  onBack,
  onDiscard,
  onDismissAlert,
  onSave,
  setActiveLayout,
  setActivePanel,
  setLanguageMode,
  setLocaleFieldValues,
  setSelectedLocale,
  setVariablesModal,
}: SettingsLanguageWorkspaceProps) {
  return (
    <>
      <AdminPageTitleBar
        title={translateAdmin("adminAttributes.languageConfigurations")}
        breadcrumbLabel="Settings"
        onBack={onBack}
      />
      <AdminTaskAlertBanner alert={taskAlert} onDismiss={onDismissAlert} />
      <LanguageSettingsView
        activeLayout={activeLayout}
        activePanel={activePanel}
        fieldGroups={fieldGroups}
        fieldValues={fieldValues}
        languageMode={languageMode}
        localeFieldValues={localeFieldValues}
        selectedLocale={selectedLocale}
        onBack={onBack}
        onFieldChange={(key, value) =>
          setLocaleFieldValues((current) => ({
            ...current,
            [selectedLocale]: {
              ...(current[selectedLocale] ?? getInitialLanguageFieldValues()),
              [key]: value,
            },
          }))
        }
        onLayoutChange={(nextLayout) => {
          setActiveLayout(nextLayout);
          setSelectedLocale("en");
          setActivePanel(
            nextLayout === "Product Page Layout"
              ? LANGUAGE_CONFIGURATION.productPageTemplateSections[0]
              : LANGUAGE_CONFIGURATION.templateSections[0]
          );
        }}
        onModeChange={(nextMode) => {
          setLanguageMode(nextMode);
          setSelectedLocale("en");
        }}
        onPanelChange={setActivePanel}
        onRemoveLocale={(locale) => {
          setLocaleFieldValues((current) =>
            Object.fromEntries(
              Object.entries(current).filter(([code]) => code !== locale)
            )
          );
          if (selectedLocale === locale) setSelectedLocale("en");
        }}
        onSelectLocale={(locale, initialValues) => {
          if (initialValues) {
            setLocaleFieldValues((current) => ({
              ...current,
              [locale]: initialValues,
            }));
          }
          setSelectedLocale(locale);
        }}
        onShowVariables={(title, variables) =>
          setVariablesModal({ title, variables })
        }
      />
      <SettingsContextualSaveBar
        isOpen={isDirty}
        isSaving={isSaving}
        onDiscard={onDiscard}
        onSave={onSave}
      />
      <SettingsVariablesModal
        modal={variablesModal}
        onClose={() => setVariablesModal(null)}
      />
    </>
  );
}
