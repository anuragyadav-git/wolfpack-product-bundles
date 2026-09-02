import { useMemo, useRef, useState } from "react";
import {
  buildDefaultProductEntryFromPicker,
  normalizeDefaultProductsData,
  type DefaultProductsData,
} from "../../../lib/bundle-config/default-products";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";
import { buildFpbStorefrontUrl } from "../../../lib/fpb-storefront-url";
import type {
  CountdownExpiryAction,
  CountdownLayout,
  CountdownPosition,
} from "../../../lib/bundle-countdown";

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
    () => typeof bundle.publicNumber !== "number"
      ? ""
      : buildFpbStorefrontUrl(
          `${shopDomain}.myshopify.com`,
          bundle.publicNumber,
          flow.storefrontProxyRoot,
        ),
    [shopDomain, bundle.publicNumber, flow.storefrontProxyRoot],
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
  const [cartRedirectToCheckout, setCartRedirectToCheckout] = useState<boolean>(
    (bundle as any).cartRedirectToCheckout ?? false,
  );
  const [allowQuantityChanges, setAllowQuantityChanges] = useState<boolean>(
    (bundle as any).allowQuantityChanges ?? true,
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
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(
    (bundle as any).countdownEnabled ?? false,
  );
  const [countdownLayout, setCountdownLayout] = useState<CountdownLayout>(
    (bundle as any).countdownLayout === "full" ? "full" : "compact",
  );
  const [countdownPosition, setCountdownPosition] = useState<CountdownPosition>(
    (bundle as any).countdownPosition === "below" ? "below" : "above",
  );
  const [countdownTitle, setCountdownTitle] = useState<string>(
    (bundle as any).countdownTitle ?? "",
  );
  const [countdownExpiryAction, setCountdownExpiryAction] =
    useState<CountdownExpiryAction>(
      (bundle as any).countdownExpiryAction === "show_zeros" ||
        (bundle as any).countdownExpiryAction === "show_message"
        ? (bundle as any).countdownExpiryAction
        : "hide",
    );
  const [countdownExpiredMessage, setCountdownExpiredMessage] = useState<string>(
    (bundle as any).countdownExpiredMessage ?? "",
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
  const originalShowProductPricesRef = useRef<boolean>(
    (bundle as any).showProductPrices ?? true,
  );
  const originalCartRedirectToCheckoutRef = useRef<boolean>(
    (bundle as any).cartRedirectToCheckout ?? false,
  );
  const originalAllowQuantityChangesRef = useRef<boolean>(
    (bundle as any).allowQuantityChanges ?? true,
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
  const originalCountdownEnabledRef = useRef(countdownEnabled);
  const originalCountdownLayoutRef = useRef(countdownLayout);
  const originalCountdownPositionRef = useRef(countdownPosition);
  const originalCountdownTitleRef = useRef(countdownTitle);
  const originalCountdownExpiryActionRef = useRef(countdownExpiryAction);
  const originalCountdownExpiredMessageRef = useRef(countdownExpiredMessage);
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
  const savedUpsellMultiLangText =
    (((bundle as any).bundleUpsellConfig as {
      multiLangText?: Record<string, Record<string, string>>;
    } | null)?.multiLangText ?? {});
  const initialTextOverridesByLocale = Object.fromEntries(
    Array.from(
      new Set([
        ...Object.keys(
          ((bundle as any).textOverridesByLocale as Record<
            string,
            Record<string, string>
          >) ?? {},
        ),
        ...Object.keys(savedUpsellMultiLangText),
      ]),
    ).map((locale) => [
      locale,
      {
        ...(savedUpsellMultiLangText[locale] ?? {}),
        ...(((bundle as any).textOverridesByLocale as Record<
          string,
          Record<string, string>
        >)?.[locale] ?? {}),
      },
    ]),
  );
  const [textOverridesByLocale, setTextOverridesByLocale] = useState<
    Record<string, Record<string, string>>
  >(initialTextOverridesByLocale);
  const originalTextOverridesRef =
    useRef<Record<string, string>>(initialTextOverrides);
  const originalTextOverridesByLocaleRef = useRef<
    Record<string, Record<string, string>>
  >(initialTextOverridesByLocale);
  const [textOverridesLocale, setTextOverridesLocale] = useState<string>("");

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
    initialDefaultProductsData,
    initialTextOverrides,
    initialValidateQuantityPerProduct,
    loadingGif,
    lowStockAlertEnabled,
    lowStockAlertMessage,
    lowStockAlertThreshold,
    countdownEnabled,
    countdownLayout,
    countdownPosition,
    countdownTitle,
    countdownExpiryAction,
    countdownExpiredMessage,
    maxQtyPerProduct,
    normalizeDefaultProductsData,
    originalAllowQuantityChangesRef,
    originalCartRedirectToCheckoutRef,
    originalDefaultProductsDataRef,
    originalFloatingBadgeEnabledRef,
    originalFloatingBadgeTextRef,
    originalLoadingGifRef,
    originalLowStockAlertEnabledRef,
    originalLowStockAlertMessageRef,
    originalLowStockAlertThresholdRef,
    originalCountdownEnabledRef,
    originalCountdownLayoutRef,
    originalCountdownPositionRef,
    originalCountdownTitleRef,
    originalCountdownExpiryActionRef,
    originalCountdownExpiredMessageRef,
    originalPromoBannerBgImageRef,
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
    setLoadingGif,
    setLowStockAlertEnabled,
    setLowStockAlertMessage,
    setLowStockAlertThreshold,
    setCountdownEnabled,
    setCountdownLayout,
    setCountdownPosition,
    setCountdownTitle,
    setCountdownExpiryAction,
    setCountdownExpiredMessage,
    setMaxQtyPerProduct,
    setProductSlotIconUrl,
    setProductSlotsEnabled,
    setPromoBannerBgImage,
    setQuantityValidationEnabled,
    setShowProductPrices,
    setShowSlotIconPicker,
    setShowStepTimeline,
    setShowTextOnAddButton,
    setTextOverrides,
    setTextOverridesByLocale,
    setTextOverridesLocale,
    setVariantSelectorEnabled,
    shopDomain,
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
