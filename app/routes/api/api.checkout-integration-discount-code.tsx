import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireAppProxy } from "../../lib/auth-guards.server";
import { isSupportedCheckoutIntegrationProvider } from "../../lib/checkout-integrations";
import { AppLogger } from "../../lib/logger";
import { CheckoutIntegrationDiscountCodeService } from "../../services/checkout-integration-discount-code-service.server";
import { unauthenticated } from "../../shopify.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await requireAppProxy(request);
  const shopDomain = session.shop;

  const body = await request.json().catch(() => null);
  const providerId = body?.providerId;

  if (!isSupportedCheckoutIntegrationProvider(providerId)) {
    return json({ ok: false, error: "Unsupported checkout integration provider" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const { admin } = await unauthenticated.admin(shopDomain);
    const result = await CheckoutIntegrationDiscountCodeService.createForProvider(
      admin,
      shopDomain,
      providerId,
    );

    if (!result.success || !result.code || !result.expiresAt) {
      return json({
        ok: false,
        error: result.error ?? "Checkout integration discount code could not be created",
      }, { status: 500, headers: CORS_HEADERS });
    }

    return json({
      ok: true,
      providerId,
      code: result.code,
      expiresAt: result.expiresAt,
    }, {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    }

    AppLogger.error("Checkout integration discount code creation failed", {
      component: "api.checkout-integration-discount-code",
      operation: "action",
      shop: shopDomain,
    }, error);

    return json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown checkout integration discount code error",
    }, { status: 500, headers: CORS_HEADERS });
  }
}
