import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AdminSectionLoadingState } from "../../../components/AdminSectionLoadingState";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import { PpbStepSetupSection } from "./PpbStepSetupSection";
import { ConfigureValidationSummary } from "../_shared/bundle-configure/ConfigureValidationSummary";
import { getDeferredConfigureSection } from "../_shared/bundle-configure/deferred-configure-sections";
import { getPpbStandaloneOperationAlert } from "./ppb-warning-presentation";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

const PpbDiscountPricingSection = lazy(() =>
  import("./PpbDiscountPricingSection").then((module) => ({
    default: module.PpbDiscountPricingSection,
  }))
);
const PpbBundleVisibilitySection = lazy(() =>
  import("./PpbBundleVisibilitySection").then((module) => ({
    default: module.PpbBundleVisibilitySection,
  }))
);
const PpbBundleWidgetSection = lazy(() =>
  import("./PpbBundleWidgetSection").then((module) => ({
    default: module.PpbBundleWidgetSection,
  }))
);
const PpbBundleEmbedSection = lazy(() =>
  import("./PpbBundleEmbedSection").then((module) => ({
    default: module.PpbBundleEmbedSection,
  }))
);
const PpbImagesGifsSection = lazy(() =>
  import("./PpbImagesGifsSection").then((module) => ({
    default: module.PpbImagesGifsSection,
  }))
);
const PpbBundleSettingsSection = lazy(() =>
  import("./PpbBundleSettingsSection").then((module) => ({
    default: module.PpbBundleSettingsSection,
  }))
);
const PpbSubscriptionsSection = lazy(() =>
  import("./PpbSubscriptionsSection").then((module) => ({
    default: module.PpbSubscriptionsSection,
  }))
);
const PpbFreeGiftAddonsSection = lazy(() =>
  import("./PpbFreeGiftAddonsSection").then((module) => ({
    default: module.PpbFreeGiftAddonsSection,
  }))
);

