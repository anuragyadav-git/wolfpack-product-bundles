import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { createCannySession } from "../../services/canny.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const headers = { "Cache-Control": "no-store" };
  try {
    return json(await createCannySession(admin), { headers });
  } catch {
    // Do not log identity, JWTs, or potentially sensitive upstream responses.
    return json({ error: "canny_unavailable" }, { status: 503, headers });
  }
}
