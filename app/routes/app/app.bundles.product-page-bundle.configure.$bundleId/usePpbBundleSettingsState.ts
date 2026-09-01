import { useMemo, useRef, useState } from "react";
import {
  normalizeDefaultProductsData,
  type DefaultProductsData,
} from "../../../lib/bundle-config/default-products";

export function usePpbBundleSettingsState({ bundle }: { bundle: any }) {
  const [preSelectedProductVariantId, setPreSelectedProductVariantId] =
    useState<string>((bundle as any).preSelectedProductVariantId ?? "");
  const initialValidateQuantityPerProduct =
    ((bundle as any).validateQuantityPerProduct as {
      isEnabled?: boolean;
      allowedQuantity?: number;
    } | null) ?? null;
  const [quantityValidationEnabled, setQuantityValidationEnabled] =
    useState<boolean>(initialValidateQuantityPerProduct?.isEnabled === true);
  const [maxQtyPerProduct, setMaxQtyPerProduct] = useState<string>(
    (
      initialValidateQuantityPerProduct?.allowedQuantity ??
      (bundle as any).maxQtyPerProduct ??
      1
    ).toString(),
  );
  const [variantSelectorEnabled, setVariantSelectorEnabled] = useState<boolean>(
    (bundle as any).variantSelectorEnabled ?? true,
  );
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState<boolean>(
    (bundle as any).lowStockAlertEnabled ?? false,
  );
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState<string>(
    String((bundle as any).lowStockAlertThreshold ?? 5),
  );
  const [lowStockAlertMessage, setLowStockAlertMessage] = useState<string>(
    (bundle as any).lowStockAlertMessage ?? "Only {{stock}} left",
  );
  const originalLowStockAlertEnabledRef = useRef<boolean>(
    (bundle as any).lowStockAlertEnabled ?? false,
  );
  const originalLowStockAlertThresholdRef = useRef<string>(
    String((bundle as any).lowStockAlertThreshold ?? 5),
  );
  const originalLowStockAlertMessageRef = useRef<string>(
    (bundle as any).lowStockAlertMessage ?? "Only {{stock}} left",
  );
  const [stickyAddToCartEnabled, setStickyAddToCartEnabled] =
    useState<boolean>((bundle as any).stickyAddToCartEnabled ?? false);
  const [stickyAddToCartShowDesktop, setStickyAddToCartShowDesktop] =
    useState<boolean>((bundle as any).stickyAddToCartShowDesktop ?? true);
  const [stickyAddToCartShowMobile, setStickyAddToCartShowMobile] =
    useState<boolean>((bundle as any).stickyAddToCartShowMobile ?? true);
  const [stickyAddToCartAction, setStickyAddToCartAction] = useState<
    "scroll_to_offers" | "add_selected_offer"
  >(
    (bundle as any).stickyAddToCartAction === "add_selected_offer"
      ? "add_selected_offer"
      : "scroll_to_offers",
  );
  const originalStickyAddToCartEnabledRef = useRef(
    (bundle as any).stickyAddToCartEnabled ?? false,
  );
  const originalStickyAddToCartShowDesktopRef = useRef(
    (bundle as any).stickyAddToCartShowDesktop ?? true,
  );
  const originalStickyAddToCartShowMobileRef = useRef(
    (bundle as any).stickyAddToCartShowMobile ?? true,
  );
  const originalStickyAddToCartActionRef = useRef<
    "scroll_to_offers" | "add_selected_offer"
  >(
    (bundle as any).stickyAddToCartAction === "add_selected_offer"
      ? "add_selected_offer"
      : "scroll_to_offers",
  );
  const [showTextOnAddButton, setShowTextOnAddButton] = useState<boolean>(
    (bundle as any).showTextOnAddButton ?? false,
  );
  const [bundleCartTitle, setBundleCartTitle] = useState<string>(
    (bundle as any).bundleCartTitle ?? "",
  );
  const [bundleCartSubtitle, setBundleCartSubtitle] = useState<string>(
    (bundle as any).bundleCartSubtitle ?? "",
  );
  const [bundleBannerDesktopUrl, setBundleBannerDesktopUrl] = useState<string>(
    (bundle as any).bundleBannerDesktopUrl ?? "",
  );
  const [bundleBannerMobileUrl, setBundleBannerMobileUrl] = useState<string>(
    (bundle as any).bundleBannerMobileUrl ?? "",
  );
  const [bundleLevelCss, setBundleLevelCss] = useState<string>(
    (bundle as any).bundleLevelCss ?? "",
  );
  const [bundleLevelCssExpanded, setBundleLevelCssExpanded] = useState(false);
  const initialDefaultProductsData = useMemo(
    () => normalizeDefaultProductsData((bundle as any).defaultProductsData),
    [bundle],
  );
  const [defaultProductsData, setDefaultProductsData] =
    useState<DefaultProductsData>(initialDefaultProductsData);
  const originalDefaultProductsDataRef = useRef<DefaultProductsData>(
    initialDefaultProductsData,
  );
  const [useSingleStepCategoriesAsBundleSteps, setUseSingleStepCategoriesAsBundleSteps] =
    useState<boolean>(
      (bundle as any).useSingleStepCategoriesAsBundleSteps === true,
    );

  return {
    preSelectedProductVariantId,
    setPreSelectedProductVariantId,
    initialValidateQuantityPerProduct,
    quantityValidationEnabled,
    setQuantityValidationEnabled,
    maxQtyPerProduct,
    setMaxQtyPerProduct,
    variantSelectorEnabled,
    setVariantSelectorEnabled,
    lowStockAlertEnabled,
    setLowStockAlertEnabled,
    lowStockAlertThreshold,
    setLowStockAlertThreshold,
    lowStockAlertMessage,
    setLowStockAlertMessage,
    originalLowStockAlertEnabledRef,
    originalLowStockAlertThresholdRef,
    originalLowStockAlertMessageRef,
    stickyAddToCartEnabled,
    setStickyAddToCartEnabled,
    stickyAddToCartShowDesktop,
    setStickyAddToCartShowDesktop,
    stickyAddToCartShowMobile,
    setStickyAddToCartShowMobile,
    stickyAddToCartAction,
    setStickyAddToCartAction,
    originalStickyAddToCartEnabledRef,
    originalStickyAddToCartShowDesktopRef,
    originalStickyAddToCartShowMobileRef,
    originalStickyAddToCartActionRef,
    showTextOnAddButton,
    setShowTextOnAddButton,
    bundleCartTitle,
    setBundleCartTitle,
    bundleCartSubtitle,
    setBundleCartSubtitle,
    bundleBannerDesktopUrl,
    setBundleBannerDesktopUrl,
    bundleBannerMobileUrl,
    setBundleBannerMobileUrl,
    bundleLevelCss,
    setBundleLevelCss,
    bundleLevelCssExpanded,
    setBundleLevelCssExpanded,
    initialDefaultProductsData,
    defaultProductsData,
    setDefaultProductsData,
    originalDefaultProductsDataRef,
    useSingleStepCategoriesAsBundleSteps,
    setUseSingleStepCategoriesAsBundleSteps,
  };
}
