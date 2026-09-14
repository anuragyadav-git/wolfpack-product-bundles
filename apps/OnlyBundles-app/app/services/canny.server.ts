import { SignJWT } from "jose";

type CannyEnvironment = Record<string, string | undefined>;
type ShopGraphqlClient = {
  graphql: (query: string) => Promise<{ json(): Promise<unknown> }>;
};

/** Only these non-secret fields may cross the server/client boundary. */
export function getCannyPublicConfig(env: CannyEnvironment = process.env) {
  const appID = env.CANNY_APP_ID?.trim();
  const boardToken = env.CANNY_BOARD_TOKEN?.trim();
  const portalURL = env.CANNY_PORTAL_URL?.trim();
  if (!appID || !boardToken || !portalURL || !env.CANNY_SSO_PRIVATE_KEY?.trim()) return null;
  try {
    const url = new URL(portalURL);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return { appID, boardToken, portalURL: url.origin };
  } catch {
    return null;
  }
}

export async function createCannySession(admin: ShopGraphqlClient, env: CannyEnvironment = process.env) {
  if (!getCannyPublicConfig(env)) throw new Error("Canny is not configured");
  const response = await admin.graphql(`#graphql
    query CannyShopIdentity {
      shop { id name email }
    }
  `);
  const body = await response.json() as {
    errors?: unknown[];
    data?: { shop?: { id?: string; name?: string; email?: string } };
  };
  const shop = body.data?.shop;
  if (body.errors?.length || !shop?.id?.startsWith("gid://shopify/Shop/") || !shop.name?.trim() || !shop.email?.trim()) {
    throw new Error("Canny shop identity unavailable");
  }
  const ssoToken = await new SignJWT({ id: shop.id, name: shop.name, email: shop.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(env.CANNY_SSO_PRIVATE_KEY));
  return { ssoToken };
}
