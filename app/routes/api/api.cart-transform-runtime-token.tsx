import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../../db.server";
import { authenticate } from "../../shopify.server";
import { AppLogger } from "../../lib/logger";
import {
  buildRuntimeTokenPayload,
  generateCartTransformRuntimeTokenSecret,
  signRuntimeCartToken,
  validateLiveSellingPlanSelection,
} from "../../services/cart-transform-runtime-token.server";
import { getBundleProductVariantId } from "../../utils/variant-lookup.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function loader() {
  return json(
    { ok: false, error: "Method not allowed" },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        Allow: "POST, OPTIONS",
      },
    },
  );
}

function sanitizeString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const shop = session.shop;

  const body = await request.json().catch(() => null);
  const bundleId = sanitizeString(body?.bundleId);
  const bundleType = sanitizeString(body?.bundleType);
  const offerGroupId = sanitizeString(body?.offerGroupId);

  if (!bundleId || !bundleType || !offerGroupId) {
    return json({ ok: false, error: "Invalid runtime token payload" }, { status: 400, headers: CORS_HEADERS });
  }

  const bundle = await (prisma.bundle as any).findFirst({
    where: { id: bundleId, shopId: shop },
    include: {
      steps: {
        include: {
          StepProduct: { orderBy: { position: "asc" } },
          StepCategory: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { position: "asc" },
      },
      pricing: true,
    },
  });

  if (!bundle || bundle.bundleType !== bundleType || !bundle.shopifyProductId) {
    return json({ ok: false, error: "Invalid runtime token payload" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const { unauthenticated } = await import("../../shopify.server");
    const { admin } = await unauthenticated.admin(shop);
    const parentVariantId = await getBundleProductVariantId(admin as never, bundle.shopifyProductId);
    const payload = buildRuntimeTokenPayload({
      shop,
      bundle,
      parentVariantId: parentVariantId ?? "",
      offerGroupId,
      bundleType,
      selection: {
        components: body?.components,
        addons: body?.addons,
        subscription: body?.subscription,
      },
    });
    if (payload.subscription) {
      await validateLiveSellingPlanSelection(
        admin as never,
        payload.subscription,
        payload.components,
      );
    }
    const secret = generateCartTransformRuntimeTokenSecret(shop);
    const token = signRuntimeCartToken(payload, secret);

    return json({ ok: true, token }, { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }

    AppLogger.warn("Runtime cart token payload rejected", {
      component: "api.cart-transform-runtime-token",
      operation: "action",
      shop,
      bundleId,
    }, error);
    return json({ ok: false, error: "Invalid runtime token payload" }, { status: 400, headers: CORS_HEADERS });
  }
}
