import { useConfigureBundleFlow } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleFlow";
import { useConfigureBundleController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController";
import { useConfigureAddonState } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureAddonState";
import { useConfigureContentState } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureContentState";
import { useConfigureSubscriptionState } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSubscriptionState";
import { useConfigureActionController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureActionController";
import { useConfigureSaveController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSaveController";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController",
  () => ({ useConfigureBundleController: jest.fn() })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureAddonState",
  () => ({ useConfigureAddonState: jest.fn() })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureContentState",
  () => ({ useConfigureContentState: jest.fn() })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSubscriptionState",
  () => ({ useConfigureSubscriptionState: jest.fn() })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureLocalizationState",
  () => ({
    useConfigureLocalizationState: jest.fn(() => ({ localization: true })),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureVisibilityTemplateState",
  () => ({
    useConfigureVisibilityTemplateState: jest.fn(() => ({ visibility: true })),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureTemplatePricingController",
  () => ({
    useConfigureTemplatePricingController: jest.fn(() => ({
      templatePricing: true,
    })),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureModalController",
  () => ({ useConfigureModalController: jest.fn(() => ({ modals: true })) })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureActionController",
  () => ({
    useConfigureActionController: jest.fn(() => ({
      actions: true,
      finishPreviewBundleLoading: "finish-preview",
    })),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSaveController",
  () => ({ useConfigureSaveController: jest.fn(() => ({ save: true })) })
);

describe("useConfigureBundleFlow composition", () => {
  it("passes narrow state dependencies and merges feature ownership at the route boundary", () => {
    const bundle = { id: "bundle-1" };
    const markAsDirty = jest.fn();
    jest.mocked(useConfigureBundleController).mockReturnValue({
      bundle,
      markAsDirty,
      shop: "store.myshopify.com",
      storefrontProxyRoot: "/apps/product-bundles",
      baseOnly: true,
    } as never);
    jest
      .mocked(useConfigureAddonState)
      .mockReturnValue({ addon: true } as never);
    jest
      .mocked(useConfigureContentState)
      .mockReturnValue({ content: true } as never);
    jest
      .mocked(useConfigureSubscriptionState)
      .mockReturnValue({ subscriptions: true } as never);

    const result = useConfigureBundleFlow();

    expect(useConfigureAddonState).toHaveBeenCalledWith({
      bundle,
      markAsDirty,
    });
    expect(useConfigureContentState).toHaveBeenCalledWith({
      bundle,
      shop: "store.myshopify.com",
      storefrontProxyRoot: "/apps/product-bundles",
    });
    expect(useConfigureSubscriptionState).toHaveBeenCalledWith({
      bundle,
      markAsDirty,
    });
    expect(useConfigureActionController).toHaveBeenCalledWith(
      expect.not.objectContaining({
        addon: true,
        baseOnly: true,
        content: true,
        localization: true,
        modals: true,
        subscriptions: true,
        templatePricing: true,
        visibility: true,
      })
    );
    expect(useConfigureSaveController).toHaveBeenCalledWith(
      expect.objectContaining({
        finishPreviewBundleLoading: "finish-preview",
      })
    );
    expect(useConfigureSaveController).toHaveBeenCalledWith(
      expect.not.objectContaining({
        actions: true,
        addon: true,
        baseOnly: true,
        content: true,
        localization: true,
        modals: true,
        subscriptions: true,
        templatePricing: true,
        visibility: true,
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        actions: true,
        addon: true,
        baseOnly: true,
        content: true,
        localization: true,
        modals: true,
        save: true,
        subscriptions: true,
        templatePricing: true,
        visibility: true,
      })
    );
  });
});
