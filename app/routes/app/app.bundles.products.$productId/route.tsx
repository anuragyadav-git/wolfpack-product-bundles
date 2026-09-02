import type { LoaderFunctionArgs } from "@remix-run/node";
import { BundleType } from "../../../constants/bundle";
import db from "../../../db.server";
import { authenticate } from "../../../shopify.server";

const SHOPIFY_PRODUCT_ID_PATTERN = /^\d+$/;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, redirect } = await authenticate.admin(request);
  const productId = params.productId;

  if (!productId || !SHOPIFY_PRODUCT_ID_PATTERN.test(productId)) {
    throw new Response("Invalid Shopify product ID", { status: 400 });
  }

  const bundle = await db.bundle.findFirst({
    where: {
      shopId: session.shop,
      shopifyProductId: `gid://shopify/Product/${productId}`,
    },
    select: { id: true, bundleType: true },
  });

  if (!bundle) {
    throw new Response("Bundle not found", { status: 404 });
  }

  const routeType =
    bundle.bundleType === BundleType.FULL_PAGE
      ? "full-page-bundle"
      : "product-page-bundle";

  return redirect(`/app/bundles/${routeType}/configure/${bundle.id}`);
};
