import { useEffect, useRef, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { SettingsField } from "../../../lib/admin-configuration-surfaces";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
import { getSlotIconRecommendation } from "../../../lib/settings-design-runtime";
import { FilePicker } from "../../../components/shared/FilePicker";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import {
  SettingsPreviewError,
  openSettingsBundleStorefrontPreview,
  type SettingsPreviewBundle,
} from "../../../lib/settings-design-storefront-preview.client";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import { useTranslation } from "react-i18next";

export const isPolarisHexColorInput = (value: string) => {
  if (value.length !== 7 && value.length !== 9) return false;
  if (!value.startsWith("#")) return false;
  return [...value.slice(1).toLowerCase()].every((character) =>
    "0123456789abcdef".includes(character),
  );
};

export const isPolarisNumberInput = (value: string) => {
  if (!value || value.length > 7) return false;
  let decimalCount = 0;
  for (const character of value) {
    if (character === ".") {
      decimalCount += 1;
      if (decimalCount > 1) return false;
      continue;
    }
    if (character < "0" || character > "9") return false;
  }
  const [integer, fraction] = value.split(".");
  return Boolean(integer)
    && integer.length <= 3
    && (fraction === undefined || (fraction.length > 0 && fraction.length <= 3))
    && Number(value) <= 999;
};

export function normalizePolarisColorValue(value: string, fallback: string): string {
  if (isPolarisHexColorInput(value)) return value;
  if (isPolarisHexColorInput(fallback)) return fallback;
  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(fallback);
  return shortHex
    ? `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`
    : "#000000";
}

export function SettingsCardIcon({ icon }: { icon: string }) {
  return (
    <span className={styles.settingsCardIcon} aria-hidden="true">
      <s-icon type={icon as any} size="base"></s-icon>
    </span>
  );
}

export function DesignFields({
  title,
  fields,
  values,
  disabledFieldKeys = [],
  inheritedFieldKeys = [],
  onFieldChange,
}: {
  title?: string;
  fields: SettingsField[];
  values: Record<string, string>;
  disabledFieldKeys?: string[];
  inheritedFieldKeys?: string[];
  onFieldChange: (label: string, value: string) => void;
}) {
  const defaultGroup = title ?? "";
  const groupedFields = fields.reduce<Array<{ title: string; fields: SettingsField[] }>>((groups, field) => {
    const groupTitle = field.group ?? defaultGroup;
    const existing = groups.find((group) => group.title === groupTitle);
    if (existing) {
      existing.fields.push(field);
    } else {
      groups.push({ title: groupTitle, fields: [field] });
    }
    return groups;
  }, []);
  return (
    <s-stack gap="base">
      {groupedFields.map((group) => {
        const guideUrl = group.fields.find((field) => field.guideUrl)?.guideUrl;

        return (
          <s-section key={group.title} heading={group.title || undefined}>
            <s-stack gap="base">
              {group.fields.map((field) => {
                const fieldKey = field.key ?? field.label;
                const disabled = disabledFieldKeys.includes(fieldKey);
                const value = values[fieldKey] ?? field.value ?? "";
                const colorValue = normalizePolarisColorValue(value, field.value || "#000000");
                const handleInput = (event: Event) => {
                  onFieldChange(fieldKey, (event.currentTarget as HTMLInputElement).value);
                };
                const handleColorInput = (event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  const nextValue = input.value;
                  if (isPolarisHexColorInput(nextValue)) {
                    onFieldChange(fieldKey, nextValue);
                  } else {
                    input.value = colorValue;
                  }
                };
                const numberValue = value.replace(/(px|rem|em)$/i, "");
                const handleNumberInput = (event: Event) => {
                  const input = event.currentTarget as HTMLInputElement;
                  if (isPolarisNumberInput(input.value)) {
                    onFieldChange(fieldKey, input.value);
                  } else {
                    input.value = numberValue;
                  }
                };

                if (field.kind === "color") {
                  return (
                    <s-stack key={`${group.title}:${field.label}`} gap="small">
                      <s-color-field
                        label={field.label}
                        name={fieldKey}
                        value={colorValue}
                        details={field.description}
                        alpha
                        disabled={disabled}
                        onChange={handleColorInput}
                      />
                      {inheritedFieldKeys.includes(fieldKey) ? (
                        <s-badge tone="info">Shop Brand</s-badge>
                      ) : null}
                    </s-stack>
                  );
                }
                if (field.kind === "select") {
                  const recommendation = fieldKey === "stylePresets.images.slotIconFit"
                    ? getSlotIconRecommendation(value)
                    : null;
                  return (
                    <s-stack key={`${group.title}:${field.label}`} gap="small">
                      <s-select
                        label={field.label}
                        name={fieldKey}
                        value={value || field.options?.[0] || ""}
                        details={field.description}
                        disabled={disabled}
                        onChange={handleInput}
                      >
                        {(field.options?.length ? field.options : [field.value ?? ""]).map((option) => (
                          <s-option key={option} value={option}>{option}</s-option>
                        ))}
                      </s-select>
                      {recommendation ? <s-text color="subdued">{recommendation}</s-text> : null}
                    </s-stack>
                  );
                }
                if (field.kind === "number") {
                  return (
                    <s-number-field
                      key={`${group.title}:${field.label}`}
                      label={field.label}
                      name={fieldKey}
                      value={numberValue}
                      details={field.description}
                      min={0}
                      max={999}
                      disabled={disabled}
                      onChange={handleNumberInput}
                    />
                  );
                }
                if (field.kind === "loadingGif" || field.kind === "image" || field.kind === "file") {
                  const isGif = field.kind === "loadingGif";
                  return (
                    <FilePicker
                      key={`${group.title}:${field.label}`}
                      label={field.label}
                      hint={isGif ? "Click to upload a loading GIF" : "Click to upload an image or icon"}
                      showUploadButton={false}
                      acceptedTypes={isGif ? "image/gif" : "image/*"}
                      invalidTypeErrorMessage={isGif ? "Choose a GIF file." : "Choose a supported image file."}
                      value={value || null}
                      disabled={disabled}
                      onChange={(url) => onFieldChange(fieldKey, url ?? "")}
                    />
                  );
                }
                return (
                  <s-text-field
                    key={`${group.title}:${field.label}`}
                    label={field.label}
                    name={fieldKey}
                    value={value}
                    details={field.description}
                    disabled={field.kind === "loadingSpinner" || disabled}
                    onInput={handleInput}
                  />
                );
              })}
              {guideUrl ? (
                <s-box padding="base" background="subdued" borderRadius="base">
                  <s-stack gap="small">
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-icon type="view" size="small" />
                      <s-text type="strong">Visual reference</s-text>
                    </s-stack>
                    <s-paragraph color="subdued">
                      See which storefront elements these color controls affect.
                    </s-paragraph>
                    <s-link href={guideUrl} target="_blank">
                      Show Colour Guide
                    </s-link>
                  </s-stack>
                </s-box>
              ) : null}
            </s-stack>
          </s-section>
        );
      })}
    </s-stack>
  );
}

export function BundlePreviewModal({
  bundles,
  onClose,
}: {
  bundles: SettingsPreviewBundle[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const modalRef = useRef<HTMLElement | null>(null);
  const [pendingBundleId, setPendingBundleId] = useState<string | null>(null);
  useModalHideListener(modalRef, onClose);

  useEffect(() => {
    showPolarisModal(modalRef);
    return () => hidePolarisModal(modalRef);
  }, []);

  const openPreview = async (bundle: SettingsPreviewBundle) => {
    setPendingBundleId(bundle.id);
    try {
      await openSettingsBundleStorefrontPreview(bundle);
    } catch (error) {
      const message = error instanceof SettingsPreviewError
        ? t(`settingsDcp.preview.storefront.errors.${error.code}`)
        : t("settingsDcp.preview.storefront.errors.notReady");
      showAdminTransientErrorToast(shopify, message);
    } finally {
      setPendingBundleId(null);
    }
  };

  return (
    <s-modal
      ref={modalRef as any}
      id="settings-design-bundle-preview"
      heading={t("settingsDcp.preview.storefront.heading")}
      size="large"
    >
      <s-button slot="secondary-actions" onClick={onClose}>
        {t("settingsDcp.preview.storefront.close")}
      </s-button>
      <s-stack gap="base">
        {bundles.length === 0 ? (
          <s-paragraph>{t("settingsDcp.preview.storefront.empty")}</s-paragraph>
        ) : (
          <s-table variant="auto">
            <s-table-header-row>
              <s-table-header listSlot="primary">{t("settingsDcp.preview.storefront.bundleName")}</s-table-header>
              <s-table-header listSlot="labeled">{t("settingsDcp.preview.storefront.bundleType")}</s-table-header>
              <s-table-header listSlot="labeled">{t("settingsDcp.preview.storefront.actions")}</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {bundles.map((bundle) => (
                <s-table-row key={bundle.id}>
                  <s-table-cell>{bundle.name}</s-table-cell>
                  <s-table-cell>{bundle.type}</s-table-cell>
                  <s-table-cell>
                    <s-button
                      variant="primary"
                      loading={pendingBundleId === bundle.id || undefined}
                      disabled={pendingBundleId !== null || undefined}
                      onClick={() => void openPreview(bundle)}
                    >
                      {t("settingsDcp.preview.storefront.view")}
                    </s-button>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-stack>
    </s-modal>
  );
}

export function getControlTabIcon(title: string) {
  if (title === "CSS & Scripts") {
    return "note";
  }
  if (title === "Integrations") {
    return "plus";
  }
  if (title === "Advanced") {
    return "filter";
  }
  return "info";
}

export function getDesignIconKey(title: string) {
  if (title === "Brand Colors") {
    return "edit";
  }
  if (title === "Typography") {
    return "note";
  }
  if (title === "Corners") {
    return "edit";
  }
  if (title === "Images & GIFs") {
    return "upload";
  }
  if (title === "Product Card") {
    return "product";
  }
  if (title === "Bundle Cart") {
    return "product";
  }
  if (title === "Upsell") {
    return "plus";
  }
  return "info";
}
