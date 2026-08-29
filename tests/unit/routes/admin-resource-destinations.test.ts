import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { APP_BRAND } from "../../../app/lib/app-brand";
import { DashboardResourcesCard } from "../../../app/routes/app/app.dashboard/DashboardResourcesCard";
import IntegrationsRouteShell from "../../../app/routes/app/app.integrations/IntegrationsRouteShell";

jest.mock("@remix-run/react", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("Admin resource destinations", () => {
  it("uses verified Shopify App Store destinations instead of the expired company domain", () => {
    expect(JSON.stringify(APP_BRAND.links)).not.toContain("wolfpackapps.com");
    expect(APP_BRAND.links.company).toBe("https://apps.shopify.com/partners/wolfpack6");
    expect((APP_BRAND.links as Record<string, string>).listing).toBe(
      "https://apps.shopify.com/wolfpack-product-bundles-1",
    );
  });

  it("keeps unavailable Dashboard SDK and gallery resources non-interactive", () => {
    const view = renderToStaticMarkup(
      React.createElement(DashboardResourcesCard as any, {
        activeResource: "bundle-inspirations",
        setActiveResource: jest.fn(),
        handleDirectChat: jest.fn(),
      }),
    );

    expect(view).toContain("dashboard.resources.sdkDocumentation");
    expect(view).toContain("dashboard.resources.comingSoon");
    expect(view).not.toContain("wolfpackapps.com");
    expect(view).not.toContain("<a ");
  });

  it("renders integration setup as app-owned actions without external destinations", () => {
    const view = renderToStaticMarkup(
      React.createElement(IntegrationsRouteShell, { onBack: jest.fn() }),
    );

    expect(view.match(/View Setup/g)).toHaveLength(6);
    expect(view).not.toContain("wolfpackapps.com");
    expect(view).not.toContain('target="_blank"');
    expect(view).not.toContain('href="http');
  });
});
