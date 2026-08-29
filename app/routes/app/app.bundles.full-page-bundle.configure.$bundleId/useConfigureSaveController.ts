import { useCallback, useEffect, useRef } from "react";
import { AppLogger } from "../../../lib/logger";
import { serializePricingDisplayOptions } from "../../../lib/pricing-display-options";
import { markBundlePreviewComplete } from "../../../lib/bundle-preview-readiness";
import { resolveFpbProductSlotsEnabled } from "../../../lib/fpb-product-slots-availability";
import { ADDON_MESSAGE_KEY } from "./configure-constants";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";
import { serializeFpbSaveSteps } from "./fpb-save-transport";
import { useConfigureValidation } from "../_shared/bundle-configure/useConfigureValidation";
import { i18n } from "../../../i18n/config";
import {
  isPersistentAdminOperationError,
  showAdminTransientErrorToast,
} from "../../../lib/admin-alert-feedback";
import { getEntitlementAlertCopyKeys } from "../../../lib/subscriptions/alerts";

export function useConfigureSaveController(flow: ConfigureBundleFlowDraft) {
  const lastFetcherIntentRef = useRef<string | null>(null);
  const validation = useConfigureValidation({
    kind: "fpb",
    setActiveSection: flow.setActiveSection,
    revealIssue: (validationIssue) => {
      if (!validationIssue.stepId) return;
      const stepIndex = flow.stepsState.steps.findIndex(
        (step: any) => String(step.id) === validationIssue.stepId,
      );
      if (stepIndex >= 0) flow.setActiveTabIndex(stepIndex);
      if (validationIssue.categoryId) {
        const key = `${validationIssue.stepId}__${validationIssue.categoryId}`;
        flow.setCategoryOpen((current: Record<string, boolean>) => ({
          ...current,
          [key]: true,
        }));
      }
    },
  });
  const buildDefaultProductsData = useCallback(() => {
    return flow.normalizeDefaultProductsData(flow.defaultProductsData);
  }, [flow]);
  const closeDiscardModal = useCallback(() => {
    flow.setShowDiscardModal(false);
  }, [flow]);
  const handleSave = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("intent", "saveBundle");
      formData.append("bundleName", flow.formState.bundleName);
      formData.append("bundleDescription", flow.formState.bundleDescription);
      formData.append("templateName", flow.formState.templateName);
      formData.append("bundleStatus", flow.formState.bundleStatus);
      const pricingMessages = serializePricingDisplayOptions({
        existingMessages: {
          showDiscountMessaging: flow.pricingState.discountMessagingEnabled,
          ruleMessages: flow.normalizedRuleMessages,
        },
        options: flow.normalizedPricingDisplayOptions,
      });
      formData.append(
        "stepsData",
        JSON.stringify(
          serializeFpbSaveSteps(flow.stepsState.steps, flow.selectedCollections),
        ),
      );
      const enrichedRuleMessages = Object.fromEntries(
        Object.entries(flow.normalizedRuleMessages).map(([id, msg]: any) => [
          id,
          {
            ...msg,
            successMessage: flow.globalSuccessMessage || msg.successMessage,
          },
        ]),
      );
      formData.append(
        "discountData",
        JSON.stringify({
          discountEnabled: flow.pricingState.discountEnabled,
          discountType: flow.pricingState.discountType,
          discountRules: flow.pricingState.discountRules,
          showFooter: flow.pricingState.showFooter,
          showDiscountProgressBar: flow.pricingState.showDiscountProgressBar,
          discountMessagingEnabled: flow.pricingState.discountMessagingEnabled,
          ruleMessages: enrichedRuleMessages,
          successMessage: flow.globalSuccessMessage,
          successMessageByLocale: flow.discountMessagingMultiLanguageEnabled
            ? flow.successMessageByLocale
            : null,
          pricingDisplayOptions: pricingMessages.displayOptions,
          discountMessagingMultiLanguageEnabled:
            flow.discountMessagingMultiLanguageEnabled,
          ruleMessagesByLocale: flow.discountMessagingMultiLanguageEnabled
            ? flow.ruleMessagesByLocale
            : null,
          tierTextByRuleId:
            Object.keys(flow.tierTextByRuleId).length > 0
              ? flow.tierTextByRuleId
              : null,
          tierTextByLocaleByRuleId:
            Object.keys(flow.tierTextByLocaleByRuleId).length > 0
              ? flow.tierTextByLocaleByRuleId
              : null,
        }),
      );
      formData.append(
        "stepConditions",
        JSON.stringify(flow.conditionsState.stepConditions),
      );
      formData.append("bundleProduct", JSON.stringify(flow.bundleProduct));
      formData.append(
        "bundleSubscriptionConfig",
        JSON.stringify(flow.subscriptionConfig),
      );
      formData.append("promoBannerBgImage", flow.promoBannerBgImage ?? "");
      formData.append("loadingGif", flow.loadingGif ?? "");
      formData.append(
        "floatingBadgeEnabled",
        String(flow.floatingBadgeEnabled),
      );
      formData.append("floatingBadgeText", flow.floatingBadgeText);
      formData.append("showProductPrices", String(flow.showProductPrices));
      formData.append(
        "cartRedirectToCheckout",
        String(flow.cartRedirectToCheckout),
      );
      formData.append(
        "allowQuantityChanges",
        String(flow.allowQuantityChanges),
      );
      formData.append("searchBarEnabled", String(flow.searchBarEnabled));
      formData.append(
        "variantSelectorEnabled",
        String(flow.variantSelectorEnabled),
      );
      formData.append(
        "showTextOnAddButton",
        String(flow.showTextOnAddButton),
      );
      formData.append(
        "textOverrides",
        Object.keys(flow.textOverrides).length > 0
          ? JSON.stringify(flow.textOverrides)
          : "",
      );
      formData.append(
        "textOverridesByLocale",
        Object.keys(flow.textOverridesByLocale).length > 0
          ? JSON.stringify(flow.textOverridesByLocale)
          : "",
      );
      formData.append(
        "bundleTextConfig",
        JSON.stringify({
          bundleSummary: {
            title: flow.textOverrides.yourBundle ?? "",
            subTitle: flow.textOverrides.reviewBundle ?? "",
          },
        }),
      );
      const addonMessages = flow.ruleMessages[ADDON_MESSAGE_KEY] || null;
      const personalizationData = flow.buildPersonalizationDataFromDraft(
        flow.addonDraft,
        addonMessages,
      );
      formData.append(
        "personalizationData",
        personalizationData ? JSON.stringify(personalizationData) : "",
      );
      formData.append("validationAddonDraft", JSON.stringify(flow.addonDraft));
      formData.append(
        "bundleUpsellConfig",
        JSON.stringify(flow.buildBundleUpsellConfig()),
      );
      formData.append("upsellWidgetEnabled", String(flow.upsellWidgetEnabled));
      formData.append("upsellWidgetDisplayMode", flow.upsellWidgetDisplayMode);
      formData.append("upsellWidgetDisplayOn", flow.upsellWidgetDisplayOn);
      formData.append(
        "autoSelectBrowsedProduct",
        String(flow.autoSelectBrowsedProduct),
      );
      formData.append("bundleBannerDesktopUrl", flow.bundleBannerDesktopUrl);
      formData.append("bundleBannerMobileUrl", flow.bundleBannerMobileUrl);
      formData.append("bundleLevelCss", flow.bundleLevelCss);
      formData.append(
        "productSlotsEnabled",
        String(
          resolveFpbProductSlotsEnabled(
            flow.productSlotsEnabled,
            flow.stepsState.steps,
            flow.conditionsState.stepConditions,
          ),
        ),
      );
      formData.append("maxQtyPerProduct", flow.maxQtyPerProduct);
      formData.append("productSlotIconUrl", flow.productSlotIconUrl);
      formData.append(
        "validateQuantityPerProduct",
        JSON.stringify({
          isEnabled: flow.quantityValidationEnabled,
          allowedQuantity:
            Number.parseInt(flow.maxQtyPerProduct || "1", 10) || 1,
        }),
      );
      formData.append(
        "defaultProductsData",
        JSON.stringify(buildDefaultProductsData()),
      );
      validation.validateConfigureForm(formData, (validFormData) => {
        flow.fetcher.submit(validFormData, { method: "post" });
      });
      return;
    } catch (error: any) {
      AppLogger.error("Save failed:", {}, error as any);
      flow.setOperationAlert({
        id: "bundle-save",
        heading: i18n.t("common.alerts.bundleNotSaved"),
        message: "Review the bundle and try again.",
      });
    }
  }, [buildDefaultProductsData, flow, validation]);

  useEffect(() => {
    const submittedIntent = flow.fetcher.formData?.get("intent");
    if (typeof submittedIntent === "string") {
      lastFetcherIntentRef.current = submittedIntent;
    }
    if (flow.fetcher.data && flow.fetcher.state === "idle") {
      if (flow.fetcher.data === flow.lastProcessedFetcherDataRef.current) {
        return;
      }
      flow.lastProcessedFetcherDataRef.current = flow.fetcher.data;
      const result = flow.fetcher.data;
      const requestIntent = lastFetcherIntentRef.current;
      lastFetcherIntentRef.current = null;
      if (result.success) {
        validation.clearValidationErrors();
        if ("bundle" in result && result.bundle) {
          flow.originalValuesRef.current = {
            status: flow.formState.bundleStatus,
            name: flow.formState.bundleName,
            description: flow.formState.bundleDescription,
            templateName: flow.formState.templateName,
            steps: JSON.stringify(flow.stepsState.steps),
            discountEnabled: flow.pricingState.discountEnabled,
            discountType: flow.pricingState.discountType,
            discountRules: JSON.stringify(flow.pricingState.discountRules),
            showFooter: flow.pricingState.showFooter,
            showDiscountProgressBar: flow.pricingState.showDiscountProgressBar,
            discountMessagingEnabled:
              flow.pricingState.discountMessagingEnabled,
            pricingDisplayOptions: JSON.stringify(
              flow.pricingState.pricingDisplayOptions,
            ),
            selectedCollections: JSON.stringify(flow.selectedCollections),
            ruleMessages: JSON.stringify(flow.normalizedRuleMessages),
            stepConditions: JSON.stringify(flow.conditionsState.stepConditions),
            bundleProduct: flow.bundleProduct || null,
            productStatus: flow.productStatus,
          };
          flow.originalPromoBannerBgImageRef.current = flow.promoBannerBgImage;
          flow.originalLoadingGifRef.current = flow.loadingGif;
          flow.originalShowStepTimelineRef.current = flow.showStepTimeline;
          flow.originalFloatingBadgeEnabledRef.current =
            flow.floatingBadgeEnabled;
          flow.originalFloatingBadgeTextRef.current = flow.floatingBadgeText;
          flow.originalSearchBarEnabledRef.current = flow.searchBarEnabled;
          flow.originalShowProductPricesRef.current = flow.showProductPrices;
          flow.originalCartRedirectToCheckoutRef.current =
            flow.cartRedirectToCheckout;
          flow.originalAllowQuantityChangesRef.current =
            flow.allowQuantityChanges;
          flow.originalTextOverridesRef.current = flow.textOverrides;
          flow.originalTextOverridesByLocaleRef.current =
            flow.textOverridesByLocale;
          flow.originalAddonDraftRef.current = flow.addonDraft;
          flow.originalDiscountMessagingMultiLanguageEnabledRef.current =
            flow.discountMessagingMultiLanguageEnabled;
          flow.originalRuleMessagesByLocaleRef.current =
            flow.ruleMessagesByLocale;
          flow.originalUpsellWidgetEnabledRef.current =
            flow.upsellWidgetEnabled;
          flow.originalUpsellWidgetDisplayModeRef.current =
            flow.upsellWidgetDisplayMode;
          flow.originalUpsellWidgetDisplayOnRef.current =
            flow.upsellWidgetDisplayOn;
          flow.originalUpsellWidgetButtonTextRef.current =
            flow.upsellWidgetButtonText;
          flow.originalAutoSelectBrowsedProductRef.current =
            flow.autoSelectBrowsedProduct;
          flow.originalSubscriptionConfigRef.current =
            flow.subscriptionConfig;
          flow.setIsDirty(false);
          flow.clearOperationAlert();
          flow.shopify.toast.show(i18n.t("common.success.changesSaved"), { isError: false });
        } else if ("productId" in result && result.productId) {
          flow.clearOperationAlert();
          flow.shopify.toast.show(i18n.t("common.success.productSynced"), { isError: false });
        } else if ("themeId" in result && result.themeId) {
          // No-op: handled by individual callbacks.
        } else if (
          "shareablePreviewUrl" in result &&
          result.shareablePreviewUrl
        ) {
          window.open(result.shareablePreviewUrl as string, "_blank");
          markBundlePreviewComplete({
            bundleId: flow.bundle.id,
            storage: window.localStorage,
            setHasPreview: flow.setHasPreview,
          });
          flow.finishPreviewBundleLoading?.();
          flow.revalidator.revalidate();
          flow.clearOperationAlert();
          flow.shopify.toast.show(i18n.t("common.success.previewOpened"));
        } else if ("synced" in result && result.synced) {
          flow.clearOperationAlert();
          flow.shopify.toast.show(i18n.t("common.success.bundleSynced"), { isError: false });
          flow.revalidator.revalidate();
          const syncInstallLink = (result as any).widgetInstallationLink;
          if (syncInstallLink) {
            setTimeout(() => window.open(syncInstallLink, "_blank"), 800);
          }
        } else {
          flow.clearOperationAlert();
          flow.shopify.toast.show(i18n.t("common.success.operationComplete"), { isError: false });
        }
      } else {
        if (Array.isArray((result as any).fieldErrors)) {
          validation.setServerFieldErrors((result as any).fieldErrors);
          flow.finishPreviewBundleLoading?.();
          return;
        }
        if (isPersistentAdminOperationError(requestIntent)) {
          const alertCopy = getEntitlementAlertCopyKeys(
            (result as any).entitlementFailure?.code,
          );
          flow.setOperationAlert({
            id: "bundle-save",
            heading: i18n.t(alertCopy.heading),
            message: i18n.t(alertCopy.message),
          });
        } else {
          showAdminTransientErrorToast(
            flow.shopify,
            i18n.t("common.alerts.operationFailed"),
          );
        }
        flow.finishPreviewBundleLoading?.();
      }
    }
  }, [flow]);

  const handleDiscard = useCallback(() => {
    flow.hookHandleDiscard();
    flow.setPromoBannerBgImage(flow.originalPromoBannerBgImageRef.current);
    flow.setLoadingGif(flow.originalLoadingGifRef.current);
    flow.setShowStepTimeline(flow.originalShowStepTimelineRef.current);
    flow.setFloatingBadgeEnabled(flow.originalFloatingBadgeEnabledRef.current);
    flow.setFloatingBadgeText(flow.originalFloatingBadgeTextRef.current);
    flow.setSearchBarEnabled(flow.originalSearchBarEnabledRef.current);
    flow.setShowProductPrices(flow.originalShowProductPricesRef.current);
    flow.setCartRedirectToCheckout(
      flow.originalCartRedirectToCheckoutRef.current,
    );
    flow.setAllowQuantityChanges(flow.originalAllowQuantityChangesRef.current);
    flow.setTextOverrides(flow.originalTextOverridesRef.current);
    flow.setTextOverridesByLocale(
      flow.originalTextOverridesByLocaleRef.current,
    );
    flow.setAddonDraft(flow.originalAddonDraftRef.current);
    flow.setDiscountMessagingMultiLanguageEnabled(
      flow.originalDiscountMessagingMultiLanguageEnabledRef.current,
    );
    flow.setRuleMessagesByLocale(flow.originalRuleMessagesByLocaleRef.current);
    flow.setUpsellWidgetEnabled(flow.originalUpsellWidgetEnabledRef.current);
    flow.setUpsellWidgetDisplayMode(
      flow.originalUpsellWidgetDisplayModeRef.current,
    );
    flow.setUpsellWidgetDisplayOn(
      flow.originalUpsellWidgetDisplayOnRef.current,
    );
    flow.setUpsellWidgetButtonText(
      flow.originalUpsellWidgetButtonTextRef.current,
    );
    flow.setAutoSelectBrowsedProduct(
      flow.originalAutoSelectBrowsedProductRef.current,
    );
    flow.resetSubscriptionConfig(
      flow.originalSubscriptionConfigRef.current,
    );
    validation.clearValidationErrors();
  }, [flow, validation]);
  const handleConfirmDiscard = useCallback(() => {
    closeDiscardModal();
    handleDiscard();
  }, [closeDiscardModal, handleDiscard]);

  Object.assign(flow, {
    buildDefaultProductsData,
    closeDiscardModal,
    handleConfirmDiscard,
    handleDiscard,
    handleSave,
    serializePricingDisplayOptions,
    ...validation,
  });
}
