import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
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
import errorPageStylesheet from "./components/ErrorPage.css?url";
import { APP_BRAND } from "./lib/app-brand";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: errorPageStylesheet },
];

export function isStorefrontPreviewFramePath(pathname: string) {
  return pathname === "/settings-design-preview-frame"
    || pathname === "/settings-design-preview-frame/";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    isStorefrontPreviewFrame: isStorefrontPreviewFramePath(new URL(request.url).pathname),
  };
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
        <link rel="stylesheet" href={errorPageStylesheet} />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
          crossOrigin=""
        />
        <title>{`Error — ${APP_BRAND.name}`}</title>
        <link rel="icon" href={APP_BRAND.faviconPath} />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <ErrorPage error={error} />
        <CrispChat />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { apiKey, isStorefrontPreviewFrame } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href={APP_BRAND.faviconPath} />
        {/* Shopify mandate (March 13, 2024): app-bridge.js must be the first
            <script> tag in <head>, before any other scripts. The unversioned
            CDN URL is the official auto-updating endpoint — do not pin. */}
        {!isStorefrontPreviewFrame ? <meta name="shopify-api-key" content={apiKey} /> : null}
        <Meta />
        <Links />
        {!isStorefrontPreviewFrame ? (
          <>
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
            <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
          </>
        ) : null}
        {/* Keep one stable font link in the server and client trees. */}
        {!isStorefrontPreviewFrame ? (
          <link
            rel="stylesheet"
            href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
            crossOrigin=""
          />
        ) : null}
      </head>
      <body
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <Outlet />
        {!isStorefrontPreviewFrame ? <CrispChat /> : null}
        {!isStorefrontPreviewFrame ? <ScrollRestoration /> : null}
        <Scripts />
      </body>
    </html>
  );
}
