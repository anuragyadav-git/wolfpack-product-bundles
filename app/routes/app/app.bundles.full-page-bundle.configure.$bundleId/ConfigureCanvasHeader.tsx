import type { ConfigureBundleFlowContext } from "./useConfigureBundleFlow";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { AdminWarningGroup } from "../../../components/AdminWarningGroup";
import { getReadinessScoreColor } from "../../../components/bundle-configure/BundleReadinessOverlay";
import { useTranslation } from "react-i18next";
import { translateAdmin } from "~/i18n/config";

export function ConfigureCanvasHeader({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const { t } = useTranslation();
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
  const bundleProductId = bundleProduct?.id ?? bundle.shopifyProductId ?? null;
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
      <div className={fullPageBundleStyles.canvasHeader}>
        <div className={fullPageBundleStyles.canvasTitleGroup}>
          <div className={fullPageBundleStyles.canvasTitleRow}>
            <button
              type="button"
              className={fullPageBundleStyles.canvasBackButton}
              onClick={handleBackClick}
              aria-label={translateAdmin("adminAttributes.backToDashboard")}
            >
              ←
            </button>
            <h1 className={fullPageBundleStyles.canvasTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.configureBundleFlow"
              )}
            </h1>
          </div>
        </div>
        <div className={fullPageBundleStyles.canvasActions}>
          <span
            className={fullPageBundleStyles.readinessButton}
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
              <span className={fullPageBundleStyles.readinessScore}>
                {readinessScore}
              </span>
              <span className={fullPageBundleStyles.readinessLabel}>
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
            <div className={fullPageBundleStyles.unlistedBannerGap}>
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
