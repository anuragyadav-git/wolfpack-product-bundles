import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  DESIGN_CONFIGURATION,
  EXPERT_COLOR_CONTROLS,
  type SettingsField,
} from "../../../lib/admin-configuration-surfaces";
import {
  SETTINGS_DESIGN_DEFAULT_FIELD_VALUES,
} from "../../../lib/settings-design-contract";
import {
  resolveDesignColor,
  type ShopBrandColors,
} from "../../../lib/shop-brand-colors";
import { BundlePreviewModal, DesignFields } from "./SettingsDesignFields";
import { DesignLivePreview, type DesignPreviewFieldFocusRequest } from "./DesignLivePreview";
import type { DesignPreviewSurface } from "./design-preview-model";
import { getDesignFieldsForPreviewContext } from "./design-preview-model";
import type { TemplateKey } from "../../../lib/bundle-config/template-selection";
import styles from "./DesignSettingsView.module.css";
import { SettingsContextualSaveBar, SettingsToast } from "./SettingsFeedback";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import type { SettingsPreviewBundle } from "../../../lib/settings-design-storefront-preview.client";

type DesignSettingsViewProps = {
  designFieldValues: Record<string, string>;
  inheritedColorFieldKeys: string[];
  shopBrandColors: ShopBrandColors | null;
  isActiveSubpageDirty: boolean;
  isDesignSaving?: boolean;
  isPreviewModalOpen: boolean;
  previewBundles: SettingsPreviewBundle[];
  saveMessage: string | null;
  setSettingsView: (view: "landing") => void;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  setDesignFieldValues: Dispatch<SetStateAction<Record<string, string>>>;
  setInheritedColorFieldKeys: Dispatch<SetStateAction<string[]>>;
  setSaveMessage: (message: string | null) => void;
  discardActiveSettingsChanges: () => void;
  saveActiveSettingsChanges: () => void;
};

const CONTEXTUAL_INSPECTOR_SECTIONS: Array<{ title: string; fields: SettingsField[] }> = [
  {
    title: "Colors",
    fields: Object.values(EXPERT_COLOR_CONTROLS).flat(),
  },
  ...DESIGN_CONFIGURATION
    .filter((tab) => tab.title !== "Brand Colors")
    .map((tab) => ({ title: tab.title, fields: tab.fields })),
];

