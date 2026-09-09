import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  buildVisibilitySelectionIds,
  getVisibilityPickerSelection,
  normalizeVisibilityCollectionForDisplayConfiguration,
  normalizeVisibilityCollectionPageTarget,
  normalizeVisibilityProductForDisplayConfiguration,
  normalizeVisibilityProductPageTarget,
  type VisibilityResource,
} from "./visibility-helpers";

type VisibilityActionDependencies = {
  markAsDirty: () => void;
  upsellWidgetCollectionsSelectedData: VisibilityResource[];
  upsellWidgetSelectedProducts: VisibilityResource[];
  setUpsellWidgetCollectionsSelectedData: Dispatch<
    SetStateAction<VisibilityResource[]>
  >;
  setUpsellWidgetSelectedProducts: Dispatch<
    SetStateAction<VisibilityResource[]>
  >;
  setUpsellWidgetSpecificCollectionPages: Dispatch<
    SetStateAction<VisibilityResource[]>
  >;
  setUpsellWidgetSpecificProductPages: Dispatch<
    SetStateAction<VisibilityResource[]>
  >;
};

export function useConfigureVisibilityActionHandlers(
  dependencies: VisibilityActionDependencies
) {
  const shopify = useAppBridge();
  const {
    markAsDirty,
    setUpsellWidgetCollectionsSelectedData,
    setUpsellWidgetSelectedProducts,
    setUpsellWidgetSpecificCollectionPages,
    setUpsellWidgetSpecificProductPages,
    upsellWidgetCollectionsSelectedData,
    upsellWidgetSelectedProducts,
  } = dependencies;
  const openVisibilityProductPicker = useCallback(
    async (target: "widget" | "embed") => {
      const currentProducts =
        target === "widget" ? upsellWidgetSelectedProducts : [];
      const picked = await shopify.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        selectionIds: buildVisibilitySelectionIds(currentProducts),
      });
      const selection = getVisibilityPickerSelection(picked);
      if (!selection) return;
      const selectedProducts = selection.map((product) =>
        normalizeVisibilityProductForDisplayConfiguration(product)
      );
      const pageTargets = selectedProducts.map((product) =>
        normalizeVisibilityProductPageTarget(product)
      );
      setUpsellWidgetSelectedProducts(selectedProducts);
      setUpsellWidgetSpecificProductPages(pageTargets);
      markAsDirty();
    },
    [
      markAsDirty,
      setUpsellWidgetSelectedProducts,
      setUpsellWidgetSpecificProductPages,
      shopify,
      upsellWidgetSelectedProducts,
    ]
  );
  const openVisibilityCollectionPicker = useCallback(
    async (target: "widget" | "embed") => {
      const currentCollections =
        target === "widget" ? upsellWidgetCollectionsSelectedData : [];
      const picked = await shopify.resourcePicker({
        type: "collection",
        multiple: true,
        action: "select",
        selectionIds: buildVisibilitySelectionIds(currentCollections),
      });
      const selection = getVisibilityPickerSelection(picked);
      if (!selection) return;
      const collectionsSelectedData = selection.map((collection) =>
        normalizeVisibilityCollectionForDisplayConfiguration(collection)
      );
      const pageTargets = collectionsSelectedData.map((collection) =>
        normalizeVisibilityCollectionPageTarget(collection)
      );
      setUpsellWidgetCollectionsSelectedData(collectionsSelectedData);
      setUpsellWidgetSpecificCollectionPages(pageTargets);
      markAsDirty();
    },
    [
      markAsDirty,
      setUpsellWidgetCollectionsSelectedData,
      setUpsellWidgetSpecificCollectionPages,
      shopify,
      upsellWidgetCollectionsSelectedData,
    ]
  );
  const removeVisibilityProductTarget = useCallback(
    (target: "widget" | "embed", indexToRemove: number) => {
      if (target === "widget") {
        setUpsellWidgetSelectedProducts((prev) =>
          prev.filter((_, index) => index !== indexToRemove)
        );
        setUpsellWidgetSpecificProductPages((prev) =>
          prev.filter((_, index) => index !== indexToRemove)
        );
      }
      markAsDirty();
    },
    [
      markAsDirty,
      setUpsellWidgetSelectedProducts,
      setUpsellWidgetSpecificProductPages,
    ]
  );
  const removeVisibilityCollectionTarget = useCallback(
    (target: "widget" | "embed", indexToRemove: number) => {
      if (target === "widget") {
        setUpsellWidgetCollectionsSelectedData((prev) =>
          prev.filter((_, index) => index !== indexToRemove)
        );
        setUpsellWidgetSpecificCollectionPages((prev) =>
          prev.filter((_, index) => index !== indexToRemove)
        );
      }
      markAsDirty();
    },
    [
      markAsDirty,
      setUpsellWidgetCollectionsSelectedData,
      setUpsellWidgetSpecificCollectionPages,
    ]
  );

  return {
    buildVisibilitySelectionIds,
    getVisibilityPickerSelection,
    normalizeVisibilityCollectionForDisplayConfiguration,
    normalizeVisibilityCollectionPageTarget,
    normalizeVisibilityProductForDisplayConfiguration,
    normalizeVisibilityProductPageTarget,
    openVisibilityCollectionPicker,
    openVisibilityProductPicker,
    removeVisibilityCollectionTarget,
    removeVisibilityProductTarget,
  };
}
