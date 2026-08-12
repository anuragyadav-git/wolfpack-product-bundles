import { resolveBundleStepEnabled } from "../../../app/lib/bundle-config/step-enablement";

describe("resolveBundleStepEnabled", () => {
  it("keeps the first step enabled when a disabled value is submitted", () => {
    expect(resolveBundleStepEnabled(0, false)).toBe(true);
  });

  it("allows a later step to be disabled", () => {
    expect(resolveBundleStepEnabled(1, false)).toBe(false);
  });

  it.each([true, undefined])(
    "keeps a later step enabled when its value is %s",
    (enabled) => {
      expect(resolveBundleStepEnabled(2, enabled)).toBe(true);
    },
  );
});
