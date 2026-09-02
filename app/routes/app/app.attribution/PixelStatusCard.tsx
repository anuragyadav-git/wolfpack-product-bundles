import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { action } from "../app.attribution";
import {
  getUtmPixelStatusBannerModel,
  UTM_PIXEL_PRIVACY_MESSAGE,
} from "../../../lib/utm-pixel-status-banner";
import { useBannerSessionState } from "../../../lib/banner-session-state";
import styles from "./AttributionRouteShell.module.css";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
import { translateAdmin } from "~/i18n/config";

// ─── Pixel Status Card ────────────────────────────────────────

export const UTM_PIXEL_STATUS_BANNER_KEY = "analytics_utm_pixel_status";

export function PixelStatusCard({ pixelActive }: { pixelActive: boolean }) {
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const [dismissed, dismiss] = useBannerSessionState(
    UTM_PIXEL_STATUS_BANNER_KEY
  );
  const [hydrated, setHydrated] = useState(false);

  const [active, setActive] = useState(pixelActive);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!fetcher.data) return;
    const data = fetcher.data as {
      success: boolean;
      pixelActive?: boolean;
      message?: string;
      error?: string;
    };
    if (data.success && data.pixelActive !== undefined) {
      setActive(data.pixelActive);
      shopify.toast.show(
        t(
          data.pixelActive
            ? "common.success.trackingEnabled"
            : "common.success.trackingDisabled"
        ),
        { isError: false }
      );
    } else if (!data.success && data.error) {
      showAdminTransientErrorToast(
        shopify,
        t("common.alerts.trackingNotUpdated")
      );
    }
  }, [fetcher.data, shopify, t]);

  const handleToggle = useCallback(() => {
    fetcher.submit(
      { intent: active ? "disable" : "enable" },
      { method: "POST" }
    );
  }, [fetcher, active]);

  const model = getUtmPixelStatusBannerModel(active);

  if (active && hydrated && dismissed) return null;

  return (
    <>
      <s-box paddingBlockEnd="small-200">
        <s-banner
          tone={active ? "success" : "warning"}
          heading={translateAdmin("adminAttributes.utmPixelTracking")}
          dismissible={active}
          hidden={false}
          onDismiss={active && hydrated ? dismiss : undefined}
        >
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
            gap="base"
          >
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
      </s-box>

      {!active ? (
        <s-modal
          id="utm-pixel-tracking-disclosure"
          heading={translateAdmin("adminAttributes.utmPixelTracking")}
        >
          <s-button
            slot="primary-action"
            variant="primary"
            icon="check"
            loading={isSubmitting || undefined}
            disabled={isSubmitting || undefined}
            onClick={handleToggle}
          >
            {translateAdmin(
              "adminExtracted.appAttribution.pixelstatuscard.activateTracking"
            )}
          </s-button>
          <s-button
            slot="secondary-actions"
            commandFor="utm-pixel-tracking-disclosure"
            command="--hide"
          >
            {translateAdmin("dashboard.storefrontSetup.close")}
          </s-button>

          <s-stack direction="block" gap="base">
            <s-paragraph>{UTM_PIXEL_PRIVACY_MESSAGE}</s-paragraph>
            <s-stack direction="block" gap="small">
              <p className={styles.pixelDisclosureText}>
                {translateAdmin(
                  "adminExtracted.appAttribution.pixelstatuscard.turnThisOnToConnectAdClicksWithBundleOrdersWhenShoppersVisitThro"
                )}
              </p>
              <p className={styles.pixelDisclosureText}>
                {translateAdmin(
                  "adminExtracted.appAttribution.pixelstatuscard.shopifyControlsWhenThePixelCanRunSoTrackingFollowsEachShopperSCo"
                )}
              </p>
            </s-stack>
          </s-stack>
        </s-modal>
      ) : null}
    </>
  );
}