export function PpbMainSections({ flow }: { flow: PpbConfigureFlow }) {
  const { t } = useTranslation();
  const deferredSection = getDeferredConfigureSection(flow.activeSection);

  return (
    <>
      <AdminTaskAlertBanner
        alert={getPpbStandaloneOperationAlert(flow.operationAlert)}
        onDismiss={flow.clearOperationAlert}
      />
      <ConfigureValidationSummary
        activeSection={flow.activeSection}
        issues={flow.validationIssues}
      />
      {flow.activeSection === "step_setup" ? (
        <PpbStepSetupSection
          activeSection={flow.activeSection}
          slideDir={flow.slideDir}
          slideKey={flow.slideKey}
          stepFlow={{
            activeTabIndex: flow.activeTabIndex,
            handleAddNewStep: flow.handleAddNewStep,
            navigateToStep: flow.navigateToStep,
            stepsState: flow.stepsState,
          }}
          details={{
            clearValidationError: flow.clearValidationError,
            cloneStep: flow.cloneStep,
            deleteStep: flow.deleteStep,
            markAsDirty: flow.markAsDirty,
            openStepMultiLanguageModal: flow.openStepMultiLanguageModal,
            shopLocales: flow.shopLocales,
            stepsState: flow.stepsState,
            validationErrors: flow.validationErrors,
          }}
          categories={{
            categoryAdapter: {
              categoryActiveTabs: flow.categoryActiveTabs,
              categoryOpen: flow.categoryOpen,
              clearValidationError: flow.clearValidationError,
              draggedCatKey: flow.draggedCatKey,
              dragOverCatKey: flow.dragOverCatKey,
              handleCatDragEnd: flow.handleCatDragEnd,
              handleCatDragStart: flow.handleCatDragStart,
              handleCatDrop: flow.handleCatDrop,
              markAsDirty: flow.markAsDirty,
              openStepCategoryMultiLanguageModal:
                flow.openStepCategoryMultiLanguageModal,
              setCategoryActiveTabs: flow.setCategoryActiveTabs,
              setCategoryOpen: flow.setCategoryOpen,
              setDragOverCatKey: flow.setDragOverCatKey,
              shopify: flow.shopify,
              shopLocales: flow.shopLocales,
              stepsState: flow.stepsState,
              validationErrors: flow.validationErrors,
            },
            markAsDirty: flow.markAsDirty,
            stepsState: flow.stepsState,
          }}
          rules={{
            addCategoryConditionRule: flow.addCategoryConditionRule,
            categoryRulesAdapter: {
              addCategoryConditionRule: flow.addCategoryConditionRule,
              categoryRulesOpen: flow.categoryRulesOpen,
              removeCategoryConditionRule: flow.removeCategoryConditionRule,
              setCategoryRulesOpen: flow.setCategoryRulesOpen,
              updateCategoryAutoNextRule: flow.updateCategoryAutoNextRule,
              updateCategoryConditionRule: flow.updateCategoryConditionRule,
            },
            clearCategoryConditionRules: flow.clearCategoryConditionRules,
            conditionsState: flow.conditionsState,
          }}
          config={{
            markAsDirty: flow.markAsDirty,
            setShowIconPickerForStep: flow.setShowIconPickerForStep,
            showIconPickerForStep: flow.showIconPickerForStep,
            stepsState: flow.stepsState,
          }}
        />
      ) : null}
      <Suspense
        fallback={
          <AdminSectionLoadingState label={t("common.loading.workspace")} />
        }
      >
        {deferredSection === "discount_pricing" ? (
          <PpbDiscountPricingSection
            activeSection={flow.activeSection}
            rules={{
              pricingState: flow.pricingState,
              setGlobalSuccessMessage: flow.setGlobalSuccessMessage,
              setRuleMessages: flow.setRuleMessages,
              setRuleMessagesByLocale: flow.setRuleMessagesByLocale,
              setSuccessMessageByLocale: flow.setSuccessMessageByLocale,
              validationErrors: flow.validationErrors,
            }}
            display={{
              displayOptionsInactive: flow.displayOptionsInactive,
              quantity: {
                bundleQuantityOptionsEligible:
                  flow.bundleQuantityOptionsEligible,
                markAsDirty: flow.markAsDirty,
                pricingState: flow.pricingState,
                qtyOptionsDefaultRuleId: flow.qtyOptionsDefaultRuleId,
                qtyOptionsEnabled: flow.qtyOptionsEnabled,
                qtyRuleLabels: flow.qtyRuleLabels,
                qtyRuleSubtexts: flow.qtyRuleSubtexts,
                setIsBundleQuantityMultiLangModalOpen:
                  flow.setIsBundleQuantityMultiLangModalOpen,
                setQtyOptionsDefaultRuleId: flow.setQtyOptionsDefaultRuleId,
                setQtyOptionsEnabled: flow.setQtyOptionsEnabled,
                setQtyRuleLabels: flow.setQtyRuleLabels,
                setQtyRuleSubtexts: flow.setQtyRuleSubtexts,
                shopLocales: flow.shopLocales,
              },
              progress: {
                markAsDirty: flow.markAsDirty,
                pricingState: flow.pricingState,
                progressBarEnabled: flow.progressBarEnabled,
                progressBarType: flow.progressBarType,
                setIsProgressBarMultiLangModalOpen:
                  flow.setIsProgressBarMultiLangModalOpen,
                setProgressBarEnabled: flow.setProgressBarEnabled,
                setProgressBarType: flow.setProgressBarType,
                setTierTextByRuleId: flow.setTierTextByRuleId,
                shopLocales: flow.shopLocales,
                tierTextByRuleId: flow.tierTextByRuleId,
              },
              messaging: {
                activeDiscountLocale: flow.activeDiscountLocale,
                discountMessagingMultiLanguageEnabled:
                  flow.discountMessagingMultiLanguageEnabled,
                globalSuccessMessage: flow.globalSuccessMessage,
                markAsDirty: flow.markAsDirty,
                pricingState: flow.pricingState,
                ruleMessages: flow.ruleMessages,
                ruleMessagesByLocale: flow.ruleMessagesByLocale,
                setActiveDiscountLocale: flow.setActiveDiscountLocale,
                setDiscountMessagingMultiLanguageEnabled:
                  flow.setDiscountMessagingMultiLanguageEnabled,
                setGlobalSuccessMessage: flow.setGlobalSuccessMessage,
                setIsDiscountVariablesModalOpen:
                  flow.setIsDiscountVariablesModalOpen,
                setRuleMessagesByLocale: flow.setRuleMessagesByLocale,
                setSuccessMessageByLocale: flow.setSuccessMessageByLocale,
                shopLocales: flow.shopLocales,
                successMessageByLocale: flow.successMessageByLocale,
                updateRuleMessage: flow.updateRuleMessage,
              },
            }}
          />
        ) : null}
        {flow.activeSection === "bundle_visibility" ? (
          <PpbBundleVisibilitySection
            activeSection={flow.activeSection}
            appEmbedEnabled={flow.appEmbedEnabled}
            bundle={flow.bundle}
            copySpecificLinkOffer={flow.copySpecificLinkOffer}
            generatedSpecificLink={flow.generatedSpecificLink}
            generateSpecificLinkOffer={flow.generateSpecificLinkOffer}
            handleSectionChange={flow.handleSectionChange}
            offerDeliveryState={flow.offerDeliveryState}
            openThemeEditorForAppEmbed={flow.openThemeEditorForAppEmbed}
            revokeSpecificLinkOffer={flow.revokeSpecificLinkOffer}
            setCountryCodes={flow.setCountryCodes}
            setCountryTargetingEnabled={flow.setCountryTargetingEnabled}
            setCountryTargetingMode={flow.setCountryTargetingMode}
            setOfferEndsAt={flow.setOfferEndsAt}
            setOfferPriority={flow.setOfferPriority}
            setOfferRecurrenceAnchorDate={flow.setOfferRecurrenceAnchorDate}
            setOfferRecurrenceEndsOn={flow.setOfferRecurrenceEndsOn}
            setOfferRecurrenceFrequency={flow.setOfferRecurrenceFrequency}
            setOfferRecurrenceRunCount={flow.setOfferRecurrenceRunCount}
            setOfferRecurrenceTermination={flow.setOfferRecurrenceTermination}
            setOfferRecurrenceWindowEnd={flow.setOfferRecurrenceWindowEnd}
            setOfferRecurrenceWindowStart={flow.setOfferRecurrenceWindowStart}
            setOfferScheduleMode={flow.setOfferScheduleMode}
            setOfferStartsAt={flow.setOfferStartsAt}
            setOfferStopLowerPriority={flow.setOfferStopLowerPriority}
            setSpecificLinkOfferEnabled={flow.setSpecificLinkOfferEnabled}
            shop={flow.shop}
            specificLinkOfferBusy={flow.specificLinkOfferBusy}
            themeEditorUrl={flow.themeEditorUrl}
          />
        ) : null}
        {deferredSection === "bundle_widget" ? (
          <PpbBundleWidgetSection
            activeSection={flow.activeSection}
            autoSelectBrowsedProduct={flow.autoSelectBrowsedProduct}
            clearValidationError={flow.clearValidationError}
            handlePlaceWidget={flow.handlePlaceWidget}
            markAsDirty={flow.markAsDirty}
            openMultiLanguageModal={flow.openMultiLanguageModal}
            openVisibilityCollectionPicker={
              flow.openVisibilityCollectionPicker
            }
            openVisibilityProductPicker={flow.openVisibilityProductPicker}
            removeVisibilityCollectionTarget={
              flow.removeVisibilityCollectionTarget
            }
            removeVisibilityProductTarget={flow.removeVisibilityProductTarget}
            setAutoSelectBrowsedProduct={flow.setAutoSelectBrowsedProduct}
            setUpsellWidgetButtonText={flow.setUpsellWidgetButtonText}
            setUpsellWidgetDescription={flow.setUpsellWidgetDescription}
            setUpsellWidgetDisplayMode={flow.setUpsellWidgetDisplayMode}
            setUpsellWidgetDisplayOn={flow.setUpsellWidgetDisplayOn}
            setUpsellWidgetEnabled={flow.setUpsellWidgetEnabled}
            setUpsellWidgetImageUrl={flow.setUpsellWidgetImageUrl}
            setUpsellWidgetTitle={flow.setUpsellWidgetTitle}
            shopLocales={flow.shopLocales}
            upsellWidgetButtonText={flow.upsellWidgetButtonText}
            upsellWidgetCollectionsSelectedData={
              flow.upsellWidgetCollectionsSelectedData
            }
            upsellWidgetDescription={flow.upsellWidgetDescription}
            upsellWidgetDisplayMode={flow.upsellWidgetDisplayMode}
            upsellWidgetDisplayOn={flow.upsellWidgetDisplayOn}
            upsellWidgetEnabled={flow.upsellWidgetEnabled}
            upsellWidgetImageUrl={flow.upsellWidgetImageUrl}
            upsellWidgetSelectedProducts={flow.upsellWidgetSelectedProducts}
            upsellWidgetTitle={flow.upsellWidgetTitle}
            validationErrors={flow.validationErrors}
          />
        ) : null}
        {deferredSection === "bundle_embed" ? (
          <PpbBundleEmbedSection
            activeSection={flow.activeSection}
            bundleEmbedAddBrowsedProduct={flow.bundleEmbedAddBrowsedProduct}
            bundleEmbedCollectionsSelectedData={
              flow.bundleEmbedCollectionsSelectedData
            }
            bundleEmbedDisplayOn={flow.bundleEmbedDisplayOn}
            bundleEmbedEnabled={flow.bundleEmbedEnabled}
            bundleEmbedSelectedProducts={flow.bundleEmbedSelectedProducts}
            bundleEmbedSubTitle={flow.bundleEmbedSubTitle}
            bundleEmbedTitle={flow.bundleEmbedTitle}
            clearValidationError={flow.clearValidationError}
            handlePlaceWidget={flow.handlePlaceWidget}
            markAsDirty={flow.markAsDirty}
            openMultiLanguageModal={flow.openMultiLanguageModal}
            openVisibilityCollectionPicker={
              flow.openVisibilityCollectionPicker
            }
            openVisibilityProductPicker={flow.openVisibilityProductPicker}
            removeVisibilityCollectionTarget={
              flow.removeVisibilityCollectionTarget
            }
            removeVisibilityProductTarget={flow.removeVisibilityProductTarget}
            setBundleEmbedAddBrowsedProduct={
              flow.setBundleEmbedAddBrowsedProduct
            }
            setBundleEmbedCollectionsSelectedData={
              flow.setBundleEmbedCollectionsSelectedData
            }
            setBundleEmbedDisplayOn={flow.setBundleEmbedDisplayOn}
            setBundleEmbedEnabled={flow.setBundleEmbedEnabled}
            setBundleEmbedSelectedProducts={flow.setBundleEmbedSelectedProducts}
            setBundleEmbedSpecificCollectionPages={
              flow.setBundleEmbedSpecificCollectionPages
            }
            setBundleEmbedSpecificProductPages={
              flow.setBundleEmbedSpecificProductPages
            }
            setBundleEmbedSubTitle={flow.setBundleEmbedSubTitle}
            setBundleEmbedTitle={flow.setBundleEmbedTitle}
            shopLocales={flow.shopLocales}
            validationErrors={flow.validationErrors}
          />
        ) : null}
        {flow.activeSection === "images_gifs" ? (
          <PpbImagesGifsSection
            activeAssetTabIndex={flow.activeAssetTabIndex}
            activeSection={flow.activeSection}
            loadingGif={flow.loadingGif}
            markAsDirty={flow.markAsDirty}
            setActiveAssetTabIndex={flow.setActiveAssetTabIndex}
            setLoadingGif={flow.setLoadingGif}
            stepsState={flow.stepsState}
          />
        ) : null}
        {deferredSection === "bundle_settings" ? (
          <PpbBundleSettingsSection
            activeSection={flow.activeSection}
            controls={{
              banner: {
                bundleBannerDesktopUrl: flow.bundleBannerDesktopUrl,
                bundleBannerMobileUrl: flow.bundleBannerMobileUrl,
                markAsDirty: flow.markAsDirty,
                setBundleBannerDesktopUrl: flow.setBundleBannerDesktopUrl,
                setBundleBannerMobileUrl: flow.setBundleBannerMobileUrl,
              },
              bundleLevelCss: {
                bundleLevelCss: flow.bundleLevelCss,
                bundleLevelCssExpanded: flow.bundleLevelCssExpanded,
                markAsDirty: flow.markAsDirty,
                setBundleLevelCss: flow.setBundleLevelCss,
                setBundleLevelCssExpanded: flow.setBundleLevelCssExpanded,
              },
              categorySteps: {
                markAsDirty: flow.markAsDirty,
                setUseSingleStepCategoriesAsBundleSteps:
                  flow.setUseSingleStepCategoriesAsBundleSteps,
                useSingleStepCategoriesAsBundleSteps:
                  flow.useSingleStepCategoriesAsBundleSteps,
              },
              countdown: {
                countdownEnabled: flow.countdownEnabled,
                countdownExpiredMessage: flow.countdownExpiredMessage,
                countdownExpiryAction: flow.countdownExpiryAction,
                countdownLayout: flow.countdownLayout,
                countdownPosition: flow.countdownPosition,
                countdownTitle: flow.countdownTitle,
                markAsDirty: flow.markAsDirty,
                scheduledEndsAt: flow.offerDeliveryState.endsAt,
                setCountdownEnabled: flow.setCountdownEnabled,
                setCountdownExpiredMessage: flow.setCountdownExpiredMessage,
                setCountdownExpiryAction: flow.setCountdownExpiryAction,
                setCountdownLayout: flow.setCountdownLayout,
                setCountdownPosition: flow.setCountdownPosition,
                setCountdownTitle: flow.setCountdownTitle,
              },
              defaultProducts: {
                clearValidationError: flow.clearValidationError,
                defaultProductsData: flow.defaultProductsData,
                markAsDirty: flow.markAsDirty,
                setDefaultProductsData: flow.setDefaultProductsData,
                validationErrors: flow.validationErrors,
              },
              discountDisplay: {
                markAsDirty: flow.markAsDirty,
                setTextOverrides: flow.setTextOverrides,
                textOverrides: flow.textOverrides,
              },
              quantity: {
                clearValidationError: flow.clearValidationError,
                lowStockAlertEnabled: flow.lowStockAlertEnabled,
                lowStockAlertMessage: flow.lowStockAlertMessage,
                lowStockAlertThreshold: flow.lowStockAlertThreshold,
                markAsDirty: flow.markAsDirty,
                maxQtyPerProduct: flow.maxQtyPerProduct,
                quantityValidationEnabled: flow.quantityValidationEnabled,
                setLowStockAlertEnabled: flow.setLowStockAlertEnabled,
                setLowStockAlertMessage: flow.setLowStockAlertMessage,
                setLowStockAlertThreshold: flow.setLowStockAlertThreshold,
                setMaxQtyPerProduct: flow.setMaxQtyPerProduct,
                setQuantityValidationEnabled:
                  flow.setQuantityValidationEnabled,
                setVariantSelectorEnabled: flow.setVariantSelectorEnabled,
                validationErrors: flow.validationErrors,
                variantSelectorEnabled: flow.variantSelectorEnabled,
              },
              status: {
                status: flow.formState.bundleStatus,
                onChange: flow.formState.setBundleStatus,
              },
              stickyAddToCart: {
                markAsDirty: flow.markAsDirty,
                setStickyAddToCartAction: flow.setStickyAddToCartAction,
                setStickyAddToCartEnabled: flow.setStickyAddToCartEnabled,
                setStickyAddToCartShowDesktop:
                  flow.setStickyAddToCartShowDesktop,
                setStickyAddToCartShowMobile:
                  flow.setStickyAddToCartShowMobile,
                stickyAddToCartAction: flow.stickyAddToCartAction,
                stickyAddToCartEnabled: flow.stickyAddToCartEnabled,
                stickyAddToCartShowDesktop: flow.stickyAddToCartShowDesktop,
                stickyAddToCartShowMobile: flow.stickyAddToCartShowMobile,
              },
            }}
          />
        ) : null}
        {deferredSection === "subscriptions" ? (
          <PpbSubscriptionsSection
            activeSection={flow.activeSection}
            bundle={flow.bundle}
            pricingState={flow.pricingState}
            setShowSubscriptionSetupGuide={
              flow.setShowSubscriptionSetupGuide
            }
            showSubscriptionSetupGuide={flow.showSubscriptionSetupGuide}
            shopLocales={flow.shopLocales}
            stepsState={flow.stepsState}
            subscriptionConfig={flow.subscriptionConfig}
            setSubscriptionConfig={flow.setSubscriptionConfig}
            subscriptionFetcher={flow.subscriptionFetcher}
            validationErrors={flow.validationErrors}
          />
        ) : null}
        {deferredSection === "free_gift_addons" ? (
          <PpbFreeGiftAddonsSection
            activeSection={flow.activeSection}
            activeTabIndex={flow.activeTabIndex}
            markAsDirty={flow.markAsDirty}
            openAddonMultiLanguageModal={flow.openAddonMultiLanguageModal}
            ruleMessages={flow.ruleMessages}
            setRuleMessages={flow.setRuleMessages}
            setShowIconPickerForStep={flow.setShowIconPickerForStep}
            shopLocales={flow.shopLocales}
            showIconPickerForStep={flow.showIconPickerForStep}
            stepsState={flow.stepsState}
            templateVariablesModalRef={flow.templateVariablesModalRef}
          />
        ) : null}
      </Suspense>
    </>
  );
}
