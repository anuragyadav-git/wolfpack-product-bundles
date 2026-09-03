import React from "react";
import { flushSync } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import "../../../app/i18n/config";
import { SubscriptionQuotaCard } from "../../../app/components/billing/SubscriptionQuotaCard";

describe("SubscriptionQuotaCard", () => {
  it("renders the localized Free usage message", () => {
    const view = renderToStaticMarkup(React.createElement(SubscriptionQuotaCard, {
      currentBundleCount: 0,
      bundleLimit: 1,
      isFreePlan: true,
    }));

    expect(view).toContain(
      "You&#x27;re using 0 of 1 public bundles on Free. Growth includes unlimited public bundles.",
    );
    expect(view).not.toContain("billing.upgradePrompt.usageBody");
  });

  it("renders Unlimited instead of the internal Growth limit sentinel", () => {
    const view = renderToStaticMarkup(React.createElement(SubscriptionQuotaCard, {
      currentBundleCount: 42,
      bundleLimit: Number.MAX_SAFE_INTEGER,
      isFreePlan: false,
    }));

    expect(view).toContain("Unlimited");
    expect(view).not.toContain(String(Number.MAX_SAFE_INTEGER));
  });

  it("removes the Free usage prompt when the merchant activates Dismiss", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    const container = document.createElement("div");
    const root = createRoot(container);

    flushSync(() => {
      root.render(React.createElement(SubscriptionQuotaCard, {
        currentBundleCount: 1,
        bundleLimit: 1,
        isFreePlan: true,
      }));
    });

    const banner = container.querySelector("s-banner");
    expect(banner).not.toBeNull();
    const dismissButton = banner?.querySelector("s-button");
    expect(dismissButton?.textContent).toBe("Dismiss");

    flushSync(() => {
      dismissButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector("s-banner")).toBeNull();

    flushSync(() => root.unmount());
  });
});
