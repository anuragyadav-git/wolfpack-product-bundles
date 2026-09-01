import { useTranslation } from "react-i18next";

interface UnlistedBundleBannerProps {
  shop: string;
  bundleProductId: string | null;
  loading: boolean;
  onManage: () => void;
}

export function buildShopifyProductAdminUrl(
  shop: string,
  productId: string | null,
): string | null {
  if (!productId) return null;
  const numericId = productId.includes("gid://shopify/Product/")
    ? productId.split("/").pop()
    : productId;
  if (!numericId) return null;
  const storeSlug = shop.replace(/\.myshopify\.com$/, "");
  return `https://admin.shopify.com/store/${storeSlug}/products/${numericId}`;
}

export function UnlistedBundleBanner({
  shop,
  bundleProductId,
  loading,
  onManage,
}: UnlistedBundleBannerProps) {
  const { t } = useTranslation();
  const adminUrl = buildShopifyProductAdminUrl(shop, bundleProductId);
  if (loading) {
    const loadingLabel = t("common.parentProductStatus.loadingTitle");
    return (
      <s-box paddingBlockEnd="small-200">
        <s-banner
          tone="info"
          heading={loadingLabel}
          dismissible
        >
          <s-stack direction="inline" alignItems="center" gap="small">
            <s-spinner size="base" accessibilityLabel={loadingLabel} />
            <s-text>{t("common.parentProductStatus.loadingBody")}</s-text>
          </s-stack>
        </s-banner>
      </s-box>
    );
  }

  if (!adminUrl) return null;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="warning"
        heading={t("common.unlistedBundle.title")}
        dismissible={false}
        hidden={false}
      >
        <s-stack direction="inline" justifyContent="space-between" alignItems="start" gap="base">
          <s-text>{t("common.unlistedBundle.body")}</s-text>
          <s-button
            variant="secondary"
            tone="auto"
            onClick={onManage}
          >
            {t("common.actions.manage")}
          </s-button>
        </s-stack>
      </s-banner>
    </s-box>
  );
}
