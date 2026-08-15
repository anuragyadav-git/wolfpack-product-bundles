'use strict';

export function emit(eventName, detail) {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detail, bubbles: false }));
  } catch (e) {
    // Non-critical: event dispatch must never break SDK operations.
  }
}
