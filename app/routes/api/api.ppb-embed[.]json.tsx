import { createHash } from "node:crypto";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../../db.server";
import { authenticate } from "../../shopify.server";
import { formatBundleForWidget } from "../../lib/bundle-formatter.server";
import { AppLogger } from "../../lib/logger";
import { selectEligiblePpbBundleEmbed } from "../../services/ppb-bundle-embed.server";

const CACHE_CONTROL = "private, max-age=30, must-revalidate";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { session } = await authenticate.public.appProxy(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const productId = url.searchParams.get("productId")?.trim() ?? "";
  const productHandle = url.searchParams.get("productHandle")?.trim() ?? "";
  const locale = url.searchParams.get("locale")?.trim() ?? "";
  const countryCode = url.searchParams.get("country");
  const collectionIds = url.searchParams
    .getAll("collectionId")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!productId || !locale) {
    return json(
      { embed: null },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const bundles = await db.bundle.findMany({
      where: {
        shopId: session.shop,
        bundleType: "product_page",
        status: { in: ["active", "unlisted"] },
      },
      include: {
        steps: {
          orderBy: { position: "asc" },
          include: {
            StepProduct: { orderBy: { position: "asc" } },
            StepCategory: { orderBy: { sortOrder: "asc" } },
          },
        },
        pricing: true,
        offerPolicy: {
          select: {
            specificLinkRequired: true,
            priority: true,
            stopLowerPriority: true,
            scheduleMode: true,
            startsAt: true,
            endsAt: true,
            recurrenceFrequency: true,
            recurrenceTimezone: true,
            recurrenceAnchorDate: true,
            recurrenceWindowStartMinute: true,
            recurrenceWindowEndMinute: true,
            recurrenceTermination: true,
            recurrenceEndsOn: true,
            recurrenceRunCount: true,
            countryTargetingEnabled: true,
            countryTargetingMode: true,
            countryCodes: true,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const resolution = selectEligiblePpbBundleEmbed(bundles as any[], {
      productId,
      productHandle,
      collectionIds,
      locale,
      countryCode,
    });
    const embed = resolution
      ? {
          bundle: formatBundleForWidget(resolution.bundle),
          title: resolution.title,
          subTitle: resolution.subTitle,
          preselectBrowsedProduct: resolution.preselectBrowsedProduct,
        }
      : null;
    const payload = { embed };
    const etag = `"${createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("base64url")}"`;
    const headers = {
      "Cache-Control": CACHE_CONTROL,
      ETag: etag,
      Vary: "Accept-Encoding",
    };
    if (request.headers.get("If-None-Match") === etag) {
      return new Response(null, { status: 304, headers });
    }
    return json(payload, { headers });
  } catch (error: any) {
    if (error instanceof Response) throw error;
    AppLogger.error(
      "Failed to resolve PPB product-page embed",
      { component: "api.ppb-embed", shop: session.shop },
      error,
    );
    return json(
      { embed: null },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
