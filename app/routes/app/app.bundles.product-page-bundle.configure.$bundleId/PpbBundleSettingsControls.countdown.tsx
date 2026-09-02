import { CountdownSettingsSection } from "../_shared/bundle-configure/CountdownSettingsSection";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbCountdownSettings() {
  const flow = usePpbConfigureContext();

  return (
    <CountdownSettingsSection
      enabled={flow.countdownEnabled}
      layout={flow.countdownLayout}
      position={flow.countdownPosition}
      title={flow.countdownTitle}
      expiryAction={flow.countdownExpiryAction}
      expiredMessage={flow.countdownExpiredMessage}
      scheduledEndsAt={flow.offerDeliveryState.endsAt}
      markAsDirty={flow.markAsDirty}
      setEnabled={flow.setCountdownEnabled}
      setLayout={flow.setCountdownLayout}
      setPosition={flow.setCountdownPosition}
      setTitle={flow.setCountdownTitle}
      setExpiryAction={flow.setCountdownExpiryAction}
      setExpiredMessage={flow.setCountdownExpiredMessage}
    />
  );
}
