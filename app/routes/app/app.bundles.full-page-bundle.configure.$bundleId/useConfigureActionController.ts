import { useCallback, useState } from "react";
import { AppLogger } from "../../../lib/logger";
import { navigateBackOrFallback } from "../../../lib/navigation";
import { markBundlePreviewComplete } from "../../../lib/bundle-preview-readiness";
import { verifyAppEmbedEnabledBeforePreview } from "../../../lib/app-embed-status-check.client";
import { prepareStorefrontPreviewForOpen } from "../../../lib/storefront-sync-preview.client";
import {
  closePendingDashboardPreview,
  navigatePendingDashboardPreview,
  openPendingDashboardPreview,
} from "../../../lib/dashboard-preview-window";
import { blockUnsavedAdminNavigation } from "../../../lib/admin-unsaved-navigation";
import {
  buildFpbUpsellThemeEditorUrl,
  openThemeEditorInNewTab,
} from "../../../lib/theme-editor-navigation.client";
import { buildFpbStorefrontUrl } from "../../../lib/fpb-storefront-url";
import { useSharedBundleHandlers } from "../../../hooks/useSharedBundleHandlers";
import { i18n } from "../../../i18n/config";
import {
  getGuidedTourTransition,
  type TourStep,
} from "../../../components/bundle-configure/tourSteps";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";
import { useConfigureAddonActionHandlers } from "./useConfigureAddonActionHandlers";
import { useConfigureVisibilityActionHandlers } from "./useConfigureVisibilityActionHandlers";

function recordBundlePreview(bundleLink: string, routeFamily: string) {
  const formData = new FormData();
  formData.append("intent", "recordBundlePreview");
  formData.append("bundleLink", bundleLink);
  formData.append("routeFamily", routeFamily);
  void fetch(window.location.href, { method: "POST", body: formData }).catch(() => {});
}

