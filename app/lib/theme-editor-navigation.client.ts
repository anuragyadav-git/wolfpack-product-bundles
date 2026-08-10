export function buildFpbUpsellThemeEditorUrl(input: {
  shop: string;
  apiKey: string;
  displayMode: "button" | "block";
}): string {
  const shopDomain = input.shop.includes(".myshopify.com")
    ? input.shop
    : `${input.shop}.myshopify.com`;
  const blockHandle = input.displayMode === "button"
    ? "bundle-upsell-button"
    : "bundle-upsell-block";
  const url = new URL(`https://${shopDomain}/admin/themes/current/editor`);
  url.searchParams.set("template", "product");
  url.searchParams.set("addAppBlockId", `${input.apiKey}/${blockHandle}`);
  url.searchParams.set("target", "newAppsSection");
  return url.toString();
}

export function openThemeEditorInNewTab(themeEditorUrl: string): void {
  if (!themeEditorUrl) return;
  window.open(themeEditorUrl, "_blank", "noopener,noreferrer");
}
