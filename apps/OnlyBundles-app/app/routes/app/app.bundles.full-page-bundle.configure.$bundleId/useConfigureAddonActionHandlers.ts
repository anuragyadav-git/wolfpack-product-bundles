import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  createDefaultAddonDraftTier,
  normalizeAddonPickerProduct,
} from "./addon-helpers";
import { hidePolarisModal } from "../_shared/bundle-configure/modal-utils";
import type {
  AddonDraftUpdate,
  AddonTierDraft,
} from "./addon-draft.types";

type AddonActionDependencies = {
  addonDraft: { addonTiers?: AddonTierDraft[] };
  addonSelectedProductsModalRef: {
    current: HTMLElement | { hideOverlay?: () => void } | null;
  };
  setAddonSelectedProductsTierIndex: (index: number | null) => void;
  setIsAddonSelectedProductsModalOpen: (open: boolean) => void;
  setIsDisableAddonStepModalOpen: (open: boolean) => void;
  updateAddonDraft: (updates: AddonDraftUpdate) => void;
};

export function useConfigureAddonActionHandlers(
  dependencies: AddonActionDependencies
) {
  const shopify = useAppBridge();
  const {
    addonDraft,
    addonSelectedProductsModalRef,
    setAddonSelectedProductsTierIndex,
    setIsAddonSelectedProductsModalOpen,
    setIsDisableAddonStepModalOpen,
    updateAddonDraft,
  } = dependencies;
  const openAddonSelectedProductsModal = useCallback(
    (tierIndex: number) => {
      setAddonSelectedProductsTierIndex(tierIndex);
      setIsAddonSelectedProductsModalOpen(true);
    },
    [setAddonSelectedProductsTierIndex, setIsAddonSelectedProductsModalOpen]
  );
  const handleAddonSelectedProductRemove = useCallback(
    (tierIndex: number, productIndex: number) => {
      const addonTiers = Array.isArray(addonDraft.addonTiers)
        ? addonDraft.addonTiers
        : [];
      const updated = addonTiers.map((tier, index) => {
        if (index !== tierIndex) return tier;
        const selectedAddonProducts = Array.isArray(tier.selectedAddonProducts)
          ? tier.selectedAddonProducts
          : [];
        return {
          ...tier,
          selectedAddonProducts: selectedAddonProducts.filter(
            (_, selectedIndex) => selectedIndex !== productIndex
          ),
        };
      });
      updateAddonDraft({ addonTiers: updated });
    },
    [addonDraft.addonTiers, updateAddonDraft]
  );
  const handleAddonSelectedProductAdd = useCallback(
    async (
      tierIndex: number,
      options?: { reopenSelectedProductsModal?: boolean }
    ) => {
      if (options?.reopenSelectedProductsModal) {
        setAddonSelectedProductsTierIndex(tierIndex);
        setIsAddonSelectedProductsModalOpen(false);
        hidePolarisModal(addonSelectedProductsModalRef);
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
      const addonTiers = Array.isArray(addonDraft.addonTiers)
        ? addonDraft.addonTiers
        : [];
      const currentProducts = Array.isArray(
        addonTiers[tierIndex]?.selectedAddonProducts
      )
        ? addonTiers[tierIndex].selectedAddonProducts
        : [];
      try {
        const picked = await shopify.resourcePicker({
          type: "product",
          multiple: true,
          selectionIds: currentProducts.flatMap((product) => {
            const id = product.graphqlId || product.id;
            return id ? [{ id }] : [];
          }),
        });
        const selection = Array.isArray(picked) ? picked : undefined;
        if (!selection) return;
        const updated = addonTiers.map((tier, index) =>
          index === tierIndex
            ? {
                ...tier,
                selectedAddonProducts: selection.map((product) =>
                  normalizeAddonPickerProduct(product)
                ),
              }
            : tier
        );
        updateAddonDraft({ addonTiers: updated });
      } finally {
        if (options?.reopenSelectedProductsModal) {
          setAddonSelectedProductsTierIndex(tierIndex);
          setIsAddonSelectedProductsModalOpen(true);
        }
      }
    },
    [
      addonDraft.addonTiers,
      addonSelectedProductsModalRef,
      setAddonSelectedProductsTierIndex,
      setIsAddonSelectedProductsModalOpen,
      shopify,
      updateAddonDraft,
    ]
  );
  const handleDisableAddonStepConfirm = useCallback(() => {
    setIsDisableAddonStepModalOpen(false);
    updateAddonDraft({
      isPersonalizationEnabled: false,
      addonProductsEnabled: false,
    });
  }, [setIsDisableAddonStepModalOpen, updateAddonDraft]);

  return {
    createDefaultAddonDraftTier,
    handleAddonSelectedProductAdd,
    handleAddonSelectedProductRemove,
    handleDisableAddonStepConfirm,
    normalizeAddonPickerProduct,
    openAddonSelectedProductsModal,
  };
}
