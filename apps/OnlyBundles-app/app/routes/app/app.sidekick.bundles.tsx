import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import {
  executeSidekickBundleOperation,
  SidekickBundleRequestError,
} from "../../services/sidekick-bundles.server";

const responseHeaders = {
  "Cache-Control": "private, no-store",
};

export async function action({ request }: ActionFunctionArgs) {
  const { cors, session } = await authenticate.admin(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return cors(
      json(
        { error: "invalid_json" },
        { status: 400, headers: responseHeaders },
      ),
    );
  }

  try {
    const payload = await executeSidekickBundleOperation({
      shop: session.shop,
      body,
    });
    return cors(json(payload, { headers: responseHeaders }));
  } catch (error) {
    if (error instanceof SidekickBundleRequestError) {
      return cors(
        json(
          { error: error.code },
          { status: error.status, headers: responseHeaders },
        ),
      );
    }
    return cors(
      json(
        { error: "sidekick_request_failed" },
        { status: 500, headers: responseHeaders },
      ),
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { cors } = await authenticate.admin(request);
  return cors(
    json(
      { error: "method_not_allowed" },
      {
        status: 405,
        headers: { ...responseHeaders, Allow: "POST" },
      },
    ),
  );
}
