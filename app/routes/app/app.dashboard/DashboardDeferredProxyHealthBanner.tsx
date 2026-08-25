import { Await } from "@remix-run/react";
import { Suspense } from "react";
import { ProxyHealthBanner } from "../../../components/ProxyHealthBanner";

type DashboardBanners = {
  proxyHealthy: boolean;
};

type DashboardDeferredProxyHealthBannerProps = {
  appUrl?: string;
  banners: Promise<DashboardBanners> | DashboardBanners;
  shop: string;
};

export function DashboardDeferredProxyHealthBanner({
  appUrl,
  banners,
  shop,
}: DashboardDeferredProxyHealthBannerProps) {
  return (
    <Suspense fallback={null}>
      <Await resolve={banners}>
        {(resolved) => resolved.proxyHealthy || !appUrl
          ? null
          : <ProxyHealthBanner shop={shop} appUrl={appUrl} />}
      </Await>
    </Suspense>
  );
}
