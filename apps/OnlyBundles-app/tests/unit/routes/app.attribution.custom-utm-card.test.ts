import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let mockFetcherState = "idle";

jest.mock("@remix-run/react", () => ({
  Await: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
    React.createElement(React.Fragment, null, children({ active: true })),
  useFetcher: jest.fn(() => ({
    data: undefined,
    state: mockFetcherState,
    Form: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("form", props, children),
  })),
  useLoaderData: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({
    saveBar: {
      show: jest.fn().mockResolvedValue(undefined),
      hide: jest.fn().mockResolvedValue(undefined),
    },
  }),
}));

jest.mock("../../../app/components/analytics/BundlePerformanceMatrix", () => ({
  BundlePerformanceMatrix: () => null,
}));
jest.mock("../../../app/components/analytics/BundleConversionFunnel", () => ({
  BundleConversionFunnel: () => null,
}));
jest.mock("../../../app/components/analytics/BundleKeyStatistics", () => ({
  BundleKeyStatistics: () => null,
}));
jest.mock("../../../app/components/analytics/BundleSalesTrends", () => ({
  BundleSalesTrends: () => null,
}));
jest.mock("../../../app/components/analytics/TopCampaigns", () => ({
  TopCampaigns: () => null,
}));

describe("CustomUtmTrackingCard", () => {
  beforeEach(() => {
    mockFetcherState = "idle";
  });

  it("renders a Learn More modal with merchant setup guidance", async () => {
    const { CustomUtmTrackingCard } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    const view = renderToStaticMarkup(
      React.createElement(CustomUtmTrackingCard, {
        customUtmParameters: ["utm_influencer", "partner_id"],
      }),
    );

    expect(view).toContain("Learn More");
    expect(view).toContain("How custom attributes work");
    expect(view).toContain("Add parameter names one per line or separated by commas");
    expect(view).toContain("utm_influencer, partner_id");
    expect(view).toContain("Only Bundles saves up to 10 valid names");
    expect(view).toContain("Do not track shopper identifiers");
    expect(view).toContain("new visits after you save");
    expect(view).toContain('id="analytics-custom-utm-save-bar"');
    expect(view).toContain(">Save</button>");
    expect(view).toContain(">Discard</button>");
  });

  it("renders saved custom attributes as removable chips", async () => {
    const { CustomUtmTrackingCard } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    const view = renderToStaticMarkup(
      React.createElement(CustomUtmTrackingCard, {
        customUtmParameters: ["utm_influencer", "partner_id"],
      }),
    );

    expect(view).toContain("Currently tracking");
    expect(view).toContain("utm_influencer");
    expect(view).toContain("partner_id");
    expect(view).toContain("<s-clickable-chip");
    expect(view).toContain('accessibilityLabel="Remove utm_influencer"');
    expect(view).toContain('accessibilityLabel="Remove partner_id"');
    expect(view).toContain("removable");
  });

  it("disables contextual save actions while saving", async () => {
    mockFetcherState = "submitting";
    const { CustomUtmTrackingCard } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    const view = renderToStaticMarkup(
      React.createElement(CustomUtmTrackingCard, {
        customUtmParameters: ["utm_influencer"],
      }),
    );

    expect(view).toContain('<button type="button" variant="primary" disabled="" loading="true">Save</button>');
    expect(view).toContain('<button type="button" disabled="">Discard</button>');
  });

  it("removes a saved custom attribute from the submitted parameter list", async () => {
    const { removeCustomUtmParameter } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    expect(
      removeCustomUtmParameter(["utm_influencer", "partner_id", "creator"], "partner_id"),
    ).toEqual(["utm_influencer", "creator"]);
  });
});
