import {
  THEME_EXTENSION_RESOURCES,
  type NormalizedThemeExtensionResource,
} from "../../../lib/theme-extension-status";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

type DashboardStatusGridProps = {
  activeBundleCount: number;
  resources: NormalizedThemeExtensionResource[];
  loading: boolean;
  error: boolean;
  themeEditorUrl: string | null;
  onOpenThemeEditor: () => void;
};

function statusTone(status: NormalizedThemeExtensionResource["status"]): "success" | "info" | "warning" {
  if (status === "active") return "success";
  if (status === "available") return "info";
  return "warning";
}

function statusTranslationKey(status: NormalizedThemeExtensionResource["status"]): "ready" | "unavailable" {
  return status === "available" ? "ready" : "unavailable";
}

const MERCHANT_RESOURCE_LABEL_KEYS: Record<string, string> = {
  "bundle-app-embed": "dashboard.storefrontSetup.resources.appEmbed",
  "bundle-full-page": "dashboard.storefrontSetup.resources.fullPage",
  "bundle-product-page": "dashboard.storefrontSetup.resources.productPage",
  "bundle-upsell-block": "dashboard.storefrontSetup.resources.upsellBlock",
  "bundle-upsell-button": "dashboard.storefrontSetup.resources.upsellButton",
};

type StorefrontSetupSummaryInput = {
  enabledCoreCount: number;
  totalCoreCount: number;
  loading: boolean;
  error: boolean;
};

type StorefrontSetupSummary = {
  state: "loading" | "error" | "incomplete" | "complete";
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  remainingCoreCount: number;
};

export function getStorefrontSetupSummary({
  enabledCoreCount,
  error,
  loading,
  totalCoreCount,
}: StorefrontSetupSummaryInput): StorefrontSetupSummary {
  const remainingCoreCount = Math.max(0, totalCoreCount - enabledCoreCount);
  if (loading) {
    return {
      state: "loading",
      titleKey: "dashboard.storefrontSetup.loadingTitle",
      descriptionKey: "dashboard.storefrontSetup.loadingDescription",
      actionKey: "dashboard.storefrontSetup.viewDetails",
      remainingCoreCount,
    };
  }
  if (error) {
    return {
      state: "error",
      titleKey: "dashboard.storefrontSetup.errorTitle",
      descriptionKey: "dashboard.storefrontSetup.errorDescription",
      actionKey: "dashboard.storefrontSetup.viewDetails",
      remainingCoreCount,
    };
  }
  if (remainingCoreCount > 0) {
    return {
      state: "incomplete",
      titleKey: "dashboard.storefrontSetup.incompleteTitle",
      descriptionKey: "dashboard.storefrontSetup.incompleteDescription",
      actionKey: "dashboard.storefrontSetup.finishSetup",
      remainingCoreCount,
    };
  }
  return {
    state: "complete",
    titleKey: "dashboard.storefrontSetup.completeTitle",
    descriptionKey: "dashboard.storefrontSetup.completeDescription",
    actionKey: "dashboard.storefrontSetup.viewDetails",
    remainingCoreCount,
  };
}

