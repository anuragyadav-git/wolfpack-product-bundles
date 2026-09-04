import type { ShopifyThemeExtensionInfo } from "./theme-extension-status";

export interface PpbWidgetPlacementGate {
  ready: boolean;
  installationLink: string | null;
  message: string | null;
}

export type PpbWidgetPlacementAction =
  | { type: "preview" }
  | { type: "setup"; installationLink: string; message: string }
  | { type: "blocked"; message: string };

export function resolvePpbWidgetPlacementAction(
  placement: PpbWidgetPlacementGate
): PpbWidgetPlacementAction {
  if (placement.ready) return { type: "preview" };

  const message = placement.message ?? "Unable to verify bundle widget placement";
  return placement.installationLink
    ? { type: "setup", installationLink: placement.installationLink, message }
    : { type: "blocked", message };
}

type AppBridgeExtensionsApi = {
  app?: {
    extensions?: () => Promise<ShopifyThemeExtensionInfo[]>;
  };
};

function matchesProductTemplate(
  target: string | undefined,
  templateSuffix: string | null | undefined
): boolean {
  if (!target) return false;
  const suffix = templateSuffix?.trim();
  const templateHandle = suffix ? `product.${suffix}` : "product";
  return target.startsWith(`template--${templateHandle}/`);
}

export async function validatePpbWidgetPlacementFromAppBridge(
  input: {
    shopify: AppBridgeExtensionsApi;
    templateSuffix?: string | null;
    installationLink: string;
  }
): Promise<PpbWidgetPlacementGate> {
  try {
    const extensions = await input.shopify.app?.extensions?.();
    const themeExtension = extensions?.find(
      (extension) => extension.type === "theme_app_extension"
    );
    const productBundleBlock = themeExtension?.activations?.find(
      (activation) => activation.handle === "bundle-product-page"
    );
    const isPlaced =
      productBundleBlock?.status === "active" &&
      productBundleBlock.activations?.some((activation) =>
        matchesProductTemplate(activation.target, input.templateSuffix)
      );

    if (isPlaced) {
      return { ready: true, installationLink: null, message: null };
    }

    return {
      ready: false,
      installationLink: input.installationLink,
      message:
        "Place the Bundle Builder block on this product template before previewing the bundle.",
    };
  } catch {
    return {
      ready: false,
      installationLink: null,
      message: "Unable to verify bundle widget placement",
    };
  }
}
