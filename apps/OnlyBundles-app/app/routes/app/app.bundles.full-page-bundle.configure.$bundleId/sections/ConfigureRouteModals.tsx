import {
  FpbGlobalOverlays,
  type FpbGlobalOverlaysProps,
} from "./ConfigureGlobalOverlays";
import {
  FpbSelectedItemsModals,
  type FpbSelectedItemsModalsProps,
} from "./ConfigureSelectedItemsModals";
import {
  FpbSyncAndLanguageModals,
  type FpbSyncAndLanguageModalsProps,
} from "./ConfigureSyncAndLanguageModals";
import {
  FpbTemplateDialog,
  type FpbTemplateDialogProps,
} from "./ConfigureTemplateDialog";

export function ConfigureRouteModals({
  globalOverlays,
  selectedItems,
  syncAndLanguage,
  templateDialog,
}: {
  globalOverlays: FpbGlobalOverlaysProps;
  selectedItems: FpbSelectedItemsModalsProps;
  syncAndLanguage: FpbSyncAndLanguageModalsProps;
  templateDialog: FpbTemplateDialogProps;
}) {
  return (
    <>
      <FpbSelectedItemsModals {...selectedItems} />
      <FpbGlobalOverlays {...globalOverlays} />
      <FpbTemplateDialog {...templateDialog} />
      <FpbSyncAndLanguageModals {...syncAndLanguage} />
    </>
  );
}
