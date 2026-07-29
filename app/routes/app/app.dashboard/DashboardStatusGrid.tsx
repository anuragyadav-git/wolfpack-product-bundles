import {
  THEME_EXTENSION_RESOURCES,
  type NormalizedThemeExtensionResource,
} from "../../../lib/theme-extension-status";
import { useRef } from "react";

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

function statusLabel(status: NormalizedThemeExtensionResource["status"]): string {
  if (status === "active") return "Enabled";
  if (status === "available") return "Ready to enable";
  return "Not available";
}

const MERCHANT_RESOURCE_LABELS: Record<string, string> = {
  "bundle-app-embed": "App embed",
  "bundle-full-page": "Full-page widget",
  "bundle-product-page": "Product-page widget",
  "bundle-upsell-block": "Upsell block",
  "bundle-upsell-button": "Upsell button",
};

export function DashboardStatusGrid({
  activeBundleCount,
  error,
  loading,
  onOpenThemeEditor,
  resources,
  themeEditorUrl,
}: DashboardStatusGridProps) {
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
  const openStatusModal = () => statusModalRef.current?.showOverlay?.();
  const closeStatusModal = () => statusModalRef.current?.hideOverlay?.();
  const merchantLabel = (handle: string) => MERCHANT_RESOURCE_LABELS[handle] ?? handle;

  return (
    <s-section>
      <s-box padding="small" border="base" borderRadius="base">
        <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="base">
          <s-stack direction="inline" alignItems="center" gap="small">
            <s-text type="strong">Storefront setup</s-text>
            {loading ? <s-spinner accessibilityLabel="Checking storefront setup" /> : (
              <s-badge tone={enabledCoreCount === coreResources.length ? "success" : "warning"}>
                {enabledCoreCount} of {coreResources.length} core components enabled
              </s-badge>
            )}
          </s-stack>
          <s-button variant="secondary" onClick={openStatusModal}>View status</s-button>
        </s-stack>
        <s-text color="subdued">{activeBundleCount} active bundles</s-text>
      </s-box>
      <s-modal ref={statusModalRef} id="storefront-setup-status-modal" heading="Storefront setup">
        <s-stack direction="block" gap="base">
          <s-text color="subdued">
            These components control how Wolfpack bundles appear on your storefront.
          </s-text>
          {error ? <s-banner tone="critical">Status unavailable. Reload to try again.</s-banner> : null}
          <s-heading>Core bundle components</s-heading>
          {coreResources.map((resource) => (
            <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
              <s-text>{merchantLabel(resource.handle)}</s-text>
              <s-badge tone={statusTone(resource.status)}>{resource.enabled ? "Enabled" : statusLabel(resource.status)}</s-badge>
            </s-stack>
          ))}
          {optionalResources.length > 0 ? (
            <>
              <s-heading>Optional placements</s-heading>
              {optionalResources.map((resource) => (
                <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                  <s-text>{merchantLabel(resource.handle)}</s-text>
                  <s-badge tone={statusTone(resource.status)}>{resource.enabled ? "Enabled" : statusLabel(resource.status)}</s-badge>
                </s-stack>
              ))}
            </>
          ) : null}
          {!loading && embed && !embed.enabled && themeEditorUrl ? (
            <s-button variant="primary" onClick={onOpenThemeEditor}>Open Theme Editor</s-button>
          ) : null}
        </s-stack>
        <s-button slot="secondary-actions" onClick={closeStatusModal}>Close</s-button>
      </s-modal>
    </s-section>
  );
}
