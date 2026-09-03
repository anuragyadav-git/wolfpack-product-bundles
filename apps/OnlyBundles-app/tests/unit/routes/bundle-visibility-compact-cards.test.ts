import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommonBundleVisibilityOverview } from "../../../app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview";

const renderOverview = (active = true) =>
  renderToStaticMarkup(
    React.createElement(CommonBundleVisibilityOverview, {
      active,
      embedStatus: {
        enabled: false,
        label: "Disabled",
        tone: "warning",
        description: "Enable the app embed to publish this bundle.",
      },
      link: {
        kind: "product",
        isLinked: true,
        url: "https://shop.test/products/example-bundle",
        emptyMessage: "Bundle product not yet linked.",
      },
      onCopyLink: jest.fn(),
      onEnableEmbed: jest.fn(),
      placementOptions: [
        {
          title: "Bundle Widget",
          description: "Display an offer on selected product pages.",
          actionLabel: "Set up Bundle Widget",
          variant: "primary",
          onAction: jest.fn(),
        },
        {
          title: "Bundle Embed",
          description: "Embed the builder on selected product pages.",
          actionLabel: "Set up Bundle Embed",
          variant: "secondary",
          onAction: jest.fn(),
        },
      ],
      themeEditorUrl: "https://admin.shopify.com/store/shop/themes/current/editor",
    }),
  );

describe("compact shared Bundle Visibility cards", () => {
  it("does not render when Bundle Visibility is inactive", () => {
    expect(renderOverview(false)).toBe("");
  });

  it("keeps status, link, and placement actions available", () => {
    const view = renderOverview();

    expect(view).toContain("App Embed Status");
    expect(view).toContain("Disabled");
    expect(view).toContain("Your Bundle Link");
    expect(view).toContain("Set up Bundle Widget");
    expect(view).toContain("Set up Bundle Embed");
  });

  it("uses Polaris icons only through CTA button icon properties", () => {
    const view = renderOverview();

    expect(view).not.toContain("<s-icon");
    expect(view).toContain('icon="theme-edit"');
    expect(view).toContain('icon="duplicate"');
    expect(view.match(/icon="arrow-right"/g)).toHaveLength(2);
  });
});
