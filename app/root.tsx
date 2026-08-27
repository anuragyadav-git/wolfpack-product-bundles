import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react";
import CrispChat from "./components/CrispChat";
import { ErrorPage } from "./components/ErrorPage";

export const loader = async (_args: LoaderFunctionArgs) => {
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export function ErrorBoundary() {
  const error = useRouteError();
  // Root loader may not have run if the error happened before it; fall back to "".
  const rootData = useRouteLoaderData<typeof loader>("root");
  const apiKey = rootData?.apiKey ?? "";
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Shopify mandate (March 13, 2024): app-bridge.js must be the first
            <script> tag in <head>, before any other scripts. */}
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
          crossOrigin=""
        />
        <title>Error — Wolfpack Bundles</title>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <ErrorPage error={error} />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Shopify mandate (March 13, 2024): app-bridge.js must be the first
            <script> tag in <head>, before any other scripts. The unversioned
            CDN URL is the official auto-updating endpoint — do not pin. */}
        <meta name="shopify-api-key" content={apiKey} />
        <Meta />
        <Links />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
        {/* Keep one stable font link in the server and client trees. */}
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
          crossOrigin=""
        />
      </head>
      <body
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <Outlet />
        <CrispChat />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
