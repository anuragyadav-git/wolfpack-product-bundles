import { useCallback, useEffect, useState } from "react";

const BANNER_SESSION_KEY_PREFIX = "wpb_banner_dismissed_";

export function getBannerSessionStorageKey(bannerKey: string): string {
  return `${BANNER_SESSION_KEY_PREFIX}${bannerKey}`;
}

export function isBannerDismissedInSession(bannerKey: string): boolean {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return false;
  }
  try {
    return window.sessionStorage.getItem(getBannerSessionStorageKey(bannerKey)) === "true";
  } catch {
    return false;
  }
}

export function dismissBannerInSession(bannerKey: string): void {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(getBannerSessionStorageKey(bannerKey), "true");
  } catch {
    // Gracefully handle storage errors in restricted iframes
  }
}

export function clearBannerDismissalInSession(bannerKey: string): void {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(getBannerSessionStorageKey(bannerKey));
  } catch {
    // Gracefully handle storage errors
  }
}

export function useBannerSessionState(bannerKey: string): readonly [boolean, () => void] {
  const [dismissed, setDismissedState] = useState(() => isBannerDismissedInSession(bannerKey));

  useEffect(() => {
    if (isBannerDismissedInSession(bannerKey)) {
      setDismissedState(true);
    }
  }, [bannerKey]);

  const dismiss = useCallback(() => {
    dismissBannerInSession(bannerKey);
    setDismissedState(true);
  }, [bannerKey]);

  return [dismissed, dismiss] as const;
}
