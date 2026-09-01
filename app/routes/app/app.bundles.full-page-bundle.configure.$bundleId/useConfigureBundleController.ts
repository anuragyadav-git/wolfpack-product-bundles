import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { handleAdminSaveLockedEvent } from "../../../lib/admin-save-lock";
import { getParentProductStatusUi } from "../../../lib/parent-product-status-ui";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import { getThemeExtensionStatusFromAppBridge } from "../../../lib/app-embed-status-check.client";
import { buildThemeAppEmbedEditorUrl } from "../../../lib/theme-extension-status";
import { useBundleConfigurationState } from "../../../hooks/useBundleConfigurationState";
import { useEnsureProductTemplateMutation } from "../../../store/api/adminApi";
import type { LoaderData } from "./types";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";
import { useSpecificLinkOfferAdmin } from "../shared/useSpecificLinkOfferAdmin";

export function useConfigureBundleController(): ConfigureBundleFlowDraft {
  const loaderData = useLoaderData<LoaderData>();
  const bundle =
    loaderData.bundle as unknown as import("../../../hooks/useBundleConfigurationState").BundleData & {
      promoBannerBgImage?: string | null;
      loadingGif?: string | null;
      shopifyProductHandle?: string;
    };
  const {
    bundleProduct: loadedBundleProduct,
    availableBundles,
    shop,
    apiKey,
    storefrontProxyRoot,
    shopLocales = [],
    shopCurrencyCode,
  } = loaderData as any;
  const themeEditorUrl = buildThemeAppEmbedEditorUrl(shop, apiKey, "bundle-app-embed");
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const fetcher = useFetcher<any>();
  const revalidator = useRevalidator();
  const [currentAppEmbedEnabled, setCurrentAppEmbedEnabled] = useState<
    boolean | null
  >(null);
  const [isCriticalStatusReady, setIsCriticalStatusReady] = useState(false);
  const [currentThemeEditorUrl, setCurrentThemeEditorUrl] =
    useState(themeEditorUrl);
  const [appEmbedBannerFeedbackTrigger, setAppEmbedBannerFeedbackTrigger] =
    useState(0);
  const [ensureProductTemplate] = useEnsureProductTemplateMutation();
  const isSaveInFlight = fetcher.state !== "idle";
  const saveBarRef = useRef<UISaveBarElement | null>(null);
  const triggerSaveBarIrritation = useCallback(() => {
    void saveBarRef.current?.show?.();
  }, []);
  const blockConfigurationChangeWhileSaving = useCallback(
    (event: SyntheticEvent) => {
      handleAdminSaveLockedEvent(
        event,
        isSaveInFlight,
        triggerSaveBarIrritation
      );
    },
    [isSaveInFlight, triggerSaveBarIrritation]
  );
  const configState = useBundleConfigurationState({
    bundle,
    bundleProduct: loadedBundleProduct,
    shopify,
    shopCurrencyCode,
  });
  const {
    isDirty,
    setIsDirty,
    markAsDirty,
    markAsSaved,
    handleDiscard: hookHandleDiscard,
    isResettingRef,
    lastProcessedFetcherDataRef,
    formState,
    stepsState,
    conditionsState,
    pricingState,
    isProductsModalOpen,
    openProductsModal,
    closeProductsModal,
    isCollectionsModalOpen,
    openCollectionsModal,
    closeCollectionsModal,
    currentModalStepId,
    setCurrentModalStepId,
    bundleProduct,
    setBundleProduct,
    productStatus,
    setProductStatus,
    productTitle,
    setProductTitle,
    productImageUrl,
    setProductImageUrl,
    selectedCollections,
    setSelectedCollections,
    ruleMessages,
    setRuleMessages,
    activeTabIndex,
    setActiveTabIndex,
    activeSection,
    setActiveSection,
    forceNavigation,
    setForceNavigation,
    operationAlert,
    setOperationAlert,
    clearOperationAlert,
    originalValuesRef,
  } = configState;
  const parentProductStatusUi = getParentProductStatusUi(
    loadedBundleProduct?.status || bundleProduct?.status,
    revalidator.state !== "idle",
  );
  useEffect(() => {
    let active = true;
    setCurrentAppEmbedEnabled(null);
    setCurrentThemeEditorUrl(themeEditorUrl);
    setIsCriticalStatusReady(false);
    void getThemeExtensionStatusFromAppBridge(shopify)
      .then((status) => {
        if (active) {
          setCurrentAppEmbedEnabled(status.appEmbedEnabled);
        }
      })
      .catch(() => {
        if (active) setCurrentAppEmbedEnabled(false);
      })
      .finally(() => {
        if (active) {
          setIsCriticalStatusReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [shopify, themeEditorUrl]);
  const refreshParentProductStatusFromShopify = useCallback(() => {
    const revalidateNow = () => {
      revalidator.revalidate();
    };
    let cleanup = () => {};
    const revalidateOnReturn = () => {
      revalidateNow();
      cleanup();
    };
    const revalidateOnVisible = () => {
      if (document.visibilityState === "visible") {
        revalidateOnReturn();
      }
    };
    cleanup = () => {
      window.removeEventListener("focus", revalidateOnReturn);
      document.removeEventListener("visibilitychange", revalidateOnVisible);
    };
    [1000, 3000, 6000].forEach((delay) => {
      window.setTimeout(revalidateNow, delay);
    });
    window.addEventListener("focus", revalidateOnReturn, { once: true });
    document.addEventListener("visibilitychange", revalidateOnVisible);
    window.setTimeout(cleanup, 30000);
  }, [revalidator]);
  const openThemeEditorForAppEmbed = useCallback(() => {
    if (!currentThemeEditorUrl) return;
    setCurrentAppEmbedEnabled(true);
    openThemeEditorInNewTab(currentThemeEditorUrl);
  }, [currentThemeEditorUrl]);
  const triggerAppEmbedBannerFeedback = useCallback(() => {
    setAppEmbedBannerFeedbackTrigger((value) => value + 1);
  }, []);
  const checkAppEmbedStatusBeforePreview = useCallback(async () => {
    const status = await getThemeExtensionStatusFromAppBridge(shopify);
    const appEmbedEnabled = status?.appEmbedEnabled ?? false;
    setCurrentAppEmbedEnabled(appEmbedEnabled);
    return appEmbedEnabled;
  }, [shopify]);
  const specificLinkOffer = useSpecificLinkOfferAdmin({
    initialState: loaderData.offerDelivery,
    markAsDirty,
    shopify,
  });

  return {
    activeSection,
    activeTabIndex,
    apiKey,
    appEmbedBannerFeedbackTrigger,
    appEmbedEnabled: currentAppEmbedEnabled ?? true,
    isCriticalStatusReady,
    availableBundles,
    blockConfigurationChangeWhileSaving,
    bundle,
    bundleProduct,
    closeCollectionsModal,
    closeProductsModal,
    conditionsState,
    configState,
    currentModalStepId,
    ensureProductTemplate,
    fetcher,
    forceNavigation,
    formState,
    hookHandleDiscard,
    isCollectionsModalOpen,
    isDirty,
    isProductsModalOpen,
    isResettingRef,
    isSaveInFlight,
    lastProcessedFetcherDataRef,
    loadedBundleProduct,
    loaderData,
    markAsDirty,
    markAsSaved,
    navigate,
    openCollectionsModal,
    openProductsModal,
    operationAlert,
    originalValuesRef,
    parentProductStatusUi,
    pricingState,
    productImageUrl,
    productStatus,
    productTitle,
    refreshParentProductStatusFromShopify,
    openThemeEditorForAppEmbed,
    checkAppEmbedStatusBeforePreview,
    revalidator,
    ruleMessages,
    saveBarRef,
    selectedCollections,
    setActiveSection,
    setActiveTabIndex,
    setBundleProduct,
    setCurrentModalStepId,
    setForceNavigation,
    setIsDirty,
    setOperationAlert,
    setProductImageUrl,
    setProductStatus,
    setProductTitle,
    setRuleMessages,
    setSelectedCollections,
    shop,
    shopify,
    shopLocales,
    shopCurrencyCode,
    storefrontProxyRoot,
    stepsState,
    themeEditorUrl: currentThemeEditorUrl,
    triggerAppEmbedBannerFeedback,
    triggerSaveBarIrritation,
    clearOperationAlert,
    ...specificLinkOffer,
  };
}
