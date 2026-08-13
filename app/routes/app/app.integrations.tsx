import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { requireAdminSession } from "../../lib/auth-guards.server";
import { navigateBackOrFallback } from "../../lib/navigation";
import IntegrationsRouteShell from "./app.integrations/IntegrationsRouteShell";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminSession(request);
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
