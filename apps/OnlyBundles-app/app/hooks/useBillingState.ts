/**
 * Billing State Hook
 *
 * Manages all state for the Billing route including:
 * - Cancel confirmation modal state
 * - Success/Error banner visibility
 */

import { useCallback, useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================

export interface BillingLoaderData {
  upgraded: boolean;
  callbackError: string | null;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useBillingState(loaderData: BillingLoaderData) {
  const { callbackError, upgraded } = loaderData;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(upgraded);
  const [showErrorBanner, setShowErrorBanner] = useState(Boolean(callbackError));

  useEffect(() => {
    setShowSuccessBanner(upgraded);
    setShowErrorBanner(Boolean(callbackError));
  }, [callbackError, upgraded]);

  // Open cancel confirmation
  const openCancelConfirm = useCallback(() => {
    setShowCancelConfirm(true);
  }, []);

  // Close cancel confirmation
  const closeCancelConfirm = useCallback(() => {
    setShowCancelConfirm(false);
  }, []);

  // Dismiss success banner
  const dismissSuccessBanner = useCallback(() => {
    setShowSuccessBanner(false);
  }, []);

  // Dismiss error banner
  const dismissErrorBanner = useCallback(() => {
    setShowErrorBanner(false);
  }, []);

  // Show success banner (for programmatic use)
  const showSuccess = useCallback(() => {
    setShowSuccessBanner(true);
  }, []);

  // Show error banner (for programmatic use)
  const showError = useCallback(() => {
    setShowErrorBanner(true);
  }, []);

  return {
    // Cancel confirmation state
    showCancelConfirm,
    openCancelConfirm,
    closeCancelConfirm,

    // Success banner state
    showSuccessBanner,
    dismissSuccessBanner,
    showSuccess,

    // Error banner state
    showErrorBanner,
    dismissErrorBanner,
    showError,
  };
}
