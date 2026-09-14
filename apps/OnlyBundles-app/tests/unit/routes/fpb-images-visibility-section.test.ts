import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {ImagesVisibilitySection} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesVisibilitySection";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleVisibilityPanel",
  () => ({
    FpbBundleVisibilityPanel: () =>
      React.createElement("span", null, "visibility"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel",
  () => ({
    FpbImagesGifsPanel: () => React.createElement("span", null, "media"),
  }),
);
jest.mock(
  "../../../app/routes/app/shared/SpecificLinkOfferSection",
  () => ({
    SpecificLinkOfferSection: () =>
      React.createElement("span", null, "specific-link"),
  }),
);
jest.mock(
  "../../../app/routes/app/shared/OfferOperationsSection",
  () => ({
    OfferOperationsSection: () =>
      React.createElement("span", null, "operations"),
  }),
);
jest.mock(
  "../../../app/routes/app/shared/CountryTargetingSection",
  () => ({
    CountryTargetingSection: () =>
      React.createElement("span", null, "targeting"),
  }),
);

const ownedProps = {
  countryTargeting: {},
  media: {},
  offerOperations: {},
  specificLinkOffer: {},
  visibility: {},
} as any;

describe("ImagesVisibilitySection", () => {
  it("renders nothing for unrelated configure sections", () => {
    const view = renderToStaticMarkup(
      React.createElement(ImagesVisibilitySection, {
        activeSection: "step_setup",
        ...ownedProps,
      }),
    );

    expect(view).toBe("");
  });

  it.each(["images_gifs", "bundle_visibility"])(
    "composes the owned features for %s",
    (activeSection) => {
      const view = renderToStaticMarkup(
        React.createElement(ImagesVisibilitySection, {
          activeSection,
          ...ownedProps,
        }),
      );

      expect(view).toContain("visibility");
      expect(view).toContain("specific-link");
      expect(view).toContain("operations");
      expect(view).toContain("targeting");
      expect(view).toContain("media");
    },
  );
});
