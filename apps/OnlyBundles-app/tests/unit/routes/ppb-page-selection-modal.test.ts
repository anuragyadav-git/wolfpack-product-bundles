import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  dismissPpbPageSelectionModal,
  PpbPageSelectionModal,
  type PpbPageSelectionModalProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbPageSelectionModal";

describe("PpbPageSelectionModal", () => {
  it("imperatively hides before clearing state for template selection", () => {
    const calls: string[] = [];
    dismissPpbPageSelectionModal(
      { current: { hideOverlay: () => { calls.push("hide"); } } },
      () => { calls.push("close-state"); },
    );

    expect(calls).toEqual(["hide", "close-state"]);
  });

  it("uses the native Polaris hide command for the projected Cancel action", () => {
    const props = {
      availablePages: [{ id: "product", title: "product" }],
      closePageSelectionModal: jest.fn(),
      handlePageSelection: jest.fn(),
      isPageSelectionModalOpen: true,
    } as unknown as PpbPageSelectionModalProps;

    const view = renderToStaticMarkup(
      React.createElement(PpbPageSelectionModal, props),
    );

    expect(view).toContain('id="ppb-page-selection-modal"');
    expect(view.match(/commandFor="ppb-page-selection-modal"/g)).toHaveLength(1);
    expect(view.match(/command="--hide"/g)).toHaveLength(1);
  });
});
