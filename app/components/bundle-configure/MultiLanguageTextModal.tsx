import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { normalizeTranslationValues } from "../../lib/bundle-configure-translations";

interface ShopLocale {
  locale: string;
  name: string;
  primary?: boolean;
}

export interface MultiLanguageField {
  key: string;
  label: string;
  fallback: string;
  multiline?: boolean;
  headingBefore?: string;
}

interface MultiLanguageTextModalProps {
  id?: string;
  open: boolean;
  title: string;
  layout?: "rich" | "compact";
  saveLabel?: string;
  locales: ShopLocale[];
  activeLocale: string;
  fields: MultiLanguageField[];
  valuesByLocale: Record<string, Record<string, string>>;
  onActiveLocaleChange: (locale: string) => void;
  onSave: (valuesByLocale: Record<string, Record<string, string>>) => void;
  onClose: () => void;
}

export function MultiLanguageTextModal({
  id = "bundle-configure-translation-modal",
  open,
  title,
  layout = "rich",
  saveLabel,
  locales,
  activeLocale,
  fields,
  valuesByLocale,
  onActiveLocaleChange,
  onSave,
  onClose,
}: MultiLanguageTextModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<any>(null);
  const wasOpenRef = useRef(false);
  const [draftByLocale, setDraftByLocale] = useState<Record<string, Record<string, string>>>({});

  const selectedLocale = locales.some((locale) => locale.locale === activeLocale)
    ? activeLocale
    : locales.find((locale) => locale.primary)?.locale ?? locales[0]?.locale ?? "";

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    if (open && !wasOpenRef.current) {
      setDraftByLocale(valuesByLocale);
      modal.showOverlay?.();
    } else if (!open && wasOpenRef.current) {
      modal.hideOverlay?.();
    }
    wasOpenRef.current = open;
  }, [open, valuesByLocale]);

  const localeValues = draftByLocale[selectedLocale] ?? {};

  const updateDraft = (key: string, value: string) => {
    setDraftByLocale((prev) => ({
      ...prev,
      [selectedLocale]: {
        ...(prev[selectedLocale] ?? {}),
        [key]: value,
      },
    }));
  };

  const saveAndClose = () => {
    const normalizedValues = normalizeTranslationValues(draftByLocale);
    onSave(normalizedValues);
    onClose();
  };

  const renderFields = () => {
    let lastHeading = "";

    return fields.map((field) => {
      const fieldInput = field.multiline ? (
        <s-text-area
          key={`${field.key}-input`}
          label={field.label}
          value={localeValues[field.key] ?? ""}
          placeholder={field.fallback}
          onInput={(event: Event) => updateDraft(field.key, (event.target as HTMLTextAreaElement).value)}
        />
      ) : (
        <s-text-field
          key={`${field.key}-input`}
          label={field.label}
          value={localeValues[field.key] ?? ""}
          placeholder={field.fallback}
          autocomplete="off"
          onInput={(event: Event) => updateDraft(field.key, (event.target as HTMLInputElement).value)}
        />
      );

      if (!field.headingBefore || field.headingBefore === lastHeading) {
        return fieldInput;
      }

      lastHeading = field.headingBefore;

      return (
        <s-stack key={field.key} direction="block" gap="small-100">
          <s-text type="strong">{field.headingBefore}</s-text>
          {fieldInput}
        </s-stack>
      );
    });
  };

  const compactBody = (
    <s-stack direction="block" gap="base">
      <s-select
        label="Select Language"
        value={selectedLocale}
        onChange={(event: Event) => onActiveLocaleChange((event.target as HTMLSelectElement).value)}
      >
        {locales.map((locale) => (
          <s-option key={locale.locale} value={locale.locale}>
            {locale.name || locale.locale}
          </s-option>
        ))}
      </s-select>

      <s-stack direction="block" gap="base">
        {renderFields()}
      </s-stack>
    </s-stack>
  );

  const richBody = (
    <s-stack direction="block" gap="base">
      <s-stack direction="block" gap="small-100">
        <s-heading>{t("common.multiLanguage.translations")}</s-heading>
        <s-text color="subdued">{t("common.multiLanguage.helper")}</s-text>
      </s-stack>
      <s-heading>{t("common.multiLanguage.chooseLanguage")}</s-heading>
      <s-select
        label={t("common.multiLanguage.chooseLanguage")}
        value={selectedLocale}
        onChange={(event: Event) => onActiveLocaleChange((event.target as HTMLSelectElement).value)}
      >
        {locales.map((locale) => (
          <s-option key={locale.locale} value={locale.locale}>
            {locale.name || locale.locale}
          </s-option>
        ))}
      </s-select>

      <s-stack direction="block" gap="small-100">
        <s-heading>{t("common.multiLanguage.customText")}</s-heading>
        <s-text color="subdued">{t("common.multiLanguage.inputHelper")}</s-text>
      </s-stack>
      <s-heading>{t("common.multiLanguage.textSettings")}</s-heading>

      <s-stack direction="block" gap="base">
        {renderFields()}
      </s-stack>
    </s-stack>
  );

  return (
    <s-modal
      id={id}
      ref={modalRef}
      heading={title || t("common.multiLanguage.title")}
      onHide={onClose}
    >
      {layout === "compact" ? compactBody : richBody}
      <s-button slot="primary-action" variant="primary" onClick={saveAndClose}>
        {saveLabel ?? t("common.multiLanguage.saveAndClose")}
      </s-button>
      <s-button slot="secondary-actions" onClick={onClose}>
        {t("common.actions.cancel")}
      </s-button>
    </s-modal>
  );
}
