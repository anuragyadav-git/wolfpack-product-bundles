import { fullPageAnalyticsConfigMethods } from "../../../app/assets/widgets/full-page/methods/analytics-config-methods.js";

describe("FPB post-add controls", () => {
  it("runs the saved landing-page script once before the redirect lifecycle", async () => {
    const context = {
      _runControlsScript: jest.fn(),
      _emitStorefrontEvent: jest.fn(),
      _isCheckoutIntegrationProvider: jest.fn(() => true),
      _handleCheckoutIntegrationProvider: jest.fn(async () => undefined),
    };

    await fullPageAnalyticsConfigMethods._handlePostAddToCartAction.call(context, {
      action: "checkout",
      providerId: "theme_cart_drawer",
      executeScript: "window.__fpbPostAddRuns = (window.__fpbPostAddRuns || 0) + 1;",
    });

    expect(context._runControlsScript).toHaveBeenCalledTimes(1);
    expect(context._runControlsScript).toHaveBeenCalledWith(
      "window.__fpbPostAddRuns = (window.__fpbPostAddRuns || 0) + 1;",
    );
    expect(context._handleCheckoutIntegrationProvider).toHaveBeenCalledTimes(1);
    expect(context._runControlsScript.mock.invocationCallOrder[0]).toBeLessThan(
      context._handleCheckoutIntegrationProvider.mock.invocationCallOrder[0],
    );
  });
});
