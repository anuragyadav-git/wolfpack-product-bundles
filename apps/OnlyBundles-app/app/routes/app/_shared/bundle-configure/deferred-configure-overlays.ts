import { startTransition } from "react";

export function revealDeferredConfigureOverlays(reveal: () => void): void {
  startTransition(reveal);
}
