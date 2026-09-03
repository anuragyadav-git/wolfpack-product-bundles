import { useEffect, useRef, type RefObject } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { translateAdmin } from "~/i18n/config";

export function ConfigureContextualSaveBar({
  isOpen,
  isSaving,
  onDiscard,
  onSave,
  saveBarRef,
}: {
  isOpen: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  saveBarRef: RefObject<UISaveBarElement | null>;
}) {
  const shopify = useAppBridge();
  const isSaveBarShown = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isSaveBarShown.current = true;
      void shopify.saveBar.show("bundle-save-bar");
    } else if (isSaveBarShown.current) {
      isSaveBarShown.current = false;
      void shopify.saveBar.hide("bundle-save-bar");
    }
  }, [isOpen, shopify]);

  return (
    <ui-save-bar ref={saveBarRef} id="bundle-save-bar">
      <button
        type="button"
        variant="primary"
        disabled={isSaving}
        onClick={onSave}
      >
        {translateAdmin("dashboard.language.save")}
      </button>
      <button type="button" disabled={isSaving} onClick={onDiscard}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.configurecontextualsavebar.discard"
        )}
      </button>
    </ui-save-bar>
  );
}
