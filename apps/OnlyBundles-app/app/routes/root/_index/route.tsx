import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  return redirect(`/app${url.search}`);
};

export default function RootIndexRoute() {
  return null;
}
