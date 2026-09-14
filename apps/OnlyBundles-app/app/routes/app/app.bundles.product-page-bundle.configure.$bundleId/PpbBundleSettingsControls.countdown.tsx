import { CountdownSettingsSection } from "../_shared/bundle-configure/CountdownSettingsSection";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbCountdownFlowProps = Pick<
  PpbConfigureFlow,
  | "countdownEnabled"
  | "countdownLayout"
  | "countdownPosition"
  | "countdownTitle"
  | "countdownExpiryAction"
  | "countdownExpiredMessage"
  | "markAsDirty"
  | "setCountdownEnabled"
  | "setCountdownLayout"
  | "setCountdownPosition"
  | "setCountdownTitle"
  | "setCountdownExpiryAction"
  | "setCountdownExpiredMessage"
>;

export type PpbCountdownSettingsProps = PpbCountdownFlowProps & {
  scheduledEndsAt: PpbConfigureFlow["offerDeliveryState"]["endsAt"];
};

export function PpbCountdownSettings({
  countdownEnabled,
  countdownLayout,
  countdownPosition,
  countdownTitle,
  countdownExpiryAction,
  countdownExpiredMessage,
  scheduledEndsAt,
  markAsDirty,
  setCountdownEnabled,
  setCountdownLayout,
  setCountdownPosition,
  setCountdownTitle,
  setCountdownExpiryAction,
  setCountdownExpiredMessage,
}: PpbCountdownSettingsProps) {

  return (
    <CountdownSettingsSection
      enabled={countdownEnabled}
      layout={countdownLayout}
      position={countdownPosition}
      title={countdownTitle}
      expiryAction={countdownExpiryAction}
      expiredMessage={countdownExpiredMessage}
      scheduledEndsAt={scheduledEndsAt}
      markAsDirty={markAsDirty}
      setEnabled={setCountdownEnabled}
      setLayout={setCountdownLayout}
      setPosition={setCountdownPosition}
      setTitle={setCountdownTitle}
      setExpiryAction={setCountdownExpiryAction}
      setExpiredMessage={setCountdownExpiredMessage}
    />
  );
}
