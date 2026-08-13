import type { ConfigureBundleFlowContext } from "./useConfigureBundleFlow";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { getReadinessScoreColor } from "../../../components/bundle-configure/BundleReadinessOverlay";

export function ConfigureCanvasHeader({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    AppEmbedBanner,
    appEmbedEnabled,
    bundle,
    bundleProduct,
    fetcher,
    fullPageBundleStyles,
    handleBackClick,
    handlePreviewBundle,
    isPreviewBundleLoading,
    openThemeEditorForAppEmbed,
    openProductInAdmin,
    parentProductStatusUi,
    readinessScore,
    setReadinessOpen,
    shop,
    themeEditorUrl,
    UnlistedBundleBanner,
  } = flow;

  return (
    <>
      <AdminPageTitleBar
        title="Configure Bundle Flow"
        breadcrumbLabel="Dashboard"
        onBack={handleBackClick}
      />
      <div className={fullPageBundleStyles.canvasHeader}>
        <div className={fullPageBundleStyles.canvasTitleGroup}>
          <div className={fullPageBundleStyles.canvasTitleRow}>
            <button
              type="button"
              className={fullPageBundleStyles.canvasBackButton}
              onClick={handleBackClick}
              aria-label="Back to dashboard"
            >
              ←
            </button>
            <h1 className={fullPageBundleStyles.canvasTitle}>
              Configure Bundle Flow
            </h1>
          </div>
        </div>
        <div className={fullPageBundleStyles.canvasActions}>
          <button
            type="button"
            className={fullPageBundleStyles.readinessButton}
            style={{
              backgroundColor: getReadinessScoreColor(readinessScore),
              borderColor: getReadinessScoreColor(readinessScore),
            }}
            onClick={() => setReadinessOpen(true)}
          >
            <span className={fullPageBundleStyles.readinessScore}>
              {readinessScore}
            </span>
            <span className={fullPageBundleStyles.readinessLabel}>
              Readiness Score
            </span>
          </button>
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
        <div className={fullPageBundleStyles.unlistedBannerGap}>
          <UnlistedBundleBanner
            shop={shop}
            bundleProductId={bundleProduct?.id ?? bundle.shopifyProductId ?? null}
            onManage={() => {
              const productId =
                bundleProduct?.legacyResourceId ||
                bundleProduct?.id?.split("/").pop() ||
                bundle.shopifyProductId?.split("/").pop();
              if (productId) openProductInAdmin(productId);
            }}
          />
        </div>
      )}
    </>
  );
}
