import { useEffect, useRef } from "react";
import {
  resolveTemplateReadyStep,
  shouldProcessTemplateResponse,
} from "../../../lib/template-ready-step";
import { removeLegacyPpbEmbedTextOverrides } from "../../../lib/ppb-bundle-embed";
import { i18n } from "../../../i18n/config";
import {
  isPersistentAdminOperationError,
  showAdminTransientErrorToast,
} from "../../../lib/admin-alert-feedback";
import { getEntitlementAlertCopyKeys } from "../../../lib/subscriptions/alerts";

export function usePpbFetcherEffects({
  base,
  visibility,
  settings,
  templateState,
  sharedHandlers,
  saveHandlers,
}: {
  base: any;
  visibility: any;
  settings: any;
  templateState: any;
  sharedHandlers: any;
  saveHandlers: any;
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
          base.originalLoadingGifRef.current = base.loadingGif;
          base.originalShowProductPricesRef.current = base.showProductPrices;
          base.originalCartRedirectToCheckoutRef.current =
            base.cartRedirectToCheckout;
          base.originalAllowQuantityChangesRef.current =
            base.allowQuantityChanges;
          base.originalSdkModeRef.current = base.sdkMode;
          base.originalSubscriptionConfigRef.current =
            base.subscriptionConfig;
          const canonicalTextOverrides =
            removeLegacyPpbEmbedTextOverrides(base.textOverrides);
          const canonicalTextOverridesByLocale = Object.fromEntries(
            Object.entries(base.textOverridesByLocale).map(
              ([locale, values]: any) => [
                locale,
                removeLegacyPpbEmbedTextOverrides(
                  values as Record<string, string>,
                ),
              ],
            ),
          );
          base.setTextOverrides(canonicalTextOverrides);
          base.setTextOverridesByLocale(canonicalTextOverridesByLocale);
          base.originalTextOverridesRef.current = canonicalTextOverrides;
          base.originalTextOverridesByLocaleRef.current =
            canonicalTextOverridesByLocale;
          settings.originalDefaultProductsDataRef.current =
            settings.defaultProductsData;
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
