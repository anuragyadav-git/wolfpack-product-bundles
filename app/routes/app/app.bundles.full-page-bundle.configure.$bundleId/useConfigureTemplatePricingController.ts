import { useCallback, useEffect, useMemo } from "react";
import { type BundleReadinessItem } from "../../../components/bundle-configure/BundleReadinessOverlay";
import { DiscountMethod } from "../../../types/pricing";
import {
  normalizePricingDisplayOptions,
  normalizePricingRuleMessages,
} from "../../../lib/pricing-display-options";
import fullPageBundleStyles from "../../../styles/routes/full-page-bundle-configure.module.css";
import { FPB_DESIGN_CONTROL_PANEL_URL } from "./configure-constants";
import { buildVisibilityDisplayConfiguration } from "./visibility-helpers";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";
import { runAfterSaveBarLeaveConfirmation } from "../../../lib/admin-savebar-navigation.client";
import {
  resolveTemplateReadyStep,
  shouldProcessTemplateResponse,
} from "../../../lib/template-ready-step";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";

export function useConfigureTemplatePricingController(
  flow: ConfigureBundleFlowDraft
) {
  const {
    appEmbedEnabled,
    autoSelectBrowsedProduct,
    bundle,
    bundleDesignPresetId,
    bundleDesignTemplate,
    conditionsState,
    formState,
    isSelectTemplateModalOpen,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    loadedBundleProduct,
    navigate,
    pendingDesignPresetId,
    pendingDesignTemplate,
    pricingState,
    productStatus,
    ruleMessages,
    savedBundleUpsellConfig,
    selectTemplateModalRef,
    selectTemplateOpenButtonRef,
    setBundleDesignPresetId,
    setBundleDesignTemplate,
    setIsSelectTemplateModalOpen,
    setPendingDesignPresetId,
    setPendingDesignTemplate,
    setTemplateModalStep,
    setTemplateSaveError,
    stepsState,
    templateSubmissionStartedRef,
    templateFetcher,
    textOverridesByLocale,
    upsellWidgetButtonText,
    upsellWidgetCollectionsSelectedData,
    upsellWidgetDescription,
    upsellWidgetDisplayOn,
    upsellWidgetEnabled,
    upsellWidgetImageUrl,
    upsellWidgetLanguageMode,
    upsellWidgetSelectedProducts,
    upsellWidgetSpecificCollectionPages,
    upsellWidgetSpecificProductPages,
    upsellWidgetTitle,
  } = flow;

  const resetSelectTemplateModal = useCallback(() => {
    setIsSelectTemplateModalOpen(false);
    setTemplateModalStep("templates");
    setTemplateSaveError(null);
    lastTemplateRequestRef.current = null;
    lastTemplateResponseRef.current = null;
    templateSubmissionStartedRef.current = false;
    requestAnimationFrame(() => {
      selectTemplateOpenButtonRef.current?.focus();
    });
  }, [
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    selectTemplateOpenButtonRef,
    setIsSelectTemplateModalOpen,
    setTemplateModalStep,
    setTemplateSaveError,
    templateSubmissionStartedRef,
  ]);
  const closeSelectTemplateModal = useCallback(() => {
    hidePolarisModal(selectTemplateModalRef);
    resetSelectTemplateModal();
  }, [resetSelectTemplateModal, selectTemplateModalRef]);
  useModalHideListener(selectTemplateModalRef, resetSelectTemplateModal);
  const openSelectTemplateModal = useCallback(() => {
    setPendingDesignTemplate(bundleDesignTemplate);
    setPendingDesignPresetId(bundleDesignPresetId);
    setTemplateModalStep("templates");
    setTemplateSaveError(null);
    lastTemplateRequestRef.current = null;
    lastTemplateResponseRef.current = null;
    templateSubmissionStartedRef.current = false;
    setIsSelectTemplateModalOpen(true);
  }, [
    bundleDesignPresetId,
    bundleDesignTemplate,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    setIsSelectTemplateModalOpen,
    setPendingDesignPresetId,
    setPendingDesignTemplate,
    setTemplateModalStep,
    setTemplateSaveError,
    templateSubmissionStartedRef,
  ]);
  const openDesignControlPanel = useCallback(() => {
    void runAfterSaveBarLeaveConfirmation(flow.shopify, () =>
      navigate(FPB_DESIGN_CONTROL_PANEL_URL)
    );
  }, [flow.shopify, navigate]);

  useEffect(() => {
    isSelectTemplateModalOpen
      ? showPolarisModal(selectTemplateModalRef)
      : hidePolarisModal(selectTemplateModalRef);
  }, [isSelectTemplateModalOpen, selectTemplateModalRef]);

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
    if (templateFetcher.data == null) {
      setTemplateSaveError("Unable to save template. Please try again.");
      setTemplateModalStep("templates");
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
        setBundleDesignTemplate(request.template);
        setBundleDesignPresetId(request.presetId);
        setTemplateModalStep(resolveTemplateReadyStep(appEmbedEnabled));
      }
      setTemplateSaveError(null);
      lastTemplateRequestRef.current = null;
      templateSubmissionStartedRef.current = false;
      return;
    }
    setTemplateModalStep("templates");
    setTemplateSaveError(response.error || "Failed to save template settings.");
    lastTemplateRequestRef.current = null;
    templateSubmissionStartedRef.current = false;
  }, [
    appEmbedEnabled,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    setBundleDesignPresetId,
    setBundleDesignTemplate,
    setTemplateModalStep,
    setTemplateSaveError,
    templateSubmissionStartedRef,
    templateFetcher.data,
    templateFetcher.formData,
    templateFetcher.state,
  ]);

  const handleTemplateNext = useCallback(() => {
    if (!pendingDesignTemplate || !pendingDesignPresetId) {
      return;
    }
    setTemplateSaveError(null);
    lastTemplateRequestRef.current = {
      template: pendingDesignTemplate,
      presetId: pendingDesignPresetId,
    };
    lastTemplateResponseRef.current = null;
    templateSubmissionStartedRef.current = false;
    const fd = new FormData();
    fd.append("intent", "updateBundleDesignTemplate");
    fd.append("bundleDesignTemplate", pendingDesignTemplate ?? "");
    fd.append("bundleDesignPresetId", pendingDesignPresetId ?? "");
    templateFetcher.submit(fd, { method: "POST" });
    setTemplateModalStep(resolveTemplateReadyStep(appEmbedEnabled));
  }, [
    appEmbedEnabled,
    lastTemplateRequestRef,
    lastTemplateResponseRef,
    pendingDesignPresetId,
    pendingDesignTemplate,
    setTemplateModalStep,
    setTemplateSaveError,
    templateSubmissionStartedRef,
    templateFetcher,
  ]);
  function buildBundleUpsellConfig() {
    const multiLangText = Object.fromEntries(
      Object.entries(textOverridesByLocale ?? {}).flatMap(([locale, values]: any) => {
        const widgetCopy = {
          widgetTitle: values?.widgetTitle ?? "",
          widgetDescription: values?.widgetDescription ?? "",
          widgetButtonText: values?.widgetButtonText ?? "",
        };
        return Object.values(widgetCopy).some(Boolean) ? [[locale, widgetCopy]] : [];
      }),
    );
    return {
      multiLangText,
      languageMode: upsellWidgetLanguageMode,
      widgetConfiguration: {
        isEnabled: upsellWidgetEnabled,
        type: "OFFER_WIDGET",
        imageUrl: upsellWidgetImageUrl,
        title: upsellWidgetTitle,
        description: upsellWidgetDescription,
        buttonText: upsellWidgetButtonText,
        displayConfiguration: buildVisibilityDisplayConfiguration(
          upsellWidgetDisplayOn,
          upsellWidgetSelectedProducts,
          upsellWidgetSpecificProductPages,
          upsellWidgetCollectionsSelectedData,
          upsellWidgetSpecificCollectionPages
        ),
        useLinkProductAsDefaultProduct: autoSelectBrowsedProduct,
        languageMode: upsellWidgetLanguageMode,
      },
    };
  }
  const normalizedPricingDisplayOptions = useMemo(
    () =>
      normalizePricingDisplayOptions({
        rules: pricingState.discountRules,
        messages: { displayOptions: pricingState.pricingDisplayOptions },
        showProgressBar: pricingState.showDiscountProgressBar,
        steps: stepsState.steps.map((step: any) => {
          const [firstCondition, secondCondition] =
            conditionsState.stepConditions[step.id] || [];
          return {
            id: step.id,
            enabled: step.enabled,
            conditionType: firstCondition?.type ?? null,
            conditionOperator: firstCondition?.operator ?? null,
            conditionValue: firstCondition
              ? Number(firstCondition.value)
              : null,
            conditionOperator2: secondCondition?.operator ?? null,
            conditionValue2: secondCondition
              ? Number(secondCondition.value)
              : null,
          };
        }),
      }),
    [
      pricingState.discountRules,
      pricingState.pricingDisplayOptions,
      pricingState.showDiscountProgressBar,
      conditionsState.stepConditions,
      stepsState.steps,
    ]
  );
  const normalizedRuleMessages = useMemo(
    () =>
      normalizePricingRuleMessages({
        rules: pricingState.discountRules,
        messages: { ruleMessages },
        method: pricingState.discountType,
      }),
    [pricingState.discountRules, pricingState.discountType, ruleMessages]
  );
  const bundleQuantityOptionsEligible =
    pricingState.discountType !== DiscountMethod.BUY_X_GET_Y &&
    pricingState.discountRules.length > 0 &&
    pricingState.discountRules.every(
      (rule: any) => rule.conditionType === "quantity"
    );
  const displayOptionsInactive =
    !pricingState.discountEnabled || pricingState.discountRules.length === 0;

  useEffect(() => {
    if (
      !bundleQuantityOptionsEligible &&
      pricingState.pricingDisplayOptions.bundleQuantityOptions.enabled
    ) {
      pricingState.setBundleQuantityOptionsEnabled(false);
    }
  }, [
    bundleQuantityOptionsEligible,
    pricingState.pricingDisplayOptions.bundleQuantityOptions.enabled,
    pricingState.setBundleQuantityOptionsEnabled,
  ]);

  const readinessItems = useMemo<BundleReadinessItem[]>(() => {
    const hasProducts =
      stepsState.steps.reduce((totalProducts: number, step: any) => {
        const legacyProducts = Array.isArray(step.StepProduct)
          ? step.StepProduct.length
          : 0;
        const categoryProductCount = Array.isArray((step as any).StepCategory)
          ? ((step as any).StepCategory as any[]).reduce(
              (count: number, category: any) =>
                count +
                (Array.isArray(category?.products)
                  ? category.products.length
                  : 0),
              0
            )
          : 0;
        return totalProducts + legacyProducts + categoryProductCount;
      }, 0) >= 3;
    const hasBundleVisibility = formState.bundleStatus === "active";
    const parentProductActive =
      String(
        productStatus || loadedBundleProduct?.status || ""
      ).toLowerCase() === "active";
    return [
      {
        key: "embed",
        label: "App Embed Enabled",
        description: "Needed for your bundle to show up on store",
        points: 15,
        done: appEmbedEnabled,
      },
      {
        key: "products",
        label: "Minimum 3 Products Added",
        description: "Add more products to build a better bundle",
        points: 20,
        done: hasProducts,
      },
      {
        key: "discount",
        label: "Set Up Discount",
        description: "Bundles with offers tend to sell better",
        points: 15,
        done: pricingState.discountEnabled,
      },
      {
        key: "preview",
        label: "Preview Bundle",
        description: "Check your bundle looks and works right",
        points: 10,
        done: flow.hasPreview,
      },
      {
        key: "visible",
        label: "Set Up Bundle Visibility",
        description: "Put your bundle where shoppers can find it",
        points: 25,
        done: hasBundleVisibility,
      },
      {
        key: "product_active",
        label: "Set Parent Product to Active",
        description: "Unlisted bundles won't show in search",
        points: 15,
        done: parentProductActive,
      },
    ];
  }, [
    appEmbedEnabled,
    flow.hasPreview,
    formState.bundleStatus,
    loadedBundleProduct?.status,
    pricingState.discountEnabled,
    productStatus,
    stepsState.steps,
  ]);
  const readinessScore = readinessItems.reduce(
    (sum, item) => sum + (item.done ? item.points : 0),
    0
  );
  Object.assign(flow, {
    buildBundleUpsellConfig,
    buildVisibilityDisplayConfiguration,
    bundleQuantityOptionsEligible,
    closeSelectTemplateModal,
    displayOptionsInactive,
    FPB_DESIGN_CONTROL_PANEL_URL,
    fullPageBundleStyles,
    handleTemplateNext,
    normalizedPricingDisplayOptions,
    normalizedRuleMessages,
    normalizePricingDisplayOptions,
    normalizePricingRuleMessages,
    openDesignControlPanel,
    openSelectTemplateModal,
    readinessItems,
    readinessScore,
  });
}
