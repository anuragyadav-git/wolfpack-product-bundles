import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PpbCategoryStepSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.categorySteps";

describe("PPB category step setting control", () => {
  it.each([
    [true, true],
    [false, false],
  ])(
    "renders the persisted %s state",
    (useSingleStepCategoriesAsBundleSteps, expectedChecked) => {
      const props = {
        markAsDirty: jest.fn(),
        setUseSingleStepCategoriesAsBundleSteps: jest.fn(),
        useSingleStepCategoriesAsBundleSteps,
      };

      const view = renderToStaticMarkup(
        createElement(PpbCategoryStepSettings, props),
      );

      expect(view).toContain("Use categories as bundle steps");
      expect(view.includes('checked="true"')).toBe(expectedChecked);
    },
  );
});
