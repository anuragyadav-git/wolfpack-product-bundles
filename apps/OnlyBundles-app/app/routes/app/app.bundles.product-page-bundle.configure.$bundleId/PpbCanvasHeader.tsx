import { AdminWarningGroup } from "../../../components/AdminWarningGroup";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { useTranslation } from "react-i18next";
import { translateAdmin } from "~/i18n/config";
import { UnlistedBundleBanner } from "../../../components/UnlistedBundleBanner";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  buildPpbCanvasWarnings,
  getPpbStandaloneUnlistedWarning,
} from "./ppb-warning-presentation";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbCanvasHeaderFlowProps = Pick<
  PpbConfigureFlow,
  | "appEmbedEnabled"
  | "handleBackClick"
  | "handlePreviewBundle"
  | "isPreviewBundleLoading"
  | "loadedBundleProduct"
  | "openThemeEditorForAppEmbed"
  | "openProductInAdmin"
  | "operationAlert"
  | "readinessScore"
  | "shop"
  | "themeEditorUrl"
>;

export type PpbCanvasHeaderProps = PpbCanvasHeaderFlowProps & {
  bundle: Pick<PpbConfigureFlow["bundle"], "shopifyProductId">;
  fetcher: Pick<PpbConfigureFlow["fetcher"], "state">;
  parentProductStatusUi: Pick<
    PpbConfigureFlow["parentProductStatusUi"],
    "isLoading" | "showUnlistedBanner"
  >;
};

export function PpbCanvasHeader({
  appEmbedEnabled,
  bundle,
  fetcher,
  handleBackClick,
  handlePreviewBundle,
  isPreviewBundleLoading,
  loadedBundleProduct,
  openThemeEditorForAppEmbed,
  openProductInAdmin,
  operationAlert,
  parentProductStatusUi,
  readinessScore,
  shop,
  themeEditorUrl,
}: PpbCanvasHeaderProps) {
  const { t } = useTranslation();
  const bundleProductId =
    loadedBundleProduct?.id ?? bundle.shopifyProductId ?? null;
  const numericProductId = bundleProductId?.split("/").pop() || null;
  const hasUnlistedWarning =
    parentProductStatusUi.showUnlistedBanner && Boolean(numericProductId);
  const warnings = buildPpbCanvasWarnings({
    appEmbedEnabled,
    appEmbedWarning: {
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
    unlistedWarning: hasUnlistedWarning
      ? {
          id: "unlisted-bundle",
          heading: t("common.unlistedBundle.title"),
          message: t("common.unlistedBundle.body"),
          actionLabel: t("common.actions.manage"),
          onAction: () => openProductInAdmin(numericProductId!),
        }
      : null,
    operationAlert,
  });
  const standaloneUnlistedWarning =
    getPpbStandaloneUnlistedWarning(warnings);

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
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="arrow-left"
              onClick={handleBackClick}
              accessibilityLabel={translateAdmin(
                "adminAttributes.backToDashboard"
              )}
            />
            <h1 className={productPageBundleStyles.canvasTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.configureBundleFlow"
              )}
            </h1>
          </div>
        </div>
        <div className={productPageBundleStyles.canvasActions}>
          <span className={productPageBundleStyles.readinessButton}>
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
            disabled={fetcher.state !== "idle"}
          >
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.configurecanvasheader.previewBundle"
            )}
          </s-button>
        </div>
      </div>
      {standaloneUnlistedWarning ? (
        <div className={productPageBundleStyles.unlistedBannerGap}>
          <UnlistedBundleBanner
            shop={shop}
            bundleProductId={bundleProductId}
            loading={false}
            onManage={standaloneUnlistedWarning.onAction}
          />
        </div>
      ) : warnings.length > 0 ? (
        <AdminWarningGroup warnings={warnings} />
      ) : parentProductStatusUi.isLoading ? (
        <div className={productPageBundleStyles.unlistedBannerGap}>
          <UnlistedBundleBanner
            shop={shop}
            bundleProductId={bundleProductId}
            loading
            onManage={() => undefined}
          />
        </div>
      ) : null}
    </>
  );
}
