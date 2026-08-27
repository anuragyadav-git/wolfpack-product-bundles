import db from "../../db.server";
import type { ShopifyAdmin } from "../../lib/auth-guards.server";
import { AppLogger } from "../../lib/logger";
import { buildBundleProductDescriptionHtml } from "../../lib/bundle-product-description.server";
import { buildGeneratedBundleProductMetadata } from "../../lib/bundle-product-data.server";
import { buildBundleProductPlaceholderMediaInput } from "../../lib/bundle-product-media.server";
import { buildFpbStorefrontUrl } from "../../lib/fpb-storefront-url";

type BundleParentProductRecord = {
  id: string;
  publicNumber?: number | null;
  name: string;
  bundleType?: string | null;
  shopifyProductId?: string | null;
  shopifyProductHandle?: string | null;
};

type ShopifyUserError = {
  field?: string[] | null;
  message: string;
  code?: string | null;
};

type ParentProductNode = {
  id: string;
  handle: string;
  status: string;
  variants?: {
    nodes?: Array<{ id?: string | null }>;
  } | null;
};

const REBUY_SMART_CART_BUNDLE_TAG = "smart-cart-hide-bundle-options";

export type BundleParentProductResult = {
  productId: string;
  variantId: string;
  handle: string;
  status: string;
  created: boolean;
};

const FIND_REDIRECT = `#graphql
  query FindUrlRedirect($query: String!) {
    urlRedirects(first: 10, query: $query) {
      nodes { id path target }
    }
  }
`;

const CREATE_REDIRECT = `#graphql
  mutation CreateUrlRedirect($urlRedirect: UrlRedirectInput!) {
    urlRedirectCreate(urlRedirect: $urlRedirect) {
      urlRedirect { id path target }
      userErrors { code field message }
    }
  }
`;

const UPDATE_REDIRECT = `#graphql
  mutation UpdateUrlRedirect($id: ID!, $urlRedirect: UrlRedirectInput!) {
    urlRedirectUpdate(id: $id, urlRedirect: $urlRedirect) {
      urlRedirect { id path target }
      userErrors { code field message }
    }
  }
`;

