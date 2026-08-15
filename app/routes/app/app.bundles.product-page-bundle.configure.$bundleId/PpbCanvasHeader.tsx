import { AppEmbedBanner } from "../../../components/AppEmbedBanner";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { getReadinessScoreColor } from "../../../components/bundle-configure/BundleReadinessOverlay";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbCanvasHeader() {
  const {
    UnlistedBundleBanner,
    appEmbedEnabled,
    bundle,
    bundleProduct,
    fetcher,
    handleBackClick,
    handlePreviewBundle,
    isPreviewBundleLoading,
    loadedBundleProduct,
    openThemeEditorForAppEmbed,
    openProductInAdmin,
    parentProductStatusUi,
    productPageBundleStyles,
    readinessScore,
    setReadinessOpen,
    shop,
    themeEditorUrl,
  } = usePpbConfigureContext();

  return (
    <>
      <AdminPageTitleBar
        title="Configure Bundle Flow"
        breadcrumbLabel="Dashboard"
        onBack={handleBackClick}
      />
      <div className={productPageBundleStyles.canvasHeader}>
        <div className={productPageBundleStyles.canvasTitleGroup}>
          <div className={productPageBundleStyles.canvasTitleRow}>
            <button
              type="button"
              className={productPageBundleStyles.canvasBackButton}
              onClick={handleBackClick}
              aria-label="Back to dashboard"
            >
              ←
            </button>
            <h1 className={productPageBundleStyles.canvasTitle}>
              Configure Bundle Flow
            </h1>
          </div>
        </div>
        <div className={productPageBundleStyles.canvasActions}>
          <span
            className={productPageBundleStyles.readinessButton}
            style={{
              backgroundColor: getReadinessScoreColor(readinessScore),
              borderColor: getReadinessScoreColor(readinessScore),
            }}
          >
            <s-press-button
              variant="tertiary"
              tone="neutral"
              accessibilityLabel={`${readinessScore} Readiness Score`}
              onClick={() => setReadinessOpen(true)}
            >
              <span className={productPageBundleStyles.readinessScore}>
                {readinessScore}
              </span>
              <span className={productPageBundleStyles.readinessLabel}>
                Readiness Score
              </span>
            </s-press-button>
          </span>
          <s-button
            variant="secondary"
            icon="view"
            onClick={() => {
              void handlePreviewBundle();
            }}
            loading={isPreviewBundleLoading || undefined}
            disabled={fetcher.state !== "idle"}
          >
            Preview Bundle
          </s-button>
        </div>
      </div>
      <AppEmbedBanner
        appEmbedEnabled={appEmbedEnabled}
        themeEditorUrl={themeEditorUrl}
        onEnableClick={openThemeEditorForAppEmbed}
      />
      {parentProductStatusUi.showUnlistedBanner && (
        <div className={productPageBundleStyles.unlistedBannerGap}>
          <UnlistedBundleBanner
            shop={shop}
            bundleProductId={
              loadedBundleProduct?.id ?? (bundle as any).shopifyProductId ?? null
            }
            onManage={() => {
              const productId =
                bundleProduct?.legacyResourceId ||
                bundleProduct?.id?.split("/").pop() ||
                (bundle as any).shopifyProductId?.split("/").pop();
              if (productId) openProductInAdmin(productId);
            }}
          />
        </div>
      )}
    </>
  );
}
