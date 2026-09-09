import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeAddonTierAccordionIndex } from "../../../lib/addon-tier-accordion";
import {
  buildAddonDraftFromPersonalizationData,
  buildPersonalizationDataFromDraft,
} from "./addon-helpers";
import type { AddonDraft, AddonDraftUpdate } from "./addon-draft.types";
import type { useConfigureBundleController } from "./useConfigureBundleController";

type ConfigureAddonStateDependencies = {
  bundle: ReturnType<typeof useConfigureBundleController>["bundle"];
  markAsDirty: () => void;
};

export function useConfigureAddonState(
  dependencies: ConfigureAddonStateDependencies
) {
  const { bundle, markAsDirty } = dependencies;
  const [addonDraft, setAddonDraft] = useState<AddonDraft>(() =>
    buildAddonDraftFromPersonalizationData((bundle as any).personalizationData)
  );
  const originalAddonDraftRef = useRef<AddonDraft>(addonDraft);
  const [activeAddonTierIndex, setActiveAddonTierIndex] = useState<
    number | null
  >(0);
  const [addonSelectedProductsTierIndex, setAddonSelectedProductsTierIndex] =
    useState<number | null>(null);
  const [
    isAddonSelectedProductsModalOpen,
    setIsAddonSelectedProductsModalOpen,
  ] = useState(false);
  const updateAddonDraft = useCallback(
    (updates: AddonDraftUpdate) => {
      setAddonDraft((current) => ({ ...current, ...updates }));
      markAsDirty();
    },
    [markAsDirty]
  );
  const addonTierCount = Array.isArray(addonDraft.addonTiers)
    ? addonDraft.addonTiers.length
    : 0;

  useEffect(() => {
    setActiveAddonTierIndex((currentIndex) => {
      return normalizeAddonTierAccordionIndex(currentIndex, addonTierCount);
    });
  }, [addonTierCount]);

  return {
    activeAddonTierIndex,
    addonDraft,
    addonSelectedProductsTierIndex,
    addonTierCount,
    buildAddonDraftFromPersonalizationData,
    buildPersonalizationDataFromDraft,
    isAddonSelectedProductsModalOpen,
    originalAddonDraftRef,
    setActiveAddonTierIndex,
    setAddonDraft,
    setAddonSelectedProductsTierIndex,
    setIsAddonSelectedProductsModalOpen,
    updateAddonDraft,
  };
}
