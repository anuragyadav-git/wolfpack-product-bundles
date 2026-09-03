import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { BundleStatus, BundleType } from "../../constants/bundle";
import { prisma } from "../../db.server";
import { AppLogger } from "../../lib/logger";
import { buildSettingsControlsResponse } from "../../lib/settings-controls-runtime";

// auth: public - served to storefront widgets through the Shopify app proxy.
// Data is non-sensitive merchant-authored storefront behavior settings.

function sanitizeBundleType(raw: string | null): BundleType.PRODUCT_PAGE | BundleType.FULL_PAGE {
  if (!raw) return BundleType.PRODUCT_PAGE;
  const stripped = raw.split("?")[0].split("&")[0].trim();
  return stripped === BundleType.FULL_PAGE ? BundleType.FULL_PAGE : BundleType.PRODUCT_PAGE;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { shopDomain } = params;

  if (!shopDomain) {
    return json({ error: "Shop domain is required" }, { status: 400 });
  }

  const url = new URL(request.url);
  const bundleType = sanitizeBundleType(url.searchParams.get("bundleType"));

  try {
    const [settings, bundles] = await Promise.all([
      prisma.designSettings.findUnique({
        where: {
          shopId_bundleType: {
            shopId: shopDomain,
            bundleType,
          },
        },
      }),
      prisma.bundle.findMany({
        where: {
          shopId: shopDomain,
          status: { in: [BundleStatus.ACTIVE, BundleStatus.UNLISTED] },
          shopifyProductHandle: { not: null },
        },
        select: {
          bundleType: true,
          publicNumber: true,
          shopifyProductHandle: true,
        },
      }),
    ]);
    const generalSettings = settings?.generalSettings && typeof settings.generalSettings === "object"
      ? settings.generalSettings as Record<string, unknown>
      : {};

    const { schemaVersion, settingsControls, activeControls } = buildSettingsControlsResponse(
      generalSettings.settingsControls,
      bundleType,
    );

    const bundleLinks = bundles.flatMap((bundle) => {
      const productHandle = bundle.shopifyProductHandle?.trim();
      if (!productHandle) return [];
      if (bundle.bundleType === BundleType.FULL_PAGE) {
        if (!bundle.publicNumber) return [];
        return [{
          bundleType: BundleType.FULL_PAGE,
          productHandle,
          targetUrl: `/apps/product-bundles/wpb/${bundle.publicNumber}`,
        }];
      }
      return [{
        bundleType: BundleType.PRODUCT_PAGE,
        productHandle,
        targetUrl: `/products/${productHandle}`,
      }];
    });

    return json({ schemaVersion, bundleType, settingsControls, activeControls, bundleLinks }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    AppLogger.error("Failed to load controls settings", {
      component: "api.controls-settings",
      shopDomain,
      bundleType,
      error: error instanceof Error ? error.message : String(error),
    });

    return json({ error: "Controls settings are temporarily unavailable" }, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}
