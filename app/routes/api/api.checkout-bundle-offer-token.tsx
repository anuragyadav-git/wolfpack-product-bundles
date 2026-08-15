import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../../db.server";
import { BundleStatus } from "../../constants/bundle";
import { AppLogger } from "../../lib/logger";
import { authenticate } from "../../shopify.server";
import {
  buildCheckoutOfferRuntime,
  calculateCheckoutOfferSelectionAmount,
  resolveActiveCheckoutOffer,
} from "../../services/checkout-bundle-offers.server";
import {
  generateCartTransformRuntimeTokenSecret,
  normalizeProductVariantGid,
  signRuntimeCartToken,
  verifyRuntimeCartToken,
} from "../../services/cart-transform-runtime-token.server";

function shopDomainFromDestination(destination: unknown) {
  if (typeof destination !== "string") return null;
  try {
    const hostname = new URL(destination).hostname.toLowerCase();
    return hostname.endsWith(".myshopify.com") ? hostname : null;
  } catch {
    return null;
  }
}

function errorResponse(cors: (response: Response) => Response, message = "Invalid checkout bundle offer request") {
  return cors(json({ ok: false, error: message }, { status: 400 }));
}

function offerLineAttributes(input: {
  token: string;
  offerKey: string;
  tierId: string;
  offerGroupId: string;
  discount: { type: "PERCENTAGE"; value: number } | null;
}) {
  const suffix = input.offerKey.replace(/[^a-zA-Z0-9-]/g, "-");
  return [
    { key: "_wolfpackProductBundle:OfferId", value: `${input.offerGroupId}_checkout-${suffix}` },
    { key: "_wolfpack_bundle_runtime", value: input.token },
    {
      key: "_bundle_step_type",
      value: input.discount
        ? `addon:${input.discount.type}:${input.discount.value}`
        : "addon",
    },
    { key: "_addon_product", value: "true" },
    { key: "_addonTierId", value: input.tierId },
    { key: "_addon_offer_id", value: input.offerGroupId },
    { key: "_checkout_offer_key", value: input.offerKey },
  ];
}

export function loader() {
  return json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST, OPTIONS" } },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { sessionToken, cors } = await authenticate.public.checkout(request);
  const shop = shopDomainFromDestination(sessionToken.dest);
  if (!shop) return errorResponse(cors);

  const body = await request.json().catch(() => null);
  const parentToken = typeof body?.parentToken === "string" ? body.parentToken : "";
  const offerKey = typeof body?.offerKey === "string" ? body.offerKey.trim() : "";
  const selectedVariantId = normalizeProductVariantGid(body?.selectedVariantId);
  const quantity = Number(body?.quantity);
  if (!parentToken || !offerKey || !selectedVariantId || !Number.isInteger(quantity) || quantity < 1) {
    return errorResponse(cors);
  }

  const secret = generateCartTransformRuntimeTokenSecret(shop);
  const parentPayload = verifyRuntimeCartToken(parentToken, secret);
  if (!parentPayload || parentPayload.shop !== shop) {
    return errorResponse(cors);
  }

  const bundle = await (prisma.bundle as any).findFirst({
    where: {
      id: parentPayload.bundleId,
      shopId: shop,
      status: BundleStatus.ACTIVE,
      bundleType: parentPayload.bundleType,
    },
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
  if (!bundle) return errorResponse(cors);

  const runtime = buildCheckoutOfferRuntime(bundle);
  const offer = resolveActiveCheckoutOffer(
    runtime.offers,
    offerKey,
    parentPayload,
    calculateCheckoutOfferSelectionAmount(bundle, parentPayload),
  );
  if (
    !offer
    || quantity > offer.maxQuantity
    || !offer.variants.some((variant) => variant.id === selectedVariantId)
  ) {
    return errorResponse(cors);
  }

  const groupVariantIds = new Set(
    runtime.offers
      .filter((candidate) => candidate.groupKey === offer.groupKey)
      .flatMap((candidate) => candidate.variants.map((variant) => variant.id)),
  );
  const payload = {
    ...parentPayload,
    addons: [
      ...parentPayload.addons.filter((addon) => !groupVariantIds.has(addon.variantId)),
      {
        variantId: selectedVariantId,
        quantity,
        discount: offer.discount,
      },
    ],
  };
  const token = signRuntimeCartToken(payload, secret);
  const attributes = offerLineAttributes({
    token,
    offerKey: offer.key,
    tierId: offer.tierId,
    offerGroupId: parentPayload.offerGroupId,
    discount: offer.discount,
  });

  AppLogger.info("Checkout bundle offer token issued", {
    component: "api.checkout-bundle-offer-token",
    shop,
    bundleId: parentPayload.bundleId,
    offerKey,
    quantity,
  });

  return cors(json({
    ok: true,
    token,
    offerKey: offer.key,
    offerGroupId: parentPayload.offerGroupId,
    parentVariantId: parentPayload.parentVariantId,
    quantity,
    discount: offer.discount,
    attributes,
  }, { headers: { "Cache-Control": "no-store" } }));
}
