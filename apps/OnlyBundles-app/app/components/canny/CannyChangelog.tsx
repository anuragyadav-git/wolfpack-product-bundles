import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadCanny } from "../../lib/canny.client";
import type { getCannyPublicConfig } from "../../services/canny.server";
import styles from "./canny.module.css";

type Props = { config: ReturnType<typeof getCannyPublicConfig> };
const initializedButtons = new WeakSet<HTMLElement>();

export function CannyChangelog({ config }: Props) {
  const { t } = useTranslation();
  const button = useRef<HTMLElement | null>(null);
  const activating = useRef(false);
  const [failed, setFailed] = useState(false);
  const appID = config?.appID;

  const initialize = useCallback(async () => {
    if (!appID) return false;
    const element = button.current;
    if (!element) return false;
    const canny = await loadCanny();
    if (!element.isConnected || element !== button.current) return false;
    if (!initializedButtons.has(element)) {
      canny("initChangelog", { appID, position: "bottom", align: "right", theme: "light", omitNonEssentialCookies: true });
      initializedButtons.add(element);
    }
    return true;
  }, [appID]);

  useEffect(() => {
    const element = button.current;
    const preload = () => { void initialize().catch(() => {}); };
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.Canny?.("closeChangelog");
    };
    element?.addEventListener("pointerenter", preload);
    document.addEventListener("keydown", dismiss);
    const timer = setTimeout(() => { void initialize().catch(() => {}); }, 8000);
    return () => {
      clearTimeout(timer);
      element?.removeEventListener("pointerenter", preload);
      document.removeEventListener("keydown", dismiss);
      window.Canny?.("closeChangelog");
    };
  }, [initialize]);

  const activate = async () => {
    const element = button.current;
    if (!element || initializedButtons.has(element) || activating.current) return;
    activating.current = true;
    setFailed(false);
    try {
      if (await initialize()) element.click();
      else if (element.isConnected) setFailed(true);
    } catch {
      if (element.isConnected) setFailed(true);
    } finally {
      activating.current = false;
    }
  };

  return (
    <s-stack direction="inline" gap="small" alignItems="center">
      {/* Polaris's button host has no box; Canny needs a measurable anchor and badge host. */}
      <span ref={button} data-canny-changelog className={styles.changelogTrigger}>
        <s-button
          icon="notification"
          accessibilityLabel={t("canny.changelog")}
          onClick={() => { void activate(); }}
          onFocus={() => { void initialize().catch(() => {}); }}
        />
      </span>
      {failed && <s-text tone="critical">{t("canny.unavailable")}</s-text>}
    </s-stack>
  );
}
