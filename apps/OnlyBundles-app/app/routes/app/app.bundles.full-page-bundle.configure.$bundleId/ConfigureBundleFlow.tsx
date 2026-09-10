import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminSectionLoadingState } from "../../../components/AdminSectionLoadingState";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import { BundleReadinessOverlay } from "../../../components/bundle-configure/BundleReadinessOverlay";
import fullPageBundleStyles from "../../../styles/routes/full-page-bundle-configure.module.css";
import { CommonConfigureShell } from "../_shared/bundle-configure/CommonConfigureShell";
import { getDeferredConfigureSection } from "../_shared/bundle-configure/deferred-configure-sections";
import { revealDeferredConfigureOverlays } from "../_shared/bundle-configure/deferred-configure-overlays";
import { ConfigureCanvasHeader } from "./ConfigureCanvasHeader";
import { ConfigureHiddenInputs } from "./ConfigureHiddenInputs";
import { ConfigureSidebar } from "./ConfigureSidebar";
import { useConfigureBundleFlow } from "./useConfigureBundleFlow";
import { StepSetupSection } from "./sections/StepSetupSection";
import { ConfigureValidationSummary } from "../_shared/bundle-configure/ConfigureValidationSummary";
import { ConfigureContextualSaveBar } from "../_shared/bundle-configure/ConfigureContextualSaveBar";
import { isMultiLanguageActionDisabled } from "../../../lib/bundle-config/common-configure-page-model";
import type {
  BundleQuantityOptionDisplay,
  PricingRuleTierText,
} from "../../../types/pricing";
import { ADDON_MESSAGE_KEY } from "./configure-constants";
import type { AddonTierDraft } from "./addon-draft.types";

const FreeGiftAddonsSection = lazy(() =>
  import("./sections/FreeGiftAddonsSection").then((module) => ({
    default: module.FreeGiftAddonsSection,
  }))
);
const DiscountPricingSection = lazy(() =>
  import("./sections/DiscountPricingSection").then((module) => ({
    default: module.DiscountPricingSection,
  }))
);
const ImagesVisibilitySection = lazy(() =>
  import("./sections/ImagesVisibilitySection").then((module) => ({
    default: module.ImagesVisibilitySection,
  }))
);
const BundleSettingsSection = lazy(() =>
  import("./sections/BundleSettingsSection").then((module) => ({
    default: module.BundleSettingsSection,
  }))
);
const BundleWidgetSection = lazy(() =>
  import("./sections/BundleWidgetSection").then((module) => ({
    default: module.BundleWidgetSection,
  }))
);
const BundleSubscriptionsSection = lazy(() =>
  import("../_shared/bundle-configure/BundleSubscriptionsSection").then(
    (module) => ({ default: module.BundleSubscriptionsSection })
  )
);
const ConfigureRouteModals = lazy(() =>
  import("./sections/ConfigureRouteModals").then((module) => ({
    default: module.ConfigureRouteModals,
  }))
);

