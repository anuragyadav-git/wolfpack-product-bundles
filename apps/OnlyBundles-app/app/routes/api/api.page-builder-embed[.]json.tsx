import { createHash } from "node:crypto";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../../db.server";
import { formatBundleForWidget } from "../../lib/bundle-formatter.server";
import { authenticate } from "../../shopify.server";
import { AppLogger } from "../../lib/logger";
import { parsePageBuilderEmbedRequest } from "../../lib/page-builder-embed";
import { resolvePageBuilderEmbed } from "../../services/page-builder-embed.server";

const CACHE_CONTROL = "private, max-age=30, must-revalidate";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const embedRequest = parsePageBuilderEmbedRequest(new URL(request.url).searchParams);
  if (!embedRequest) {
    return json(
      { embed: null },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const resolution = await resolvePageBuilderEmbed(
      db as unknown as Parameters<typeof resolvePageBuilderEmbed>[0],
      session.shop,
      embedRequest,
    );
    const embed = resolution
      ? {
          bundleType: embedRequest.bundleType,
          bundle: formatBundleForWidget(resolution.bundle as any),
          ...(resolution.loadingScreen
            ? { loadingScreen: resolution.loadingScreen }
            : {}),
        }
      : null;
    const payload = { embed };
    const etag = `"${createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("base64url")}"`;
    const headers = {
      "Cache-Control": CACHE_CONTROL,
      ETag: etag,
      Vary: "Accept-Encoding",
    };
    if (request.headers.get("If-None-Match") === etag) {
      return new Response(null, { status: 304, headers });
    }
    return json(payload, { headers });
  } catch (error: any) {
    if (error instanceof Response) throw error;
    AppLogger.error(
      "Failed to resolve page-builder bundle embed",
      { component: "api.page-builder-embed", shop: session.shop },
      error,
    );
    return json(
      { embed: null },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
