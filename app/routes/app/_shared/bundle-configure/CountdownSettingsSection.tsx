import { i18n } from "../../../../i18n/config";
import type {
  CountdownExpiryAction,
  CountdownLayout,
  CountdownPosition,
} from "../../../../lib/bundle-countdown";
import { DisabledConfigurationRegion } from "./DisabledConfigurationRegion";
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";

export function CountdownSettingsSection({
  enabled,
  layout,
  position,
  title,
  expiryAction,
  expiredMessage,
  scheduledEndsAt,
  markAsDirty,
  setEnabled,
  setLayout,
  setPosition,
  setTitle,
  setExpiryAction,
  setExpiredMessage,
}: {
  enabled: boolean;
  layout: CountdownLayout;
  position: CountdownPosition;
  title: string;
  expiryAction: CountdownExpiryAction;
  expiredMessage: string;
  scheduledEndsAt: string | null;
  markAsDirty: () => void;
  setEnabled: (value: boolean) => void;
  setLayout: (value: CountdownLayout) => void;
  setPosition: (value: CountdownPosition) => void;
  setTitle: (value: string) => void;
  setExpiryAction: (value: CountdownExpiryAction) => void;
  setExpiredMessage: (value: string) => void;
}) {
  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <s-stack
          direction="inline"
          alignItems="center"
          justifyContent="space-between"
          gap="base"
        >
          <s-stack direction="block" gap="small-100">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-heading>{i18n.t("countdown.title")}</s-heading>
              <ConfigureHelpPopover tooltipKey="countdownTimer" />
            </s-stack>
            <s-text color="subdued">{i18n.t("countdown.description")}</s-text>
          </s-stack>
          <s-switch
            accessibilityLabel={i18n.t("countdown.title")}
            checked={enabled || undefined}
            onChange={(event) => {
              setEnabled((event.target as HTMLInputElement).checked);
              markAsDirty();
            }}
          />
        </s-stack>

        {enabled && !scheduledEndsAt ? (
          <s-banner tone="warning">
            {i18n.t("countdown.missingSchedule")}
          </s-banner>
        ) : null}

        <DisabledConfigurationRegion disabled={!enabled}>
          <s-stack direction="block" gap="small">
            <s-select
              label={i18n.t("countdown.layoutLabel")}
              value={layout}
              disabled={!enabled || undefined}
              onChange={(event) => {
                setLayout(
                  (event.target as HTMLSelectElement).value === "full"
                    ? "full"
                    : "compact",
                );
                markAsDirty();
              }}
            >
              <s-option value="compact">{i18n.t("countdown.layoutCompact")}</s-option>
              <s-option value="full">{i18n.t("countdown.layoutFull")}</s-option>
            </s-select>
            <s-select
              label={i18n.t("countdown.positionLabel")}
              value={position}
              disabled={!enabled || undefined}
              onChange={(event) => {
                setPosition(
                  (event.target as HTMLSelectElement).value === "below"
                    ? "below"
                    : "above",
                );
                markAsDirty();
              }}
            >
              <s-option value="above">{i18n.t("countdown.positionAbove")}</s-option>
              <s-option value="below">{i18n.t("countdown.positionBelow")}</s-option>
            </s-select>
            <s-text-field
              label={i18n.t("countdown.timerTitleLabel")}
              value={title}
              disabled={!enabled || undefined}
              onInput={(event) => {
                setTitle((event.target as HTMLInputElement).value);
                markAsDirty();
              }}
              autocomplete="off"
            />
            <s-select
              label={i18n.t("countdown.expiryActionLabel")}
              value={expiryAction}
              disabled={!enabled || undefined}
              onChange={(event) => {
                const value = (event.target as HTMLSelectElement).value;
                setExpiryAction(
                  value === "show_zeros" || value === "show_message"
                    ? value
                    : "hide",
                );
                markAsDirty();
              }}
            >
              <s-option value="hide">{i18n.t("countdown.expiryHide")}</s-option>
              <s-option value="show_zeros">{i18n.t("countdown.expiryZeros")}</s-option>
              <s-option value="show_message">{i18n.t("countdown.expiryMessage")}</s-option>
            </s-select>
            {expiryAction === "show_message" ? (
              <s-text-field
                label={i18n.t("countdown.expiredMessageLabel")}
                value={expiredMessage}
                disabled={!enabled || undefined}
                onInput={(event) => {
                  setExpiredMessage((event.target as HTMLInputElement).value);
                  markAsDirty();
                }}
                autocomplete="off"
              />
            ) : null}
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </s-section>
  );
}
