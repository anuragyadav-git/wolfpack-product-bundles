import type { SettingsFieldGroup } from "../../../lib/admin-configuration-surfaces";
import {
  LANGUAGE_CONFIGURATION,
} from "../../../lib/admin-configuration-surfaces";
import { SETTINGS_LANGUAGE_LOCALES } from "../../../lib/settings-language-runtime";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import { ControlsField, getSettingsVariables } from "./SettingsControls";
import { getFieldValueKey, getInitialLanguageFieldValues } from "./settings-state";

export function LanguageSettingsView({
  activeLayout,
  activePanel,
  fieldGroups,
  fieldValues,
  languageMode,
  localeFieldValues,
  selectedLocale,
  onBack,
  onFieldChange,
  onLayoutChange,
  onModeChange,
  onPanelChange,
  onRemoveLocale,
  onSelectLocale,
  onShowVariables,
}: {
  activeLayout: string;
  activePanel: string;
  fieldGroups: SettingsFieldGroup[];
  fieldValues: Record<string, string>;
  languageMode: "SINGLE" | "MULTIPLE";
  localeFieldValues: Record<string, Record<string, string>>;
  selectedLocale: string;
  onBack: () => void;
  onFieldChange: (key: string, value: string) => void;
  onLayoutChange: (layout: string) => void;
  onModeChange: (mode: "SINGLE" | "MULTIPLE") => void;
  onPanelChange: (panel: string) => void;
  onRemoveLocale: (locale: string) => void;
  onSelectLocale: (locale: string, initialValues?: Record<string, string>) => void;
  onShowVariables: (title: string, variables: string[]) => void;
}) {
  const sections = activeLayout === "Product Page Layout"
    ? LANGUAGE_CONFIGURATION.productPageTemplateSections
    : LANGUAGE_CONFIGURATION.templateSections;

  return (
    <s-box paddingInline="base">
      <s-page inlineSize="large">
        <s-stack gap="@container (inline-size > 600px) large, base">
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-button
            variant="tertiary"
            icon="arrow-left"
            accessibilityLabel="Back to Settings"
            onClick={onBack}
          />
          <s-heading>Language settings</s-heading>
        </s-stack>

        <s-section>
          <s-stack gap="base">
            <s-grid gridTemplateColumns="@container (inline-size > 700px) 1fr 1fr, 1fr" gap="base">
              <s-switch
                label="Enable multiple languages"
                details="Show bundle labels in more than one language."
                checked={languageMode === "MULTIPLE" || undefined}
                onChange={(event) => onModeChange(event.currentTarget.checked ? "MULTIPLE" : "SINGLE")}
              />
              <s-select
                label="Add or edit languages"
                value={selectedLocale}
                disabled={languageMode === "SINGLE" || undefined}
                onChange={(event) => {
                  const locale = event.currentTarget.value || "en";
                  onSelectLocale(locale, localeFieldValues[locale] ? undefined : getInitialLanguageFieldValues(locale));
                }}
              >
                {SETTINGS_LANGUAGE_LOCALES.map((language) => (
                  <s-option key={language.code} value={language.code}>{language.label}</s-option>
                ))}
              </s-select>
            </s-grid>
            <div className={styles.languageLocaleRail}>
              <s-stack direction="inline" gap="small" alignItems="center">
                {Object.keys(localeFieldValues).map((locale) => {
                  const label = SETTINGS_LANGUAGE_LOCALES.find((option) => option.code === locale)?.label ?? locale;
                  return (
                    <s-clickable-chip
                      key={locale}
                      color={selectedLocale === locale ? "strong" : "base"}
                      removable={locale !== "en" || undefined}
                      onClick={() => onSelectLocale(locale)}
                      onRemove={locale === "en" ? undefined : () => onRemoveLocale(locale)}
                    >
                      {label}
                    </s-clickable-chip>
                  );
                })}
              </s-stack>
            </div>
          </s-stack>
        </s-section>

        <div className={styles.languageContentLayout}>
          <s-section>
            <s-stack gap="large">
              <s-stack gap="small">
                <s-heading>Shared labels</s-heading>
                <s-text color="subdued">Used across every bundle layout.</s-text>
                <div className={styles.languageDesktopPanelNav}>
                  <s-button
                    variant={activePanel === "cartCheckout" ? "primary" : "tertiary"}
                    onClick={() => onPanelChange("cartCheckout")}
                  >
                    Cart &amp; Checkout
                  </s-button>
                </div>
              </s-stack>
              <s-divider />
              <s-stack gap="small">
                <s-heading>Bundle labels</s-heading>
                <s-text color="subdued">Choose a layout, then edit its labels.</s-text>
                <s-select
                  label="Bundle layout"
                  value={activeLayout}
                  onChange={(event) => onLayoutChange(event.currentTarget.value || activeLayout)}
                >
                  <s-option value="Landing Page Layout">Landing Page Layout</s-option>
                  <s-option value="Product Page Layout">Product Page Layout</s-option>
                </s-select>
                <div className={styles.languageDesktopPanelNav}>
                  {sections.map((section) => (
                    <s-button
                      key={section}
                      variant={activePanel === section ? "primary" : "tertiary"}
                      onClick={() => onPanelChange(section)}
                    >
                      {section}
                    </s-button>
                  ))}
                </div>
                <nav className={styles.languageMobilePanelRail} aria-label="Language sections">
                  <s-stack direction="inline" gap="small">
                    <s-clickable-chip
                      color={activePanel === "cartCheckout" ? "strong" : "base"}
                      onClick={() => onPanelChange("cartCheckout")}
                    >
                      Cart &amp; Checkout
                    </s-clickable-chip>
                    {sections.map((section) => (
                      <s-clickable-chip
                        key={section}
                        color={activePanel === section ? "strong" : "base"}
                        onClick={() => onPanelChange(section)}
                      >
                        {section}
                      </s-clickable-chip>
                    ))}
                  </s-stack>
                </nav>
              </s-stack>
            </s-stack>
          </s-section>

          <s-stack gap="base">
            {fieldGroups.map((group) => {
              const variables = getSettingsVariables(group.fields, fieldValues);
              return (
                <s-section key={`${activePanel}-${group.title}`} heading={group.title}>
                  <s-stack gap="base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
                      <s-text color="subdued">{group.description}</s-text>
                      {variables.length > 0 && (
                        <s-button
                          variant="tertiary"
                          commandFor="settings-language-variables"
                          command="--show"
                          onClick={() => onShowVariables(group.title, variables)}
                        >
                          Show Variables
                        </s-button>
                      )}
                    </s-stack>
                    {group.fields.map((field) => {
                      const key = getFieldValueKey(field);
                      return (
                        <ControlsField
                          key={key}
                          field={field}
                          value={fieldValues[key] ?? ""}
                          onChange={(value) => onFieldChange(key, value)}
                        />
                      );
                    })}
                  </s-stack>
                </s-section>
              );
            })}
          </s-stack>
        </div>
        </s-stack>
      </s-page>
    </s-box>
  );
}
