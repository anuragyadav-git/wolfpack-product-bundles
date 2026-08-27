import { useCallback, useMemo, useState } from "react";
import { AppLogger } from "../../../lib/logger";
import { navigateBackOrFallback } from "../../../lib/navigation";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { markBundlePreviewComplete } from "../../../lib/bundle-preview-readiness";
import { pickPpbPreviewUrl } from "../../../lib/ppb-preview-url";
import { appendBundlePreviewToken } from "../../../lib/bundle-preview-url";
import { prepareStorefrontPreviewForOpen } from "../../../lib/storefront-sync-preview.client";
import { validatePpbWidgetPlacementBeforePreview } from "../../../lib/ppb-widget-placement.client";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import { blockUnsavedAdminNavigation } from "../../../lib/admin-unsaved-navigation";
import {
  openPendingDashboardPreview,
  navigatePendingDashboardPreview,
  closePendingDashboardPreview,
} from "../../../lib/dashboard-preview-window";
import type { BundleReadinessItem } from "../../../components/bundle-configure/BundleReadinessOverlay";
import {
  getGuidedTourTransition,
  type TourStep,
} from "../../../components/bundle-configure/tourSteps";

function recordBundlePreview(bundleLink: string) {
  const formData = new FormData();
  formData.append("intent", "recordBundlePreview");
  formData.append("bundleLink", bundleLink);
  formData.append("routeFamily", "ppb_configure");
  void fetch(window.location.href, { method: "POST", body: formData }).catch(() => {});
}

