import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";

import { CommonConfigureShell } from "../_shared/bundle-configure/CommonConfigureShell";
import {
  PpbConfigureProvider,
  usePpbConfigureContext,
} from "./PpbConfigureContext";
import { PpbCanvasHeader } from "./PpbCanvasHeader";
import {
  PpbConfigureSidebar,
  PpbConfigureSupplement,
} from "./PpbConfigureSidebar";
import { ConfigureRouteLoadingWorkspace } from "../_shared/bundle-configure/ConfigureRouteLoadingWorkspace";
import { PpbDiscountLanguageModals } from "./PpbDiscountLanguageModals";
import { PpbMainSections } from "./PpbMainSections";
import { PpbOverlayModals } from "./PpbOverlayModals";
import { PpbPageSelectionModal } from "./PpbPageSelectionModal";
import { PpbSaveForm } from "./PpbSaveForm";
import { PpbSelectTemplateDialog } from "./PpbSelectTemplateDialog";
import { PpbSelectedItemsModals } from "./PpbSelectedItemsModals";
import { PpbUtilityModals } from "./PpbUtilityModals";
import { usePpbConfigureFlow } from "./usePpbConfigureFlow";

function ConfigureBundleCanvas() {
  const flow = usePpbConfigureContext();
  const {
    blockConfigurationChangeWhileSaving,
    isSaveInFlight,
    isCriticalStatusReady,
  } = flow;

  if (!isCriticalStatusReady) {
    return <ConfigureRouteLoadingWorkspace />;
  }

  return (
    <CommonConfigureShell
      blockConfigurationChangeWhileSaving={blockConfigurationChangeWhileSaving}
      isSaveInFlight={isSaveInFlight}
      styles={productPageBundleStyles}
      saveForm={<PpbSaveForm />}
      header={<PpbCanvasHeader />}
      sidebar={<PpbConfigureSidebar />}
      supplementaryContent={<PpbConfigureSupplement />}
      overlays={
        <>
          <PpbPageSelectionModal />
          <PpbSelectedItemsModals />
          <PpbSelectTemplateDialog />
          <PpbUtilityModals />
          <PpbDiscountLanguageModals />
          <PpbOverlayModals />
        </>
      }
    >
      <PpbMainSections />
    </CommonConfigureShell>
  );
}

export default function ConfigureBundleFlow() {
  const flow = usePpbConfigureFlow();

  return (
    <PpbConfigureProvider value={flow}>
      <ConfigureBundleCanvas />
    </PpbConfigureProvider>
  );
}
