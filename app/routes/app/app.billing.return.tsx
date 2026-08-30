import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { resolveShopEntitlements } from "../../services/subscriptions/subscription-service.server";
import { recordBusinessEvent } from "../../services/app-events.server";
import { applyFreePlanBundlePolicy } from "../../services/subscriptions/free-plan-bundle-policy.server";
import { syncBundleStorefrontNow } from "../../services/bundles/storefront-sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session, redirect } = await authenticate.admin(request);
  const url = new URL(request.url);
  const planHandleHint = url.searchParams.get("plan_handle");
  const state = await resolveShopEntitlements({
    shopDomain: session.shop,
    forceRefresh: true,
  });
  const verificationSucceeded = state.planCode !== null;
  await recordBusinessEvent({
    eventHandle: verificationSucceeded
      ? "subscription_verification_succeeded"
      : "subscription_verification_failed",
    shopDomain: session.shop,
    surface: "app_pricing_return",
    result: state.planCode?.toLowerCase() ?? "unverified",
    errorCode: verificationSucceeded ? null : "billing_unverified",
    attributes: {
      plan_code: state.planCode,
      billing_interval: state.billingInterval,
      redirect_hint_present: Boolean(planHandleHint),
    },
    sendToShopify: false,
  });
  if (state.planCode === "FREE") {
    await applyFreePlanBundlePolicy({
      shopDomain: session.shop,
      onBundleUnpublished: async ({ bundleId, bundleType }) => {
        await syncBundleStorefrontNow({
          admin,
          shopDomain: session.shop,
          bundleId,
          bundleType,
          reason: "downgrade",
        });
      },
    });
  }

  if (state.planCode === "GROWTH") {
    return redirect("/app/billing?upgraded=true");
  }
  if (state.planCode === "FREE") {
    return redirect("/app/billing");
  }
  return redirect("/app/billing?error=billing_unverified");
}

export default function AppPricingReturn() {
  return null;
}
