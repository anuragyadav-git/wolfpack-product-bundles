/**
 * Minimal bindings for the supported Polaris modal surface.
 */

import { useEffect, useRef } from "react";

type PolarisOverlay =
  | HTMLElement
  | {
      showOverlay?: () => void;
      hideOverlay?: () => void;
    };

type PolarisOverlayRef = { current: PolarisOverlay | null };

export function showPolarisModal(ref: PolarisOverlayRef): void {
  const modal = ref.current;
  if (modal && "showOverlay" in modal) modal.showOverlay?.();
}

export function hidePolarisModal(ref: PolarisOverlayRef): void {
  const modal = ref.current;
  if (modal && "hideOverlay" in modal) modal.hideOverlay?.();
}

/**
 * Keeps app-owned state synchronized with Polaris's documented hide event.
 * `afterhide` is the later phase of the same close and must not repeat cleanup.
 */
export function useModalHideListener(
  ref: { current: HTMLElement | null },
  onHide: () => void
): void {
  const handlerRef = useRef(onHide);
  handlerRef.current = onHide;

  useEffect(() => {
    const modal = ref.current;
    if (!modal) return;
    const handler = () => handlerRef.current();
    modal.addEventListener("hide", handler);
    return () => {
      modal.removeEventListener("hide", handler);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
