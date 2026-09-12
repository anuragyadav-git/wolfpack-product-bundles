/**
 * Bundle Configuration State Hook
 *
 * Unified state management for bundle configuration routes.
 * Wraps existing custom hooks and adds additional state for:
 * - Modal visibility
 * - Loading states
 * - UI navigation
 * - Bundle product data
 *
 * Used by both full-page and product-page bundle configuration routes.
 */

import { useCallback, useRef, useMemo, useEffect, useReducer } from "react";
import { showAdminTransientErrorToast, type AdminTaskAlert } from "../lib/admin-alert-feedback";
import type { EntitlementFailureData } from "../components/billing/EntitlementUpgradeModal";
import { useBundleForm } from "./useBundleForm";
import { useBundleSteps } from "./useBundleSteps";
import { useBundleConditions } from "./useBundleConditions";
import { useBundlePricing } from "./useBundlePricing";
import { type BundleStatus } from "../constants/bundle";
import { normalizePricingRuleMessages } from "../lib/pricing-display-options";
import {
  createInitialConfigureRouteState,
  reduceConfigureRouteState,
} from "./configure-route-state";
import type { BundleProductData } from "../types/bundle-configure";

// ============================================
// TYPES
// ============================================

interface BundleData {
  id: string;
  name: string;
  description?: string;
  status: BundleStatus;
  bundleType: string;
  templateName?: string;
  shopifyProductId?: string;
  steps: any[];
  pricing?: any;
}

