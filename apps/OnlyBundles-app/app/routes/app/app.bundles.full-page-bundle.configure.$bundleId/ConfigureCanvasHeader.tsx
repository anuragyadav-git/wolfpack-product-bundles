import type { BundleProductData } from "../../../types/bundle-configure";
import type { ParentProductStatusUi } from "../../../lib/parent-product-status-ui";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { AdminWarningGroup } from "../../../components/AdminWarningGroup";
import { AppEmbedBanner } from "../../../components/AppEmbedBanner";
import { UnlistedBundleBanner } from "../../../components/UnlistedBundleBanner";
import { useTranslation } from "react-i18next";
import { translateAdmin } from "~/i18n/config";

interface ConfigureCanvasHeaderProps {
  appEmbedEnabled: boolean;
  bundleProduct: BundleProductData | null;
  bundleProductId: string | null;
  fetcherState: "idle" | "loading" | "submitting";
  fullPageBundleStyles: Record<string, string>;
  handleBackClick: () => void;
  handlePreviewBundle: () => Promise<unknown>;
  isPreviewBundleLoading: boolean;
  openThemeEditorForAppEmbed: () => void;
  openProductInAdmin: (productId: string) => void;
  parentProductStatusUi: ParentProductStatusUi;
  readinessScore: number;
  shop: string;
  themeEditorUrl: string | null;
}

export function ConfigureCanvasHeader({
  appEmbedEnabled,
  bundleProduct,
  bundleProductId,
  fetcherState,
  fullPageBundleStyles,
  handleBackClick,
  handlePreviewBundle,
  isPreviewBundleLoading,
  openThemeEditorForAppEmbed,
  openProductInAdmin,
  parentProductStatusUi,
  readinessScore,
  shop,
  themeEditorUrl,
}: ConfigureCanvasHeaderProps) {
  const { t } = useTranslation();
  const resolvedBundleProductId = bundleProduct?.id ?? bundleProductId;
  const numericProductId = resolvedBundleProductId?.split("/").pop() || null;
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
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="arrow-left"
              onClick={handleBackClick}
              accessibilityLabel={translateAdmin(
                "adminAttributes.backToDashboard"
              )}
            />
            <h1 className={fullPageBundleStyles.canvasTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.configureBundleFlow"
              )}
            </h1>
          </div>
        </div>
        <div className={fullPageBundleStyles.canvasActions}>
          <span className={fullPageBundleStyles.readinessButton}>
            <s-button
              variant="secondary"
              accessibilityLabel={`${readinessScore} Readiness Score`}
              commandFor="bundle-readiness-popover"
              command="--show"
              data-tour-target="fpb-readiness-score"
            >
              {readinessScore} {translateAdmin("common.readiness.title")}
            </s-button>
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
            disabled={fetcherState !== "idle"}
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
                bundleProductId={resolvedBundleProductId}
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
