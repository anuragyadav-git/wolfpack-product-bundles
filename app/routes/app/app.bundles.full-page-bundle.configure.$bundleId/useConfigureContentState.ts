import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildDefaultProductEntryFromPicker,
  normalizeDefaultProductsData,
  type DefaultProductsData,
} from "../../../lib/bundle-config/default-products";
import type { IndividualSellingPlanShowFor } from "./configure-constants";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";

export function useConfigureContentState(flow: ConfigureBundleFlowDraft) {
  const { bundle, shop } = flow;
  const shopDomain = useMemo(
    () =>
      shop.includes(".myshopify.com")
        ? shop.replace(".myshopify.com", "")
        : shop,
    [shop],
  );
  const bundlePageUrl = useMemo(
    () => `https://${shopDomain}.myshopify.com/apps/product-bundles/wpb/${encodeURIComponent(bundle.id)}`,
    [shopDomain, bundle.id],
  );

  const [promoBannerBgImage, setPromoBannerBgImage] = useState<string | null>(
    bundle.promoBannerBgImage ?? null,
  );
  const originalPromoBannerBgImageRef = useRef<string | null>(
    bundle.promoBannerBgImage ?? null,
  );
  const [loadingGif, setLoadingGif] = useState<string | null>(
    bundle.loadingGif ?? null,
  );
  const originalLoadingGifRef = useRef<string | null>(
    bundle.loadingGif ?? null,
  );
  const [showStepTimeline, setShowStepTimeline] = useState<boolean>(
    bundle.showStepTimeline !== false,
  );
  const originalShowStepTimelineRef = useRef<boolean>(
    bundle.showStepTimeline !== false,
  );
  const [floatingBadgeEnabled, setFloatingBadgeEnabled] = useState<boolean>(
    (bundle as any).floatingBadgeEnabled ?? false,
  );
  const [floatingBadgeText, setFloatingBadgeText] = useState<string>(
    (bundle as any).floatingBadgeText ?? "",
  );
  const originalFloatingBadgeEnabledRef = useRef<boolean>(
    (bundle as any).floatingBadgeEnabled ?? false,
  );
  const originalFloatingBadgeTextRef = useRef<string>(
    (bundle as any).floatingBadgeText ?? "",
  );
  const [showProductPrices, setShowProductPrices] = useState<boolean>(
    (bundle as any).showProductPrices ?? true,
  );
  const [showCompareAtPrices, setShowCompareAtPrices] = useState<boolean>(
    (bundle as any).showCompareAtPrices ?? false,
  );
  const [cartRedirectToCheckout, setCartRedirectToCheckout] = useState<boolean>(
    (bundle as any).cartRedirectToCheckout ?? false,
  );
  const [allowQuantityChanges, setAllowQuantityChanges] = useState<boolean>(
    (bundle as any).allowQuantityChanges ?? true,
  );
  const initialValidateQuantityPerProduct =
    ((bundle as any).validateQuantityPerProduct as {
      isEnabled?: boolean;
      allowedQuantity?: number;
    } | null) ?? null;
  const [quantityValidationEnabled, setQuantityValidationEnabled] =
    useState<boolean>(initialValidateQuantityPerProduct?.isEnabled === true);
  const [productSlotsEnabled, setProductSlotsEnabled] = useState<boolean>(
    (bundle as any).productSlotsEnabled ?? false,
  );
  const [variantSelectorEnabled, setVariantSelectorEnabled] = useState<boolean>(
    (bundle as any).variantSelectorEnabled ?? true,
  );
  const [maxQtyPerProduct, setMaxQtyPerProduct] = useState<string>(
    (
      initialValidateQuantityPerProduct?.allowedQuantity ??
      (bundle as any).maxQtyPerProduct ??
      1
    ).toString(),
  );
  const [productSlotIconUrl, setProductSlotIconUrl] = useState<string>(
    (bundle as any).productSlotIconUrl ?? "",
  );
  const [showSlotIconPicker, setShowSlotIconPicker] = useState(false);
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
  const [showTextOnAddButton, setShowTextOnAddButton] = useState<boolean>(
    ((bundle as any).showTextOnAddButton ?? false) === true ||
      !!(bundle as any).textOverrides?.addToCartButton,
  );
  const [individualSellingPlanEnabled, setIndividualSellingPlanEnabled] =
    useState<boolean>(
      (
        (bundle as any).individualSellingPlanSelection as {
          isEnabled?: boolean;
        } | null
      )?.isEnabled === true,
    );
  const [individualSellingPlanShowFor, setIndividualSellingPlanShowFor] =
    useState<IndividualSellingPlanShowFor>(
      (
        (bundle as any).individualSellingPlanSelection as {
          showFor?: unknown;
        } | null
      )?.showFor === "OOS_PRODUCTS"
        ? "OOS_PRODUCTS"
        : "ALL_PRODUCTS",
    );
  const originalShowProductPricesRef = useRef<boolean>(
    (bundle as any).showProductPrices ?? true,
  );
  const originalShowCompareAtPricesRef = useRef<boolean>(
    (bundle as any).showCompareAtPrices ?? false,
  );
  const originalCartRedirectToCheckoutRef = useRef<boolean>(
    (bundle as any).cartRedirectToCheckout ?? false,
  );
  const originalAllowQuantityChangesRef = useRef<boolean>(
    (bundle as any).allowQuantityChanges ?? true,
  );
  const directBundleSummary =
    (
      (bundle as any).bundleTextConfig as {
        bundleSummary?: { title?: string; subTitle?: string };
      } | null
    )?.bundleSummary ?? {};
  const initialTextOverrides = {
    ...(((bundle as any).textOverrides as Record<string, string>) ?? {}),
    yourBundle: directBundleSummary.title ?? "",
    reviewBundle: directBundleSummary.subTitle ?? "",
  };
  const [textOverrides, setTextOverrides] =
    useState<Record<string, string>>(initialTextOverrides);
  const [textOverridesByLocale, setTextOverridesByLocale] = useState<
    Record<string, Record<string, string>>
  >(
    ((bundle as any).textOverridesByLocale as Record<
      string,
      Record<string, string>
    >) ?? {},
  );
  const originalTextOverridesRef =
    useRef<Record<string, string>>(initialTextOverrides);
  const originalTextOverridesByLocaleRef = useRef<
    Record<string, Record<string, string>>
  >(
    ((bundle as any).textOverridesByLocale as Record<
      string,
      Record<string, string>
    >) ?? {},
  );
  const [textOverridesLocale, setTextOverridesLocale] = useState<string>("en");

  Object.assign(flow, {
    allowQuantityChanges,
    buildDefaultProductEntryFromPicker,
    bundleLevelCssExpanded,
    bundlePageUrl,
    cartRedirectToCheckout,
    defaultProductsData,
    directBundleSummary,
    floatingBadgeEnabled,
    floatingBadgeText,
    individualSellingPlanEnabled,
    individualSellingPlanShowFor,
    initialDefaultProductsData,
    initialTextOverrides,
    initialValidateQuantityPerProduct,
    loadingGif,
    maxQtyPerProduct,
    normalizeDefaultProductsData,
    originalAllowQuantityChangesRef,
    originalCartRedirectToCheckoutRef,
    originalDefaultProductsDataRef,
    originalFloatingBadgeEnabledRef,
    originalFloatingBadgeTextRef,
    originalLoadingGifRef,
    originalPromoBannerBgImageRef,
    originalShowCompareAtPricesRef,
    originalShowProductPricesRef,
    originalShowStepTimelineRef,
    originalTextOverridesByLocaleRef,
    originalTextOverridesRef,
    productSlotIconUrl,
    productSlotsEnabled,
    promoBannerBgImage,
    quantityValidationEnabled,
    setAllowQuantityChanges,
    setBundleLevelCssExpanded,
    setCartRedirectToCheckout,
    setDefaultProductsData,
    setFloatingBadgeEnabled,
    setFloatingBadgeText,
    setIndividualSellingPlanEnabled,
    setIndividualSellingPlanShowFor,
    setLoadingGif,
    setMaxQtyPerProduct,
    setProductSlotIconUrl,
    setProductSlotsEnabled,
    setPromoBannerBgImage,
    setQuantityValidationEnabled,
    setShowCompareAtPrices,
    setShowProductPrices,
    setShowSlotIconPicker,
    setShowStepTimeline,
    setShowTextOnAddButton,
    setTextOverrides,
    setTextOverridesByLocale,
    setTextOverridesLocale,
    setVariantSelectorEnabled,
    shopDomain,
    showCompareAtPrices,
    showProductPrices,
    showSlotIconPicker,
    showStepTimeline,
    showTextOnAddButton,
    textOverrides,
    textOverridesByLocale,
    textOverridesLocale,
    variantSelectorEnabled,
  });
}
