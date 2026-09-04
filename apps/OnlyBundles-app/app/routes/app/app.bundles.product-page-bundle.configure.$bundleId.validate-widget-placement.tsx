import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { handleValidateWidgetPlacement } from "./app.bundles.product-page-bundle.configure.$bundleId/handlers/widget-placement.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({ success: false, error: "Method not allowed" }, { status: 405 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const bundleId = params.bundleId;
  if (!bundleId) {
    return json(
      { success: false, error: "Invalid bundle widget placement route" },
      { status: 400 }
    );
  }

  return handleValidateWidgetPlacement(admin, session, bundleId);
};
