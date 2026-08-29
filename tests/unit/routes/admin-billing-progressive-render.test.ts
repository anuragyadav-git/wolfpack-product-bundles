import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const pendingSubscription = new Promise(() => {});

jest.mock("@remix-run/react", () => ({
  Await: () => React.createElement("span", null, "Await boundary"),
  useFetcher: jest.fn(() => ({
    data: undefined,
    state: "idle",
    submit: jest.fn(),
  })),
  useLoaderData: jest.fn(() => ({ subscription: pendingSubscription })),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "billing.route.title") return "Billing";
      if (key === "billing.route.dashboard") return "Dashboard";
      if (key === "billing.actions.back") return "Back";
      if (key === "common.loading.workspace") return "Loading workspace";
      return key;
    },
  }),
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/db.server", () => ({
  bundle: { count: jest.fn() },
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn(),
}));

describe("Admin Billing progressive render", () => {
  it("renders the visible Billing heading while subscription data is pending", async () => {
    const { default: PricingPage } = await import(
      "../../../app/routes/app/app.pricing"
    );

    const view = renderToStaticMarkup(React.createElement(PricingPage));

    expect(view).toContain("<s-heading>Billing</s-heading>");
    expect(view).toContain("Await boundary");
  });
});
