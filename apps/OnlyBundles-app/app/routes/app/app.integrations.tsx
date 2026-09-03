import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { navigateBackOrFallback } from "../../lib/navigation";
import IntegrationsRouteShell from "./app.integrations/IntegrationsRouteShell";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json(null);
}

export default function IntegrationsRoute() {
  const navigate = useNavigate();

  return (
    <IntegrationsRouteShell
      onBack={() =>
        navigateBackOrFallback(navigate, "/app/dashboard", {
          replaceFallback: true,
        })
      }
    />
  );
}
