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
      React.createElement(DefaultStepTimelineIcon, { step })
    );

    expect(view).toContain(expectedPath);
  });

  it("uses the icon tile as the only native upload target", () => {
    const view = renderToStaticMarkup(
      React.createElement(FpbStepConfigCard, {
        styles: {},
        step: { id: "step-1", stepImage: null },
        onImageChange: jest.fn(),
        onRemoveImage: jest.fn(),
        onTitleChange: jest.fn(),
      })
    );

    expect(view.match(/<s-drop-zone/g)).toHaveLength(1);
    expect(view).toContain('labelAccessibilityVisibility="exclusive"');
    expect(view).toContain('d="M6 2L3 6');
    expect(view).not.toContain(">Replace</s-button>");
  });
});
