import React from "react";

import { DashboardActionModals } from "../../../app/routes/app/app.dashboard/DashboardActionModals";
import { BundleSubscriptionConfiguration } from "../../../app/routes/app/_shared/bundle-configure/BundleSubscriptionConfiguration";
import type { BundleSubscriptionConfigV1 } from "../../../app/lib/bundle-subscriptions";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function findElements(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement[] {
  const matches: React.ReactElement[] = [];

  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) matches.push(child);
    matches.push(...findElements(child.props.children, predicate));
  }

  return matches;
}

describe("Admin inline field validation", () => {
  it("gives the dashboard rename error to the text field without duplicating it in a banner", () => {
    const renameError = "Enter a bundle name.";
    const view = DashboardActionModals({
      appEmbedOpen: false,
      appEmbedPhase: "ready" as never,
      appEmbedModalRef: { current: null },
      onOpenThemeEditor: jest.fn(),
      onCloseAppEmbed: jest.fn(),
      onSupport: jest.fn(),
      renderDeleteModal: false,
      deleteModalRef: { current: null },
      isSubmitting: false,
      onConfirmDelete: jest.fn(),
      onCancelDelete: jest.fn(),
      renderRenameModal: true,
      renameModalRef: { current: null },
      isRenaming: false,
      renameError,
      bundleName: "",
      onBundleNameChange: jest.fn(),
      onConfirmRename: jest.fn(),
      onCloseRename: jest.fn(),
    });

    const [nameField] = findElements(
      view,
      (element) => element.type === "s-text-field",
    );
    const criticalBanners = findElements(
      view,
      (element) =>
        element.type === "s-banner" && element.props.tone === "critical",
    );

    expect(nameField.props.error).toBe(renameError);
    expect(criticalBanners).toHaveLength(0);
  });

  it("keeps subscription validation on the affected Polaris controls without a detached summary", () => {
    const plan = {
      id: "gid://shopify/SellingPlan/1",
      sourceName: "Monthly",
      position: 1,
      options: ["Monthly"],
      pricingPolicies: [],
    };
    const subscriptionConfig: BundleSubscriptionConfigV1 = {
      version: 1,
      enabled: true,
      selectedGroup: {
        id: "gid://shopify/SellingPlanGroup/1",
        name: "Subscribe",
        options: ["Delivery every"],
        plans: [plan],
      },
      selectedPlanIds: [plan.id],
      defaultPurchaseOption: { kind: "one_time" },
      oneTimePurchase: { enabled: true, title: "", description: "" },
      copy: { title: "Subscribe", subtitle: "", unavailableMessage: "" },
      planCopy: {},
      showDiscountOnProductCards: false,
      recurringBundleDiscount: false,
      bundleDiscountAppliesOn: "both",
      translations: {},
    };
    const titleError = "Enter a one-time purchase label.";
    const view = BundleSubscriptionConfiguration({
      subscriptionConfig,
      setSubscriptionConfig: jest.fn(),
      uniquePlanRows: [plan],
      validationErrors: {
        "subscriptions.oneTimePurchase.title": titleError,
      },
      shopLocales: [],
      onOpenTranslations: jest.fn(),
    });

    const fieldsWithError = findElements(
      view,
      (element) => element.props.error === titleError,
    );
    const detachedCriticalText = findElements(
      view,
      (element) =>
        element.type === "s-text" && element.props.tone === "critical",
    );

    expect(fieldsWithError).toHaveLength(1);
    expect(detachedCriticalText).toHaveLength(0);
  });

  it("does not render step resources validation error in the Step Name details card for FPB", () => {
    const { FpbStepSetupDetailsCard } = require("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupDetailsCard");
    const stepId = "step-1";
    const resourceError = "Add at least one product or collection.";
    const view = FpbStepSetupDetailsCard({
      styles: {},
      step: { id: stepId, name: "Step 1", enabled: true },
      isFirstStep: true,
      stepCount: 1,
      translationsDisabled: true,
      validationErrors: {
        [`steps.${stepId}.resources`]: resourceError,
      },
      onClearValidationError: jest.fn(),
      onClone: jest.fn(),
      onDelete: jest.fn(),
      onEnabledChange: jest.fn(),
      onNameChange: jest.fn(),
      onOpenTranslations: jest.fn(),
    });

    const criticalTexts = findElements(
      view,
      (element) =>
        element.type === "s-text" && element.props.tone === "critical",
    );
    expect(criticalTexts).toHaveLength(0);
  });

  it("does not render step resources validation error in the Step Name details card for PPB", () => {
    const { PpbStepSetupDetailsCard } = require("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupDetailsCard");
    const stepId = "step-1";
    const resourceError = "Add at least one product or collection.";
    const view = PpbStepSetupDetailsCard({
      clearValidationError: jest.fn(),
      cloneStep: jest.fn(),
      deleteStep: jest.fn(),
      isFirstStep: true,
      markAsDirty: jest.fn(),
      openStepMultiLanguageModal: jest.fn(),
      shopLocales: [],
      step: { id: stepId, name: "Step 1", enabled: true },
      stepsState: {
        steps: [{ id: stepId, name: "Step 1", enabled: true }],
        updateStepField: jest.fn(),
      } as any,
      validationErrors: {
        [`steps.${stepId}.resources`]: resourceError,
      },
    });

    const criticalTexts = findElements(
      view,
      (element) =>
        element.type === "s-text" && element.props.tone === "critical",
    );
    expect(criticalTexts).toHaveLength(0);
  });

  it("routes offerDelivery validation paths to offer_delivery section in useConfigureValidation", () => {
    const { sectionForPath } = require("../../../app/routes/app/_shared/bundle-configure/useConfigureValidation");
    expect(sectionForPath("offerDelivery.priority")).toBe("offer_delivery");
    expect(sectionForPath("offerDelivery.startsAt")).toBe("offer_delivery");
    expect(sectionForPath("offerDelivery.countryCodes")).toBe("offer_delivery");
  });

  it("renders step resources error inline in FPB StepCategoryCard with matching ID", () => {
    const { FpbStepCategoryCard } = require("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupCategoryCard");
    const stepId = "step-1";
    const resourceError = "Add at least one product or collection.";
    const view = FpbStepCategoryCard({
      adapter: {} as any,
      styles: {},
      step: { id: stepId, StepCategory: [] },
      validationErrors: {
        [`steps.${stepId}.resources`]: resourceError,
      },
      onAddCategory: jest.fn(),
      onDisplayVariantsChange: jest.fn(),
    });

    const errorElements = findElements(
      view,
      (el) =>
        el.type === "s-text" &&
        el.props.id === `configure-steps-${stepId}-resources` &&
        el.props.tone === "critical",
    );
    expect(errorElements).toHaveLength(1);
    expect(errorElements[0].props.children).toBe(resourceError);
  });

  it("renders step resources error inline in PPB StepCategoriesCard with matching ID", () => {
    const { PpbStepCategoriesCard } = require("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard");
    const stepId = "step-1";
    const resourceError = "Add at least one product or collection.";
    const view = PpbStepCategoriesCard({
      categoryAdapter: {} as any,
      markAsDirty: jest.fn(),
      step: { id: stepId, StepCategory: [] },
      stepsState: {
        steps: [{ id: stepId, StepCategory: [] }],
        updateStepField: jest.fn(),
      } as any,
      validationErrors: {
        [`steps.${stepId}.resources`]: resourceError,
      },
    });

    const errorElements = findElements(
      view,
      (el) =>
        el.type === "s-text" &&
        el.props.id === `configure-steps-${stepId}-resources` &&
        el.props.tone === "critical",
    );
    expect(errorElements).toHaveLength(1);
    expect(errorElements[0].props.children).toBe(resourceError);
  });

  it("renders discount rules error inline in FPB and PPB discount pricing sections", () => {
    const { FpbDiscountRulesSection } = require("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules");
    const { PpbDiscountRulesPanel } = require("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel");
    const discountRulesError = "Add at least one discount rule.";

    const fpbPricingState = {
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [],
      addDiscountRule: jest.fn(),
      setDiscountEnabled: jest.fn(),
      updateDiscountRule: jest.fn(),
      currencySymbol: "$",
    } as any;

    const fpbView = FpbDiscountRulesSection({
      pricingState: fpbPricingState,
      styles: {},
      validationErrors: { "discount.rules": discountRulesError },
      onDiscountMethodChange: jest.fn(),
    });

    const fpbErrors = findElements(
      fpbView,
      (el) =>
        el.type === "s-text" &&
        el.props.id === "configure-discount-rules" &&
        el.props.tone === "critical",
    );
    expect(fpbErrors).toHaveLength(1);
    expect(fpbErrors[0].props.children).toBe(discountRulesError);

    const ppbPricingState = {
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [],
      addDiscountRule: jest.fn(),
      setDiscountEnabled: jest.fn(),
      replaceDiscountMethod: jest.fn(),
    } as any;

    const ppbView = PpbDiscountRulesPanel({
      pricingState: ppbPricingState,
      setGlobalSuccessMessage: jest.fn(),
      setRuleMessages: jest.fn(),
      setRuleMessagesByLocale: jest.fn(),
      setSuccessMessageByLocale: jest.fn(),
      validationErrors: { "discount.rules": discountRulesError },
    });

    const ppbErrors = findElements(
      ppbView,
      (el) =>
        el.type === "s-text" &&
        el.props.id === "configure-discount-rules" &&
        el.props.tone === "critical",
    );
    expect(ppbErrors).toHaveLength(1);
    expect(ppbErrors[0].props.children).toBe(discountRulesError);
  });

  it("binds error and id directly to fields in FreeGiftAddon cards", () => {
    const { FpbAddonProductsCard } = require("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonProductsCard");
    const { FpbAddonReferenceStepCard } = require("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonReferenceStepCard");

    const productsTitleError = "Enter an add-on section title.";
    const stepNameError = "Enter a step name.";

    const productsView = FpbAddonProductsCard({
      enabled: true,
      title: "",
      translationsAvailable: false,
      styles: {},
      tierEditor: {} as any,
      validationErrors: {
        "addons.products.title": productsTitleError,
      },
      onEnabledChange: jest.fn(),
      onOpenTranslations: jest.fn(),
      onTitleChange: jest.fn(),
    });

    const [productsTitleField] = findElements(
      productsView,
      (el) =>
        el.type === "s-text-field" &&
        el.props.id === "configure-addons-products-title",
    );
    expect(productsTitleField).toBeDefined();
    expect(productsTitleField.props.error).toBe(productsTitleError);

    const referenceView = FpbAddonReferenceStepCard({
      enabled: true,
      imageUrl: null,
      showImagePicker: false,
      stepName: "",
      stepTitle: "",
      styles: {},
      translationsAvailable: false,
      validationErrors: {
        "addons.gifting.stepName": stepNameError,
      },
      onEnabledChange: jest.fn(),
      onImageChange: jest.fn(),
      onImagePickerOpenChange: jest.fn(),
      onOpenTranslations: jest.fn(),
      onStepNameChange: jest.fn(),
      onStepTitleChange: jest.fn(),
    });

    const [stepNameField] = findElements(
      referenceView,
      (el) =>
        el.type === "s-text-field" &&
        el.props.id === "configure-addons-gifting-stepName",
    );
    expect(stepNameField).toBeDefined();
    expect(stepNameField.props.error).toBe(stepNameError);
  });

  it("binds error and id directly to fields in OfferOperationsSection", () => {
    const { OfferOperationsSection } = require("../../../app/routes/app/shared/OfferOperationsSection");
    const priorityError = "Enter a valid priority.";
    const startsAtError = "Enter a valid start date.";

    const view = OfferOperationsSection({
      active: true,
      state: {
        priority: 1,
        stopLowerPriority: false,
        scheduleMode: "one_time",
        startsAt: "",
        endsAt: null,
      } as any,
      validationErrors: {
        "offerDelivery.priority": priorityError,
        "offerDelivery.startsAt": startsAtError,
      },
      onPriorityChange: jest.fn(),
      onStopLowerPriorityChange: jest.fn(),
      onScheduleModeChange: jest.fn(),
      onStartsAtChange: jest.fn(),
      onEndsAtChange: jest.fn(),
      onRecurrenceFrequencyChange: jest.fn(),
      onRecurrenceAnchorDateChange: jest.fn(),
      onRecurrenceWindowStartChange: jest.fn(),
      onRecurrenceWindowEndChange: jest.fn(),
      onRecurrenceTerminationChange: jest.fn(),
      onRecurrenceEndsOnChange: jest.fn(),
      onRecurrenceRunCountChange: jest.fn(),
    });

    const [priorityField] = findElements(
      view,
      (el) =>
        el.type === "s-number-field" &&
        el.props.id === "configure-offerDelivery-priority",
    );
    expect(priorityField).toBeDefined();
    expect(priorityField.props.error).toBe(priorityError);

    const [startsAtField] = findElements(
      view,
      (el) =>
        el.type === "s-text-field" &&
        el.props.id === "configure-offerDelivery-startsAt",
    );
    expect(startsAtField).toBeDefined();
    expect(startsAtField.props.error).toBe(startsAtError);
  });
});
