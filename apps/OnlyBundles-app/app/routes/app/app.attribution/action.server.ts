import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../../shopify.server";
import {
  activateUtmPixel,
  deactivateUtmPixel,
} from "../../../services/pixel-activation.server";
import { backfillOrderAttribution } from "../../../services/analytics/order-backfill.server";
import {
  normalizeAttributionWindow,
  normalizeSavedCustomUtmParameters,
  parseCustomUtmInput,
} from "../../../lib/analytics/attribution-controls";
import { normalizeOfferAnalyticsDimensions } from "../../../lib/analytics/offer-dimensions";
import db from "../../../db.server";
import { APP_BRAND } from "../../../lib/app-brand";
import { EntitlementDeniedError } from "../../../lib/subscriptions/entitlements";
import { assertAdvancedAnalyticsAllowed } from "../../../lib/subscriptions/analytics-entitlements";
import { resolveShopEntitlements } from "../../../services/subscriptions/subscription-service.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const shopId = session.shop;

  if (["export", "backfill", "saveCustomUtms"].includes(intent)) {
    const subscription = await resolveShopEntitlements({
      shopDomain: shopId,
      forceRefresh: true,
    });
    try {
      assertAdvancedAnalyticsAllowed(subscription.entitlements);
    } catch (error) {
      if (error instanceof EntitlementDeniedError) {
        return json(
          {
            success: false,
            error: error.code,
            entitlementFailure: error.toJSON(),
          },
          { status: error.status }
        );
      }
      throw error;
    }
  }

  const getSavedCustomUtmParameters = async () => {
    const shop = await db.shop.findUnique({
      where: { shopDomain: shopId },
      select: { customUtmParameters: true },
    });
    return normalizeSavedCustomUtmParameters(shop?.customUtmParameters);
  };

  if (intent === "export") {
    const params = new URLSearchParams();
    for (const key of ["from", "to", "days"]) {
      const value = formData.get(key);
      if (typeof value === "string") params.set(key, value);
    }
    const { since, until } = normalizeAttributionWindow(params);
    const selectedOfferPolicyId = normalizeOfferAnalyticsDimensions({
      offerPolicyId: formData.get("offerPolicyId"),
    }).offerPolicyId;

    const [attributions, viewEvents] = await Promise.all([
      db.orderAttribution.findMany({
        where: {
          shopId,
          createdAt: { gte: since, lte: until },
          ...(selectedOfferPolicyId
            ? { offerPolicyId: selectedOfferPolicyId }
            : {}),
        },
        orderBy: { createdAt: "asc" },
      }),
      db.bundleAnalytics.findMany({
        where: { shopId, event: "view", createdAt: { gte: since, lte: until } },
        select: { bundleId: true, createdAt: true },
      }),
    ]);

    const bundleIds = [
      ...new Set([
        ...attributions.filter((a) => a.bundleId).map((a) => a.bundleId!),
        ...viewEvents.filter((v) => v.bundleId).map((v) => v.bundleId!),
      ]),
    ];
    const bundles =
      bundleIds.length > 0
        ? await db.bundle.findMany({
            where: { id: { in: bundleIds } },
            select: { id: true, name: true },
          })
        : [];
    const nameMap = Object.fromEntries(bundles.map((b) => [b.id, b.name]));

    const escape = (v: string | null | undefined) =>
      v == null ? "" : `"${String(v).replace(/"/g, '""')}"`;

    const rows: string[] = [
      [
        "Date",
        "Type",
        "Bundle ID",
        "Bundle Name",
        "Offer Policy ID",
        "Offer Rule Version",
        "Offer Tier ID",
        "Offer Eligibility Source",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "Custom UTM Attributes",
        "Revenue (USD)",
        "Order ID",
        "Landing Page",
      ].join(","),
    ];

    for (const a of attributions) {
      rows.push(
        [
          new Date(a.createdAt).toISOString().split("T")[0],
          "order",
          escape(a.bundleId),
          escape(a.bundleId ? nameMap[a.bundleId] : null),
          escape(a.offerPolicyId),
          a.offerRuleVersion == null ? "" : String(a.offerRuleVersion),
          escape(a.offerTierId),
          escape(a.offerEligibilitySource),
          escape(a.utmSource),
          escape(a.utmMedium),
          escape(a.utmCampaign),
          escape(JSON.stringify(a.customUtmAttributes ?? {})),
          (a.revenue / 100).toFixed(2),
          escape(a.orderId),
          escape(a.landingPage),
        ].join(",")
      );
    }

    for (const v of viewEvents) {
      rows.push(
        [
          new Date(v.createdAt).toISOString().split("T")[0],
          "view",
          escape(v.bundleId),
          escape(v.bundleId ? nameMap[v.bundleId] : null),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ].join(",")
      );
    }

    const csv = rows.join("\n");
    const fromLabel = since.toISOString().split("T")[0];
    const toLabel = until.toISOString().split("T")[0];

    return json({
      success: true,
      csv,
      filename: `${APP_BRAND.exportSlug}-analytics-${fromLabel}-to-${toLabel}.csv`,
    });
  }

  if (intent === "enable") {
    const appUrl = process.env.SHOPIFY_APP_URL;
    if (!appUrl) {
      return json({
        success: false,
        pixelActive: false,
        error: "App URL not configured.",
      });
    }
    const result = await activateUtmPixel(
      admin,
      appUrl,
      session.shop,
      await getSavedCustomUtmParameters()
    );
    if (result.success) {
      return json({
        success: true,
        pixelActive: true,
        message: "UTM tracking enabled successfully",
      });
    }
    const isNotDeployed =
      typeof result.error === "string" &&
      result.error.toLowerCase().includes("not found");
    return json({
      success: false,
      pixelActive: false,
      error: isNotDeployed
        ? "Tracking could not be enabled. Deploy the app extension first via Shopify CLI."
        : "Failed to enable tracking. Please try again.",
    });
  }

  if (intent === "disable") {
    const result = await deactivateUtmPixel(admin);
    if (result.success) {
      return json({
        success: true,
        pixelActive: false,
        message: "UTM tracking disabled",
      });
    }
    return json({
      success: false,
      pixelActive: true,
      error: "Failed to disable tracking. Please try again.",
    });
  }

  if (intent === "backfill") {
    const params = new URLSearchParams();
    for (const key of ["from", "to", "days"]) {
      const value = formData.get(key);
      if (typeof value === "string") params.set(key, value);
    }
    const { since, until } = normalizeAttributionWindow(params);

    try {
      const result = await backfillOrderAttribution(
        admin,
        session.shop,
        since.toISOString(),
        until.toISOString()
      );
      return json({
        success: true,
        backfill: result,
        message: `Backfill complete: ${result.created} rows created, ${result.repaired} repaired, ${result.skipped} already present.`,
      });
    } catch (error: any) {
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Backfill failed. Please try again.",
        },
        { status: 500 }
      );
    }
  }

  if (intent === "saveCustomUtms") {
    const customUtmParameters = parseCustomUtmInput(
      formData.get("customUtmParameters") as string | null
    );

    await db.shop.upsert({
      where: { shopDomain: shopId },
      update: { customUtmParameters },
      create: { shopDomain: shopId, customUtmParameters },
    });

    const appUrl = process.env.SHOPIFY_APP_URL;
    if (!appUrl) {
      return json(
        {
          success: false,
          customUtmParameters,
          error: "App URL not configured.",
        },
        { status: 500 }
      );
    }

    const result = await activateUtmPixel(
      admin,
      appUrl,
      shopId,
      customUtmParameters
    );
    if (!result.success) {
      return json(
        {
          success: false,
          customUtmParameters,
          error:
            "Custom UTM settings were saved, but tracking could not be refreshed.",
        },
        { status: 500 }
      );
    }

    return json({
      success: true,
      pixelActive: true,
      customUtmParameters,
      message: "Custom UTM tracking updated.",
    });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
};
