/**
 * Minimal bindings for the supported Polaris modal surface.
 */

import { useEffect, useRef } from "react";

export function showPolarisModal(ref: { current: any }): void {
  const modal = ref.current as any;
  modal?.showOverlay?.();
}

export function hidePolarisModal(ref: { current: any }): void {
  const modal = ref.current as any;
  modal?.hideOverlay?.();
}

/**
 * Keeps app-owned state synchronized with Polaris's documented hide events.
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
    modal.addEventListener("afterhide", handler);
    return () => {
      modal.removeEventListener("hide", handler);
      modal.removeEventListener("afterhide", handler);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
