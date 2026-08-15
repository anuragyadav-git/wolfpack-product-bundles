import { createHash } from "node:crypto";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../../db.server";
import { verifyAppProxyRequest } from "../../lib/app-proxy.server";
import { AppLogger } from "../../lib/logger";
import { selectEligibleFpbUpsells } from "../../services/fpb-upsells.server";

const CACHE_CONTROL = "private, max-age=30, must-revalidate";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = verifyAppProxyRequest(url);
  if (!shop) return json({ offers: [] }, { status: 401, headers: { "Cache-Control": "private, no-store" } });

  const productId = url.searchParams.get("productId")?.trim() ?? "";
  const locale = url.searchParams.get("locale")?.trim() ?? "";
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
      },
      orderBy: { publicNumber: "asc" },
    });
    const offers = selectEligibleFpbUpsells(bundles as any[], { productId, collectionIds, locale });
    const etag = `"${createHash("sha256").update(JSON.stringify(offers)).digest("base64url")}"`;
    const headers = { "Cache-Control": CACHE_CONTROL, ETag: etag, Vary: "Accept-Encoding" };
    if (request.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });
    return json({ offers }, { headers });
  } catch (error) {
    AppLogger.error("Failed to resolve FPB product-page upsells", { component: "api.fpb-upsells", shop }, error);
    return json({ offers: [] }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
