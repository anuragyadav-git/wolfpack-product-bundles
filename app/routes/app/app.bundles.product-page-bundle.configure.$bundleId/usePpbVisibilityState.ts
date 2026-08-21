import { useRef, useState } from "react";
import {
  asVisibilityArray,
  getVisibilityDisplayTarget,
} from "./ConfigureBundleFlow.helpers";
import { normalizePpbBundleEmbedConfig } from "../../../lib/ppb-bundle-embed";

export function usePpbVisibilityState({
  bundle,
}: {
  bundle: any;
}) {
  const savedBundleUpsellConfig = ((bundle as any).bundleUpsellConfig ??
    null) as any;
  const savedWidgetConfiguration = savedBundleUpsellConfig?.widgetConfiguration;
  const savedUpsellConfiguration = savedBundleUpsellConfig?.upsellConfiguration;
  const normalizedEmbedConfig = normalizePpbBundleEmbedConfig(
    savedBundleUpsellConfig,
  );
  const canonicalEmbedConfiguration = normalizedEmbedConfig.upsellConfiguration;
  const savedWidgetDisplayConfiguration =
    savedWidgetConfiguration?.displayConfiguration;
  const savedEmbedDisplayConfiguration =
    savedUpsellConfiguration?.displayConfiguration;
  const [upsellWidgetEnabled, setUpsellWidgetEnabled] = useState<boolean>(
    savedWidgetConfiguration?.isEnabled ??
      (bundle as any).upsellWidgetEnabled ??
      false,
  );
  const [upsellWidgetDisplayMode, setUpsellWidgetDisplayMode] =
    useState<string>((bundle as any).upsellWidgetDisplayMode ?? "block");
  const [upsellWidgetDisplayOn, setUpsellWidgetDisplayOn] = useState<string>(
    (bundle as any).upsellWidgetDisplayOn ??
      getVisibilityDisplayTarget(savedWidgetDisplayConfiguration, "all"),
  );
  const [upsellWidgetTitle, setUpsellWidgetTitle] = useState<string>(
    savedWidgetConfiguration?.title ?? "Bundle & Save",
  );
  const [upsellWidgetDescription, setUpsellWidgetDescription] =
    useState<string>(savedWidgetConfiguration?.description ?? "");
  const [upsellWidgetButtonText, setUpsellWidgetButtonText] = useState<string>(
    savedWidgetConfiguration?.buttonText ?? "Buy With Bundle",
  );
  const [upsellWidgetImageUrl, setUpsellWidgetImageUrl] = useState<string>(
    savedWidgetConfiguration?.imageUrl ?? "",
  );
  const [upsellWidgetSelectedProducts, setUpsellWidgetSelectedProducts] =
    useState<unknown[]>(
      asVisibilityArray(savedWidgetDisplayConfiguration?.selectedProducts),
    );
  const [
    upsellWidgetSpecificProductPages,
    setUpsellWidgetSpecificProductPages,
  ] = useState<unknown[]>(
    asVisibilityArray(
      savedWidgetDisplayConfiguration?.showOnSpecificProductPages,
    ),
  );
  const [
    upsellWidgetCollectionsSelectedData,
    setUpsellWidgetCollectionsSelectedData,
  ] = useState<unknown[]>(
    asVisibilityArray(savedWidgetDisplayConfiguration?.collectionsSelectedData),
  );
  const [
    upsellWidgetSpecificCollectionPages,
    setUpsellWidgetSpecificCollectionPages,
  ] = useState<unknown[]>(
    asVisibilityArray(
      savedWidgetDisplayConfiguration?.showOnSpecificCollectionPages,
    ),
  );
  const [autoSelectBrowsedProduct, setAutoSelectBrowsedProduct] =
    useState<boolean>(
      savedWidgetConfiguration?.useLinkProductAsDefaultProduct ??
        (bundle as any).autoSelectBrowsedProduct ??
        false,
    );
  const [bundleEmbedEnabled, setBundleEmbedEnabled] = useState<boolean>(
    canonicalEmbedConfiguration.isEnabled,
  );
  const [bundleEmbedTitle, setBundleEmbedTitle] = useState<string>(
    canonicalEmbedConfiguration.title,
  );
  const [bundleEmbedSubTitle, setBundleEmbedSubTitle] = useState<string>(
    canonicalEmbedConfiguration.subTitle,
  );
  const [bundleEmbedDisplayOn, setBundleEmbedDisplayOn] = useState<string>(
    getVisibilityDisplayTarget(
      canonicalEmbedConfiguration.displayConfiguration,
      "all_products",
    ),
  );
  const [bundleEmbedAddBrowsedProduct, setBundleEmbedAddBrowsedProduct] =
    useState<boolean>(
      canonicalEmbedConfiguration.useLinkProductAsDefaultProduct,
    );
  const [bundleEmbedSelectedProducts, setBundleEmbedSelectedProducts] =
    useState<unknown[]>(
      asVisibilityArray(canonicalEmbedConfiguration.displayConfiguration.selectedProducts),
    );
  const [bundleEmbedSpecificProductPages, setBundleEmbedSpecificProductPages] =
    useState<unknown[]>(
      asVisibilityArray(
        canonicalEmbedConfiguration.displayConfiguration.showOnSpecificProductPages,
      ),
    );
  const [
    bundleEmbedCollectionsSelectedData,
    setBundleEmbedCollectionsSelectedData,
  ] = useState<unknown[]>(
      asVisibilityArray(canonicalEmbedConfiguration.displayConfiguration.collectionsSelectedData),
  );
  const [
    bundleEmbedSpecificCollectionPages,
    setBundleEmbedSpecificCollectionPages,
  ] = useState<unknown[]>(
    asVisibilityArray(
      canonicalEmbedConfiguration.displayConfiguration.showOnSpecificCollectionPages,
    ),
  );
  const [bundleEmbedMultiLangText, setBundleEmbedMultiLangText] = useState(
    normalizedEmbedConfig.multiLangText,
  );
  const originalUpsellWidgetEnabledRef = useRef<boolean>(
    savedWidgetConfiguration?.isEnabled ??
      (bundle as any).upsellWidgetEnabled ??
      false,
  );
  const originalUpsellWidgetDisplayModeRef = useRef<string>(
    (bundle as any).upsellWidgetDisplayMode ?? "block",
  );
  const originalUpsellWidgetDisplayOnRef = useRef<string>(
    (bundle as any).upsellWidgetDisplayOn ??
      getVisibilityDisplayTarget(savedWidgetDisplayConfiguration, "all"),
  );
  const originalUpsellWidgetTitleRef = useRef<string>(
    savedWidgetConfiguration?.title ?? "Bundle & Save",
  );
  const originalUpsellWidgetDescriptionRef = useRef<string>(
    savedWidgetConfiguration?.description ?? "",
  );
  const originalUpsellWidgetButtonTextRef = useRef<string>(
    savedWidgetConfiguration?.buttonText ?? "Buy With Bundle",
  );
  const originalUpsellWidgetImageUrlRef = useRef<string>(
    savedWidgetConfiguration?.imageUrl ?? "",
  );
  const originalAutoSelectBrowsedProductRef = useRef<boolean>(
    savedWidgetConfiguration?.useLinkProductAsDefaultProduct ??
      (bundle as any).autoSelectBrowsedProduct ??
      false,
  );
  const originalBundleEmbedEnabledRef = useRef<boolean>(
    canonicalEmbedConfiguration.isEnabled,
  );
  const originalBundleEmbedTitleRef = useRef<string>(
    canonicalEmbedConfiguration.title,
  );
  const originalBundleEmbedSubTitleRef = useRef<string>(
    canonicalEmbedConfiguration.subTitle,
  );
  const originalBundleEmbedDisplayOnRef = useRef<string>(
    getVisibilityDisplayTarget(
      canonicalEmbedConfiguration.displayConfiguration,
      "all_products",
    ),
  );
  const originalBundleEmbedAddBrowsedProductRef = useRef<boolean>(
    canonicalEmbedConfiguration.useLinkProductAsDefaultProduct,
  );
  const originalBundleEmbedSelectedProductsRef = useRef(
    canonicalEmbedConfiguration.displayConfiguration.selectedProducts,
  );
  const originalBundleEmbedSpecificProductPagesRef = useRef(
    canonicalEmbedConfiguration.displayConfiguration.showOnSpecificProductPages,
  );
  const originalBundleEmbedCollectionsSelectedDataRef = useRef(
    canonicalEmbedConfiguration.displayConfiguration.collectionsSelectedData,
  );
  const originalBundleEmbedSpecificCollectionPagesRef = useRef(
    canonicalEmbedConfiguration.displayConfiguration.showOnSpecificCollectionPages,
  );
  const originalBundleEmbedMultiLangTextRef = useRef(
    normalizedEmbedConfig.multiLangText,
  );

  return {
    savedBundleUpsellConfig,
    savedWidgetConfiguration,
    savedUpsellConfiguration,
    savedWidgetDisplayConfiguration,
    savedEmbedDisplayConfiguration,
    upsellWidgetEnabled,
    setUpsellWidgetEnabled,
    upsellWidgetDisplayMode,
    setUpsellWidgetDisplayMode,
    upsellWidgetDisplayOn,
    setUpsellWidgetDisplayOn,
    upsellWidgetTitle,
    setUpsellWidgetTitle,
    upsellWidgetDescription,
    setUpsellWidgetDescription,
    upsellWidgetButtonText,
    setUpsellWidgetButtonText,
    upsellWidgetImageUrl,
    setUpsellWidgetImageUrl,
    upsellWidgetSelectedProducts,
    setUpsellWidgetSelectedProducts,
    upsellWidgetSpecificProductPages,
    setUpsellWidgetSpecificProductPages,
    upsellWidgetCollectionsSelectedData,
    setUpsellWidgetCollectionsSelectedData,
    upsellWidgetSpecificCollectionPages,
    setUpsellWidgetSpecificCollectionPages,
    autoSelectBrowsedProduct,
    setAutoSelectBrowsedProduct,
    bundleEmbedEnabled,
    setBundleEmbedEnabled,
    bundleEmbedTitle,
    setBundleEmbedTitle,
    bundleEmbedSubTitle,
    setBundleEmbedSubTitle,
    bundleEmbedDisplayOn,
    setBundleEmbedDisplayOn,
    bundleEmbedAddBrowsedProduct,
    setBundleEmbedAddBrowsedProduct,
    bundleEmbedSelectedProducts,
    setBundleEmbedSelectedProducts,
    bundleEmbedSpecificProductPages,
    setBundleEmbedSpecificProductPages,
    bundleEmbedCollectionsSelectedData,
    setBundleEmbedCollectionsSelectedData,
    bundleEmbedSpecificCollectionPages,
    setBundleEmbedSpecificCollectionPages,
    bundleEmbedMultiLangText,
    setBundleEmbedMultiLangText,
    originalUpsellWidgetEnabledRef,
    originalUpsellWidgetDisplayModeRef,
    originalUpsellWidgetDisplayOnRef,
    originalUpsellWidgetTitleRef,
    originalUpsellWidgetDescriptionRef,
    originalUpsellWidgetButtonTextRef,
    originalUpsellWidgetImageUrlRef,
    originalAutoSelectBrowsedProductRef,
    originalBundleEmbedEnabledRef,
    originalBundleEmbedTitleRef,
    originalBundleEmbedSubTitleRef,
    originalBundleEmbedDisplayOnRef,
    originalBundleEmbedAddBrowsedProductRef,
    originalBundleEmbedSelectedProductsRef,
    originalBundleEmbedSpecificProductPagesRef,
    originalBundleEmbedCollectionsSelectedDataRef,
    originalBundleEmbedSpecificCollectionPagesRef,
    originalBundleEmbedMultiLangTextRef,
  };
}
