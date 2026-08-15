import { useCallback, useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  normalizeBundleSubscriptionConfig,
  type BundleSubscriptionConfigV1,
} from "../../../lib/bundle-subscriptions";
import type { ConfigureBundleFlowDraft } from "./configure-flow-types";

type SubscriptionValidationResponse = {
  success: boolean;
  isValid?: boolean;
  productCount?: number;
  groups?: BundleSubscriptionConfigV1["selectedGroup"][];
  message?: string | null;
  error?: string;
};

export function useConfigureSubscriptionState(flow: ConfigureBundleFlowDraft) {
  const subscriptionFetcher = useFetcher<SubscriptionValidationResponse>();
  const [showSubscriptionSetupGuide, setShowSubscriptionSetupGuide] =
    useState(false);
  const [subscriptionConfigState, setSubscriptionConfigState] =
    useState<BundleSubscriptionConfigV1>(() =>
      normalizeBundleSubscriptionConfig(flow.bundle.bundleSubscriptionConfig),
    );
  const originalSubscriptionConfigRef = useRef(subscriptionConfigState);
  const setSubscriptionConfig = useCallback(
    (updater: (current: BundleSubscriptionConfigV1) => BundleSubscriptionConfigV1) => {
      setSubscriptionConfigState((current) =>
        normalizeBundleSubscriptionConfig(updater(current)),
      );
      flow.markAsDirty();
    },
    [flow],
  );
  const resetSubscriptionConfig = useCallback((value: unknown) => {
    setSubscriptionConfigState(normalizeBundleSubscriptionConfig(value));
  }, []);

  Object.assign(flow, {
    originalSubscriptionConfigRef,
    resetSubscriptionConfig,
    setShowSubscriptionSetupGuide,
    setSubscriptionConfig,
    showSubscriptionSetupGuide,
    subscriptionConfig: subscriptionConfigState,
    subscriptionFetcher,
  });
}
