import { PpbDiscountLanguageModals } from "./PpbDiscountLanguageModals";
import { PpbOverlayModals } from "./PpbOverlayModals";
import { PpbPageSelectionModal } from "./PpbPageSelectionModal";
import { PpbSelectTemplateDialog } from "./PpbSelectTemplateDialog";
import { PpbSelectedItemsModals } from "./PpbSelectedItemsModals";
import { PpbUtilityModals } from "./PpbUtilityModals";

export function PpbConfigureOverlays() {
  return (
    <>
      <PpbPageSelectionModal />
      <PpbSelectedItemsModals />
      <PpbSelectTemplateDialog />
      <PpbUtilityModals />
      <PpbDiscountLanguageModals />
      <PpbOverlayModals />
    </>
  );
}
