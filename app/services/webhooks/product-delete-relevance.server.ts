import db from "../../db.server";

interface ProductDeletePayload {
  id?: string | number;
}
export async function isTrackedBundleProductDelete({
  rawBody,
  shopDomain,
}: {
  rawBody: Buffer;
  shopDomain: string;
}): Promise<boolean> {
  let payload: ProductDeletePayload;

  try {
    payload = JSON.parse(rawBody.toString("utf8")) as ProductDeletePayload;
  } catch {
    throw new Error("Invalid products/delete payload");
  }

  if ((typeof payload.id !== "string" && typeof payload.id !== "number") || String(payload.id).length === 0) {
    throw new Error("Invalid products/delete payload");
  }

  const stepProduct = await db.stepProduct.findFirst({
    where: {
      productId: `gid://shopify/Product/${payload.id}`,
      step: {
        bundle: {
          shopId: shopDomain,
        },
      },
    },
    select: { id: true },
  });

  return stepProduct !== null;
}
