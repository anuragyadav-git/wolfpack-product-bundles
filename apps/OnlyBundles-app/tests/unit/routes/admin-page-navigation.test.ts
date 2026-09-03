import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AdminPageBackTitle,
  AdminPageTitleBar,
} from "../../../app/components/AdminPageNavigation";

describe("Admin page navigation", () => {
  it("renders a Shopify title bar with a breadcrumb action", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AdminPageTitleBar, {
        title: "Analytics",
        breadcrumbLabel: "Dashboard",
        onBack: jest.fn(),
      }),
    );

    expect(markup).toContain("Analytics");
    expect(markup).toContain("Dashboard");
    expect(markup).toContain('variant="breadcrumb"');
  });

  it("renders an app-owned heading with an accessible back action", () => {
    const markup = renderToStaticMarkup(
      React.createElement(AdminPageBackTitle, {
        title: "Pricing",
        backLabel: "Back to previous page",
        onBack: jest.fn(),
      }),
    );

    expect(markup).toContain("Pricing");
    expect(markup).toContain('accessibilityLabel="Back to previous page"');
    expect(markup).toContain('icon="arrow-left"');
  });
});
