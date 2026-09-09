import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleStatus } from "../../../app/constants/bundle";
import { DiscountMethod } from "../../../app/types/pricing";
import {
  PpbCanvasHeader,
  type PpbCanvasHeaderProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader";
import {
  PpbConfigureSidebar,
  PpbConfigureSupplement,
  type PpbConfigureSidebarProps,
  type PpbConfigureSupplementProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureSidebar";
import {
  PpbSaveForm,
  type PpbSaveFormProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("PPB configure shell boundaries", () => {
  it("renders header actions from explicit route-owned inputs", () => {
    const onBack = jest.fn();
    const onPreview = jest.fn().mockResolvedValue(undefined);
    const props = {
      appEmbedEnabled: true,
      bundle: { shopifyProductId: undefined },
      fetcher: { state: "idle" },
      handleBackClick: onBack,
      handlePreviewBundle: onPreview,
      isPreviewBundleLoading: false,
      loadedBundleProduct: null,
      openThemeEditorForAppEmbed: jest.fn(),
      openProductInAdmin: jest.fn(),
      operationAlert: null,
      parentProductStatusUi: { isLoading: false, showUnlistedBanner: false },
      readinessScore: 80,
      shop: "test.myshopify.com",
      themeEditorUrl: "",
    } satisfies PpbCanvasHeaderProps;

    const view = renderToStaticMarkup(
      React.createElement(PpbCanvasHeader, props),
    );

    expect(view).toContain("Preview Bundle");
    expect(view).toContain("80");
    expect(view).toContain('commandFor="bundle-readiness-popover"');
    expect(view).toContain('command="--show"');
  });

  it("serializes the existing save payload from explicit feature state", () => {
    const props = {
      bundleProduct: null,
      conditionsState: { stepConditions: {} },
      discountMessagingMultiLanguageEnabled: false,
      fetcher: { state: "idle" },
      formState: {
        bundleName: "PPB Shell",
        bundleDescription: "Description",
        templateName: "GRID",
        bundleStatus: BundleStatus.ACTIVE,
      },
      handleSave: jest.fn().mockResolvedValue(undefined),
      isDirty: true,
      pricingState: {
        discountEnabled: true,
        discountType: DiscountMethod.PERCENTAGE_OFF,
        discountRules: [],
        showFooter: true,
        discountMessagingEnabled: false,
      },
      progressBarEnabled: false,
      progressBarProgressText: "",
      progressBarSuccessText: "",
      progressBarType: "simple",
      qtyOptionsDefaultRuleId: null,
      qtyOptionsEnabled: false,
      qtyRuleLabels: {},
      qtyRuleSubtexts: {},
      qtyRuleTextsByLocaleByRuleId: {},
      ruleMessages: {},
      ruleMessagesByLocale: {},
      saveBarRef: { current: null } as PpbSaveFormProps["saveBarRef"],
      setShowDiscardModal: jest.fn(),
      stepsState: { steps: [] },
      tierTextByLocaleByRuleId: {},
      tierTextByRuleId: {},
    } satisfies PpbSaveFormProps;

    const view = renderToStaticMarkup(React.createElement(PpbSaveForm, props));

    expect(view).toContain('name="bundleName" value="PPB Shell"');
    expect(view).toContain('name="bundleStatus" value="active"');
    expect(view).toContain('name="stepsData" value="[]"');
  });

  it("forwards only sidebar-owned data and actions", () => {
    const handleSectionChange = jest.fn();
    const props = {
      activeSection: "step_setup",
      appEmbedEnabled: true,
      bundle: {} as unknown as PpbConfigureSidebarProps["bundle"],
      bundleProduct: null,
      formState: {} as unknown as PpbConfigureSidebarProps["formState"],
      handleBundleProductSelect: jest.fn(),
      handleSectionChange,
      handleSyncProduct: jest.fn(),
      openProductInAdmin: jest.fn(),
      openSelectTemplateModal: jest.fn(),
      parentProductStatusUi: {} as unknown as PpbConfigureSidebarProps["parentProductStatusUi"],
      pricingState: {} as unknown as PpbConfigureSidebarProps["pricingState"],
      productImageUrl: "",
      productTitle: "Bundle",
      selectTemplateOpenButtonRef: {
        current: null,
      } as PpbConfigureSidebarProps["selectTemplateOpenButtonRef"],
    } satisfies PpbConfigureSidebarProps;

    const element = PpbConfigureSidebar(props);

    expect(element.props.adapter.handleSectionChange).toBe(handleSectionChange);
    expect(element.props.adapter.activeSection).toBe("step_setup");
  });

  it("builds the live supplement from placement-owned inputs", () => {
    const handlePlaceWidget = jest.fn();
    const props = {
      handlePlaceWidget,
      isPreparingPlacementTemplates: false,
    } satisfies PpbConfigureSupplementProps;

    const element = PpbConfigureSupplement(props);

    expect(element.props.liveCard.onAction).toBe(handlePlaceWidget);
  });
});
