import { buildBundleAuthorizationPolicy, readPublishedBundlePolicy } from '../../services/bundle-authorization-policy.server';
import { buildFullPageBundleMetafieldConfig } from '../app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server';
import { buildSyncBundleConfiguration } from '../app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server';
import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../../db.server";
import { authenticate } from "../../shopify.server";
import { AppLogger } from "../../lib/logger";
import {
  buildRuntimeTokenPayload,
  generateCartTransformRuntimeTokenSecret,
  signRuntimeCartToken,
  validateLiveSellingPlanSelection,
  resolveRuntimeSelectionProducts,
} from "../../services/cart-transform-runtime-token.server";
import { getBundleProductVariantId } from "../../utils/variant-lookup.server";
import { BundleStatus } from "../../constants/bundle";
import { resolveOfferSchedule } from "../../lib/offer-policy-decision";

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
      offerPolicy: true,
    },
  });

  if (!bundle || bundle.bundleType !== bundleType || !bundle.shopifyProductId) {
    return json({ ok: false, error: "Invalid runtime token payload" }, { status: 400, headers: CORS_HEADERS });
  }

  if ((bundle.status !== BundleStatus.ACTIVE && bundle.status !== BundleStatus.UNLISTED)
    || !resolveOfferSchedule(bundle.offerPolicy ?? {}).effective) {
    return json({ ok: false, error: "Offer is not currently available" }, {
      status: 403,
      headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
    });
  }

  try {
    const { unauthenticated } = await import("../../shopify.server");
    const { admin } = await unauthenticated.admin(shop);
    const parentVariantId = await getBundleProductVariantId(admin as never, bundle.shopifyProductId);
    const canonical = bundleType === 'full_page' ? buildFullPageBundleMetafieldConfig(bundle) : buildSyncBundleConfiguration(bundle, bundle.shopifyProductId);
    const policy = buildBundleAuthorizationPolicy({ bundle: canonical, shop, parentVariantId: parentVariantId ?? '' });
    const published = await readPublishedBundlePolicy(admin, bundleId);
    if (published?.revision !== policy.revision || published.pricingMode !== policy.pricingMode) {
      return json({ ok: false, error: 'Bundle configuration requires synchronization' }, { status: 409, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } });
    }
    const resolvedProducts = await resolveRuntimeSelectionProducts(admin, bundle, { components: body.components, addons: body.addons });
    const payload = buildRuntimeTokenPayload({
      resolvedProducts,
      revision: policy.revision,
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
