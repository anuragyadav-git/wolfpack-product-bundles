import { createHash } from "node:crypto";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../../db.server";
import { authenticate } from "../../shopify.server";
import { AppLogger } from "../../lib/logger";
import { selectEligibleFpbUpsells } from "../../services/fpb-upsells.server";

const CACHE_CONTROL = "private, max-age=30, must-revalidate";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { session } = await authenticate.public.appProxy(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const shop = session.shop;

  const productId = url.searchParams.get("productId")?.trim() ?? "";
  const locale = url.searchParams.get("locale")?.trim() ?? "";
  const countryCode = url.searchParams.get("country");
  const collectionIds = url.searchParams.getAll("collectionId").map((value) => value.trim()).filter(Boolean);
  if (!productId || !locale) return json({ offers: [] }, { status: 400, headers: { "Cache-Control": "private, no-store" } });

  try {
    const bundles = await db.bundle.findMany({
      where: {
        shopId: shop,
        bundleType: "full_page",
        status: { in: ["active", "unlisted"] },
        publicNumber: { not: null },
        upsellWidgetEnabled: true,
      },
      include: {
        steps: {
          orderBy: { position: "asc" },
          include: { StepProduct: true, StepCategory: { orderBy: { sortOrder: "asc" } } },
        },
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
      orderBy: { publicNumber: "asc" },
    });
    const offers = selectEligibleFpbUpsells(bundles as any[], {
      productId,
      collectionIds,
      locale,
      countryCode,
    });
    const etag = `"${createHash("sha256").update(JSON.stringify(offers)).digest("base64url")}"`;
    const headers = { "Cache-Control": CACHE_CONTROL, ETag: etag, Vary: "Accept-Encoding" };
    if (request.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });
    return json({ offers }, { headers });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }
    AppLogger.error("Failed to resolve FPB product-page upsells", { component: "api.fpb-upsells", shop }, error);
    return json({ offers: [] }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