export function usePpbPreviewReadinessHandlers({
  base,
  visibility,
  templateState,
}: {
  base: any;
  visibility: any;
  templateState: any;
}) {
  const [isPreviewBundleLoading, setIsPreviewBundleLoading] = useState(false);
  const closeDisabledPreviewModal = useCallback(() => undefined, []);
  const enablePreviewGate = {
    modalProps: {
      open: false,
      onClose: closeDisabledPreviewModal,
      themeEditorUrl: base.themeEditorUrl,
      onSetupVisibility: () => base.setActiveSection("bundle_visibility"),
    },
  };
  const handlePreviewBundle = useCallback(async () => {
    if (base.isDirty) {
      base.shopify.toast.show(
        "Please save your changes before previewing the bundle",
        { isError: true, duration: 4000 },
      );
      return false;
    }
    const pendingPreviewWindow = openPendingDashboardPreview();
    setIsPreviewBundleLoading(true);
    try {
      let preview: any = null;
      try {
        preview = await prepareStorefrontPreviewForOpen();
      } catch (err: any) {
        AppLogger.warn("Storefront preview preparation warning in PPB:", {}, err);
      }
      const bundleStatusForPreview = String(
        (base.bundle as any).status ?? "",
      ).toLowerCase();
      let productUrl = pickPpbPreviewUrl({
        appEmbedEnabled: true,
        bundleStatus: bundleStatusForPreview,
        productHandle: base.bundle.shopifyProductHandle,
        bundleProduct: base.bundleProduct,
        shop: base.shop,
      });
      if (!productUrl && base.bundleProduct?.id) {
        const productId = base.bundleProduct.id.includes(
          "gid://shopify/Product/",
        )
          ? base.bundleProduct.id.split("/").pop()
          : base.bundleProduct.id;
        const shopDomain = base.shop.includes(".myshopify.com")
          ? base.shop.replace(".myshopify.com", "")
          : base.shop.split(".")[0];
        productUrl = `https://admin.shopify.com/store/${shopDomain}/products/${productId}`;
      }
      if (!productUrl && base.bundle.shopifyProductHandle) {
        const shopDomain = base.shop.includes(".myshopify.com")
          ? base.shop.replace(".myshopify.com", "")
          : base.shop.split(".")[0];
        productUrl = `https://${shopDomain}.myshopify.com/products/${base.bundle.shopifyProductHandle}`;
      }
      if (!productUrl) {
        closePendingDashboardPreview(pendingPreviewWindow);
        AppLogger.error("Bundle product data:", {}, base.bundleProduct);
        base.shopify.toast.show(
          "Unable to determine bundle product URL. Please check bundle product configuration.",
          {
            isError: true,
            duration: 5000,
          },
        );
        return false;
      }
      const isStorefrontUrl = !productUrl.includes("/admin.shopify.com/");
      if (isStorefrontUrl && base.bundleProduct?.id) {
        try {
          const formData = new FormData();
          formData.append("intent", "assignProductTemplate");
          formData.append("productId", base.bundleProduct.id);
          formData.append(
            "templateSuffix",
            (base.formState.templateName || "").trim(),
          );
          await fetch(window.location.href, { method: "POST", body: formData });
        } catch (err: any) {
          AppLogger.error(
            "Failed to sync product templateSuffix before preview",
            {},
            err,
          );
        }
      }
      if (isStorefrontUrl) {
        try {
          const placement = await validatePpbWidgetPlacementBeforePreview(
            window.location.href,
          );
          if (!placement.ready && placement.message) {
            base.shopify.toast.show(placement.message, { duration: 4000 });
          }
        } catch {
          // Non-blocking placement validation
        }
      }
      const previewUrl = isStorefrontUrl && preview?.previewToken
        ? appendBundlePreviewToken(productUrl, preview.previewToken)
        : productUrl;

      if (!navigatePendingDashboardPreview(pendingPreviewWindow, previewUrl)) {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }
      recordBundlePreview(productUrl);
      const isPreviewUrl =
        base.bundleProduct &&
        productUrl === base.bundleProduct.onlineStorePreviewUrl;
      const message = isPreviewUrl
        ? "Bundle product preview opened in new tab"
        : "Bundle product opened in new tab";
      markBundlePreviewComplete({
        bundleId: base.bundle.id,
        storage: window.localStorage,
        setHasPreview: templateState.setHasPreview,
      });
      base.shopify.toast.show(message, { isError: false });
      return previewUrl;
    } catch (error: any) {
      closePendingDashboardPreview(pendingPreviewWindow);
      base.shopify.toast.show(
        error instanceof Error
          ? error.message
          : "Preview is not ready. Please try preview again.",
        { isError: true, duration: 5000 },
      );
      return false;
    } finally {
      window.setTimeout(() => setIsPreviewBundleLoading(false), 500);
    }
  }, [base, templateState.setHasPreview]);
  const readinessItems = useMemo<BundleReadinessItem[]>(() => {
    const hasProducts =
      base.stepsState.steps.reduce((totalProducts: number, step: any) => {
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
              0,
            )
          : 0;
        return totalProducts + legacyProducts + categoryProductCount;
      }, 0) >= 3;
    const widgetPlaced =
      visibility.upsellWidgetEnabled || visibility.bundleEmbedEnabled;
    const parentProductActive =
      String(
        base.productStatus || base.loadedBundleProduct?.status || "",
      ).toLowerCase() === "active";
    return [
      {
        key: "embed",
        label: "App Embed Enabled",
        description: "Needed for your bundle to show up on store",
        points: 15,
        done: base.appEmbedEnabled,
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
        done: base.pricingState.discountEnabled,
      },
      {
        key: "preview",
        label: "Preview Bundle",
        description: "Check your bundle looks and works right",
        points: 10,
        done: templateState.hasPreview,
      },
      {
        key: "widget",
        label: "Place Bundle Widget",
        description: "Place the bundle widget on your product page",
        points: 25,
        done: widgetPlaced,
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
    base.appEmbedEnabled,
    base.loadedBundleProduct?.status,
    base.pricingState.discountEnabled,
    base.productStatus,
    base.stepsState.steps,
    templateState.hasPreview,
    visibility.upsellWidgetEnabled,
    visibility.bundleEmbedEnabled,
  ]);
  const readinessScore = readinessItems.reduce(
    (sum, item) => sum + (item.done ? item.points : 0),
    0,
  );
  const handleSectionChange = useCallback(
    (section: string) => {
      if (
        blockUnsavedAdminNavigation(
          base.isDirty,
          base.triggerSaveBarIrritation,
        )
      ) {
        return;
      }
      base.setActiveSection(section);
    },
    [base],
  );
  const openProductInAdmin = useCallback(
    (productId: string) => {
      const numericProductId = productId.startsWith("gid://")
        ? (productId.split("/").pop() ?? productId)
        : productId;
      const productGid = productId.startsWith("gid://")
        ? productId
        : `gid://shopify/Product/${productId}`;
      const storeHandle = base.shop?.replace(".myshopify.com", "");
      const adminProductUrl = `https://admin.shopify.com/store/${storeHandle}/products/${numericProductId}`;
      const openFallback = () => {
        try {
          base.shopify.navigate(adminProductUrl);
        } catch (error: any) {
          AppLogger.warn(
            "Falling back to a new tab for Admin product navigation",
            { productId },
            error as any,
          );
          window.open(adminProductUrl, "_blank");
        }
        base.refreshParentProductStatusFromShopify();
      };
      const intentsApi = (base.shopify as any).intents;
      if (typeof intentsApi?.invoke === "function") {
        try {
          const intentResult = intentsApi.invoke("edit:shopify/Product", {
            type: "shopify/Product",
            value: productGid,
          });
          base.refreshParentProductStatusFromShopify();
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
    [base],
  );
  const handleBackClick = useCallback(() => {
    if (
      blockUnsavedAdminNavigation(
        base.isDirty && !base.forceNavigation,
        base.triggerSaveBarIrritation,
      )
    ) {
      return;
    }
    navigateBackOrFallback(base.navigate, "/app/dashboard", { replaceFallback: true });
  }, [base]);
  const handleReadinessItemClick = useCallback(
    (key: string) => {
      templateState.setReadinessOpen(false);
      switch (key) {
        case "embed":
          base.openThemeEditorForAppEmbed();
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
        case "widget":
          handleSectionChange("bundle_visibility");
          break;
        case "product_active": {
          const productId =
            base.bundleProduct?.legacyResourceId ||
            base.bundleProduct?.id?.split("/").pop() ||
            (base.bundle as any).shopifyProductId?.split("/").pop();
          if (productId) {
            openProductInAdmin(productId);
          }
          break;
        }
        default:
          break;
      }
    },
    [
      base,
      handlePreviewBundle,
      handleSectionChange,
      openProductInAdmin,
      templateState,
    ],
  );
  const handleGuidedTourStepChange = useCallback(
    (step: TourStep) => {
      const transition = getGuidedTourTransition(step);
      if (transition.sectionId) {
        base.setActiveSection(transition.sectionId);
      }
      templateState.setReadinessOpen(transition.readinessOpen);
    },
    [base, templateState],
  );
  const handleAddNewStep = useCallback(() => {
    base.stepsState.addStep();
    templateState.setSlideDir("forward");
    templateState.setSlideKey((prev: number) => prev + 1);
    templateState.setActiveTabIndex(base.stepsState.steps.length);
  }, [base, templateState]);

  return {
    enablePreviewGate,
    handlePreviewBundle,
    isPreviewBundleLoading,
    readinessItems,
    readinessScore,
    handleSectionChange,
    openProductInAdmin,
    handleBackClick,
    handleReadinessItemClick,
    handleGuidedTourStepChange,
    handleAddNewStep,
  };
}
