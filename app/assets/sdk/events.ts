'use strict';

import { DiscountTierFeedbackState } from "../widgets/shared/discount-tier-feedback";

export function emit(eventName: string, detail: any) {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detail, bubbles: false }));
  } catch (e: any) {
    // Non-critical: event dispatch must never break SDK operations.
  }
}
