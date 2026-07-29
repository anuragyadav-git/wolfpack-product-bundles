import {
  THEME_EXTENSION_RESOURCES,
  type NormalizedThemeExtensionResource,
} from "../../../lib/theme-extension-status";

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
  if (status === "active") return "Active";
  if (status === "available") return "Available";
  return "Unavailable";
}

export function DashboardStatusGrid({
  activeBundleCount,
  error,
  loading,
  onOpenThemeEditor,
  resources,
  themeEditorUrl,
}: DashboardStatusGridProps) {
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
          <details>
            <summary>Review setup</summary>
            <s-stack direction="block" gap="small">
              {error ? <s-text tone="critical">Status unavailable. Reload to try again.</s-text> : null}
              {coreResources.map((resource) => (
                <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                  <s-text>{resource.label}</s-text>
                  <s-badge tone={statusTone(resource.status)}>{resource.enabled ? "Enabled" : statusLabel(resource.status)}</s-badge>
                </s-stack>
              ))}
              {optionalResources.length > 0 ? (
                <details>
                  <summary>Optional placements</summary>
                  <s-stack direction="block" gap="small-100">
                    {optionalResources.map((resource) => (
                      <s-stack key={resource.handle} direction="inline" alignItems="center" justifyContent="space-between" gap="base">
                        <s-text>{resource.label}</s-text>
                        <s-badge tone={statusTone(resource.status)}>{resource.enabled ? "Enabled" : statusLabel(resource.status)}</s-badge>
                      </s-stack>
                    ))}
                  </s-stack>
                </details>
              ) : null}
              {!loading && embed && !embed.enabled && themeEditorUrl ? (
                <s-button variant="secondary" onClick={onOpenThemeEditor}>Open Theme Editor</s-button>
              ) : null}
            </s-stack>
          </details>
        </s-stack>
        <s-text color="subdued">{activeBundleCount} active bundles</s-text>
      </s-box>
    </s-section>
  );
}
