import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireAdminSession } from "../../lib/auth-guards.server";
import IntegrationsRouteShell from "./app.integrations/IntegrationsRouteShell";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminSession(request);
  return json(null);
}

export default function IntegrationsRoute() {
  return <IntegrationsRouteShell />;
}
