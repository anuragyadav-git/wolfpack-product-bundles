import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { translateAdmin } from "~/i18n/config";

export function useLatestCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: Args) => callbackRef.current(...args),
    [],
  );
}

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
  const handleSave = useLatestCallback(onSave);
  const handleDiscard = useLatestCallback(onDiscard);

  useEffect(() => {
    if (isOpen) {
      isSaveBarShown.current = true;
      void shopify.saveBar.show("bundle-save-bar");
    } else if (isSaveBarShown.current) {
      isSaveBarShown.current = false;
      void shopify.saveBar.hide("bundle-save-bar");
    }
  }, [isOpen, shopify]);

  useEffect(
    () => () => {
      if (!isSaveBarShown.current) return;
      isSaveBarShown.current = false;
      void shopify.saveBar.hide("bundle-save-bar");
    },
    [shopify],
  );

  return (
    <ui-save-bar ref={saveBarRef} id="bundle-save-bar">
      <button
        type="button"
        variant="primary"
        disabled={isSaving}
        loading={isSaving ? "true" : undefined}
        onClick={handleSave}
      >
        {translateAdmin("dashboard.language.save")}
      </button>
      <button type="button" disabled={isSaving} onClick={handleDiscard}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.configurecontextualsavebar.discard"
        )}
      </button>
    </ui-save-bar>
  );
}
