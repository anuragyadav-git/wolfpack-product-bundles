import { useCallback, useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  normalizeBundleSubscriptionConfig,
  type BundleSubscriptionConfigV1,
} from "../../../lib/bundle-subscriptions";
import type { useConfigureBundleController } from "./useConfigureBundleController";

type SubscriptionValidationResponse = {
  success: boolean;
  isValid?: boolean;
  productCount?: number;
  groups?: BundleSubscriptionConfigV1["selectedGroup"][];
  message?: string | null;
  error?: string;
};

export function useConfigureSubscriptionState(dependencies: {
  bundle: ReturnType<typeof useConfigureBundleController>["bundle"];
  markAsDirty: () => void;
}) {
  const { bundle, markAsDirty } = dependencies;
  const subscriptionFetcher = useFetcher<SubscriptionValidationResponse>();
  const [showSubscriptionSetupGuide, setShowSubscriptionSetupGuide] =
    useState(false);
  const [subscriptionConfigState, setSubscriptionConfigState] =
    useState<BundleSubscriptionConfigV1>(() =>
      normalizeBundleSubscriptionConfig(bundle.bundleSubscriptionConfig)
    );
  const originalSubscriptionConfigRef = useRef(subscriptionConfigState);
  const setSubscriptionConfig = useCallback(
    (
      updater: (
        current: BundleSubscriptionConfigV1
      ) => BundleSubscriptionConfigV1
    ) => {
      setSubscriptionConfigState((current) =>
        normalizeBundleSubscriptionConfig(updater(current))
      );
      markAsDirty();
    },
    [markAsDirty]
  );
  const resetSubscriptionConfig = useCallback((value: unknown) => {
    setSubscriptionConfigState(normalizeBundleSubscriptionConfig(value));
  }, []);

  return {
    originalSubscriptionConfigRef,
    resetSubscriptionConfig,
    setShowSubscriptionSetupGuide,
    setSubscriptionConfig,
    showSubscriptionSetupGuide,
    subscriptionConfig: subscriptionConfigState,
    subscriptionFetcher,
  };
}
