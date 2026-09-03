import { useCallback } from "react";
import { AppLogger } from "../../../lib/logger";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import {
  buildProductPageThemeEditorDeepLink,
  resolveProductPageTemplateSuffix,
} from "../../../lib/bundle-config/product-page-admin-sections";
import {
  buildVisibilitySelectionIds,
  getVisibilityPickerSelection,
  normalizeVisibilityCollectionForDisplayConfiguration,
  normalizeVisibilityCollectionPageTarget,
  normalizeVisibilityProductForDisplayConfiguration,
  normalizeVisibilityProductPageTarget,
} from "./ConfigureBundleFlow.helpers";

export function usePpbPlacementHandlers({
  base,
  visibility,
  templateState,
}: {
  base: any;
  visibility: any;
  templateState: any;
}) {
  const handleCloseProductsModal = useCallback(() => {
    base.closeProductsModal();
    base.setCurrentModalStepId("");
  }, [base]);
  const handleCloseCollectionsModal = useCallback(() => {
    base.closeCollectionsModal();
    base.setCurrentModalStepId("");
  }, [base]);
  const loadAvailablePages = useCallback(() => {
    base.setIsLoadingPages(true);
    try {
      const formData = new FormData();
      formData.append("intent", "getThemeTemplates");
      base.fetcher.submit(formData, { method: "post" });
    } catch (error: any) {
      AppLogger.error("Failed to load theme templates:", {}, error as any);
      showAdminTransientErrorToast(base.shopify, "Templates not loaded");
      base.setIsLoadingPages(false);
      templateState.setIsPreparingPlacementTemplates(false);
      templateState.pendingPlacementModalRef.current = false;
    }
  }, [base, templateState]);
  const handlePlaceWidget = useCallback(() => {
    try {
      templateState.pendingPlacementModalRef.current = true;
      templateState.setIsPreparingPlacementTemplates(true);
      loadAvailablePages();
    } catch (error: any) {
      AppLogger.error("Error opening page selection:", {}, error as any);
      showAdminTransientErrorToast(base.shopify, "Pages not available");
      templateState.setIsPreparingPlacementTemplates(false);
      templateState.pendingPlacementModalRef.current = false;
    }
  }, [base, loadAvailablePages, templateState]);
  const openVisibilityProductPicker = useCallback(
    async (target: "widget" | "embed") => {
      const currentProducts =
        target === "widget"
          ? visibility.upsellWidgetSelectedProducts
          : visibility.bundleEmbedSelectedProducts;
      const picked = await (base.shopify as any).resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        selectionIds: buildVisibilitySelectionIds(currentProducts),
      });
      const selection = getVisibilityPickerSelection(picked);
      if (!selection) return;
      const selectedProducts = selection.map((value) => normalizeVisibilityProductForDisplayConfiguration(value));
      const pageTargets = selectedProducts.map((value) => normalizeVisibilityProductPageTarget(value));
      if (target === "widget") {
        visibility.setUpsellWidgetSelectedProducts(selectedProducts);
        visibility.setUpsellWidgetSpecificProductPages(pageTargets);
      } else {
        visibility.setBundleEmbedSelectedProducts(selectedProducts);
        visibility.setBundleEmbedSpecificProductPages(pageTargets);
      }
      base.markAsDirty();
    },
    [base, visibility],
  );
  const openVisibilityCollectionPicker = useCallback(
    async (target: "widget" | "embed") => {
      const currentCollections =
        target === "widget"
          ? visibility.upsellWidgetCollectionsSelectedData
          : visibility.bundleEmbedCollectionsSelectedData;
      const picked = await (base.shopify as any).resourcePicker({
        type: "collection",
        multiple: true,
        action: "select",
        selectionIds: buildVisibilitySelectionIds(currentCollections),
      });
      const selection = getVisibilityPickerSelection(picked);
      if (!selection) return;
      const collectionsSelectedData = selection.map((value) => normalizeVisibilityCollectionForDisplayConfiguration(value));
      const pageTargets = collectionsSelectedData.map((value) => normalizeVisibilityCollectionPageTarget(value));
      if (target === "widget") {
        visibility.setUpsellWidgetCollectionsSelectedData(
          collectionsSelectedData,
        );
        visibility.setUpsellWidgetSpecificCollectionPages(pageTargets);
      } else {
        visibility.setBundleEmbedCollectionsSelectedData(
          collectionsSelectedData,
        );
        visibility.setBundleEmbedSpecificCollectionPages(pageTargets);
      }
      base.markAsDirty();
    },
    [base, visibility],
  );
  const removeVisibilityProductTarget = useCallback(
    (target: "widget" | "embed", indexToRemove: number) => {
      if (target === "widget") {
        visibility.setUpsellWidgetSelectedProducts((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
        visibility.setUpsellWidgetSpecificProductPages((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
      } else {
        visibility.setBundleEmbedSelectedProducts((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
        visibility.setBundleEmbedSpecificProductPages((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
      }
      base.markAsDirty();
    },
    [base, visibility],
  );
  const removeVisibilityCollectionTarget = useCallback(
    (target: "widget" | "embed", indexToRemove: number) => {
      if (target === "widget") {
        visibility.setUpsellWidgetCollectionsSelectedData((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
        visibility.setUpsellWidgetSpecificCollectionPages((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
      } else {
        visibility.setBundleEmbedCollectionsSelectedData((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
        visibility.setBundleEmbedSpecificCollectionPages((prev: unknown[]) =>
          prev.filter((_, index) => index !== indexToRemove),
        );
      }
      base.markAsDirty();
    },
    [base, visibility],
  );
  const handlePageSelection = useCallback(
    async (template: any) => {
      try {
        if (!template || !template.handle) {
          AppLogger.error(
            "🚨 [THEME_EDITOR] Invalid template object:",
            {},
            template,
          );
          showAdminTransientErrorToast(base.shopify, "Template unavailable");
          return;
        }
        base.clearOperationAlert();
        if (!base.apiKey || !base.blockHandle) {
          AppLogger.error("🚨 [THEME_EDITOR] Missing app configuration");
          base.setOperationAlert({
            id: "theme-editor",
            heading: "Theme editor unavailable",
            message: "Check the app configuration and try again.",
          });
          return;
        }
        const placementBlockHandle =
          base.activeSection === "bundle_widget"
            ? "bundle-upsell"
            : "bundle-product-page-embed";
        const isBundleEmbedPlacement = base.activeSection === "bundle_embed";
        const productIdForTemplate =
          base.bundleProduct?.id ??
          (base.bundle as any).shopifyProductId ??
          null;
        const productTemplateSuffix =
          resolveProductPageTemplateSuffix(template);
        if (productIdForTemplate && !isBundleEmbedPlacement) {
          const formData = new FormData();
          formData.append("intent", "assignProductTemplate");
          formData.append("productId", productIdForTemplate);
          formData.append("templateSuffix", productTemplateSuffix ?? "");
          const response = await fetch(window.location.href, {
            method: "POST",
            body: formData,
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || result?.success === false) {
            throw new Error(
              result?.error ||
                "Failed to assign the selected template to the bundle parent product",
            );
          }
        }
        const representativeProduct =
          visibility.bundleEmbedSelectedProducts?.[0] ?? null;
        const pageProductHandle = isBundleEmbedPlacement
          ? representativeProduct?.handle ?? base.bundleProduct?.handle ?? base.bundle.shopifyProductHandle
          : base.bundleProduct?.handle ?? base.bundle.shopifyProductHandle;
        const productPreviewUrl = isBundleEmbedPlacement
          ? representativeProduct?.onlineStorePreviewUrl ?? representativeProduct?.onlineStoreUrl
          : base.bundleProduct?.onlineStorePreviewUrl;
        const themeEditorUrl = buildProductPageThemeEditorDeepLink({
          shop: base.shop,
          apiKey: base.apiKey,
          blockHandle: placementBlockHandle,
          bundleId: base.bundle.id,
          productHandle: pageProductHandle,
          productPreviewUrl,
          template,
        });
        base.setSelectedPage(template);
        base.closePageSelectionModal();
        openThemeEditorInNewTab(themeEditorUrl);
        base.shopify.toast.show("Editor opened");
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        AppLogger.error(
          "🚨 [THEME_EDITOR] Error in handlePageSelection:",
          { errorMessage },
          error as any,
        );
        showAdminTransientErrorToast(base.shopify, "Theme editor unavailable");
      }
    },
    [base, visibility.bundleEmbedSelectedProducts],
  );

  return {
    handleCloseProductsModal,
    handleCloseCollectionsModal,
    loadAvailablePages,
    handlePlaceWidget,
    openVisibilityProductPicker,
    openVisibilityCollectionPicker,
    removeVisibilityProductTarget,
    removeVisibilityCollectionTarget,
    handlePageSelection,
  };
}
