export interface ShopifyAdminGraphqlClient {
  graphql: (query: string) => Promise<Response>;
}

export interface ShopifyAppIdentity {
  id: string;
  handle: string;
}

type CurrentAppResponse = {
  data?: {
    app?: {
      id?: string | null;
      handle?: string | null;
    } | null;
  };
  errors?: unknown[];
};

const APP_GID_PATTERN = /^gid:\/\/shopify\/App\/\d+$/;
const APP_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export class ShopifyAppIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyAppIdentityError";
  }
}

export async function getCurrentShopifyAppIdentity(
  admin: ShopifyAdminGraphqlClient,
): Promise<ShopifyAppIdentity> {
  const response = await admin.graphql(`#graphql
    query CurrentAppIdentity {
      app {
        id
        handle
      }
    }
  `);
  if (!response.ok) {
    throw new ShopifyAppIdentityError("Shopify could not return the current app identity");
  }

  const payload = await response.json() as CurrentAppResponse;
  const id = payload.data?.app?.id?.trim() ?? "";
  const handle = payload.data?.app?.handle?.trim() ?? "";
  if (payload.errors?.length || !APP_GID_PATTERN.test(id) || !APP_HANDLE_PATTERN.test(handle)) {
    throw new ShopifyAppIdentityError("Shopify returned an invalid current app identity");
  }

  return { id, handle };
}

export async function getInstalledShopifyAppIdentity(
  shopDomain: string,
): Promise<ShopifyAppIdentity> {
  const { unauthenticated } = await import("../../shopify.server");
  const { admin } = await unauthenticated.admin(shopDomain);
  return getCurrentShopifyAppIdentity(admin);
}
