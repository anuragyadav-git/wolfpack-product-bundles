import { lazy, Suspense, useEffect, useState } from "react";
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
import { PpbMainSections } from "./PpbMainSections";
import { PpbSaveForm } from "./PpbSaveForm";
import { usePpbConfigureFlow } from "./usePpbConfigureFlow";

const PpbConfigureOverlays = lazy(() => import("./PpbConfigureOverlays").then((module) => ({ default: module.PpbConfigureOverlays })));

function ConfigureBundleCanvas() {
  const flow = usePpbConfigureContext();
  const {
    blockConfigurationChangeWhileSaving,
    isSaveInFlight,
  } = flow;
  const [showOverlays, setShowOverlays] = useState(false);

  useEffect(() => {
    const show = () => window.requestIdleCallback(() => setShowOverlays(true));
    if (document.readyState === "complete") {
      show();
      return;
    }
    window.addEventListener("load", show, { once: true });
    return () => window.removeEventListener("load", show);
  }, []);

  return (
    <CommonConfigureShell
      blockConfigurationChangeWhileSaving={blockConfigurationChangeWhileSaving}
      isSaveInFlight={isSaveInFlight}
      styles={productPageBundleStyles}
      saveForm={<PpbSaveForm />}
      header={<PpbCanvasHeader />}
      sidebar={<PpbConfigureSidebar />}
      supplementaryContent={<PpbConfigureSupplement />}
      overlays={showOverlays ? (
        <Suspense fallback={null}>
          <PpbConfigureOverlays />
        </Suspense>
      ) : null}
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