export function DesignSettingsView({
  designFieldValues,
  inheritedColorFieldKeys,
  shopBrandColors,
  isActiveSubpageDirty,
  isDesignSaving = false,
  isPreviewModalOpen,
  previewBundles,
  saveMessage,
  setSettingsView,
  setIsPreviewModalOpen,
  setDesignFieldValues,
  setInheritedColorFieldKeys,
  setSaveMessage,
  discardActiveSettingsChanges,
  saveActiveSettingsChanges,
}: DesignSettingsViewProps) {
  const { t } = useTranslation();
  const [workspacePane, setWorkspacePane] = useState<"preview" | "customize">("preview");
  const fieldFocusRequestIdRef = useRef(0);
  const [fieldFocusRequest, setFieldFocusRequest] = useState<DesignPreviewFieldFocusRequest | null>(null);
  const [activePreviewSurface, setActivePreviewSurface] = useState<DesignPreviewSurface>("product-card");
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<TemplateKey>("standard");
  const hasPreviewableBundle = previewBundles.length > 0;
  const isStorefrontPreviewDisabled = !hasPreviewableBundle
    || isActiveSubpageDirty
    || isDesignSaving;

  const contextualSections = useMemo(() => CONTEXTUAL_INSPECTOR_SECTIONS
    .map((section) => ({
      ...section,
      fields: getDesignFieldsForPreviewContext(
        section.fields,
        activePreviewTemplate,
        activePreviewSurface,
      ),
    }))
    .filter((section) => section.fields.length > 0), [activePreviewSurface, activePreviewTemplate]);

  const visibleFields = contextualSections.flatMap((section) => section.fields);
  const resolvedFieldValues = useMemo(() => {
    const values = { ...designFieldValues };
    for (const fieldKey of inheritedColorFieldKeys) {
      values[fieldKey] = resolveDesignColor({
        fieldKey,
        explicitValue: values[fieldKey] ?? "",
        inheritedColorFieldKeys,
        shopBrandColors,
        templateDefault: SETTINGS_DESIGN_DEFAULT_FIELD_VALUES[fieldKey] ?? "",
      });
    }
    return values;
  }, [designFieldValues, inheritedColorFieldKeys, shopBrandColors]);

  const resetVisibleControls = () => {
    const colorKeys = visibleFields
      .filter((field) => field.kind === "color")
      .map((field) => field.key ?? field.label);
    const nonColorDefaults = Object.fromEntries(
      visibleFields
        .filter((field) => field.kind !== "color")
        .map((field) => [field.key ?? field.label, field.value ?? ""]),
    );
    setDesignFieldValues((current) => ({ ...current, ...nonColorDefaults }));
    setInheritedColorFieldKeys((current) => [...new Set([...current, ...colorKeys])]);
  };

  return (
    <>
      <AdminPageTitleBar
        title="Design Control Panel"
        breadcrumbLabel="Settings"
        onBack={() => setSettingsView("landing")}
      />
      <s-query-container containerName="design-settings">
        <main className={styles.page}>
          <header className={styles.hero}>
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-button
                variant="tertiary"
                icon="arrow-left"
                accessibilityLabel="Back to Settings"
                onClick={() => setSettingsView("landing")}
              />
              <s-heading>Design Control Panel</s-heading>
            </s-stack>
            <s-stack gap="small" alignItems="end">
              <s-button
                icon="view"
                accessibilityLabel={t("settingsDcp.preview.storefront.open")}
                disabled={isStorefrontPreviewDisabled}
                loading={isDesignSaving || undefined}
                onClick={() => setIsPreviewModalOpen(true)}
              >
                {t("settingsDcp.preview.storefront.open")}
              </s-button>
              {isActiveSubpageDirty ? (
                <s-text color="subdued">{t("settingsDcp.preview.storefront.saveBeforePreview")}</s-text>
              ) : null}
            </s-stack>
          </header>

          <div className={styles.mobileWorkspaceTabs} role="group" aria-label={t("settingsDcp.preview.workspace.label")}>
            <s-button
              variant={workspacePane === "preview" ? "primary" : "secondary"}
              aria-pressed={workspacePane === "preview" ? "true" : "false"}
              onClick={() => setWorkspacePane("preview")}
            >
              {t("settingsDcp.preview.workspace.preview")}
            </s-button>
            <s-button
              variant={workspacePane === "customize" ? "primary" : "secondary"}
              aria-pressed={workspacePane === "customize" ? "true" : "false"}
              onClick={() => setWorkspacePane("customize")}
            >
              {t("settingsDcp.preview.workspace.customize")}
            </s-button>
          </div>

          <section className={styles.layout} aria-label="Design">
            <div className={styles.previewPane} data-phone-active={workspacePane === "preview" || undefined}>
              <DesignLivePreview
                fieldValues={designFieldValues}
                inheritedColorFieldKeys={inheritedColorFieldKeys}
                shopBrandColors={shopBrandColors}
                fieldFocusRequest={fieldFocusRequest}
                onSurfaceChange={setActivePreviewSurface}
                onContextChange={({ templateKey }: any) => setActivePreviewTemplate(templateKey)}
              />
            </div>
            <aside className={styles.customizePane} data-phone-active={workspacePane === "customize" || undefined}>
              <section className={styles.inspectorContent} aria-label="Contextual customization inspector">
                <s-stack gap="base">
                  <s-box>
                    <s-heading>Customize this component</s-heading>
                    <s-paragraph color="subdued">
                      Controls update for the component visible in the preview.
                    </s-paragraph>
                  </s-box>
                  {contextualSections.map((section) => (
                    <DesignFields
                      key={section.title}
                      title={section.title}
                      fields={section.fields}
                      values={resolvedFieldValues}
                      inheritedFieldKeys={inheritedColorFieldKeys}
                      disabledFieldKeys={activePreviewSurface === "loading" ? ["Image Fit"] : []}
                      onFieldChange={(fieldKey, value) => {
                        fieldFocusRequestIdRef.current += 1;
                        setFieldFocusRequest({
                          fieldKey,
                          requestId: fieldFocusRequestIdRef.current,
                        });
                        setDesignFieldValues((current) => ({ ...current, [fieldKey]: value }));
                        setInheritedColorFieldKeys((current) => current.filter((key) => key !== fieldKey));
                      }}
                    />
                  ))}
                  <s-button variant="tertiary" tone="critical" onClick={resetVisibleControls}>
                    Reset visible controls
                  </s-button>
                </s-stack>
              </section>
            </aside>
          </section>
          <SettingsContextualSaveBar isOpen={isActiveSubpageDirty} onDiscard={discardActiveSettingsChanges} onSave={saveActiveSettingsChanges} />
          {isPreviewModalOpen ? (
            <BundlePreviewModal bundles={previewBundles} onClose={() => setIsPreviewModalOpen(false)} />
          ) : null}
          <SettingsToast message={saveMessage} onDismiss={() => setSaveMessage(null)} />
        </main>
      </s-query-container>
    </>
  );
}
