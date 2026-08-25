import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useState } from "react";
import type { action } from "../app.attribution";
import {
  getUtmPixelStatusBannerModel,
  UTM_PIXEL_PRIVACY_MESSAGE,
} from "../../../lib/utm-pixel-status-banner";
import { useBannerSessionState } from "../../../lib/banner-session-state";
import styles from "./AttributionRouteShell.module.css";

// ─── Pixel Status Card ────────────────────────────────────────

export const UTM_PIXEL_STATUS_BANNER_KEY = "analytics_utm_pixel_status";

export function PixelStatusCard({ pixelActive }: { pixelActive: boolean }) {
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const [dismissed, dismiss] = useBannerSessionState(UTM_PIXEL_STATUS_BANNER_KEY);

  const [active, setActive] = useState(pixelActive);

  useEffect(() => {
    if (!fetcher.data) return;
    const data = fetcher.data as { success: boolean; pixelActive?: boolean; message?: string; error?: string };
    if (data.success && data.pixelActive !== undefined) {
      setActive(data.pixelActive);
      shopify.toast.show(data.message ?? "Done", { isError: false });
    } else if (!data.success && data.error) {
      shopify.toast.show(data.error, { isError: true, duration: 6000 });
    }
  }, [fetcher.data, shopify]);

  const handleToggle = useCallback(() => {
    fetcher.submit(
      { intent: active ? "disable" : "enable" },
      { method: "POST" }
    );
  }, [fetcher, active]);

  const model = getUtmPixelStatusBannerModel(active);

  if (active && dismissed) return null;

  return (
    <>
      <s-banner
        tone={active ? "success" : "warning"}
        heading="UTM Pixel Tracking"
        dismissible={active}
        hidden={false}
        onDismiss={active ? dismiss : undefined}
      >
        <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
          <s-text>{model.description}</s-text>
          {model.actionLabel ? (
            <s-button
              variant="tertiary"
              commandFor="utm-pixel-tracking-disclosure"
              command="--show"
            >
              {model.actionLabel}
            </s-button>
          ) : null}
        </s-stack>
      </s-banner>

      {!active ? (
        <s-modal
          id="utm-pixel-tracking-disclosure"
          heading="UTM Pixel Tracking"
        >
          <s-button
            slot="primary-action"
            variant="primary"
            icon="check"
            loading={isSubmitting || undefined}
            disabled={isSubmitting || undefined}
            onClick={handleToggle}
          >
            Activate Tracking
          </s-button>
          <s-button
            slot="secondary-actions"
            commandFor="utm-pixel-tracking-disclosure"
            command="--hide"
          >
            Close
          </s-button>

          <s-stack direction="block" gap="base">
            <s-banner
              tone="info"
              heading="UTM pixel status"
              dismissible={false}
              hidden={false}
            >
              {UTM_PIXEL_PRIVACY_MESSAGE}
            </s-banner>
            <s-stack direction="block" gap="small">
              <p className={styles.pixelDisclosureText}>
                Turn this on to connect ad clicks with bundle orders when shoppers visit through UTM-tagged links.
              </p>
              <p className={styles.pixelDisclosureText}>
                Shopify controls when the pixel can run, so tracking follows each shopper's consent choices.
              </p>
            </s-stack>
          </s-stack>
        </s-modal>
      ) : null}
    </>
  );
}
