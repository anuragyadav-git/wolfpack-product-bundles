import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbGlobalOverlays } from "./ConfigureGlobalOverlays";
import { FpbSelectedItemsModals } from "./ConfigureSelectedItemsModals";
import { FpbSyncAndLanguageModals } from "./ConfigureSyncAndLanguageModals";
import { FpbTemplateDialog } from "./ConfigureTemplateDialog";

export function ConfigureRouteModals({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  return (
    <>
      <FpbSelectedItemsModals flow={flow} />
      <FpbGlobalOverlays flow={flow} />
      <FpbTemplateDialog flow={flow} />
      <FpbSyncAndLanguageModals flow={flow} />
    </>
  );
}
