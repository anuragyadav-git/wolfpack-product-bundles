import { usePpbConfigureFlow } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbConfigureFlow";
import { usePpbBaseConfigureState } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbBaseConfigureState";
import { usePpbSaveHandlers } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbSaveHandlers";
import { usePpbFetcherEffects } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbFetcherEffects";
import { usePpbPreviewReadinessHandlers } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPreviewReadinessHandlers";
import { usePpbPlacementHandlers } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPlacementHandlers";
import { usePpbModalAndTemplateController } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbModalAndTemplateController";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useCallback: (callback: unknown) => callback,
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbBaseConfigureState",
  () => ({ usePpbBaseConfigureState: jest.fn() }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbVisibilityState",
  () => ({ usePpbVisibilityState: jest.fn(() => ({ visibilityOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbDisplayOptionsState",
  () => ({ usePpbDisplayOptionsState: jest.fn(() => ({ displayOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbBundleSettingsState",
  () => ({ usePpbBundleSettingsState: jest.fn(() => ({ settingsOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbTemplateUiState",
  () => ({ usePpbTemplateUiState: jest.fn(() => ({ templateOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbMultiLanguageHandlers",
  () => ({ usePpbMultiLanguageHandlers: jest.fn(() => ({ languageOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbCategoryHandlers",
  () => ({ usePpbCategoryHandlers: jest.fn(() => ({ categoryOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbSaveHandlers",
  () => ({ usePpbSaveHandlers: jest.fn(() => ({ saveOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbFetcherEffects",
  () => ({ usePpbFetcherEffects: jest.fn() }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPreviewReadinessHandlers",
  () => ({ usePpbPreviewReadinessHandlers: jest.fn(() => ({ previewOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPlacementHandlers",
  () => ({ usePpbPlacementHandlers: jest.fn(() => ({ placementOnly: true })) }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbModalAndTemplateController",
  () => ({ usePpbModalAndTemplateController: jest.fn(() => ({ modalOnly: true })) }),
);
jest.mock("../../../app/hooks/useSharedBundleHandlers", () => ({
  useSharedBundleHandlers: jest.fn(() => ({ sharedOnly: true })),
}));

const ownerSentinels = {
  baseOnly: true,
  visibilityOnly: true,
  displayOnly: true,
  settingsOnly: true,
  templateOnly: true,
  categoryOnly: true,
  saveOnly: true,
  sharedOnly: true,
  previewOnly: true,
  placementOnly: true,
};

describe("usePpbConfigureFlow composition", () => {
  it("projects explicit dependencies and merges feature owners only at the route boundary", () => {
    jest.mocked(usePpbBaseConfigureState).mockReturnValue({
      ...ownerSentinels,
      bundle: { id: "bundle-1" },
      shopLocales: [],
      pricingState: {},
      markAsDirty: jest.fn(),
      stepsState: { steps: [] },
      textOverridesByLocale: {},
      setTextOverridesByLocale: jest.fn(),
      ruleMessages: {},
      formState: {},
      selectedCollections: {},
      setSelectedCollections: jest.fn(),
      setRuleMessages: jest.fn(),
      setBundleProduct: jest.fn(),
      setProductTitle: jest.fn(),
      setProductImageUrl: jest.fn(),
      clearOperationAlert: jest.fn(),
      shopify: {},
      fetcher: {},
      openThemeEditorForAppEmbed: jest.fn(),
    } as never);

    const result = usePpbConfigureFlow();

    for (const hook of [
      usePpbSaveHandlers,
      usePpbFetcherEffects,
      usePpbPreviewReadinessHandlers,
      usePpbPlacementHandlers,
      usePpbModalAndTemplateController,
    ]) {
      const dependencies = jest.mocked(hook).mock.calls[0]?.[0] ?? {};
      for (const dependency of Object.values(dependencies)) {
        if (!dependency || typeof dependency !== "object") continue;
        expect(dependency).toEqual(expect.not.objectContaining(ownerSentinels));
      }
    }
    expect(result).toEqual(expect.objectContaining(ownerSentinels));
  });
});
