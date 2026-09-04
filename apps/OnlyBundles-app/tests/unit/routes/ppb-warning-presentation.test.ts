import { getAdminWarningPresentation } from "../../../app/components/AdminWarningGroup";
import {
  buildPpbCanvasWarnings,
  getPpbStandaloneUnlistedWarning,
  getPpbStandaloneOperationAlert,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ppb-warning-presentation";

const appEmbedWarning = {
  id: "app-embed",
  heading: "Enable app embed",
  message: "Enable the app embed.",
  actionLabel: "Enable here",
  onAction: jest.fn(),
};

const unlistedWarning = {
  id: "unlisted-bundle",
  heading: "Your bundle is Unlisted",
  message: "Change the product status to Active.",
  actionLabel: "Manage",
  onAction: jest.fn(),
};

const widgetPlacementAlert = {
  id: "widget-placement",
  heading: "Widget placement needed",
  message: "Place the Bundle Builder block on this product template.",
};

describe("PPB warning presentation", () => {
  it("presents widget placement as a warning instead of a standalone operation alert", () => {
    const warnings = buildPpbCanvasWarnings({
      appEmbedEnabled: true,
      appEmbedWarning,
      unlistedWarning: null,
      operationAlert: widgetPlacementAlert,
    });

    expect(warnings).toEqual([widgetPlacementAlert]);
    expect(getAdminWarningPresentation(warnings)).toBe("single");
    expect(getPpbStandaloneOperationAlert(widgetPlacementAlert)).toBeNull();
  });

  it("clubs widget placement with every other publish warning", () => {
    const warnings = buildPpbCanvasWarnings({
      appEmbedEnabled: false,
      appEmbedWarning,
      unlistedWarning,
      operationAlert: widgetPlacementAlert,
    });

    expect(warnings.map((warning) => warning.id)).toEqual([
      "app-embed",
      "unlisted-bundle",
      "widget-placement",
    ]);
    expect(getAdminWarningPresentation(warnings)).toBe("multiple");
    expect(getPpbStandaloneUnlistedWarning(warnings)).toBeNull();
  });

  it("uses the shared unlisted banner when unlisted is the only warning", () => {
    const warnings = buildPpbCanvasWarnings({
      appEmbedEnabled: true,
      appEmbedWarning,
      unlistedWarning,
      operationAlert: null,
    });

    expect(getPpbStandaloneUnlistedWarning(warnings)).toEqual(unlistedWarning);
  });

  it("keeps non-placement operation errors in the standalone critical alert slot", () => {
    const operationAlert = {
      id: "bundle-preview",
      heading: "Preview unavailable",
      message: "Check the bundle product configuration and try again.",
    };

    expect(
      buildPpbCanvasWarnings({
        appEmbedEnabled: true,
        appEmbedWarning,
        unlistedWarning: null,
        operationAlert,
      })
    ).toEqual([]);
    expect(getPpbStandaloneOperationAlert(operationAlert)).toEqual(operationAlert);
  });
});
