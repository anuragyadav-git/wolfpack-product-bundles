import { AppEmbedBanner } from "../../../components/AppEmbedBanner";
import { AdminWarningGroup } from "../../../components/AdminWarningGroup";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { getReadinessScoreColor } from "../../../components/bundle-configure/BundleReadinessOverlay";
import { useTranslation } from "react-i18next";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbCanvasHeader() {
  const { t } = useTranslation();
  const {
    UnlistedBundleBanner,
    appEmbedEnabled,
    bundle,
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
  const bundleProductId =
    loadedBundleProduct?.id ?? (bundle as any).shopifyProductId ?? null;
  const numericProductId = bundleProductId?.split("/").pop() || null;
  const hasUnlistedWarning =
    parentProductStatusUi.showUnlistedBanner && Boolean(numericProductId);
  const hasMultiplePublishWarnings =
    !appEmbedEnabled && !parentProductStatusUi.isLoading && hasUnlistedWarning;

  return (
    <>
      <AdminPageTitleBar
        title={translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.configureBundleFlow"
        )}
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
              aria-label={translateAdmin("adminAttributes.backToDashboard")}
            >
              ←
            </button>
            <h1 className={productPageBundleStyles.canvasTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.configureBundleFlow"
              )}
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
                {translateAdmin("common.readiness.title")}
              </span>
            </s-press-button>
          </span>
          <s-button
            variant="secondary"
            icon="view"
            accessibilityLabel={translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.previewBundle"
            )}
            onClick={() => {
              void handlePreviewBundle();
            }}
            loading={isPreviewBundleLoading || undefined}
            disabled={fetcher.state !== "idle"}
          >
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.previewBundle"
            )}
          </s-button>
        </div>
      </div>
      {hasMultiplePublishWarnings ? (
        <AdminWarningGroup
          warnings={[
            {
              id: "app-embed",
              heading: t("common.appEmbed.guideTitle"),
              message: t("common.appEmbed.body"),
              ...(themeEditorUrl
                ? {
                    actionLabel: t("common.actions.enableHere"),
                    onAction: openThemeEditorForAppEmbed,
                  }
                : {}),
            },
            {
              id: "unlisted-bundle",
              heading: t("common.unlistedBundle.title"),
              message: t("common.unlistedBundle.body"),
              actionLabel: t("common.actions.manage"),
              onAction: () => openProductInAdmin(numericProductId!),
            },
          ]}
        />
      ) : (
        <>
          <AppEmbedBanner
            appEmbedEnabled={appEmbedEnabled}
            themeEditorUrl={themeEditorUrl}
            onEnableClick={openThemeEditorForAppEmbed}
          />
          {(parentProductStatusUi.isLoading ||
            parentProductStatusUi.showUnlistedBanner) && (
            <div className={productPageBundleStyles.unlistedBannerGap}>
              <UnlistedBundleBanner
                shop={shop}
                bundleProductId={bundleProductId}
                loading={parentProductStatusUi.isLoading}
                onManage={() => {
                  if (numericProductId) openProductInAdmin(numericProductId);
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
