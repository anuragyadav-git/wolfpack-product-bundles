import {
  CONTROL_LAYOUTS,
  DESIGN_CONFIGURATION,
  EXPERT_COLOR_CONTROLS,
  LANGUAGE_CONFIGURATION,
  type SettingsField,
} from "../../../lib/admin-configuration-surfaces";
import {
  SETTINGS_LANGUAGE_SOURCE_TEXT,
  SETTINGS_LANGUAGE_TRANSLATIONS,
} from "../../../lib/settings-language-presets.generated";

export function getInitialLanguageFieldValues(locale = "en") {
  const englishValues = Object.fromEntries(
    [
      ...LANGUAGE_CONFIGURATION.sharedCartFields,
      ...LANGUAGE_CONFIGURATION.productCardFields,
      ...Object.values(LANGUAGE_CONFIGURATION.templateFields).flatMap((groups) =>
        groups.flatMap((group) => group.fields),
      ),
      ...Object.values(LANGUAGE_CONFIGURATION.productPageTemplateFields).flatMap((groups) =>
        groups.flatMap((group) => group.fields),
      ),
    ].map((field) => [
      getFieldValueKey(field),
      field.value ?? "",
    ]),
  ) as Record<string, string>;
  const translatedValues = SETTINGS_LANGUAGE_TRANSLATIONS[locale];
  if (!translatedValues) return englishValues;

  const translationBySource = new Map<string, string | undefined>(
    SETTINGS_LANGUAGE_SOURCE_TEXT.map((source, index) => [source, translatedValues[index]]),
  );
  return Object.fromEntries(
    Object.entries(englishValues).map(([key, value]) => [key, translationBySource.get(value) ?? value]),
  );
}

export function getInitialControlFieldValues() {
  return Object.fromEntries(
    CONTROL_LAYOUTS.flatMap((layout) => layout.tabs.flatMap((tab) => tab.fields.map((field) => [
      getFieldValueKey(field),
      field.value ?? "",
    ]))),
  ) as Record<string, string>;
}

export function getInitialDesignFieldValues() {
  return Object.fromEntries(
    [
      ...DESIGN_CONFIGURATION.flatMap((tab) => tab.fields),
      ...Object.values(EXPERT_COLOR_CONTROLS).flat(),
    ].map((field) => [
      field.key ?? field.label,
      field.value ?? "",
    ]),
  ) as Record<string, string>;
}

export function getFieldValueKey(field: SettingsField) {
  return field.key ?? field.label;
}

export function getConfirmedControlValues(
  response: { success?: boolean; intent?: string } | undefined,
  pendingValues: Record<string, string> | null,
) {
  return response?.success === true
    && response.intent === "saveSettingsControls"
    && pendingValues
    ? pendingValues
    : null;
}
