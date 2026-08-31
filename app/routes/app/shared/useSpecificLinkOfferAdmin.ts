import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { i18n } from '../../../i18n/config';
import type { SpecificLinkOfferAdminState } from '../../../lib/specific-link-offer-admin';

interface SpecificLinkOfferActionResponse {
  success: boolean;
  campaignLink?: string;
  enabled?: boolean;
  expiresAt?: string | null;
  revoked?: boolean;
  ruleVersion?: number | null;
}

interface AdminToastApi {
  toast: {
    show: (message: string, options?: { isError?: boolean }) => void;
  };
}

export function useSpecificLinkOfferAdmin({
  initialState,
  markAsDirty,
  shopify,
}: {
  initialState: SpecificLinkOfferAdminState;
  markAsDirty: () => void;
  shopify: AdminToastApi;
}) {
  const fetcher = useFetcher<SpecificLinkOfferActionResponse>();
  const [offerDeliveryState, setOfferDeliveryState] =
    useState<SpecificLinkOfferAdminState>(initialState);
  const [generatedSpecificLink, setGeneratedSpecificLink] =
    useState<string | null>(null);
  const originalStateRef = useRef(initialState);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    const result = fetcher.data;
    if (!result.success) {
      shopify.toast.show(i18n.t('common.alerts.operationFailed'), { isError: true });
      return;
    }

    if (result.campaignLink) {
      const persistedState: SpecificLinkOfferAdminState = {
        enabled: result.enabled === true,
        status: 'active',
        expiresAt: result.expiresAt ?? null,
        ruleVersion: result.ruleVersion ?? null,
      };
      originalStateRef.current = persistedState;
      setOfferDeliveryState((current) => ({
        ...persistedState,
        enabled: current.enabled,
      }));
      setGeneratedSpecificLink(result.campaignLink);
      shopify.toast.show(i18n.t('specificLinkOffer.generatedSuccess'));
      return;
    }

    if (result.revoked) {
      const persistedState: SpecificLinkOfferAdminState = {
        enabled: false,
        status: 'revoked',
        expiresAt: null,
        ruleVersion: result.ruleVersion ?? null,
      };
      originalStateRef.current = persistedState;
      setOfferDeliveryState(persistedState);
      setGeneratedSpecificLink(null);
      shopify.toast.show(i18n.t('specificLinkOffer.revokedSuccess'));
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const setSpecificLinkOfferEnabled = useCallback((enabled: boolean) => {
    setOfferDeliveryState((current) => ({ ...current, enabled }));
    markAsDirty();
  }, [markAsDirty]);

  const generateSpecificLinkOffer = useCallback(() => {
    const formData = new FormData();
    formData.set('intent', 'generateSpecificLinkOffer');
    fetcher.submit(formData, { method: 'post' });
  }, [fetcher]);

  const revokeSpecificLinkOffer = useCallback(() => {
    const formData = new FormData();
    formData.set('intent', 'revokeSpecificLinkOffer');
    fetcher.submit(formData, { method: 'post' });
  }, [fetcher]);

  const copySpecificLinkOffer = useCallback((link: string) => {
    void navigator.clipboard?.writeText(link);
    shopify.toast.show(i18n.t('specificLinkOffer.copiedSuccess'));
  }, [shopify]);

  const markSpecificLinkOfferSaved = useCallback(() => {
    originalStateRef.current = offerDeliveryState;
  }, [offerDeliveryState]);

  const discardSpecificLinkOfferChanges = useCallback(() => {
    setOfferDeliveryState(originalStateRef.current);
  }, []);

  return {
    offerDeliveryState,
    generatedSpecificLink,
    specificLinkOfferBusy: fetcher.state !== 'idle',
    setSpecificLinkOfferEnabled,
    generateSpecificLinkOffer,
    revokeSpecificLinkOffer,
    copySpecificLinkOffer,
    markSpecificLinkOfferSaved,
    discardSpecificLinkOfferChanges,
  };
}
