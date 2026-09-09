import { PpbDiscountLanguageModals } from "./PpbDiscountLanguageModals";
import { PpbOverlayModals } from "./PpbOverlayModals";
import { PpbPageSelectionModal } from "./PpbPageSelectionModal";
import { PpbSelectTemplateDialog } from "./PpbSelectTemplateDialog";
import { PpbSelectedItemsModals } from "./PpbSelectedItemsModals";
import { PpbUtilityModals } from "./PpbUtilityModals";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export function PpbConfigureOverlays({ flow }: { flow: PpbConfigureFlow }) {
  return (
    <>
      <PpbPageSelectionModal
        availablePages={flow.availablePages}
        closePageSelectionModal={flow.closePageSelectionModal}
        handlePageSelection={flow.handlePageSelection}
        isPageSelectionModalOpen={flow.isPageSelectionModalOpen}
      />
      <PpbSelectedItemsModals
        closeDiscardModal={flow.closeDiscardModal}
        collectionsModalRef={flow.collectionsModalRef}
        currentModalStepId={flow.currentModalStepId}
        handleCloseCollectionsModal={flow.handleCloseCollectionsModal}
        handleCloseProductsModal={flow.handleCloseProductsModal}
        handleConfirmDiscard={flow.handleConfirmDiscard}
        openProductInAdmin={flow.openProductInAdmin}
        productsModalRef={flow.productsModalRef}
        selectedCollections={flow.selectedCollections}
        showDiscardModal={flow.showDiscardModal}
        stepsState={flow.stepsState}
      />
      <PpbSelectTemplateDialog
        closeSelectTemplateDialog={flow.closeSelectTemplateDialog}
        handleTemplateNext={flow.handleTemplateNext}
        handleTemplatePreview={flow.handleTemplatePreview}
        isPreviewBundleLoading={flow.isPreviewBundleLoading}
        isSelectTemplateModalOpen={flow.isSelectTemplateModalOpen}
        pendingDesignPresetId={flow.pendingDesignPresetId}
        pendingDesignTemplate={flow.pendingDesignTemplate}
        setPendingDesignPresetId={flow.setPendingDesignPresetId}
        setPendingDesignTemplate={flow.setPendingDesignTemplate}
        setTemplateModalStep={flow.setTemplateModalStep}
        templateFetcher={flow.templateFetcher}
        templateModalStep={flow.templateModalStep}
        templateSaveError={flow.templateSaveError}
        themeEditorUrl={flow.themeEditorUrl}
      />
      <PpbUtilityModals
        discountVariablesModalRef={flow.discountVariablesModalRef}
        fetcher={flow.fetcher}
        handleSyncBundleConfirm={flow.handleSyncBundleConfirm}
        setIsSyncModalOpen={flow.setIsSyncModalOpen}
        syncModalRef={flow.syncModalRef}
        templateVariablesModalRef={flow.templateVariablesModalRef}
      />
      <PpbDiscountLanguageModals
        activeBundleQuantityLocale={flow.activeBundleQuantityLocale}
        activeProgressBarLocale={flow.activeProgressBarLocale}
        isBundleQuantityMultiLangModalOpen={
          flow.isBundleQuantityMultiLangModalOpen
        }
        isProgressBarMultiLangModalOpen={flow.isProgressBarMultiLangModalOpen}
        markAsDirty={flow.markAsDirty}
        pricingState={flow.pricingState}
        qtyRuleLabels={flow.qtyRuleLabels}
        qtyRuleSubtexts={flow.qtyRuleSubtexts}
        qtyRuleTextsByLocaleByRuleId={flow.qtyRuleTextsByLocaleByRuleId}
        setActiveBundleQuantityLocale={flow.setActiveBundleQuantityLocale}
        setActiveProgressBarLocale={flow.setActiveProgressBarLocale}
        setIsBundleQuantityMultiLangModalOpen={
          flow.setIsBundleQuantityMultiLangModalOpen
        }
        setIsProgressBarMultiLangModalOpen={
          flow.setIsProgressBarMultiLangModalOpen
        }
        setQtyRuleTextsByLocaleByRuleId={
          flow.setQtyRuleTextsByLocaleByRuleId
        }
        setTierTextByLocaleByRuleId={flow.setTierTextByLocaleByRuleId}
        shopLocales={flow.shopLocales}
        tierTextByLocaleByRuleId={flow.tierTextByLocaleByRuleId}
        tierTextByRuleId={flow.tierTextByRuleId}
      />
      <PpbOverlayModals
        activeMultiLanguageValues={flow.activeMultiLanguageValues}
        enablePreviewGate={flow.enablePreviewGate}
        handleGuidedTourStepChange={flow.handleGuidedTourStepChange}
        handleReadinessItemClick={flow.handleReadinessItemClick}
        isMultiLanguageModalOpen={flow.isMultiLanguageModalOpen}
        loaderData={flow.loaderData}
        multiLanguageFields={flow.multiLanguageFields}
        multiLanguageTitle={flow.multiLanguageTitle}
        readinessItems={flow.readinessItems}
        readinessOpen={flow.readinessOpen}
        saveStepSetupMultiLanguageValues={
          flow.saveStepSetupMultiLanguageValues
        }
        setIsMultiLanguageModalOpen={flow.setIsMultiLanguageModalOpen}
        setReadinessOpen={flow.setReadinessOpen}
        setTextOverridesLocale={flow.setTextOverridesLocale}
        shop={flow.shop}
        shopLocales={flow.shopLocales}
        textOverridesLocale={flow.textOverridesLocale}
      />
    </>
  );
}