export function DashboardStatusGrid({
  activeBundleCount,
  error,
  loading,
  onOpenThemeEditor,
  resources,
  themeEditorUrl,
}: DashboardStatusGridProps) {
  const { t } = useTranslation();
  const statusModalRef = useRef<any>(null);
  const resourceRows = resources.length > 0
    ? resources
    : THEME_EXTENSION_RESOURCES.map((resource) => ({
      ...resource,
      status: "unavailable" as const,
      enabled: false,
      target: null,
    }));
  const embed = resourceRows.find((resource) => resource.handle === "bundle-app-embed");
  const coreResources = resourceRows.filter((resource) => [
    "bundle-app-embed",
    "bundle-full-page",
    "bundle-product-page",
  ].includes(resource.handle));
  const optionalResources = resourceRows.filter((resource) => !coreResources.some((core) => core.handle === resource.handle));
  const enabledCoreCount = coreResources.filter((resource) => resource.enabled).length;
  const summary = getStorefrontSetupSummary({
    enabledCoreCount,
    totalCoreCount: coreResources.length,
    loading,
    error,
  });
  const openStatusModal = () => statusModalRef.current?.showOverlay?.();
  const closeStatusModal = () => statusModalRef.current?.hideOverlay?.();
  const merchantLabel = (handle: string) => {
    const key = MERCHANT_RESOURCE_LABEL_KEYS[handle];
    return key ? t(key) : handle;
  };
  const badgeTone = summary.state === "complete"
    ? "success"
    : summary.state === "error"
      ? "critical"
      : "warning";
  const badgeLabel = summary.state === "complete"
    ? t("dashboard.storefrontSetup.ready")
    : summary.state === "loading"
      ? t("dashboard.storefrontSetup.checking")
      : t("dashboard.storefrontSetup.actionNeeded");

  return (
    <s-query-container containerName="storefront-setup-card">
      <s-section>
        <s-box padding="base" border="base" borderRadius="base" background="subdued">
          <s-grid
            gridTemplateColumns="@container (inline-size <= 560px) minmax(0, 1fr), minmax(0, 1fr) auto"
            gap="base"
            alignItems="center"
          >
            <s-stack direction="block" gap="base">
              <s-stack direction="inline" alignItems="start" gap="small">
                <s-box padding="small" background="base" borderRadius="base">
                  <s-icon type="globe" />
                </s-box>
                <s-stack direction="block" gap="small-100">
                  <s-heading>{t(summary.titleKey)}</s-heading>
                  <s-text color="subdued">
                    {t(summary.descriptionKey, { count: summary.remainingCoreCount })}
                  </s-text>
                </s-stack>
              </s-stack>
              <s-grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="small">
                <s-box padding="small" background="base" borderRadius="base">
                  <s-stack direction="block" gap="small-100">
                    <s-text color="subdued">{t("dashboard.storefrontSetup.coreComponents")}</s-text>
                    <s-text type="strong">{enabledCoreCount} / {coreResources.length}</s-text>
                  </s-stack>
                </s-box>
                <s-box padding="small" background="base" borderRadius="base">
                  <s-stack direction="block" gap="small-100">
                    <s-text color="subdued">{t("dashboard.storefrontSetup.activeBundles")}</s-text>
                    <s-text type="strong">{activeBundleCount}</s-text>
                  </s-stack>
                </s-box>
              </s-grid>
            </s-stack>
            <s-stack direction="block" alignItems="start" gap="small">
              {loading ? (
                <s-spinner accessibilityLabel={t("dashboard.storefrontSetup.checking")} />
              ) : (
                <s-badge tone={badgeTone}>{badgeLabel}</s-badge>
              )}
              <s-button
                variant={summary.state === "incomplete" || summary.state === "error" ? "primary" : "secondary"}
                onClick={openStatusModal}
              >
                {t(summary.actionKey)}
              </s-button>
            </s-stack>
          </s-grid>
        </s-box>
      </s-section>
      <s-modal
        ref={statusModalRef}
        id="storefront-setup-status-modal"
        heading={t("dashboard.storefrontSetup.modalHeading")}
      >
        <s-stack direction="block" gap="base">
          <s-text color="subdued">
            {t("dashboard.storefrontSetup.modalDescription")}
          </s-text>
          {error ? <s-banner tone="critical">{t("dashboard.storefrontSetup.modalError")}</s-banner> : null}
          <s-heading>{t("dashboard.storefrontSetup.coreHeading")}</s-heading>
          {coreResources.map((resource) => (
            <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
              <s-text>{merchantLabel(resource.handle)}</s-text>
              <s-badge tone={statusTone(resource.status)}>
                {resource.enabled
                  ? t("dashboard.storefrontSetup.status.enabled")
                  : t(`dashboard.storefrontSetup.status.${statusTranslationKey(resource.status)}`)}
              </s-badge>
            </s-stack>
          ))}
          {optionalResources.length > 0 ? (
            <>
              <s-heading>{t("dashboard.storefrontSetup.optionalHeading")}</s-heading>
              {optionalResources.map((resource) => (
                <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                  <s-text>{merchantLabel(resource.handle)}</s-text>
                  <s-badge tone={statusTone(resource.status)}>
                    {resource.enabled
                      ? t("dashboard.storefrontSetup.status.enabled")
                      : t(`dashboard.storefrontSetup.status.${statusTranslationKey(resource.status)}`)}
                  </s-badge>
                </s-stack>
              ))}
            </>
          ) : null}
          {!loading && embed && !embed.enabled && themeEditorUrl ? (
            <s-button variant="primary" onClick={onOpenThemeEditor}>
              {t("dashboard.storefrontSetup.openThemeEditor")}
            </s-button>
          ) : null}
        </s-stack>
        <s-button slot="secondary-actions" onClick={closeStatusModal}>
          {t("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
    </s-query-container>
  );
}
