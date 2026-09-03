import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DefaultStepTimelineIcon } from "../../../app/routes/app/_shared/bundle-configure/DefaultStepTimelineIcon";
import { FpbStepConfigCard } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupConfigCard";

describe("Admin Step Config default icon", () => {
  it.each([
    [{}, "M6 2L3 6"],
    [{ isDefault: true }, 'x="5" y="11"'],
    [{ isFreeGift: true }, 'points="20 12 20 22 4 22 4 12"'],
  ])("matches the storefront fallback for %p", (step, expectedPath) => {
    const view = renderToStaticMarkup(
      React.createElement(DefaultStepTimelineIcon, { step }),
    );

    expect(view).toContain(expectedPath);
  });

  it("labels the picker action Replace when no image is uploaded", () => {
    const view = renderToStaticMarkup(
      React.createElement(FpbStepConfigCard, {
        flow: {
          FilePicker: () => null,
          fullPageBundleStyles: {},
          markAsDirty: jest.fn(),
          setShowIconPickerForStep: jest.fn(),
          showIconPickerForStep: null,
          stepsState: { updateStepField: jest.fn() },
        } as any,
        step: { id: "step-1", stepImage: null },
      }),
    );

    expect(view).toContain(">Replace</s-button>");
    expect(view).not.toContain("Upload file");
  });
});
