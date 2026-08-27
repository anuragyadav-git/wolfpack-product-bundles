import {
  advancePreviewProgress,
  clearPreviewDiscountFeedback,
  createPreviewInteractionState,
  getPreviewSelectionSummary,
  retreatPreviewProgress,
  selectPreviewCategory,
  setPreviewProductQuantity,
  togglePreviewMobileSummary,
  triggerPreviewDiscountFeedback,
  updatePreviewProductQuantity,
} from "../../../app/routes/app/app.settings/DesignLivePreview";
import { calculateDesignPreviewFitScale } from "../../../app/routes/app/app.settings/design-preview-model";
import { normalizePolarisColorValue } from "../../../app/routes/app/app.settings/SettingsDesignFields";

describe("Settings Design connected preview actions", () => {
  it("derives selected rows, count, and total from shared quantities", () => {
    const initial = createPreviewInteractionState();
    const withThird = updatePreviewProductQuantity(initial, "third", 2);
    const summary = getPreviewSelectionSummary(withThird);

    expect(summary.products.map(({ product, quantity }) => [product.id, quantity])).toEqual([
      ["first", 1],
      ["second", 1],
      ["third", 2],
    ]);
    expect(summary.itemCount).toBe(4);
    expect(summary.totalCents).toBe(7400);
  });

  it("supports category, slot removal, picker addition, and mobile summary state", () => {
    const initial = createPreviewInteractionState();
    const category = selectPreviewCategory(initial, "extras");
    const removed = setPreviewProductQuantity(category, "first", 0);
    const added = setPreviewProductQuantity(removed, "third", 1);
    const expanded = togglePreviewMobileSummary(added);

    expect(category.activeCategoryId).toBe("extras");
    expect(removed.quantities.first).toBe(0);
    expect(added.quantities.third).toBe(1);
    expect(expanded.isMobileSummaryOpen).toBe(true);
  });

  it("bounds Back and Continue progress and emits completion feedback at the final step", () => {
    const initial = createPreviewInteractionState();
    expect(retreatPreviewProgress(initial).progressStep).toBe(0);

    const first = advancePreviewProgress(initial);
    const second = advancePreviewProgress(first);
    const final = advancePreviewProgress(second);
    const capped = advancePreviewProgress(final);

    expect(final.progressStep).toBe(3);
    expect(capped.progressStep).toBe(3);
    expect(capped.discountFeedback.state).toBe("complete");
    expect(retreatPreviewProgress(capped).progressStep).toBe(2);
  });

  it("replays and safely clears visible discount feedback", () => {
    const tier = triggerPreviewDiscountFeedback(createPreviewInteractionState(), "tier");
    const complete = triggerPreviewDiscountFeedback(tier, "complete");

    expect(complete.discountFeedback).toEqual({ state: "complete", replay: 2 });
    expect(clearPreviewDiscountFeedback(complete, 1)).toBe(complete);
    expect(clearPreviewDiscountFeedback(complete, 2).discountFeedback.state).toBeNull();
  });

  it("fits narrow hosts and preserves six- and eight-digit Polaris colors", () => {
    expect(calculateDesignPreviewFitScale({ width: 390, height: 640 }, "desktop")).toBeCloseTo(390 / 1320);
    expect(normalizePolarisColorValue("#112233", "#000000")).toBe("#112233");
    expect(normalizePolarisColorValue("#11223380", "#000000")).toBe("#11223380");
    expect(normalizePolarisColorValue("invalid", "#abc")).toBe("#aabbcc");
  });
});
