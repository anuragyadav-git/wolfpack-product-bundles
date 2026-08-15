import {
  THEME_EXTENSION_RESOURCES,
  type NormalizedThemeExtensionResource,
} from "../../../lib/theme-extension-status";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type DashboardStatusGridProps = {
  resources: NormalizedThemeExtensionResource[];
  error: boolean;
  appEmbedEnabled?: boolean;
  themeEditorUrl: string | null;
  onOpenThemeEditor: () => void;
};

const CORE_STORE_FRONT_RESOURCES = [
  "bundle-app-embed",
  "bundle-product-page",
] as const;

type StorefrontStatusResource = NormalizedThemeExtensionResource;

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
      remainingCoreCount,
    };
  }
  if (error) {
    return {
      state: "error",
      titleKey: "dashboard.storefrontSetup.errorTitle",
      descriptionKey: "dashboard.storefrontSetup.errorDescription",
      remainingCoreCount,
    };
  }
  if (remainingCoreCount > 0) {
    return {
      state: "incomplete",
      titleKey: "dashboard.storefrontSetup.incompleteTitle",
      descriptionKey: "dashboard.storefrontSetup.incompleteDescription",
      remainingCoreCount,
    };
  }
  return {
    state: "complete",
    titleKey: "dashboard.storefrontSetup.completeTitle",
    descriptionKey: "dashboard.storefrontSetup.completeDescription",
    remainingCoreCount,
  };
}

export function getStorefrontStatusRows(
  resources: NormalizedThemeExtensionResource[],
): {
  core: StorefrontStatusResource[];
} {
  const resourceRows = resources.length > 0
    ? resources
    : THEME_EXTENSION_RESOURCES.map((resource) => ({
      ...resource,
      status: "unavailable" as const,
      enabled: false,
      target: null,
    }));

  const coreResources = resourceRows.filter((resource) =>
    CORE_STORE_FRONT_RESOURCES.includes(resource.handle as (typeof CORE_STORE_FRONT_RESOURCES)[number]));

  return {
    core: coreResources,
  };
}

export function DashboardStatusGrid({
  error,
  appEmbedEnabled = false,
  onOpenThemeEditor,
  resources,
  themeEditorUrl,
}: DashboardStatusGridProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const {
    core: coreResources,
  } = getStorefrontStatusRows(resources);

  const coreResourcesWithOverrides = coreResources.map((resource) => {
    if (resource.handle !== "bundle-app-embed") return resource;
    return appEmbedEnabled ? { ...resource, enabled: true } : resource;
  });

  const remainingCoreCount = Math.max(0, coreResourcesWithOverrides.length - coreResourcesWithOverrides.filter((resource) => resource.enabled).length);
  const storefrontSummary = getStorefrontSetupSummary({
    loading: false,
    error,
    enabledCoreCount: coreResourcesWithOverrides.filter((resource) => resource.enabled).length,
    totalCoreCount: coreResourcesWithOverrides.length,
  });
  const summaryDescription = t(appEmbedEnabled
    ? "dashboard.storefrontSetup.completeDescription"
    : storefrontSummary.descriptionKey,
    {
    count: remainingCoreCount,
    });
  const setupComplete = appEmbedEnabled;
  const title = t("dashboard.storefrontSetup.incompleteTitle");

  return (
    <s-banner
      tone={setupComplete ? "success" : "warning"}
      heading={title}
      dismissible={true}
      hidden={false}
      onDismiss={() => setDismissed(true)}
    >
      <s-box minBlockSize="28px">
        {!setupComplete ? (
          <s-stack direction="inline" justifyContent="space-between" alignItems="start" gap="base">
            <s-text>{summaryDescription}</s-text>
            <s-button
              variant="tertiary"
              onClick={onOpenThemeEditor}
              disabled={!themeEditorUrl}
            >
              {t("dashboard.storefrontSetup.activate")}
            </s-button>
          </s-stack>
        ) : (
          <s-text>{summaryDescription}</s-text>
        )}
      </s-box>
    </s-banner>
  );
}