export function useConfigureActionController(flow: ConfigureBundleFlowDraft) {
  const [isPreviewBundleLoading, setIsPreviewBundleLoading] = useState(false);
  const sharedHandlers = useSharedBundleHandlers({
    stepsState: flow.stepsState,
    formState: flow.formState,
    selectedCollections: flow.selectedCollections,
    setSelectedCollections: flow.setSelectedCollections,
    setRuleMessages: flow.setRuleMessages,
    setBundleProduct: flow.setBundleProduct,
    setProductTitle: flow.setProductTitle,
    setProductImageUrl: flow.setProductImageUrl,
    markAsDirty: flow.markAsDirty,
    activeTabIndex: flow.activeTabIndex,
    setActiveTabIndex: flow.setActiveTabIndex,
    clearOperationAlert: flow.clearOperationAlert,
    shopify: flow.shopify,
    fetcher: flow.fetcher,
    setIsSyncModalOpen: flow.setIsSyncModalOpen,
    setSlideDir: flow.setSlideDir,
    setSlideKey: flow.setSlideKey,
    setShowIconPickerForStep: flow.setShowIconPickerForStep,
  });
  Object.assign(flow, sharedHandlers);
  const addonActionHandlers = useConfigureAddonActionHandlers(flow);
  const visibilityActionHandlers = useConfigureVisibilityActionHandlers(flow);
  const closeDisabledPreviewModal = useCallback(() => undefined, []);

  const handleBackClick = useCallback(() => {
    if (
      blockUnsavedAdminNavigation(
        flow.isDirty && !flow.forceNavigation,
        flow.triggerSaveBarIrritation,
      )
    ) {
      return;
    }
    navigateBackOrFallback(flow.navigate, "/app/dashboard", { replaceFallback: true });
  }, [flow]);
  const enablePreviewGate = {
    modalProps: {
      open: false,
      onClose: closeDisabledPreviewModal,
      themeEditorUrl: flow.themeEditorUrl,
      onSetupVisibility: () => flow.setActiveSection("bundle_visibility"),
    },
  };
  const finishPreviewBundleLoading = useCallback(() => {
    setIsPreviewBundleLoading(false);
  }, []);
  const handlePreviewBundle = useCallback(async () => {
    if (flow.isDirty) {
      flow.setOperationAlert({
        id: "unsaved-preview",
        heading: "Save before previewing",
        message: "Save your changes before previewing the bundle.",
      });
      return false;
    }
    const pendingPreviewWindow = openPendingDashboardPreview();
    setIsPreviewBundleLoading(true);
    const appEmbedEnabled = await verifyAppEmbedEnabledBeforePreview(
      flow.appEmbedEnabled,
      flow.checkAppEmbedStatusBeforePreview,
      {
        onValidationBlocked: finishPreviewBundleLoading,
      },
    );
    if (!appEmbedEnabled) {
      flow.triggerAppEmbedBannerFeedback();
    }
    let preparedPreview: any = null;
    try {
      preparedPreview = await prepareStorefrontPreviewForOpen();
    } catch (error: any) {
      AppLogger.warn("Storefront preview preparation warning in FPB:", {}, error);
    }
    const publicNumber = flow.bundle.publicNumber ?? 1;
    const shareablePreviewUrl =
      preparedPreview?.shareablePreviewUrl ||
      buildFpbStorefrontUrl(flow.shop, publicNumber);

    const executePreviewBundle = (): string | false => {
      if (flow.bundle.bundleType === "full_page") {
        if (
          !navigatePendingDashboardPreview(
            pendingPreviewWindow,
            shareablePreviewUrl,
          )
        ) {
          window.open(
            shareablePreviewUrl,
            "_blank",
            "noopener,noreferrer",
          );
        }
        markBundlePreviewComplete({
          bundleId: flow.bundle.id,
          storage: window.localStorage,
          setHasPreview: flow.setHasPreview,
        });
        flow.clearOperationAlert();
        flow.shopify.toast.show(i18n.t("common.success.previewOpened"), {
          isError: false,
        });
        return shareablePreviewUrl;
      }
      let productUrl = null;
      const productHandle =
        flow.bundleProduct?.handle || flow.bundle.shopifyProductHandle;
      if (flow.bundleProduct) {
        if (flow.bundleProduct.onlineStorePreviewUrl) {
          productUrl = flow.bundleProduct.onlineStorePreviewUrl;
        } else if (flow.bundleProduct.onlineStoreUrl) {
          productUrl = flow.bundleProduct.onlineStoreUrl;
        }
      }
      if (!productUrl && productHandle) {
        if (flow.shop.includes("shopifypreview.com")) {
          productUrl = `https://${flow.shop}/products/${productHandle}`;
        } else {
          const shopDomain = flow.shop.includes(".myshopify.com")
            ? flow.shop.replace(".myshopify.com", "")
            : flow.shop;
          productUrl = `https://${shopDomain}.myshopify.com/products/${productHandle}`;
        }
      } else if (!productUrl && flow.bundleProduct?.id) {
        const productId = flow.bundleProduct.id.includes(
          "gid://shopify/Product/",
        )
          ? flow.bundleProduct.id.split("/").pop()
          : flow.bundleProduct.id;
        const shopDomain = flow.shop.includes(".myshopify.com")
          ? flow.shop.replace(".myshopify.com", "")
          : flow.shop.split(".")[0];
        productUrl = `https://admin.shopify.com/store/${shopDomain}/products/${productId}`;
      }
      if (productUrl) {
        if (!navigatePendingDashboardPreview(pendingPreviewWindow, productUrl)) {
          open(productUrl, "_blank", "noopener,noreferrer");
        }
        recordBundlePreview(productUrl, "fpb_configure");
        const isPreviewUrl =
          flow.bundleProduct &&
          productUrl === flow.bundleProduct.onlineStorePreviewUrl;
        markBundlePreviewComplete({
          bundleId: flow.bundle.id,
          storage: window.localStorage,
          setHasPreview: flow.setHasPreview,
        });
        flow.clearOperationAlert();
        flow.shopify.toast.show(
          isPreviewUrl ? i18n.t("common.success.previewOpened") : "Product opened",
          { isError: false },
        );
      } else {
        closePendingDashboardPreview(pendingPreviewWindow);
        AppLogger.error("Bundle product data:", {}, flow.bundleProduct);
        flow.setOperationAlert({
          id: "bundle-preview",
          heading: "Preview unavailable",
          message: "Check the bundle product configuration and try again.",
        });
      }
      return productUrl || false;
    };
    const previewUrl = executePreviewBundle();
    finishPreviewBundleLoading();
    return previewUrl;
  }, [finishPreviewBundleLoading, flow]);
  const handleSectionChange = useCallback(
    (section: string) => {
      if (section === flow.activeSection) return;
      if (
        blockUnsavedAdminNavigation(
          flow.isDirty,
          flow.triggerSaveBarIrritation,
        )
      ) {
        return;
      }
      flow.setActiveSection(section);
    },
    [flow],
  );
  const openProductInAdmin = useCallback(
    (productId: string) => {
      const numericProductId = productId.startsWith("gid://")
        ? (productId.split("/").pop() ?? productId)
        : productId;
      const productGid = productId.startsWith("gid://")
        ? productId
        : `gid://shopify/Product/${productId}`;
      const storeHandle = flow.shop?.replace(".myshopify.com", "");
      const adminProductUrl = `https://admin.shopify.com/store/${storeHandle}/products/${numericProductId}`;
      const openFallback = () => {
        try {
          flow.shopify.navigate(adminProductUrl);
        } catch (error: any) {
          AppLogger.warn(
            "Falling back to a new tab for Admin product navigation",
            { productId },
            error as any,
          );
          window.open(adminProductUrl, "_blank");
        }
        flow.refreshParentProductStatusFromShopify();
      };
      const intentsApi = (flow.shopify as any).intents;
      if (typeof intentsApi?.invoke === "function") {
        try {
          const intentResult = intentsApi.invoke("edit:shopify/Product", {
            type: "shopify/Product",
            value: productGid,
          });
          flow.refreshParentProductStatusFromShopify();
          if (typeof intentResult?.catch === "function") {
            void intentResult.catch((error: unknown) => {
              AppLogger.warn(
                "Falling back after Product editor intent failed",
                { productId },
                error as any,
              );
              openFallback();
            });
          }
          return;
        } catch (error: any) {
          AppLogger.warn(
            "Falling back after Product editor intent failed",
            { productId },
            error as any,
          );
        }
      }
      openFallback();
    },
    [flow],
  );
  const handleReadinessItemClick = useCallback(
    (key: string) => {
      flow.setReadinessOpen(false);
      switch (key) {
        case "embed":
          flow.openThemeEditorForAppEmbed();
          break;
        case "products":
          handleSectionChange("step_setup");
          break;
        case "discount":
          handleSectionChange("discount_pricing");
          break;
        case "preview":
          void handlePreviewBundle();
          break;
        case "visible":
          handleSectionChange("bundle_visibility");
          break;
        case "product_active": {
          const productId =
            flow.bundleProduct?.legacyResourceId ||
            flow.bundleProduct?.id?.split("/").pop() ||
            flow.bundle.shopifyProductId?.split("/").pop();
          if (productId) {
            openProductInAdmin(productId);
          }
          break;
        }
        default:
          break;
      }
    },
    [flow, handlePreviewBundle, handleSectionChange, openProductInAdmin],
  );
  const handleGuidedTourStepChange = useCallback(
    (step: TourStep) => {
      const transition = getGuidedTourTransition(step);
      if (transition.sectionId) {
        flow.setActiveSection(transition.sectionId);
      }
      flow.setReadinessOpen(transition.readinessOpen);
    },
    [flow],
  );
  const handleTemplatePreview = useCallback(async (
    onPreviewOpened?: (previewUrl: string) => void,
  ) => {
    const previewUrl = await handlePreviewBundle();
    if (previewUrl) {
      window.setTimeout(() => {
        flow.closeSelectTemplateModal();
        onPreviewOpened?.(previewUrl);
      }, 500);
    }
  }, [flow, handlePreviewBundle]);
  const handleAddNewStep = useCallback(() => {
    flow.stepsState.addStep();
    flow.setSlideDir("forward");
    flow.setSlideKey((prev: number) => prev + 1);
    flow.setActiveTabIndex(flow.stepsState.steps.length);
  }, [flow]);
  const handlePlaceWidget = useCallback(() => {
    if (!flow.apiKey) {
      flow.setOperationAlert({
        id: "widget-placement",
        heading: "Placement unavailable",
        message: "Check the app configuration and try again.",
      });
      return;
    }
    openThemeEditorInNewTab(buildFpbUpsellThemeEditorUrl({
      shop: flow.shop,
      apiKey: flow.apiKey,
    }));
  }, [flow]);
  Object.assign(flow, {
    ...addonActionHandlers,
    ...visibilityActionHandlers,
    enablePreviewGate,
    handleAddNewStep,
    handleBackClick,
    handleGuidedTourStepChange,
    handlePlaceWidget,
    handlePreviewBundle,
    finishPreviewBundleLoading,
    isPreviewBundleLoading,
    handleReadinessItemClick,
    handleSectionChange,
    handleTemplatePreview,
    openProductInAdmin,
  });
}
