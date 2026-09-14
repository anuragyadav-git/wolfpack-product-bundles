import { useConfigureActionController } from "./useConfigureActionController";
import { useConfigureAddonState } from "./useConfigureAddonState";
import { useConfigureBundleController } from "./useConfigureBundleController";
import { useConfigureContentState } from "./useConfigureContentState";
import { useConfigureLocalizationState } from "./useConfigureLocalizationState";
import { useConfigureModalController } from "./useConfigureModalController";
import { useConfigureSaveController } from "./useConfigureSaveController";
import { useConfigureTemplatePricingController } from "./useConfigureTemplatePricingController";
import { useConfigureVisibilityTemplateState } from "./useConfigureVisibilityTemplateState";
import { useConfigureSubscriptionState } from "./useConfigureSubscriptionState";

export function useConfigureBundleFlow() {
  const controller = useConfigureBundleController();
  const addons = useConfigureAddonState({
    bundle: controller.bundle,
    markAsDirty: controller.markAsDirty,
  });
  const content = useConfigureContentState({
    bundle: controller.bundle,
    shop: controller.shop,
    storefrontProxyRoot: controller.storefrontProxyRoot,
  });
  const subscriptions = useConfigureSubscriptionState({
    bundle: controller.bundle,
    markAsDirty: controller.markAsDirty,
  });
  const localization = useConfigureLocalizationState({
    addonDraft: addons.addonDraft,
    bundle: controller.bundle,
    markAsDirty: controller.markAsDirty,
    pricingState: controller.pricingState,
    ruleMessages: controller.ruleMessages,
    setTextOverridesByLocale: content.setTextOverridesByLocale,
    setTextOverridesLocale: content.setTextOverridesLocale,
    shopLocales: controller.shopLocales,
    stepsState: controller.stepsState,
    textOverridesByLocale: content.textOverridesByLocale,
    updateAddonDraft: addons.updateAddonDraft,
  });
  const visibility = useConfigureVisibilityTemplateState({
    appEmbedEnabled: controller.appEmbedEnabled,
    bundle: controller.bundle,
    markAsDirty: controller.markAsDirty,
    stepsState: controller.stepsState,
    textOverrides: content.textOverrides,
  });
  const templatePricing = useConfigureTemplatePricingController({
    appEmbedEnabled: controller.appEmbedEnabled,
    autoSelectBrowsedProduct: visibility.autoSelectBrowsedProduct,
    bundle: controller.bundle,
    bundleDesignPresetId: visibility.bundleDesignPresetId,
    bundleDesignTemplate: visibility.bundleDesignTemplate,
    conditionsState: controller.conditionsState,
    formState: controller.formState,
    hasPreview: visibility.hasPreview,
    lastTemplateRequestRef: visibility.lastTemplateRequestRef,
    lastTemplateResponseRef: visibility.lastTemplateResponseRef,
    loadedBundleProduct: controller.loadedBundleProduct,
    navigate: controller.navigate,
    pendingDesignPresetId: visibility.pendingDesignPresetId,
    pendingDesignTemplate: visibility.pendingDesignTemplate,
    pricingState: controller.pricingState,
    productStatus: controller.productStatus,
    ruleMessages: controller.ruleMessages,
    savedBundleUpsellConfig: visibility.savedBundleUpsellConfig,
    selectTemplateOpenButtonRef: visibility.selectTemplateOpenButtonRef,
    setBundleDesignPresetId: visibility.setBundleDesignPresetId,
    setBundleDesignTemplate: visibility.setBundleDesignTemplate,
    setIsSelectTemplateModalOpen: visibility.setIsSelectTemplateModalOpen,
    setPendingDesignPresetId: visibility.setPendingDesignPresetId,
    setPendingDesignTemplate: visibility.setPendingDesignTemplate,
    setTemplateModalStep: visibility.setTemplateModalStep,
    setTemplateSaveError: visibility.setTemplateSaveError,
    setEntitlementFailure: controller.setEntitlementFailure,
    isFreePlan: controller.isFreePlan,
    stepsState: controller.stepsState,
    templateFetcher: visibility.templateFetcher,
    templateSubmissionStartedRef: visibility.templateSubmissionStartedRef,
    textOverridesByLocale: content.textOverridesByLocale,
    upsellWidgetButtonText: visibility.upsellWidgetButtonText,
    upsellWidgetCollectionsSelectedData:
      visibility.upsellWidgetCollectionsSelectedData,
    upsellWidgetDescription: visibility.upsellWidgetDescription,
    upsellWidgetDisplayOn: visibility.upsellWidgetDisplayOn,
    upsellWidgetEnabled: visibility.upsellWidgetEnabled,
    upsellWidgetImageUrl: visibility.upsellWidgetImageUrl,
    upsellWidgetLanguageMode: visibility.upsellWidgetLanguageMode,
    upsellWidgetSelectedProducts: visibility.upsellWidgetSelectedProducts,
    upsellWidgetSpecificCollectionPages:
      visibility.upsellWidgetSpecificCollectionPages,
    upsellWidgetSpecificProductPages:
      visibility.upsellWidgetSpecificProductPages,
    upsellWidgetTitle: visibility.upsellWidgetTitle,
  });
  const modals = useConfigureModalController({
    closeCollectionsModal: controller.closeCollectionsModal,
    closeProductsModal: controller.closeProductsModal,
    isAddonSelectedProductsModalOpen: addons.isAddonSelectedProductsModalOpen,
    isCollectionsModalOpen: controller.isCollectionsModalOpen,
    isProductsModalOpen: controller.isProductsModalOpen,
    isSyncModalOpen: visibility.isSyncModalOpen,
    setAddonSelectedProductsTierIndex: addons.setAddonSelectedProductsTierIndex,
    setCurrentModalStepId: controller.setCurrentModalStepId,
    setIsAddonSelectedProductsModalOpen:
      addons.setIsAddonSelectedProductsModalOpen,
    setIsSyncModalOpen: visibility.setIsSyncModalOpen,
  });
  const actions = useConfigureActionController({
    activeSection: controller.activeSection,
    activeTabIndex: controller.activeTabIndex,
    addonDraft: addons.addonDraft,
    addonSelectedProductsModalRef: modals.addonSelectedProductsModalRef,
    apiKey: controller.apiKey,
    appEmbedEnabled: controller.appEmbedEnabled,
    bundle: controller.bundle,
    bundleProduct: controller.bundleProduct,
    checkAppEmbedStatusBeforePreview:
      controller.checkAppEmbedStatusBeforePreview,
    clearOperationAlert: controller.clearOperationAlert,
    closeSelectTemplateModal: templatePricing.closeSelectTemplateModal,
    fetcher: controller.fetcher,
    forceNavigation: controller.forceNavigation,
    formState: controller.formState,
    isDirty: controller.isDirty,
    markAsDirty: controller.markAsDirty,
    navigate: controller.navigate,
    openThemeEditorForAppEmbed: controller.openThemeEditorForAppEmbed,
    refreshParentProductStatusFromShopify:
      controller.refreshParentProductStatusFromShopify,
    selectedCollections: controller.selectedCollections,
    setActiveSection: controller.setActiveSection,
    setActiveTabIndex: controller.setActiveTabIndex,
    setAddonSelectedProductsTierIndex:
      addons.setAddonSelectedProductsTierIndex,
    setBundleProduct: controller.setBundleProduct,
    setHasPreview: visibility.setHasPreview,
    setIsAddonSelectedProductsModalOpen:
      addons.setIsAddonSelectedProductsModalOpen,
    setIsDisableAddonStepModalOpen: modals.setIsDisableAddonStepModalOpen,
    setIsSyncModalOpen: visibility.setIsSyncModalOpen,
    setOperationAlert: controller.setOperationAlert,
    setProductImageUrl: controller.setProductImageUrl,
    setProductTitle: controller.setProductTitle,
    setReadinessOpen: visibility.setReadinessOpen,
    setRuleMessages: controller.setRuleMessages,
    setSelectedCollections: controller.setSelectedCollections,
    setShowIconPickerForStep: visibility.setShowIconPickerForStep,
    setSlideDir: visibility.setSlideDir,
    setSlideKey: visibility.setSlideKey,
    setUpsellWidgetCollectionsSelectedData:
      visibility.setUpsellWidgetCollectionsSelectedData,
    setUpsellWidgetSelectedProducts:
      visibility.setUpsellWidgetSelectedProducts,
    setUpsellWidgetSpecificCollectionPages:
      visibility.setUpsellWidgetSpecificCollectionPages,
    setUpsellWidgetSpecificProductPages:
      visibility.setUpsellWidgetSpecificProductPages,
    shop: controller.shop,
    shopify: controller.shopify,
    stepsState: controller.stepsState,
    storefrontProxyRoot: controller.storefrontProxyRoot,
    themeEditorUrl: controller.themeEditorUrl,
    triggerAppEmbedBannerFeedback: controller.triggerAppEmbedBannerFeedback,
    triggerSaveBarIrritation: controller.triggerSaveBarIrritation,
    updateAddonDraft: addons.updateAddonDraft,
    upsellWidgetCollectionsSelectedData:
      visibility.upsellWidgetCollectionsSelectedData,
    upsellWidgetSelectedProducts: visibility.upsellWidgetSelectedProducts,
  });

  const save = useConfigureSaveController({
    addonDraft: addons.addonDraft,
    allowQuantityChanges: content.allowQuantityChanges,
    autoSelectBrowsedProduct: visibility.autoSelectBrowsedProduct,
    buildBundleUpsellConfig: templatePricing.buildBundleUpsellConfig,
    buildPersonalizationDataFromDraft:
      addons.buildPersonalizationDataFromDraft,
    bundle: controller.bundle,
    bundleBannerDesktopUrl: visibility.bundleBannerDesktopUrl,
    bundleBannerMobileUrl: visibility.bundleBannerMobileUrl,
    bundleLevelCss: visibility.bundleLevelCss,
    bundleProduct: controller.bundleProduct,
    cartRedirectToCheckout: content.cartRedirectToCheckout,
    clearEntitlementFailure: controller.clearEntitlementFailure,
    entitlementFailure: controller.entitlementFailure,
    clearOperationAlert: controller.clearOperationAlert,
    conditionsState: controller.conditionsState,
    countdownEnabled: content.countdownEnabled,
    countdownExpiredMessage: content.countdownExpiredMessage,
    countdownExpiryAction: content.countdownExpiryAction,
    countdownLayout: content.countdownLayout,
    countdownPosition: content.countdownPosition,
    countdownTitle: content.countdownTitle,
    defaultProductsData: content.defaultProductsData,
    discardSpecificLinkOfferChanges:
      controller.discardSpecificLinkOfferChanges,
    discountMessagingMultiLanguageEnabled:
      localization.discountMessagingMultiLanguageEnabled,
    fetcher: controller.fetcher,
    finishPreviewBundleLoading: actions.finishPreviewBundleLoading,
    floatingBadgeEnabled: content.floatingBadgeEnabled,
    floatingBadgeText: content.floatingBadgeText,
    formState: controller.formState,
    globalSuccessMessage: localization.globalSuccessMessage,
    hookHandleDiscard: controller.hookHandleDiscard,
    lastProcessedFetcherDataRef: controller.lastProcessedFetcherDataRef,
    loadingGif: content.loadingGif,
    lowStockAlertEnabled: content.lowStockAlertEnabled,
    lowStockAlertMessage: content.lowStockAlertMessage,
    lowStockAlertThreshold: content.lowStockAlertThreshold,
    markSpecificLinkOfferSaved: controller.markSpecificLinkOfferSaved,
    maxQtyPerProduct: content.maxQtyPerProduct,
    normalizeDefaultProductsData: content.normalizeDefaultProductsData,
    normalizedPricingDisplayOptions:
      templatePricing.normalizedPricingDisplayOptions,
    normalizedRuleMessages: templatePricing.normalizedRuleMessages,
    offerDeliveryState: controller.offerDeliveryState,
    originalAddonDraftRef: addons.originalAddonDraftRef,
    originalAllowQuantityChangesRef:
      content.originalAllowQuantityChangesRef,
    originalAutoSelectBrowsedProductRef:
      visibility.originalAutoSelectBrowsedProductRef,
    originalCartRedirectToCheckoutRef:
      content.originalCartRedirectToCheckoutRef,
    originalCountdownEnabledRef: content.originalCountdownEnabledRef,
    originalCountdownExpiredMessageRef:
      content.originalCountdownExpiredMessageRef,
    originalCountdownExpiryActionRef:
      content.originalCountdownExpiryActionRef,
    originalCountdownLayoutRef: content.originalCountdownLayoutRef,
    originalCountdownPositionRef: content.originalCountdownPositionRef,
    originalCountdownTitleRef: content.originalCountdownTitleRef,
    originalDiscountMessagingMultiLanguageEnabledRef:
      localization.originalDiscountMessagingMultiLanguageEnabledRef,
    originalFloatingBadgeEnabledRef:
      content.originalFloatingBadgeEnabledRef,
    originalFloatingBadgeTextRef: content.originalFloatingBadgeTextRef,
    originalLoadingGifRef: content.originalLoadingGifRef,
    originalLowStockAlertEnabledRef:
      content.originalLowStockAlertEnabledRef,
    originalLowStockAlertMessageRef: content.originalLowStockAlertMessageRef,
    originalLowStockAlertThresholdRef:
      content.originalLowStockAlertThresholdRef,
    originalPromoBannerBgImageRef: content.originalPromoBannerBgImageRef,
    originalRuleMessagesByLocaleRef:
      localization.originalRuleMessagesByLocaleRef,
    originalSearchBarEnabledRef: visibility.originalSearchBarEnabledRef,
    originalShowProductPricesRef: content.originalShowProductPricesRef,
    originalShowStepTimelineRef: content.originalShowStepTimelineRef,
    originalSubscriptionConfigRef:
      subscriptions.originalSubscriptionConfigRef,
    originalTextOverridesByLocaleRef:
      content.originalTextOverridesByLocaleRef,
    originalTextOverridesRef: content.originalTextOverridesRef,
    originalUpsellWidgetButtonTextRef:
      visibility.originalUpsellWidgetButtonTextRef,
    originalUpsellWidgetDisplayModeRef:
      visibility.originalUpsellWidgetDisplayModeRef,
    originalUpsellWidgetDisplayOnRef:
      visibility.originalUpsellWidgetDisplayOnRef,
    originalUpsellWidgetEnabledRef:
      visibility.originalUpsellWidgetEnabledRef,
    originalValuesRef: controller.originalValuesRef,
    pricingState: controller.pricingState,
    productSlotIconUrl: content.productSlotIconUrl,
    productSlotsEnabled: content.productSlotsEnabled,
    productStatus: controller.productStatus,
    promoBannerBgImage: content.promoBannerBgImage,
    quantityValidationEnabled: content.quantityValidationEnabled,
    resetSubscriptionConfig: subscriptions.resetSubscriptionConfig,
    revalidator: controller.revalidator,
    ruleMessages: controller.ruleMessages,
    ruleMessagesByLocale: localization.ruleMessagesByLocale,
    searchBarEnabled: visibility.searchBarEnabled,
    selectedCollections: controller.selectedCollections,
    setActiveSection: controller.setActiveSection,
    setActiveTabIndex: controller.setActiveTabIndex,
    setAddonDraft: addons.setAddonDraft,
    setAllowQuantityChanges: content.setAllowQuantityChanges,
    setAutoSelectBrowsedProduct: visibility.setAutoSelectBrowsedProduct,
    setCartRedirectToCheckout: content.setCartRedirectToCheckout,
    setCategoryOpen: visibility.setCategoryOpen,
    setCountdownEnabled: content.setCountdownEnabled,
    setCountdownExpiredMessage: content.setCountdownExpiredMessage,
    setCountdownExpiryAction: content.setCountdownExpiryAction,
    setCountdownLayout: content.setCountdownLayout,
    setCountdownPosition: content.setCountdownPosition,
    setCountdownTitle: content.setCountdownTitle,
    setDiscountMessagingMultiLanguageEnabled:
      localization.setDiscountMessagingMultiLanguageEnabled,
    setFloatingBadgeEnabled: content.setFloatingBadgeEnabled,
    setFloatingBadgeText: content.setFloatingBadgeText,
    setHasPreview: visibility.setHasPreview,
    setIsDirty: controller.setIsDirty,
    setLoadingGif: content.setLoadingGif,
    setLowStockAlertEnabled: content.setLowStockAlertEnabled,
    setLowStockAlertMessage: content.setLowStockAlertMessage,
    setLowStockAlertThreshold: content.setLowStockAlertThreshold,
    setEntitlementFailure: controller.setEntitlementFailure,
    setOperationAlert: controller.setOperationAlert,
    setPromoBannerBgImage: content.setPromoBannerBgImage,
    setRuleMessagesByLocale: localization.setRuleMessagesByLocale,
    setSearchBarEnabled: visibility.setSearchBarEnabled,
    setShowDiscardModal: modals.setShowDiscardModal,
    setShowProductPrices: content.setShowProductPrices,
    setShowStepTimeline: content.setShowStepTimeline,
    setTextOverrides: content.setTextOverrides,
    setTextOverridesByLocale: content.setTextOverridesByLocale,
    setUpsellWidgetButtonText: visibility.setUpsellWidgetButtonText,
    setUpsellWidgetDisplayMode: visibility.setUpsellWidgetDisplayMode,
    setUpsellWidgetDisplayOn: visibility.setUpsellWidgetDisplayOn,
    setUpsellWidgetEnabled: visibility.setUpsellWidgetEnabled,
    shopify: controller.shopify,
    showProductPrices: content.showProductPrices,
    showStepTimeline: content.showStepTimeline,
    showTextOnAddButton: content.showTextOnAddButton,
    stepsState: controller.stepsState,
    subscriptionConfig: subscriptions.subscriptionConfig,
    successMessageByLocale: localization.successMessageByLocale,
    textOverrides: content.textOverrides,
    textOverridesByLocale: content.textOverridesByLocale,
    tierTextByLocaleByRuleId: localization.tierTextByLocaleByRuleId,
    tierTextByRuleId: localization.tierTextByRuleId,
    upsellWidgetButtonText: visibility.upsellWidgetButtonText,
    upsellWidgetDisplayMode: visibility.upsellWidgetDisplayMode,
    upsellWidgetDisplayOn: visibility.upsellWidgetDisplayOn,
    upsellWidgetEnabled: visibility.upsellWidgetEnabled,
    variantSelectorEnabled: content.variantSelectorEnabled,
  });

  return {
    ...controller,
    ...addons,
    ...content,
    ...subscriptions,
    ...localization,
    ...visibility,
    ...templatePricing,
    ...modals,
    ...actions,
    ...save,
  };
}
