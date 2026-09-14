import {
  CommonConfigureSidebar,
  CommonConfigureSupplement,
} from "../_shared/bundle-configure/CommonConfigureSidebar";
import { buildPpbLiveCard } from "./ppb-live-card-model";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  VisibilityBadge,
  bundleSetupItems,
  bundleVisibilityChildItems,
} from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbConfigureSidebarProps = Pick<
  PpbConfigureFlow,
  | "activeSection"
  | "appEmbedEnabled"
  | "bundle"
  | "bundleProduct"
  | "formState"
  | "handleBundleProductSelect"
  | "handleSectionChange"
  | "handleSyncProduct"
  | "openProductInAdmin"
  | "openSelectTemplateModal"
  | "parentProductStatusUi"
  | "pricingState"
  | "productImageUrl"
  | "productTitle"
  | "selectTemplateOpenButtonRef"
>;

export function PpbConfigureSidebar(props: PpbConfigureSidebarProps) {

  return (
    <CommonConfigureSidebar
      adapter={{
        activeSection: props.activeSection,
        appEmbedEnabled: props.appEmbedEnabled,
        bundle: props.bundle,
        bundleProduct: props.bundleProduct,
        bundleSetupItems,
        bundleVisibilityChildItems,
        formState: props.formState,
        handleBundleProductSelect: props.handleBundleProductSelect,
        handleSectionChange: props.handleSectionChange,
        handleSyncProduct: props.handleSyncProduct,
        openProductInAdmin: props.openProductInAdmin,
        openSelectTemplateModal: props.openSelectTemplateModal,
        parentProductStatusUi: props.parentProductStatusUi,
        pricingState: props.pricingState,
        productImageUrl: props.productImageUrl,
        productTitle: props.productTitle,
        selectTemplateOpenButtonRef: props.selectTemplateOpenButtonRef,
        styles: productPageBundleStyles,
        VisibilityBadge,
      }}
    />
  );
}

export type PpbConfigureSupplementProps = Pick<
  PpbConfigureFlow,
  "isPreparingPlacementTemplates" | "handlePlaceWidget"
>;

export function PpbConfigureSupplement({
  isPreparingPlacementTemplates,
  handlePlaceWidget,
}: PpbConfigureSupplementProps) {
  const liveCard = buildPpbLiveCard({
    isPreparingPlacementTemplates,
    handlePlaceWidget,
  });

  return (
    <CommonConfigureSupplement
      liveCard={liveCard}
      styles={productPageBundleStyles}
    />
  );
}