interface UseBundleConfigurationProps {
  bundle: BundleData;
  bundleProduct: BundleProductData | null;
  shopify: any;
  shopCurrencyCode: string;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function getBundleProductImageUrl(
  loadedBundleProduct?: Partial<BundleProductData> | null,
): string {
  return (
    loadedBundleProduct?.featuredImage?.url ||
    loadedBundleProduct?.featuredMedia?.image?.url ||
    loadedBundleProduct?.media?.nodes?.find((node) => node?.image?.url)?.image?.url ||
    loadedBundleProduct?.images?.[0]?.originalSrc ||
    ""
  );
}

export function shouldResetConfigureNavigation(
  previousBundleId: string | null,
  currentBundleId: string,
): boolean {
  return previousBundleId !== currentBundleId;
}

export function useBundleConfigurationState({
  bundle,
  bundleProduct: loadedBundleProduct,
  shopify,
  shopCurrencyCode,
}: UseBundleConfigurationProps) {
  const [configureRouteState, dispatch] = useReducer(
    reduceConfigureRouteState,
    undefined,
    createInitialConfigureRouteState,
  );
  // ===== DIRTY FLAG SYSTEM =====
  const isDirty = configureRouteState.isDirty;
  const isResettingRef = useRef(false);
  const lastProcessedFetcherDataRef = useRef<any>(null);
  const configuredBundleIdRef = useRef<string | null>(null);

  const markAsDirty = useCallback(() => {
    if (!isResettingRef.current) {
      dispatch({ type: "setDirty", value: true });
    }
  }, [dispatch]);

  const setIsDirty = useCallback((value: boolean) => {
    dispatch({ type: "setDirty", value });
  }, [dispatch]);

  // ===== CUSTOM HOOKS =====
  // Form state management
  const formState = useBundleForm({
    initialData: {
      name: bundle.name,
      description: bundle.description || "",
      status: bundle.status,
      templateName: bundle.templateName || "",
    },
    onStateChange: markAsDirty
  });

  // Step conditions initialization
  const initializeStepConditions = () => {
    const initialConditions: Record<string, any[]> = {};
    (bundle.steps || []).forEach((step: any) => {
      if (step.conditionType && step.conditionOperator && step.conditionValue !== null) {
        const rules: any[] = [{
          id: `condition_${step.id}_1_${Date.now()}`,
          type: step.conditionType,
          operator: step.conditionOperator,
          value: step.conditionValue.toString()
        }];
        if (step.conditionOperator2 && step.conditionValue2 != null) {
          rules.push({
            id: `condition_${step.id}_2_${Date.now()}`,
            type: step.conditionType,
            operator: step.conditionOperator2,
            value: step.conditionValue2.toString()
          });
        }
        initialConditions[step.id] = rules;
      }
    });
    return initialConditions;
  };

  // Condition rules management
  const conditionsState = useBundleConditions({
    initialStepConditions: initializeStepConditions(),
    onStateChange: markAsDirty
  });

  // Transform steps for the hook
  const transformedSteps = useMemo(() =>
    (bundle.steps || []).map((step: any) => ({
      ...step,
      stepImage: step.stepImage ?? step.timelineIconUrl ?? null,
      StepProduct: (step.StepProduct || []).map((sp: any) => ({
        ...sp,
        id: sp.productId,
      }))
    }))
  , [bundle.steps]);

  // Steps management
  const stepsState = useBundleSteps({
    initialSteps: transformedSteps,
    shopify,
    onStateChange: markAsDirty,
  });

  // Pricing management
  const pricingState = useBundlePricing({
    initialPricing: bundle.pricing,
    currencyCode: shopCurrencyCode,
    onStateChange: markAsDirty
  });

  // ===== MODAL STATES =====
  const isPageSelectionModalOpen = configureRouteState.modals.pageSelection;
  const isWidgetInstallModalOpen = configureRouteState.modals.widgetInstall;
  const isProductsModalOpen = configureRouteState.modals.products;
  const isCollectionsModalOpen = configureRouteState.modals.collections;
  const currentModalStepId = configureRouteState.currentModalStepId;
  const setCurrentModalStepId = useCallback((stepId: string) => {
    dispatch({ type: "setCurrentModalStepId", value: stepId });
  }, [dispatch]);

  // Modal handlers
  const openPageSelectionModal = useCallback(() => {
    dispatch({ type: "openModal", modal: "pageSelection" });
  }, [dispatch]);

  const closePageSelectionModal = useCallback(() => {
    dispatch({ type: "closeModal", modal: "pageSelection" });
  }, [dispatch]);

  const openWidgetInstallModal = useCallback(() => {
    dispatch({ type: "openModal", modal: "widgetInstall" });
  }, [dispatch]);

  const closeWidgetInstallModal = useCallback(() => {
    dispatch({ type: "closeModal", modal: "widgetInstall" });
  }, [dispatch]);

  const openProductsModal = useCallback((stepId: string) => {
    dispatch({ type: "openModal", modal: "products", stepId });
  }, [dispatch]);

  const closeProductsModal = useCallback(() => {
    dispatch({ type: "closeModal", modal: "products" });
  }, [dispatch]);

  const openCollectionsModal = useCallback((stepId: string) => {
    dispatch({ type: "openModal", modal: "collections", stepId });
  }, [dispatch]);

  const closeCollectionsModal = useCallback(() => {
    dispatch({ type: "closeModal", modal: "collections" });
  }, [dispatch]);

  // ===== LOADING STATES =====
  const isLoadingPages = configureRouteState.isLoadingPages;
  const setIsLoadingPages = useCallback((value: boolean) => {
    dispatch({ type: "setLoadingPages", value });
  }, [dispatch]);

  // ===== DATA STATES =====
  const availablePages = configureRouteState.availablePages;
  const selectedPage = configureRouteState.selectedPage;
  const setAvailablePages = useCallback((value: any[]) => {
    dispatch({ type: "setAvailablePages", value });
  }, [dispatch]);
  const setSelectedPage = useCallback((value: any | null) => {
    dispatch({ type: "setSelectedPage", value });
  }, [dispatch]);

  // Bundle product state
  const bundleProduct = configureRouteState.bundleProduct;
  const productStatus = configureRouteState.productStatus;
  const productTitle = configureRouteState.productTitle;
  const productImageUrl = configureRouteState.productImageUrl;
  const setProductTitle = useCallback((value: string) => {
    dispatch({ type: "setProductTitle", value });
  }, [dispatch]);
  const setProductImageUrl = useCallback((value: string) => {
    dispatch({ type: "setProductImageUrl", value });
  }, [dispatch]);

  // Wrapped setters that trigger dirty flag
  const setBundleProduct = useCallback((value: any) => {
    dispatch({ type: "setBundleProduct", value });
  }, [dispatch]);

  const setProductStatus = useCallback((value: string) => {
    dispatch({ type: "setProductStatus", value });
  }, [dispatch]);

  // Collections state
  const initialSelectedCollections = useMemo(() => {
    const collections: Record<string, any[]> = {};
    bundle.steps?.forEach(step => {
      if (step.collections && Array.isArray(step.collections) && step.collections.length > 0) {
        collections[step.id] = step.collections;
      }
    });
    return collections;
  }, [bundle.steps]);
  const selectedCollections = configureRouteState.selectedCollections;

  const setSelectedCollections = useCallback((
    value: Record<string, any[]> | ((prev: Record<string, any[]>) => Record<string, any[]>)
  ) => {
    const nextValue = typeof value === "function" ? value(configureRouteState.selectedCollections) : value;
    dispatch({ type: "setSelectedCollections", value: nextValue });
  }, [configureRouteState.selectedCollections, dispatch]);

  // Rule messages state
  const initialRuleMessages = useMemo(
    () => normalizePricingRuleMessages({
      rules: Array.isArray(bundle.pricing?.rules) ? bundle.pricing.rules : [],
      messages: bundle.pricing?.messages || {},
      method: bundle.pricing?.method,
    }),
    [bundle.pricing?.messages, bundle.pricing?.method, bundle.pricing?.rules]
  );

  useEffect(() => {
    if (shouldResetConfigureNavigation(configuredBundleIdRef.current, bundle.id)) {
      dispatch({ type: "resetNavigation" });
      configuredBundleIdRef.current = bundle.id;
    }
    dispatch({ type: "initialize", value: {
      bundleProduct: loadedBundleProduct || null,
      productStatus: loadedBundleProduct?.status || "",
      productTitle: loadedBundleProduct?.title || "",
      productImageUrl: getBundleProductImageUrl(loadedBundleProduct),
      selectedCollections: initialSelectedCollections,
      ruleMessages: initialRuleMessages,
    } });
  }, [
    bundle.id,
    dispatch,
    initialRuleMessages,
    initialSelectedCollections,
    loadedBundleProduct,
  ]);

  const ruleMessages = configureRouteState.ruleMessages;

  const setRuleMessages = useCallback((
    value: Record<string, { discountText: string; successMessage: string }> |
    ((prev: Record<string, { discountText: string; successMessage: string }>) =>
      Record<string, { discountText: string; successMessage: string }>)
  ) => {
    const nextValue = typeof value === "function" ? value(configureRouteState.ruleMessages) : value;
    dispatch({ type: "setRuleMessages", value: nextValue });
  }, [configureRouteState.ruleMessages, dispatch]);

  // ===== UI STATES =====
  const activeTabIndex = configureRouteState.activeTabIndex;
  const activeSection = configureRouteState.activeSection;
  const forceNavigation = configureRouteState.forceNavigation;
  const setActiveTabIndex = useCallback((value: number) => {
    dispatch({ type: "setActiveTabIndex", value });
  }, [dispatch]);
  const setActiveSection = useCallback((value: string) => {
    dispatch({ type: "setActiveSection", value });
  }, [dispatch]);
  const setForceNavigation = useCallback((value: boolean) => {
    dispatch({ type: "setForceNavigation", value });
  }, [dispatch]);

  // Banner states
  const showAutoPlacementBanner = configureRouteState.showAutoPlacementBanner;
  const dismissedBanners = useMemo(
    () => new Set(configureRouteState.dismissedBanners),
    [configureRouteState.dismissedBanners],
  );
  const setShowAutoPlacementBanner = useCallback((value: boolean) => {
    dispatch({ type: "setShowAutoPlacementBanner", value });
  }, [dispatch]);
  const setDismissedBanners = useCallback((
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => {
    const previous = new Set<string>(configureRouteState.dismissedBanners);
    const nextValue = typeof value === "function" ? value(previous) : value;
    dispatch({ type: "setDismissedBanners", value: Array.from(nextValue) });
  }, [configureRouteState.dismissedBanners, dispatch]);
  const operationAlert = configureRouteState.operationAlert;
  const setOperationAlert = useCallback((value: AdminTaskAlert) => {
    dispatch({ type: "setOperationAlert", value });
  }, [dispatch]);
  const clearOperationAlert = useCallback(() => {
    dispatch({ type: "setOperationAlert", value: null });
  }, [dispatch]);
  const entitlementFailure = configureRouteState.entitlementFailure;
  const setEntitlementFailure = useCallback(
    (value: EntitlementFailureData | null) => {
      dispatch({ type: "setEntitlementFailure", value });
    },
    [dispatch],
  );
  const clearEntitlementFailure = useCallback(() => {
    dispatch({ type: "setEntitlementFailure", value: null });
  }, [dispatch]);

  // ===== ORIGINAL VALUES REF (for discard) =====
  const originalValuesRef = useRef({
    status: formState.bundleStatus,
    name: formState.bundleName,
    description: formState.bundleDescription,
    templateName: formState.templateName,
    steps: JSON.stringify(transformedSteps),
    discountEnabled: pricingState.discountEnabled,
    discountType: pricingState.discountType,
    discountRules: JSON.stringify(pricingState.discountRules),
    showFooter: pricingState.showFooter,
    showDiscountProgressBar: pricingState.showDiscountProgressBar,
    discountMessagingEnabled: pricingState.discountMessagingEnabled,
    pricingDisplayOptions: JSON.stringify(pricingState.pricingDisplayOptions),
    tierTextByRuleId: JSON.stringify(pricingState.tierTextByRuleId),
    tierTextByLocaleByRuleId: JSON.stringify(
      pricingState.tierTextByLocaleByRuleId,
    ),
    selectedCollections: JSON.stringify({}),
    ruleMessages: JSON.stringify(initialRuleMessages),
    stepConditions: JSON.stringify(conditionsState.stepConditions),
    bundleProduct: loadedBundleProduct || null,
    productStatus: loadedBundleProduct?.status || "",
  });

  // ===== DISCARD HANDLER =====
  const handleDiscard = useCallback(() => {
    try {
      isResettingRef.current = true;
      const originalValues = originalValuesRef.current;

      // Reset form state
      formState.setBundleStatus(originalValues.status);
      formState.setBundleName(originalValues.name);
      formState.setBundleDescription(originalValues.description);
      formState.setTemplateName(originalValues.templateName);

      // Reset steps
      const originalSteps = JSON.parse(originalValues.steps);
      stepsState.setSteps(originalSteps);

      // Reset pricing
      pricingState.setDiscountEnabled(originalValues.discountEnabled);
      pricingState.setDiscountType(originalValues.discountType);
      pricingState.setDiscountRules(JSON.parse(originalValues.discountRules));
      pricingState.setShowFooter(originalValues.showFooter);
      pricingState.setShowDiscountProgressBar(originalValues.showDiscountProgressBar);
      pricingState.setDiscountMessagingEnabled(originalValues.discountMessagingEnabled);
      pricingState.setPricingDisplayOptions(JSON.parse(originalValues.pricingDisplayOptions));
      pricingState.setTierTextByRuleId(
        JSON.parse(originalValues.tierTextByRuleId),
      );
      pricingState.setTierTextByLocaleByRuleId(
        JSON.parse(originalValues.tierTextByLocaleByRuleId),
      );

      // Reset collections
      setSelectedCollections(JSON.parse(originalValues.selectedCollections));

      // Reset rule messages
      setRuleMessages(JSON.parse(originalValues.ruleMessages));

      // Reset conditions
      conditionsState.setStepConditions(JSON.parse(originalValues.stepConditions));

      // Reset bundle product
      setBundleProduct(originalValues.bundleProduct || loadedBundleProduct || null);
      setProductStatus(originalValues.productStatus);

      isResettingRef.current = false;
      setIsDirty(false);
      dispatch({ type: "setOperationAlert", value: null });

      shopify.toast.show("Changes discarded", { isError: false });
    } catch (error: any) {
      isResettingRef.current = false;
      showAdminTransientErrorToast(shopify, "Changes not discarded");
    }
  }, [
    loadedBundleProduct,
    shopify,
    formState,
    stepsState,
    pricingState,
    conditionsState,
    setBundleProduct,
    setProductStatus,
    setSelectedCollections,
    setRuleMessages,
    setIsDirty,
    dispatch,
  ]);

  // ===== MARK AS SAVED =====
  const markAsSaved = useCallback(() => {
    // Update original values ref with current state
    originalValuesRef.current = {
      status: formState.bundleStatus,
      name: formState.bundleName,
      description: formState.bundleDescription,
      templateName: formState.templateName,
      steps: JSON.stringify(stepsState.steps),
      discountEnabled: pricingState.discountEnabled,
      discountType: pricingState.discountType,
      discountRules: JSON.stringify(pricingState.discountRules),
      showFooter: pricingState.showFooter,
      showDiscountProgressBar: pricingState.showDiscountProgressBar,
      discountMessagingEnabled: pricingState.discountMessagingEnabled,
      pricingDisplayOptions: JSON.stringify(pricingState.pricingDisplayOptions),
      tierTextByRuleId: JSON.stringify(pricingState.tierTextByRuleId),
      tierTextByLocaleByRuleId: JSON.stringify(
        pricingState.tierTextByLocaleByRuleId,
      ),
      selectedCollections: JSON.stringify(selectedCollections),
      ruleMessages: JSON.stringify(ruleMessages),
      stepConditions: JSON.stringify(conditionsState.stepConditions),
      bundleProduct: bundleProduct,
      productStatus: productStatus,
    };
    setIsDirty(false);
  }, [
    formState,
    stepsState.steps,
    pricingState,
    selectedCollections,
    ruleMessages,
    conditionsState.stepConditions,
    bundleProduct,
    productStatus,
    setIsDirty,
  ]);

  // ===== RETURN UNIFIED STATE =====
  return {
    // Dirty state
    isDirty,
    setIsDirty,
    markAsDirty,
    markAsSaved,
    handleDiscard,
    isResettingRef,
    lastProcessedFetcherDataRef,

    // Form state (from useBundleForm)
    formState,

    // Steps state (from useBundleSteps)
    stepsState,

    // Conditions state (from useBundleConditions)
    conditionsState,

    // Pricing state (from useBundlePricing)
    pricingState,

    // Modal states
    isPageSelectionModalOpen,
    openPageSelectionModal,
    closePageSelectionModal,
    isWidgetInstallModalOpen,
    openWidgetInstallModal,
    closeWidgetInstallModal,
    isProductsModalOpen,
    openProductsModal,
    closeProductsModal,
    isCollectionsModalOpen,
    openCollectionsModal,
    closeCollectionsModal,
    currentModalStepId,
    setCurrentModalStepId,

    // Loading states
    isLoadingPages,
    setIsLoadingPages,

    // Page selection data
    availablePages,
    setAvailablePages,
    selectedPage,
    setSelectedPage,

    // Bundle product data
    bundleProduct,
    setBundleProduct,
    productStatus,
    setProductStatus,
    productTitle,
    setProductTitle,
    productImageUrl,
    setProductImageUrl,

    // Collections
    selectedCollections,
    setSelectedCollections,

    // Rule messages
    ruleMessages,
    setRuleMessages,

    // UI states
    activeTabIndex,
    setActiveTabIndex,
    activeSection,
    setActiveSection,
    forceNavigation,
    setForceNavigation,

    // Banner states
    showAutoPlacementBanner,
    setShowAutoPlacementBanner,
    dismissedBanners,
    setDismissedBanners,
    operationAlert,
    setOperationAlert,
    clearOperationAlert,
    entitlementFailure,
    setEntitlementFailure,
    clearEntitlementFailure,

    // Original values ref
    originalValuesRef,
  };
}
