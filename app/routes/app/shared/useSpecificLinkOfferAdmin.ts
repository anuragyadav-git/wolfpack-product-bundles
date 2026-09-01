import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { i18n } from '../../../i18n/config';
import type { SpecificLinkOfferAdminState } from '../../../lib/specific-link-offer-admin';
import type { OfferCountryTargetingMode } from '../../../lib/offer-country-targeting';

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
        ...originalStateRef.current,
        enabled: result.enabled === true,
        status: 'active',
        expiresAt: result.expiresAt ?? null,
        ruleVersion: result.ruleVersion ?? null,
      };
      originalStateRef.current = persistedState;
      setOfferDeliveryState((current) => ({
        ...current,
        status: persistedState.status,
        expiresAt: persistedState.expiresAt,
        ruleVersion: persistedState.ruleVersion,
      }));
      setGeneratedSpecificLink(result.campaignLink);
      shopify.toast.show(i18n.t('specificLinkOffer.generatedSuccess'));
      return;
    }

    if (result.revoked) {
      const persistedState: SpecificLinkOfferAdminState = {
        ...originalStateRef.current,
        enabled: false,
        status: 'revoked',
        expiresAt: null,
        ruleVersion: result.ruleVersion ?? null,
      };
      originalStateRef.current = persistedState;
      setOfferDeliveryState((current) => ({
        ...current,
        enabled: false,
        status: 'revoked',
        expiresAt: null,
        ruleVersion: result.ruleVersion ?? null,
      }));
      setGeneratedSpecificLink(null);
      shopify.toast.show(i18n.t('specificLinkOffer.revokedSuccess'));
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const setSpecificLinkOfferEnabled = useCallback((enabled: boolean) => {
    setOfferDeliveryState((current) => ({ ...current, enabled }));
    markAsDirty();
  }, [markAsDirty]);

  const setOfferPriority = useCallback((priority: number) => {
    setOfferDeliveryState((current) => ({ ...current, priority }));
    markAsDirty();
  }, [markAsDirty]);

  const setOfferStopLowerPriority = useCallback((stopLowerPriority: boolean) => {
    setOfferDeliveryState((current) => ({ ...current, stopLowerPriority }));
    markAsDirty();
  }, [markAsDirty]);

  const setOfferStartsAt = useCallback((startsAt: string | null) => {
    setOfferDeliveryState((current) => ({ ...current, startsAt }));
    markAsDirty();
  }, [markAsDirty]);

  const setOfferEndsAt = useCallback((endsAt: string | null) => {
    setOfferDeliveryState((current) => ({ ...current, endsAt }));
    markAsDirty();
  }, [markAsDirty]);

  const setCountryTargetingEnabled = useCallback((countryTargetingEnabled: boolean) => {
    setOfferDeliveryState((current) => ({ ...current, countryTargetingEnabled }));
    markAsDirty();
  }, [markAsDirty]);

  const setCountryTargetingMode = useCallback((countryTargetingMode: OfferCountryTargetingMode) => {
    setOfferDeliveryState((current) => ({ ...current, countryTargetingMode }));
    markAsDirty();
  }, [markAsDirty]);

  const setCountryCodes = useCallback((countryCodes: string[]) => {
    setOfferDeliveryState((current) => ({ ...current, countryCodes }));
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
    setOfferPriority,
    setOfferStopLowerPriority,
    setOfferStartsAt,
    setOfferEndsAt,
    setCountryTargetingEnabled,
    setCountryTargetingMode,
    setCountryCodes,
    generateSpecificLinkOffer,
    revokeSpecificLinkOffer,
    copySpecificLinkOffer,
    markSpecificLinkOfferSaved,
    discardSpecificLinkOfferChanges,
  };
}
