import { useEffect, useRef } from "react";
import {
  resolveTemplateReadyStep,
  shouldProcessTemplateResponse,
} from "../../../lib/template-ready-step";
import { i18n } from "../../../i18n/config";
import {
  isPersistentAdminOperationError,
  showAdminTransientErrorToast,
} from "../../../lib/admin-alert-feedback";
import { getEntitlementAlertCopyKeys } from "../../../lib/subscriptions/alerts";
import type { usePpbBaseConfigureState } from "./usePpbBaseConfigureState";
import type { usePpbVisibilityState } from "./usePpbVisibilityState";
import type { usePpbBundleSettingsState } from "./usePpbBundleSettingsState";
import type { usePpbTemplateUiState } from "./usePpbTemplateUiState";
import type { useSharedBundleHandlers } from "../../../hooks/useSharedBundleHandlers";
import type { usePpbSaveHandlers } from "./usePpbSaveHandlers";

export function usePpbFetcherEffects({
  base,
  visibility,
  settings,
  templateState,
  sharedHandlers,
  saveHandlers,
}: {
  base: Pick<ReturnType<typeof usePpbBaseConfigureState>,
    | "allowQuantityChanges" | "appEmbedEnabled" | "cartRedirectToCheckout"
    | "clearOperationAlert" | "fetcher" | "lastProcessedFetcherDataRef"
    | "markAsSaved" | "markSpecificLinkOfferSaved" | "openPageSelectionModal"
    | "originalAllowQuantityChangesRef" | "originalCartRedirectToCheckoutRef"
    | "originalSdkModeRef" | "originalShowProductPricesRef"
    | "originalSubscriptionConfigRef" | "originalTextOverridesByLocaleRef"
    | "originalTextOverridesRef" | "revalidator" | "sdkMode" | "setAvailablePages"
    | "setIsLoadingPages" | "setOperationAlert" | "shopify" | "showProductPrices"
    | "subscriptionConfig" | "textOverrides" | "textOverridesByLocale"
  >;
  visibility: Pick<ReturnType<typeof usePpbVisibilityState>,
    | "autoSelectBrowsedProduct" | "bundleEmbedAddBrowsedProduct"
    | "bundleEmbedCollectionsSelectedData" | "bundleEmbedDisplayOn" | "bundleEmbedEnabled"
    | "bundleEmbedMultiLangText" | "bundleEmbedSelectedProducts"
    | "bundleEmbedSpecificCollectionPages" | "bundleEmbedSpecificProductPages"
    | "bundleEmbedSubTitle" | "bundleEmbedTitle" | "originalAutoSelectBrowsedProductRef"
    | "originalBundleEmbedAddBrowsedProductRef" | "originalBundleEmbedCollectionsSelectedDataRef"
    | "originalBundleEmbedDisplayOnRef" | "originalBundleEmbedEnabledRef"
    | "originalBundleEmbedMultiLangTextRef" | "originalBundleEmbedSelectedProductsRef"
    | "originalBundleEmbedSpecificCollectionPagesRef" | "originalBundleEmbedSpecificProductPagesRef"
    | "originalBundleEmbedSubTitleRef" | "originalBundleEmbedTitleRef"
    | "originalUpsellWidgetButtonTextRef" | "originalUpsellWidgetDescriptionRef"
    | "originalUpsellWidgetDisplayModeRef" | "originalUpsellWidgetDisplayOnRef"
    | "originalUpsellWidgetEnabledRef" | "originalUpsellWidgetImageUrlRef"
    | "originalUpsellWidgetTitleRef" | "upsellWidgetButtonText" | "upsellWidgetDescription"
    | "upsellWidgetDisplayMode" | "upsellWidgetDisplayOn" | "upsellWidgetEnabled"
    | "upsellWidgetImageUrl" | "upsellWidgetTitle"
  >;
  settings: Pick<ReturnType<typeof usePpbBundleSettingsState>,
    | "countdownEnabled" | "countdownExpiredMessage" | "countdownExpiryAction"
    | "countdownLayout" | "countdownPosition" | "countdownTitle" | "defaultProductsData"
    | "lowStockAlertEnabled" | "lowStockAlertMessage" | "lowStockAlertThreshold"
    | "originalCountdownEnabledRef" | "originalCountdownExpiredMessageRef"
    | "originalCountdownExpiryActionRef" | "originalCountdownLayoutRef"
    | "originalCountdownPositionRef" | "originalCountdownTitleRef"
    | "originalDefaultProductsDataRef" | "originalLowStockAlertEnabledRef"
    | "originalLowStockAlertMessageRef" | "originalLowStockAlertThresholdRef"
    | "originalStickyAddToCartActionRef" | "originalStickyAddToCartEnabledRef"
    | "originalStickyAddToCartShowDesktopRef" | "originalStickyAddToCartShowMobileRef"
    | "stickyAddToCartAction" | "stickyAddToCartEnabled" | "stickyAddToCartShowDesktop"
    | "stickyAddToCartShowMobile"
  >;
  templateState: Pick<ReturnType<typeof usePpbTemplateUiState>,
    | "lastTemplateRequestRef" | "lastTemplateResponseRef" | "pendingPlacementModalRef"
    | "setBundleDesignPresetId" | "setBundleDesignTemplate"
    | "setIsPreparingPlacementTemplates" | "setTemplateModalStep" | "setTemplateSaveError"
    | "templateFetcher" | "templateSubmissionStartedRef"
  >;
  sharedHandlers: Pick<ReturnType<typeof useSharedBundleHandlers>,
    "enhanceTemplateListWithUserSelection"
  >;
  saveHandlers: Pick<ReturnType<typeof usePpbSaveHandlers>,
    "clearValidationErrors" | "setServerFieldErrors"
  >;
}) {
  const { fetcher } = base;
  const lastFetcherIntentRef = useRef<string | null>(null);
  const {
    templateFetcher,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    templateSubmissionStartedRef,
  } = templateState;

  useEffect(() => {
    const submittedIntent = fetcher.formData?.get("intent");
    if (typeof submittedIntent === "string") {
      lastFetcherIntentRef.current = submittedIntent;
    }
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data === base.lastProcessedFetcherDataRef.current) {
        return;
      }
      base.lastProcessedFetcherDataRef.current = fetcher.data;
      const result = fetcher.data;
      const requestIntent = lastFetcherIntentRef.current;
      lastFetcherIntentRef.current = null;
      if (result.success) {
        saveHandlers.clearValidationErrors?.();
        if ("bundle" in result && result.bundle) {
          base.originalShowProductPricesRef.current = base.showProductPrices;
          base.originalCartRedirectToCheckoutRef.current =
            base.cartRedirectToCheckout;
          base.originalAllowQuantityChangesRef.current =
            base.allowQuantityChanges;
          base.originalSdkModeRef.current = base.sdkMode;
          base.originalSubscriptionConfigRef.current =
            base.subscriptionConfig;
          base.originalTextOverridesRef.current = base.textOverrides;
          base.originalTextOverridesByLocaleRef.current =
            base.textOverridesByLocale;
          settings.originalDefaultProductsDataRef.current =
            settings.defaultProductsData;
          settings.originalLowStockAlertEnabledRef.current =
            settings.lowStockAlertEnabled;
          settings.originalLowStockAlertThresholdRef.current =
            settings.lowStockAlertThreshold;
          settings.originalLowStockAlertMessageRef.current =
            settings.lowStockAlertMessage;
          settings.originalCountdownEnabledRef.current =
            settings.countdownEnabled;
          settings.originalCountdownLayoutRef.current =
            settings.countdownLayout;
          settings.originalCountdownPositionRef.current =
            settings.countdownPosition;
          settings.originalCountdownTitleRef.current = settings.countdownTitle;
          settings.originalCountdownExpiryActionRef.current =
            settings.countdownExpiryAction;
          settings.originalCountdownExpiredMessageRef.current =
            settings.countdownExpiredMessage;
          settings.originalStickyAddToCartEnabledRef.current =
            settings.stickyAddToCartEnabled;
          settings.originalStickyAddToCartShowDesktopRef.current =
            settings.stickyAddToCartShowDesktop;
          settings.originalStickyAddToCartShowMobileRef.current =
            settings.stickyAddToCartShowMobile;
          settings.originalStickyAddToCartActionRef.current =
            settings.stickyAddToCartAction;
          visibility.originalUpsellWidgetEnabledRef.current =
            visibility.upsellWidgetEnabled;
          visibility.originalUpsellWidgetDisplayModeRef.current =
            visibility.upsellWidgetDisplayMode;
          visibility.originalUpsellWidgetDisplayOnRef.current =
            visibility.upsellWidgetDisplayOn;
          visibility.originalUpsellWidgetTitleRef.current =
            visibility.upsellWidgetTitle;
          visibility.originalUpsellWidgetDescriptionRef.current =
            visibility.upsellWidgetDescription;
          visibility.originalUpsellWidgetButtonTextRef.current =
            visibility.upsellWidgetButtonText;
          visibility.originalUpsellWidgetImageUrlRef.current =
            visibility.upsellWidgetImageUrl;
          visibility.originalAutoSelectBrowsedProductRef.current =
            visibility.autoSelectBrowsedProduct;
          visibility.originalBundleEmbedEnabledRef.current =
            visibility.bundleEmbedEnabled;
          visibility.originalBundleEmbedTitleRef.current =
            visibility.bundleEmbedTitle;
          visibility.originalBundleEmbedSubTitleRef.current =
            visibility.bundleEmbedSubTitle;
          visibility.originalBundleEmbedDisplayOnRef.current =
            visibility.bundleEmbedDisplayOn;
          visibility.originalBundleEmbedAddBrowsedProductRef.current =
            visibility.bundleEmbedAddBrowsedProduct;
          visibility.originalBundleEmbedSelectedProductsRef.current =
            visibility.bundleEmbedSelectedProducts;
          visibility.originalBundleEmbedSpecificProductPagesRef.current =
            visibility.bundleEmbedSpecificProductPages;
          visibility.originalBundleEmbedCollectionsSelectedDataRef.current =
            visibility.bundleEmbedCollectionsSelectedData;
          visibility.originalBundleEmbedSpecificCollectionPagesRef.current =
            visibility.bundleEmbedSpecificCollectionPages;
          visibility.originalBundleEmbedMultiLangTextRef.current =
            visibility.bundleEmbedMultiLangText;
          base.markSpecificLinkOfferSaved();
          base.markAsSaved();
          base.clearOperationAlert();
          base.shopify.toast.show(i18n.t("common.success.changesSaved"), { isError: false });
        } else if ("productId" in result && result.productId) {
          base.clearOperationAlert();
          base.shopify.toast.show(i18n.t("common.success.productSynced"), { isError: false });
        } else if ("templates" in result && result.templates) {
          const rawTemplates = (result as any).templates || [];
          const enhancedTemplates =
            sharedHandlers.enhanceTemplateListWithUserSelection(rawTemplates);
          base.setAvailablePages(enhancedTemplates);
          base.setIsLoadingPages(false);
          templateState.setIsPreparingPlacementTemplates(false);
          if (templateState.pendingPlacementModalRef.current) {
            templateState.pendingPlacementModalRef.current = false;
            base.openPageSelectionModal();
          }
        } else if ("themeId" in result && result.themeId) {
          // Handled by individual callbacks.
        } else if ("synced" in result && result.synced) {
          base.clearOperationAlert();
          base.shopify.toast.show(i18n.t("common.success.bundleSynced"), { isError: false });
          base.revalidator.revalidate();
        } else {
          base.clearOperationAlert();
          base.shopify.toast.show(i18n.t("common.success.operationComplete"), { isError: false });
        }
      } else {
        if (Array.isArray((result as any).fieldErrors)) {
          saveHandlers.setServerFieldErrors?.((result as any).fieldErrors);
          return;
        }
        const errorMessage =
          ("error" in result ? result.error : null) ?? "";
        if (isPersistentAdminOperationError(requestIntent)) {
          const alertCopy = getEntitlementAlertCopyKeys(
            (result as any).entitlementFailure?.code,
          );
          base.setOperationAlert({
            id: "bundle-save",
            heading: i18n.t(alertCopy.heading),
            message: i18n.t(alertCopy.message),
          });
        } else {
          showAdminTransientErrorToast(
            base.shopify,
            i18n.t("common.alerts.operationFailed"),
          );
        }
        if (
          errorMessage.includes("pages") ||
          errorMessage.includes("templates")
        ) {
          base.setIsLoadingPages(false);
          templateState.setIsPreparingPlacementTemplates(false);
          templateState.pendingPlacementModalRef.current = false;
        }
      }
    }
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (!lastTemplateRequestRef.current) {
      return;
    }
    if (templateFetcher.state !== "idle") {
      templateSubmissionStartedRef.current = true;
      return;
    }
    if (
      !shouldProcessTemplateResponse({
        fetcherState: templateFetcher.state,
        hasRequest: true,
        submissionStarted: templateSubmissionStartedRef.current,
      })
    ) {
      return;
    }
    if (templateFetcher.data === null || templateFetcher.data === undefined) {
      templateState.setTemplateSaveError(
        "Unable to save template. Please try again.",
      );
      templateState.setTemplateModalStep("templates");
      lastTemplateRequestRef.current = null;
      templateSubmissionStartedRef.current = false;
      return;
    }
    if (templateFetcher.data === lastTemplateResponseRef.current) {
      return;
    }
    lastTemplateResponseRef.current = templateFetcher.data;
    const response = templateFetcher.data as {
      success?: boolean;
      error?: string;
    };
    const request = lastTemplateRequestRef.current;
    if (response.success) {
      if (request) {
        templateState.setBundleDesignTemplate(request.template);
        templateState.setBundleDesignPresetId(request.presetId);
        templateState.setTemplateModalStep(
          resolveTemplateReadyStep(base.appEmbedEnabled),
        );
      }
      templateState.setTemplateSaveError(null);
      lastTemplateRequestRef.current = null;
      templateSubmissionStartedRef.current = false;
      return;
    }
    const errorMessage = response.error || "Failed to save template settings.";
    templateState.setTemplateModalStep("templates");
    templateState.setTemplateSaveError(errorMessage);
    lastTemplateRequestRef.current = null;
    templateSubmissionStartedRef.current = false;
  }, [
    base.appEmbedEnabled,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    templateSubmissionStartedRef,
    templateFetcher.data,
    templateFetcher.formData,
    templateFetcher.state,
    templateState,
  ]);
}