const UPDATE_PARENT_PRODUCT_HANDLE = `#graphql
  mutation UpdateFpbParentProductHandle($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

function buildFpbInternalParentHandle(bundleId: string): string {
  const normalizedBundleId = bundleId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `wpb-parent-${normalizedBundleId}`;
}

function isInternalParentHandle(handle: string, canonicalHandle: string): boolean {
  return handle === canonicalHandle || handle.startsWith(`${canonicalHandle}-`);
}

function normalizeRedirectPath(path: string): string {
  return new URL(path, "https://shop.invalid").pathname.replace(
    /%[0-9A-F]{2}/g,
    (escape) => escape.toLowerCase(),
  );
}

async function findRedirect(admin: ShopifyAdmin, path: string) {
  const normalizedPath = normalizeRedirectPath(path);
  const response = await admin.graphql(FIND_REDIRECT, {
    variables: { query: `path:${JSON.stringify(normalizedPath)}` },
  });
  const data = await response.json() as {
    data?: {
      urlRedirects?: {
        nodes?: Array<{ id: string; path: string; target: string }>;
      };
    };
    errors?: Array<{ message?: string }>;
  };
  if (data.errors?.length) {
    throw new Error(
      `Failed to inspect redirect ${path}: ${data.errors[0]?.message ?? "unknown error"}`,
    );
  }
  return data.data?.urlRedirects?.nodes?.find(
    (redirect) => normalizeRedirectPath(redirect.path) === normalizedPath,
  ) ?? null;
}

async function ensureRedirect(
  admin: ShopifyAdmin,
  path: string,
  target: string,
): Promise<void> {
  const existing = await findRedirect(admin, path);
  if (existing?.target === target) return;

  const response = existing
    ? await admin.graphql(UPDATE_REDIRECT, {
        variables: { id: existing.id, urlRedirect: { path, target } },
      })
    : await admin.graphql(CREATE_REDIRECT, {
        variables: { urlRedirect: { path, target } },
      });
  const data = await response.json() as {
    data?: {
      urlRedirectUpdate?: {
        urlRedirect?: { id: string } | null;
        userErrors?: ShopifyUserError[];
      };
      urlRedirectCreate?: {
        urlRedirect?: { id: string } | null;
        userErrors?: ShopifyUserError[];
      };
    };
  };
  const payload = existing
    ? data.data?.urlRedirectUpdate
    : data.data?.urlRedirectCreate;
  const errors = payload?.userErrors ?? [];
  if (errors.length > 0 || !payload?.urlRedirect) {
    throw new Error(
      `Failed to ensure redirect ${path}: ${errors[0]?.message ?? "unknown error"}`,
    );
  }
}

async function ensureFpbParentProductHost(input: {
  admin: ShopifyAdmin;
  bundleId: string;
  publicNumber: number;
  shopId: string;
  productId: string;
  storedHandle: string | null;
  liveHandle: string;
}) {
  const target = new URL(buildFpbStorefrontUrl(input.shopId, input.publicNumber)).pathname;
  const canonicalHandle = buildFpbInternalParentHandle(input.bundleId);
  const legacyHandles = [...new Set([input.storedHandle, input.liveHandle])]
    .filter((handle): handle is string =>
      Boolean(handle) && !isInternalParentHandle(handle as string, canonicalHandle));

  for (const handle of legacyHandles) {
    await ensureRedirect(input.admin, `/products/${handle}`, target);
  }

  if (isInternalParentHandle(input.liveHandle, canonicalHandle)) {
    return input.liveHandle;
  }

  const response = await input.admin.graphql(UPDATE_PARENT_PRODUCT_HANDLE, {
    variables: {
      product: {
        id: input.productId,
        handle: canonicalHandle,
        redirectNewHandle: false,
      },
    },
  });
  const data = await response.json() as {
    data?: {
      productUpdate?: {
        product?: { id: string; handle: string } | null;
        userErrors?: ShopifyUserError[];
      };
    };
    errors?: Array<{ message?: string }>;
  };
  const payload = data.data?.productUpdate;
  const errors = [...(data.errors ?? []), ...(payload?.userErrors ?? [])];
  const updatedHandle = payload?.product?.handle;
  if (
    errors.length > 0
    || typeof updatedHandle !== "string"
    || !isInternalParentHandle(updatedHandle, canonicalHandle)
  ) {
    throw new Error(
      `Failed to move FPB parent product: ${errors[0]?.message ?? "Shopify returned an unexpected handle"}`,
    );
  }

  for (const handle of legacyHandles) {
    await ensureRedirect(input.admin, `/products/${handle}`, target);
  }

  return updatedHandle;
}

export class BundleParentProductError extends Error {
  operation: string;
  userErrors: ShopifyUserError[];

  constructor(operation: string, userErrors: ShopifyUserError[]) {
    const details = userErrors
      .map((error) => {
        const field = error.field?.length ? ` (${error.field.join(".")})` : "";
        return `${error.message}${field}`;
      })
      .join("; ");
    super(`Failed to ${operation}: ${details || "Shopify returned an unknown error"}`);
    this.name = "BundleParentProductError";
    this.operation = operation;
    this.userErrors = userErrors;
  }
}

function throwTransportErrors(operation: string, errors: unknown[] | undefined) {
  if (!errors?.length) return;
  const userErrors = errors.map((error) => ({
    message:
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : String(error),
  }));
  throw new BundleParentProductError(operation, userErrors);
}

function throwUserErrors(operation: string, userErrors: ShopifyUserError[] | undefined) {
  if (userErrors?.length) {
    throw new BundleParentProductError(operation, userErrors);
  }
}

async function addRebuySmartCartCompatibilityTag(
  admin: ShopifyAdmin,
  productId: string,
) {
  const response = await admin.graphql(
    `
      mutation AddRebuySmartCartTag($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node { id }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        id: productId,
        tags: [REBUY_SMART_CART_BUNDLE_TAG],
      },
    },
  );
  const data = (await response.json()) as {
    data?: { tagsAdd?: { userErrors?: ShopifyUserError[] } };
    errors?: unknown[];
  };
  throwTransportErrors("add Rebuy Smart Cart compatibility tag", data.errors);
  throwUserErrors(
    "add Rebuy Smart Cart compatibility tag",
    data.data?.tagsAdd?.userErrors,
  );
}