function ConfigureBundleFlow() {
  const { t } = useTranslation();
  const flow = useConfigureBundleFlow();
  const {
    blockConfigurationChangeWhileSaving,
    fetcher,
    handleSave,
    isDirty,
    isSaveInFlight,
    saveBarRef,
    setShowDiscardModal,
  } = flow;
  const [showOverlays, setShowOverlays] = useState(false);
  const deferredSection = getDeferredConfigureSection(flow.activeSection);
  const pricingTranslationRules = flow.pricingState.discountRules.map(
    (rule, index) => {
      const quantityOption =
        flow.normalizedPricingDisplayOptions.bundleQuantityOptions.options.find(
          (option) => option.ruleId === rule.id
        );
      return {
        id: rule.id,
        heading: `Rule #${index + 1}`,
        quantityFallback: {
          label: quantityOption?.label ?? "",
          subtext: quantityOption?.subtext ?? "",
        },
        tierFallback: flow.tierTextByRuleId[rule.id] ?? {},
      };
    }
  );
  const currentModalStep = flow.stepsState.steps.find(
    (step) => step.id === flow.currentModalStepId
  );
  const selectedAddonTierIndex = flow.addonSelectedProductsTierIndex ?? 0;
  const addonTiers: AddonTierDraft[] = Array.isArray(
    flow.addonDraft?.addonTiers
  )
    ? flow.addonDraft.addonTiers
    : [];
  const selectedAddonTier = addonTiers[selectedAddonTierIndex] ?? addonTiers[0];
  const selectedAddonProducts = Array.isArray(
    selectedAddonTier?.selectedAddonProducts
  )
    ? selectedAddonTier.selectedAddonProducts
    : [];
  const savedAddonMessages = (
    flow.bundle as {
      personalizationData?: {
        addonProducts?: {
          addonsMessaging?: {
            tier1?: { ineligibleState?: string; eligibleState?: string };
          };
        };
      };
    }
  ).personalizationData?.addonProducts?.addonsMessaging?.tier1;
  const configuredAddonMessages = flow.ruleMessages?.[ADDON_MESSAGE_KEY];
  const addonFooterMessages = {
    discountText:
      configuredAddonMessages?.discountText ??
      savedAddonMessages?.ineligibleState ??
      "",
    successMessage:
      configuredAddonMessages?.successMessage ??
      savedAddonMessages?.eligibleState ??
      "",
  };

  useEffect(() => {
    const show = () =>
      window.requestIdleCallback(() => {
        revealDeferredConfigureOverlays(() => setShowOverlays(true));
      });
    if (document.readyState === "complete") {
      show();
      return;
    }
    window.addEventListener("load", show, { once: true });
    return () => window.removeEventListener("load", show);
  }, []);

  return (
    <CommonConfigureShell
      blockConfigurationChangeWhileSaving={blockConfigurationChangeWhileSaving}
      isSaveInFlight={isSaveInFlight}
      styles={fullPageBundleStyles}
      saveForm={
        <form
          data-save-lock-allow="true"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          onReset={(e) => {
            e.preventDefault();
            setShowDiscardModal(true);
          }}
        >
          <ConfigureContextualSaveBar
            isOpen={isDirty}
            isSaving={fetcher.state !== "idle"}
            onSave={() => void handleSave()}
            onDiscard={() => setShowDiscardModal(true)}
            saveBarRef={saveBarRef}
          />
          <ConfigureHiddenInputs
            bundleDescription={flow.formState.bundleDescription}
            bundleName={flow.formState.bundleName}
            bundleProduct={flow.bundleProduct}
            bundleStatus={flow.formState.bundleStatus}
            conditions={flow.conditionsState.stepConditions}
            discountMessagingMultiLanguageEnabled={
              flow.discountMessagingMultiLanguageEnabled
            }
            normalizedPricingDisplayOptions={
              flow.normalizedPricingDisplayOptions
            }
            normalizedRuleMessages={flow.normalizedRuleMessages}
            pricing={flow.pricingState}
            ruleMessagesByLocale={flow.ruleMessagesByLocale}
            selectedCollections={flow.selectedCollections}
            serializePricingDisplayOptions={flow.serializePricingDisplayOptions}
            steps={flow.stepsState.steps}
            templateName={flow.formState.templateName}
            tierTextByLocaleByRuleId={flow.tierTextByLocaleByRuleId}
            tierTextByRuleId={flow.tierTextByRuleId}
          />
        </form>
      }
      header={
        <ConfigureCanvasHeader
          appEmbedEnabled={flow.appEmbedEnabled}
          bundleProduct={flow.bundleProduct}
          bundleProductId={flow.bundle.shopifyProductId ?? null}
          fetcherState={flow.fetcher.state}
          fullPageBundleStyles={flow.fullPageBundleStyles}
          handleBackClick={flow.handleBackClick}
          handlePreviewBundle={flow.handlePreviewBundle}
          isPreviewBundleLoading={flow.isPreviewBundleLoading}
          openThemeEditorForAppEmbed={flow.openThemeEditorForAppEmbed}
          openProductInAdmin={flow.openProductInAdmin}
          parentProductStatusUi={flow.parentProductStatusUi}
          readinessScore={flow.readinessScore}
          shop={flow.shop}
          themeEditorUrl={flow.themeEditorUrl}
        />
      }
      sidebar={
        <ConfigureSidebar
          activeSection={flow.activeSection}
          appEmbedEnabled={flow.appEmbedEnabled}
          bundle={flow.bundle}
          bundleProduct={flow.bundleProduct}
          formState={flow.formState}
          handleBundleProductSelect={flow.handleBundleProductSelect}
          handleSectionChange={flow.handleSectionChange}
          handleSyncProduct={flow.handleSyncProduct}
          openProductInAdmin={flow.openProductInAdmin}
          openSelectTemplateModal={flow.openSelectTemplateModal}
          parentProductStatusUi={flow.parentProductStatusUi}
          pricingState={flow.pricingState}
          productImageUrl={flow.productImageUrl}
          productTitle={flow.productTitle}
          selectTemplateOpenButtonRef={flow.selectTemplateOpenButtonRef}
          styles={flow.fullPageBundleStyles}
        />
      }
      overlays={
        <>
          <BundleReadinessOverlay
            items={flow.readinessItems}
            open={flow.readinessOpen}
            onOpenChange={flow.setReadinessOpen}
            onItemClick={flow.handleReadinessItemClick}
          />
          {showOverlays ? (
            <Suspense fallback={null}>
              <ConfigureRouteModals
                globalOverlays={{
                  guidedTour: {
                    shop: flow.shop,
                    enabled: flow.loaderData.showFirstLoadTour === true,
                    onStepChange: flow.handleGuidedTourStepChange,
                  },
                  language: {
                    open: flow.isMultiLanguageModalOpen,
                    title: flow.multiLanguageTitle,
                    layout: flow.multiLanguageLayout,
                    saveLabel:
                      flow.multiLanguageLayout === "compact"
                        ? "Save and close"
                        : undefined,
                    locales: flow.shopLocales,
                    activeLocale: flow.textOverridesLocale,
                    fields: flow.multiLanguageFields,
                    valuesByLocale: flow.activeMultiLanguageValues,
                    onActiveLocaleChange: flow.setTextOverridesLocale,
                    onSave: flow.saveStepSetupMultiLanguageValues,
                    onClose: () => flow.setIsMultiLanguageModalOpen(false),
                  },
                  discard: {
                    open: flow.showDiscardModal,
                    onDiscard: flow.handleConfirmDiscard,
                    onContinue: flow.closeDiscardModal,
                  },
                }}
              selectedItems={{
                products: {
                  modalRef: flow.productsModalRef,
                  selected: currentModalStep?.StepProduct ?? [],
                  onClose: flow.handleCloseProductsModal,
                  onOpenInAdmin: flow.openProductInAdmin,
                },
                addonProducts: {
                  modalRef: flow.addonSelectedProductsModalRef,
                  tierIndex: selectedAddonTierIndex,
                  selected: selectedAddonProducts,
                  onAdd: flow.handleAddonSelectedProductAdd,
                  onClose: flow.handleCloseAddonSelectedProductsModal,
                  onRemove: flow.handleAddonSelectedProductRemove,
                },
                collections: {
                  modalRef: flow.collectionsModalRef,
                  selected:
                    flow.selectedCollections[flow.currentModalStepId] ?? [],
                  onClose: flow.handleCloseCollectionsModal,
                },
                variables: {
                  templateModalRef: flow.templateVariablesModalRef,
                  discountModalRef: flow.discountVariablesModalRef,
                  addonModalRef: flow.addonVariablesModalRef,
                  onCloseTemplate: () =>
                    flow.hidePolarisModal(flow.templateVariablesModalRef),
                },
                disableAddon: {
                  modalRef: flow.disableAddonStepModalRef,
                  onCancel: () => flow.setIsDisableAddonStepModalOpen(false),
                  onConfirm: flow.handleDisableAddonStepConfirm,
                },
                styles: flow.fullPageBundleStyles,
              }}
              syncAndLanguage={{
                sync: {
                  modalRef: flow.syncModalRef,
                  submitting: flow.fetcher.state === "submitting",
                  onConfirm: flow.handleSyncBundleConfirm,
                  onCancel: () => flow.setIsSyncModalOpen(false),
                },
                pricingTranslations: {
                  locales: flow.shopLocales,
                  rules: pricingTranslationRules,
                  quantity: {
                    open: flow.isBundleQuantityMultiLangModalOpen,
                    activeLocale: flow.activeBundleQuantityLocale,
                    values:
                      flow.pricingState.pricingDisplayOptions
                        .bundleQuantityOptions.optionsByLocaleByRuleId ?? {},
                    onActiveLocaleChange: flow.setActiveBundleQuantityLocale,
                    onApply: (values) => {
                      flow.pricingState.setPricingDisplayOptions((current) => ({
                        ...current,
                        bundleQuantityOptions: {
                          ...current.bundleQuantityOptions,
                          optionsByLocaleByRuleId: values as Record<
                            string,
                            Record<string, BundleQuantityOptionDisplay>
                          >,
                        },
                      }));
                      flow.markAsDirty();
                    },
                    onClose: () =>
                      flow.setIsBundleQuantityMultiLangModalOpen(false),
                  },
                  progress: {
                    open: flow.isProgressBarMultiLangModalOpen,
                    activeLocale: flow.activeProgressBarLocale,
                    values: flow.tierTextByLocaleByRuleId,
                    onActiveLocaleChange: flow.setActiveProgressBarLocale,
                    onApply: (values) => {
                      flow.setTierTextByLocaleByRuleId(
                        values as Record<
                          string,
                          Record<string, PricingRuleTierText>
                        >
                      );
                      flow.markAsDirty();
                    },
                    onClose: () =>
                      flow.setIsProgressBarMultiLangModalOpen(false),
                  },
                },
                preview: flow.enablePreviewGate.modalProps,
              }}
              templateDialog={{
                template: {
                  closeSelectTemplateModal: flow.closeSelectTemplateModal,
                  fullPageBundleStyles: flow.fullPageBundleStyles,
                  handleTemplateNext: flow.handleTemplateNext,
                  handleTemplatePreview: flow.handleTemplatePreview,
                  isPreviewBundleLoading: flow.isPreviewBundleLoading,
                  isSelectTemplateModalOpen: flow.isSelectTemplateModalOpen,
                  pendingDesignPresetId: flow.pendingDesignPresetId,
                  pendingDesignTemplate: flow.pendingDesignTemplate,
                  setPendingDesignPresetId: flow.setPendingDesignPresetId,
                  setPendingDesignTemplate: flow.setPendingDesignTemplate,
                  setTemplateModalStep: flow.setTemplateModalStep,
                  templateFetcher: flow.templateFetcher,
                  templateModalStep: flow.templateModalStep,
                  templateSaveError: flow.templateSaveError,
                  themeEditorUrl: flow.themeEditorUrl,
                },
              }}
              />
            </Suspense>
          ) : null}
        </>
      }
    >
      <AdminTaskAlertBanner
        alert={flow.operationAlert}
        onDismiss={flow.clearOperationAlert}
      />
      <ConfigureValidationSummary
        activeSection={flow.activeSection}
        issues={flow.validationIssues}
      />
      {flow.activeSection === "step_setup" ? (
        <StepSetupSection
          activeSection={flow.activeSection}
          activeTabIndex={flow.activeTabIndex}
          styles={flow.fullPageBundleStyles}
          onAddStep={flow.handleAddNewStep}
          onNavigateStep={flow.navigateToStep}
          slideDir={flow.slideDir}
          slideKey={flow.slideKey}
          steps={flow.stepsState.steps}
          categoryAdapter={{
            categoryActiveTabs: flow.categoryActiveTabs,
            categoryOpen: flow.categoryOpen,
            draggedCatKey: flow.draggedCatKey,
            dragOverCatKey: flow.dragOverCatKey,
            handleCatDragEnd: flow.handleCatDragEnd,
            handleCatDragStart: flow.handleCatDragStart,
            handleCatDrop: flow.handleCatDrop,
            hidePolarisModal: flow.hidePolarisModal,
            markAsDirty: flow.markAsDirty,
            openStepCategoryMultiLanguageModal:
              flow.openStepCategoryMultiLanguageModal,
            setCategoryActiveTabs: flow.setCategoryActiveTabs,
            setCategoryOpen: flow.setCategoryOpen,
            setDragOverCatKey: flow.setDragOverCatKey,
            shopify: flow.shopify,
            showPolarisModal: flow.showPolarisModal,
            stepsState: flow.stepsState,
            styles: flow.fullPageBundleStyles,
            translationActionsDisabled: flow.shopLocales.length === 0,
            validationErrors: flow.validationErrors,
            clearValidationError: flow.clearValidationError,
          }}
          details={{
            cloneStep: flow.cloneStep,
            deleteStep: flow.deleteStep,
            markAsDirty: flow.markAsDirty,
            openTranslations: flow.openStepMultiLanguageModal,
            translationsDisabled: flow.shopLocales.length === 0,
            updateStepField: flow.stepsState.updateStepField,
            validationErrors: flow.validationErrors,
            clearValidationError: flow.clearValidationError,
          }}
          ruleMode={{
            rules: {
              addCategoryConditionRule: flow.addCategoryConditionRule,
              addStepConditionRule: flow.conditionsState.addConditionRule,
              categoryRulesOpen: flow.categoryRulesOpen,
              clearCategoryConditionRules: flow.clearCategoryConditionRules,
              clearStepConditions: flow.conditionsState.clearStepConditions,
              removeCategoryConditionRule: flow.removeCategoryConditionRule,
              removeStepConditionRule: flow.conditionsState.removeConditionRule,
              setCategoryRulesOpen: flow.setCategoryRulesOpen,
              stepConditions: flow.conditionsState.stepConditions,
              styles: flow.fullPageBundleStyles,
              updateCategoryAutoNextRule: flow.updateCategoryAutoNextRule,
              updateCategoryConditionRule: flow.updateCategoryConditionRule,
              updateStepConditionRule: flow.conditionsState.updateConditionRule,
            },
          }}
          config={{
            markAsDirty: flow.markAsDirty,
            updateStepField: flow.stepsState.updateStepField,
          }}
        />
      ) : null}
      <Suspense
        fallback={
          <AdminSectionLoadingState label={t("common.loading.workspace")} />
        }
      >
        {deferredSection === "free_gift_addons" ? (
          <FreeGiftAddonsSection
            activeSection={flow.activeSection}
            referenceStep={{
              enabled: flow.addonDraft.isPersonalizationEnabled === true,
              imageUrl: flow.addonDraft.stepImage ?? null,
              showImagePicker: flow.showIconPickerForStep === "addon-direct",
              stepName: flow.addonDraft.personalizeStepText ?? "",
              stepTitle: flow.addonDraft.personalizePageSubtext ?? "",
              styles: flow.fullPageBundleStyles,
              translationsAvailable: flow.shopLocales.length > 0,
              onEnabledChange: (enabled) => {
                if (enabled) {
                  flow.updateAddonDraft({ isPersonalizationEnabled: true });
                } else {
                  flow.setIsDisableAddonStepModalOpen(true);
                }
              },
              onImageChange: (stepImage) =>
                flow.updateAddonDraft({ stepImage }),
              onImagePickerOpenChange: (open) =>
                flow.setShowIconPickerForStep(open ? "addon-direct" : null),
              onOpenTranslations: flow.openAddonStepMultiLanguageModal,
              onStepNameChange: (personalizeStepText) =>
                flow.updateAddonDraft({ personalizeStepText }),
              onStepTitleChange: (personalizePageSubtext) =>
                flow.updateAddonDraft({ personalizePageSubtext }),
            }}
            products={{
              enabled: flow.addonDraft.addonProductsEnabled === true,
              title: flow.addonDraft.addonProductsTitle ?? "",
              translationsAvailable: flow.shopLocales.length > 0,
              styles: flow.fullPageBundleStyles,
              tierEditor: {
                activeTierIndex: flow.activeAddonTierIndex,
                tiers: addonTiers,
                styles: flow.fullPageBundleStyles,
                onActiveTierIndexChange: flow.setActiveAddonTierIndex,
                onAddProducts: (tierIndex) => {
                  void flow.handleAddonSelectedProductAdd(tierIndex);
                },
                onOpenSelectedProducts: flow.openAddonSelectedProductsModal,
                onTiersChange: (nextTiers) =>
                  flow.updateAddonDraft({ addonTiers: nextTiers }),
              },
              onEnabledChange: (addonProductsEnabled) =>
                flow.updateAddonDraft({ addonProductsEnabled }),
              onOpenTranslations: flow.openAddonSectionMultiLanguageModal,
              onTitleChange: (addonProductsTitle) =>
                flow.updateAddonDraft({ addonProductsTitle }),
            }}
            footerMessaging={{
              enabled: flow.addonDraft.addonProductsEnabled === true,
              hasTiers: addonTiers.length > 0,
              messages: addonFooterMessages,
              styles: flow.fullPageBundleStyles,
              translationsAvailable: flow.shopLocales.length > 0,
              onMessagesChange: (messages) => {
                flow.setRuleMessages((current) => ({
                  ...current,
                  [ADDON_MESSAGE_KEY]: messages,
                }));
                flow.markAsDirty();
              },
              onOpenTranslations: flow.openAddonFooterMultiLanguageModal,
              onShowVariables: () => flow.setIsAddonVariablesModalOpen(true),
            }}
          />
        ) : null}
        {deferredSection === "discount_pricing" ? (
          <DiscountPricingSection
            activeSection={flow.activeSection}
            rules={{
              pricingState: flow.pricingState,
              styles: flow.fullPageBundleStyles,
              validationErrors: flow.validationErrors,
              onDiscountMethodChange: (discountMethod) => {
                flow.pricingState.replaceDiscountMethod(discountMethod);
                flow.setRuleMessages({});
                flow.setRuleMessagesByLocale({});
                flow.setGlobalSuccessMessage("");
                flow.setSuccessMessageByLocale({});
              },
            }}
            displayOptions={{
              inactive: flow.displayOptionsInactive,
              quantity: {
                eligible: flow.bundleQuantityOptionsEligible,
                normalizedOptions:
                  flow.normalizedPricingDisplayOptions.bundleQuantityOptions
                    .options,
                pricingState: flow.pricingState,
                styles: flow.fullPageBundleStyles,
                translationsAvailable: flow.shopLocales.length > 0,
                onOpenTranslations: () =>
                  flow.setIsBundleQuantityMultiLangModalOpen(true),
              },
              progress: {
                markAsDirty: flow.markAsDirty,
                pricingState: flow.pricingState,
                setTierTextByRuleId: flow.setTierTextByRuleId,
                styles: flow.fullPageBundleStyles,
                tierTextByRuleId: flow.tierTextByRuleId,
                translationsAvailable: flow.shopLocales.length > 0,
                onOpenTranslations: () =>
                  flow.setIsProgressBarMultiLangModalOpen(true),
              },
              messaging: {
                pricingState: flow.pricingState,
                localization: {
                  activeLocale: flow.activeDiscountLocale,
                  enabled: flow.discountMessagingMultiLanguageEnabled,
                  globalSuccessMessage: flow.globalSuccessMessage,
                  locales: flow.shopLocales,
                  ruleMessagesByLocale: flow.ruleMessagesByLocale,
                  setActiveLocale: flow.setActiveDiscountLocale,
                  setEnabled: flow.setDiscountMessagingMultiLanguageEnabled,
                  setGlobalSuccessMessage: flow.setGlobalSuccessMessage,
                  setRuleMessagesByLocale: flow.setRuleMessagesByLocale,
                  setSuccessMessageByLocale: flow.setSuccessMessageByLocale,
                  successMessageByLocale: flow.successMessageByLocale,
                },
                markAsDirty: flow.markAsDirty,
                normalizedRuleMessages: flow.normalizedRuleMessages,
                styles: flow.fullPageBundleStyles,
                onShowVariables: () =>
                  flow.setIsDiscountVariablesModalOpen(true),
              },
            }}
          />
        ) : null}
        {deferredSection === "images_visibility" ? (
          <ImagesVisibilitySection
            activeSection={flow.activeSection}
            countryTargeting={{
              active: flow.activeSection === "bundle_visibility",
              state: flow.offerDeliveryState,
              onEnabledChange: flow.setCountryTargetingEnabled,
              onModeChange: flow.setCountryTargetingMode,
              onCountryCodesChange: flow.setCountryCodes,
            }}
            media={{
              activeSection: flow.activeSection,
              bundleBannerDesktopUrl: flow.bundleBannerDesktopUrl,
              bundleBannerMobileUrl: flow.bundleBannerMobileUrl,
              floatingBadgeEnabled: flow.floatingBadgeEnabled,
              floatingBadgeText: flow.floatingBadgeText,
              markAsDirty: flow.markAsDirty,
              setBundleBannerDesktopUrl: flow.setBundleBannerDesktopUrl,
              setBundleBannerMobileUrl: flow.setBundleBannerMobileUrl,
              setFloatingBadgeEnabled: flow.setFloatingBadgeEnabled,
              setFloatingBadgeText: flow.setFloatingBadgeText,
            }}
            offerOperations={{
              active: flow.activeSection === "bundle_visibility",
              state: flow.offerDeliveryState,
              onPriorityChange: flow.setOfferPriority,
              onStopLowerPriorityChange: flow.setOfferStopLowerPriority,
              onScheduleModeChange: flow.setOfferScheduleMode,
              onStartsAtChange: flow.setOfferStartsAt,
              onEndsAtChange: flow.setOfferEndsAt,
              onRecurrenceFrequencyChange: flow.setOfferRecurrenceFrequency,
              onRecurrenceAnchorDateChange: flow.setOfferRecurrenceAnchorDate,
              onRecurrenceWindowStartChange: flow.setOfferRecurrenceWindowStart,
              onRecurrenceWindowEndChange: flow.setOfferRecurrenceWindowEnd,
              onRecurrenceTerminationChange: flow.setOfferRecurrenceTermination,
              onRecurrenceEndsOnChange: flow.setOfferRecurrenceEndsOn,
              onRecurrenceRunCountChange: flow.setOfferRecurrenceRunCount,
            }}
            specificLinkOffer={{
              active: flow.activeSection === "bundle_visibility",
              busy: flow.specificLinkOfferBusy,
              generatedLink: flow.generatedSpecificLink,
              state: flow.offerDeliveryState,
              onEnabledChange: flow.setSpecificLinkOfferEnabled,
              onGenerate: flow.generateSpecificLinkOffer,
              onCopy: flow.copySpecificLinkOffer,
              onRevoke: flow.revokeSpecificLinkOffer,
            }}
            visibility={{
              activeSection: flow.activeSection,
              appEmbedEnabled: flow.appEmbedEnabled,
              bundlePageUrl: flow.bundlePageUrl,
              handleSectionChange: flow.handleSectionChange,
              openThemeEditorForAppEmbed: flow.openThemeEditorForAppEmbed,
              themeEditorUrl: flow.themeEditorUrl,
            }}
          />
        ) : null}
        {deferredSection === "bundle_settings" ? (
          <BundleSettingsSection
            activeSection={flow.activeSection}
            bundleCart={{
              fullPageBundleStyles: flow.fullPageBundleStyles,
              markAsDirty: flow.markAsDirty,
              openMultiLanguageModal: flow.openMultiLanguageModal,
              setTextOverrides: flow.setTextOverrides,
              shopLocales: flow.shopLocales,
              textOverrides: flow.textOverrides,
            }}
            css={{
              bundleLevelCss: flow.bundleLevelCss,
              bundleLevelCssExpanded: flow.bundleLevelCssExpanded,
              bundleStatus: flow.formState.bundleStatus,
              markAsDirty: flow.markAsDirty,
              setBundleLevelCss: flow.setBundleLevelCss,
              setBundleLevelCssExpanded: flow.setBundleLevelCssExpanded,
              setBundleStatus: flow.formState.setBundleStatus,
            }}
            defaultProducts={{
              clearValidationError: flow.clearValidationError,
              defaultProductsData: flow.defaultProductsData,
              markAsDirty: flow.markAsDirty,
              setDefaultProductsData: flow.setDefaultProductsData,
              validationErrors: flow.validationErrors,
            }}
            quantity={{
              activeTabIndex: flow.activeTabIndex,
              clearValidationError: flow.clearValidationError,
              maxQtyPerProduct: flow.maxQtyPerProduct,
              markAsDirty: flow.markAsDirty,
              productSlotIconUrl: flow.productSlotIconUrl,
              productSlotsEnabled: flow.productSlotsEnabled,
              quantityValidationEnabled: flow.quantityValidationEnabled,
              setMaxQtyPerProduct: flow.setMaxQtyPerProduct,
              setProductSlotIconUrl: flow.setProductSlotIconUrl,
              setProductSlotsEnabled: flow.setProductSlotsEnabled,
              setQuantityValidationEnabled: flow.setQuantityValidationEnabled,
              setShowSlotIconPicker: flow.setShowSlotIconPicker,
              showSlotIconPicker: flow.showSlotIconPicker,
              stepConditions: flow.conditionsState.stepConditions,
              steps: flow.stepsState.steps,
              validationErrors: flow.validationErrors,
            }}
            summaryText={{
              clearValidationError: flow.clearValidationError,
              countdownEnabled: flow.countdownEnabled,
              countdownExpiryAction: flow.countdownExpiryAction,
              countdownExpiredMessage: flow.countdownExpiredMessage,
              countdownLayout: flow.countdownLayout,
              countdownPosition: flow.countdownPosition,
              countdownTitle: flow.countdownTitle,
              lowStockAlertEnabled: flow.lowStockAlertEnabled,
              lowStockAlertMessage: flow.lowStockAlertMessage,
              lowStockAlertThreshold: flow.lowStockAlertThreshold,
              markAsDirty: flow.markAsDirty,
              openMultiLanguageModal: flow.openMultiLanguageModal,
              scheduledEndsAt: flow.offerDeliveryState.endsAt,
              setCountdownEnabled: flow.setCountdownEnabled,
              setCountdownExpiryAction: flow.setCountdownExpiryAction,
              setCountdownExpiredMessage: flow.setCountdownExpiredMessage,
              setCountdownLayout: flow.setCountdownLayout,
              setCountdownPosition: flow.setCountdownPosition,
              setCountdownTitle: flow.setCountdownTitle,
              setLowStockAlertEnabled: flow.setLowStockAlertEnabled,
              setLowStockAlertMessage: flow.setLowStockAlertMessage,
              setLowStockAlertThreshold: flow.setLowStockAlertThreshold,
              setShowTextOnAddButton: flow.setShowTextOnAddButton,
              setTextOverrides: flow.setTextOverrides,
              setVariantSelectorEnabled: flow.setVariantSelectorEnabled,
              shopLocales: flow.shopLocales,
              showTextOnAddButton: flow.showTextOnAddButton,
              textOverrides: flow.textOverrides,
              validationErrors: flow.validationErrors,
              variantSelectorEnabled: flow.variantSelectorEnabled,
            }}
            template={{
              handleSectionChange: flow.handleSectionChange,
              markAsDirty: flow.markAsDirty,
              setTextOverrides: flow.setTextOverrides,
              textOverrides: flow.textOverrides,
            }}
          />
        ) : null}
        {deferredSection === "subscriptions" ? (
          <BundleSubscriptionsSection
            activeSection={flow.activeSection}
            bundle={flow.bundle}
            pricingState={flow.pricingState}
            setShowSubscriptionSetupGuide={flow.setShowSubscriptionSetupGuide}
            showSubscriptionSetupGuide={flow.showSubscriptionSetupGuide}
            shopLocales={flow.shopLocales}
            stepsState={flow.stepsState}
            subscriptionConfig={flow.subscriptionConfig}
            setSubscriptionConfig={flow.setSubscriptionConfig}
            subscriptionFetcher={flow.subscriptionFetcher}
            validationErrors={flow.validationErrors}
          />
        ) : null}
        {deferredSection === "bundle_widget" ? (
          <BundleWidgetSection
            activeSection={flow.activeSection}
            widget={{
              addBrowsedProduct: flow.autoSelectBrowsedProduct,
              buttonText: flow.upsellWidgetButtonText,
              collections: flow.upsellWidgetCollectionsSelectedData,
              description: flow.upsellWidgetDescription,
              disabled: !flow.upsellWidgetEnabled,
              displayMode: flow.upsellWidgetDisplayMode,
              displayOn: flow.upsellWidgetDisplayOn,
              enabled: flow.upsellWidgetEnabled,
              imageUrl: flow.upsellWidgetImageUrl,
              multiLanguageDisabled:
                !flow.upsellWidgetEnabled ||
                isMultiLanguageActionDisabled(flow.shopLocales),
              onAddBrowsedProductChange: (checked) => {
                flow.setAutoSelectBrowsedProduct(checked);
                flow.markAsDirty();
              },
              onButtonTextChange: (value) => {
                flow.setUpsellWidgetButtonText(value);
                flow.setTextOverrides((previous) => ({
                  ...previous,
                  widgetButtonText: value,
                }));
                flow.clearValidationError("widget.buttonText");
                flow.markAsDirty();
              },
              onDescriptionChange: (value) => {
                flow.setUpsellWidgetDescription(value);
                flow.markAsDirty();
              },
              onDisplayModeChange: (value) => {
                flow.setUpsellWidgetDisplayMode(value);
                flow.markAsDirty();
              },
              onDisplayOnChange: (value) => {
                flow.setUpsellWidgetDisplayOn(value);
                flow.markAsDirty();
              },
              onEnabledChange: (checked) => {
                flow.setUpsellWidgetEnabled(checked);
                flow.markAsDirty();
              },
              onImageUrlChange: (value) => {
                flow.setUpsellWidgetImageUrl(value);
                flow.markAsDirty();
              },
              onOpenCollectionPicker: async () => {
                await flow.openVisibilityCollectionPicker("widget");
                flow.clearValidationError("widget.collections");
              },
              onOpenMultiLanguage: () =>
                flow.openMultiLanguageModal("Bundle Widget", [
                  {
                    key: "widgetTitle",
                    label: "Widget Title",
                    fallback: flow.upsellWidgetTitle,
                  },
                  {
                    key: "widgetDescription",
                    label: "Widget Description",
                    fallback: flow.upsellWidgetDescription,
                  },
                  {
                    key: "widgetButtonText",
                    label: "Widget Button Text",
                    fallback: flow.upsellWidgetButtonText,
                  },
                ]),
              onOpenProductPicker: async () => {
                await flow.openVisibilityProductPicker("widget");
                flow.clearValidationError("widget.products");
              },
              onPlaceWidget: flow.handlePlaceWidget,
              onRemoveCollection: (index) =>
                flow.removeVisibilityCollectionTarget("widget", index),
              onRemoveProduct: (index) =>
                flow.removeVisibilityProductTarget("widget", index),
              onTitleChange: (value) => {
                flow.setUpsellWidgetTitle(value);
                flow.clearValidationError("widget.title");
                flow.markAsDirty();
              },
              products: flow.upsellWidgetSelectedProducts,
              title: flow.upsellWidgetTitle,
              validationErrors: flow.validationErrors ?? {},
            }}
          />
        ) : null}
      </Suspense>
    </CommonConfigureShell>
  );
}

export default ConfigureBundleFlow;