async function loadParentProduct(
  admin: ShopifyAdmin,
  productId: string,
): Promise<ParentProductNode | null> {
  const response = await admin.graphql(
    `
      query GetBundleParentProduct($id: ID!) {
        product(id: $id) {
          id
          handle
          status
          variants(first: 1) {
            nodes { id }
          }
        }
      }
    `,
    { variables: { id: productId } },
  );
  const data = (await response.json()) as {
    data?: { product?: ParentProductNode | null };
    errors?: unknown[];
  };
  throwTransportErrors("load parent product", data.errors);
  return data.data?.product ?? null;
}

async function loadShopName(admin: ShopifyAdmin): Promise<string | null> {
  const response = await admin.graphql(`
    query GetBundleParentShop {
      shop { name }
    }
  `);
  const data = (await response.json()) as {
    data?: { shop?: { name?: string | null } };
    errors?: unknown[];
  };
  throwTransportErrors("load shop name", data.errors);
  return data.data?.shop?.name?.trim() ?? null;
}

async function createParentProduct(input: {
  admin: ShopifyAdmin;
  appUrl?: string;
  bundle: BundleParentProductRecord;
}): Promise<ParentProductNode> {
  const shopName = await loadShopName(input.admin);
  const productMetadata = buildGeneratedBundleProductMetadata({
    bundleName: input.bundle.name,
    shopName,
  });
  const media = buildBundleProductPlaceholderMediaInput(
    input.appUrl,
    input.bundle.name,
  );
  const response = await input.admin.graphql(
    `
      mutation CreateBundleParentProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
        productCreate(product: $product, media: $media) {
          product {
            id
            handle
            status
            variants(first: 1) {
              nodes { id }
            }
          }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        product: {
          ...productMetadata,
          ...(input.bundle.bundleType === "full_page"
            ? { handle: buildFpbInternalParentHandle(input.bundle.id) }
            : {}),
          claimOwnership: { bundles: true },
          status: "UNLISTED",
          descriptionHtml: buildBundleProductDescriptionHtml({
            bundleName: input.bundle.name,
            status: "unlisted",
          }),
          tags: [
            "WP-Bundles",
            "wolfpack-bundle-parent",
            REBUY_SMART_CART_BUNDLE_TAG,
          ],
        },
        ...(media ? { media } : {}),
      },
    },
  );
  const data = (await response.json()) as {
    data?: {
      productCreate?: {
        product?: ParentProductNode | null;
        userErrors?: ShopifyUserError[];
      };
    };
    errors?: unknown[];
  };
  throwTransportErrors("create parent product", data.errors);
  throwUserErrors("create parent product", data.data?.productCreate?.userErrors);
  const product = data.data?.productCreate?.product;
  if (!product?.id || !product.handle) {
    throw new BundleParentProductError("create parent product", [
      { message: "Shopify did not return a product ID and handle" },
    ]);
  }
  return product;
}

async function configureParentVariant(
  admin: ShopifyAdmin,
  productId: string,
  variantId: string,
) {
  const response = await admin.graphql(
    `
      mutation ConfigureBundleParentVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id }
          userErrors { field message code }
        }
      }
    `,
    {
      variables: {
        productId,
        variants: [
          {
            id: variantId,
            price: "0.00",
            inventoryPolicy: "CONTINUE",
            taxable: false,
            requiresComponents: true,
          },
        ],
      },
    },
  );
  const data = (await response.json()) as {
    data?: {
      productVariantsBulkUpdate?: { userErrors?: ShopifyUserError[] };
    };
    errors?: unknown[];
  };
  throwTransportErrors("configure parent variant", data.errors);
  throwUserErrors(
    "configure parent variant",
    data.data?.productVariantsBulkUpdate?.userErrors,
  );
}

async function publishParentToOnlineStore(
  admin: ShopifyAdmin,
  productId: string,
) {
  const publicationsResponse = await admin.graphql(`
    query GetOnlineStorePublication {
      publications(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  `);
  const publicationsData = (await publicationsResponse.json()) as {
    data?: {
      publications?: {
        nodes?: Array<{
          id: string;
          name?: string | null;
        }>;
      };
    };
    errors?: unknown[];
  };
  throwTransportErrors("load Online Store publication", publicationsData.errors);
  const onlineStore = publicationsData.data?.publications?.nodes?.find(
    (publication) => publication.name === "Online Store",
  );
  if (!onlineStore) {
    throw new BundleParentProductError("load Online Store publication", [
      { message: "Online Store publication is not available for this shop" },
    ]);
  }

  const response = await admin.graphql(
    `
      mutation PublishBundleParentProduct($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable { availablePublicationsCount { count } }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        id: productId,
        input: [{ publicationId: onlineStore.id }],
      },
    },
  );
  const data = (await response.json()) as {
    data?: { publishablePublish?: { userErrors?: ShopifyUserError[] } };
    errors?: unknown[];
  };
  throwTransportErrors("publish parent product", data.errors);
  throwUserErrors("publish parent product", data.data?.publishablePublish?.userErrors);
}

export async function ensureBundleParentProduct(input: {
  admin: ShopifyAdmin;
  shopDomain: string;
  appUrl?: string;
  bundle: BundleParentProductRecord;
}): Promise<BundleParentProductResult> {
  let product = input.bundle.shopifyProductId
    ? await loadParentProduct(input.admin, input.bundle.shopifyProductId)
    : null;
  let created = false;

  if (!product) {
    product = await createParentProduct(input);
    created = true;
    await db.bundle.update({
      where: { id: input.bundle.id, shopId: input.shopDomain },
      data: {
        shopifyProductId: product.id,
        shopifyProductHandle: product.handle,
      },
    });
  } else {
    if (input.bundle.bundleType === "full_page") {
      if (!input.bundle.publicNumber) {
        throw new Error("FPB public number is required before parent product sync");
      }
      const host = await ensureFpbParentProductHost({
        admin: input.admin,
        bundleId: input.bundle.id,
        publicNumber: input.bundle.publicNumber,
        shopId: input.shopDomain,
        productId: product.id,
        storedHandle: input.bundle.shopifyProductHandle ?? null,
        liveHandle: product.handle,
      });
      product.handle = host;
    }
    if (product.handle !== input.bundle.shopifyProductHandle) {
      await db.bundle.update({
        where: { id: input.bundle.id, shopId: input.shopDomain },
        data: { shopifyProductHandle: product.handle },
      });
    }
    await addRebuySmartCartCompatibilityTag(input.admin, product.id);
  }

  const variantId = product.variants?.nodes?.[0]?.id;
  if (!variantId) {
    throw new BundleParentProductError("configure parent variant", [
      { message: "Shopify parent product has no default variant" },
    ]);
  }

  await configureParentVariant(input.admin, product.id, variantId);
  await publishParentToOnlineStore(input.admin, product.id);

  AppLogger.info("Bundle parent product contract ensured", {
    component: "bundle-parent-product",
    bundleId: input.bundle.id,
    productId: product.id,
    created,
  });

  return {
    productId: product.id,
    variantId,
    handle: product.handle,
    status: product.status,
    created,
  };
}
