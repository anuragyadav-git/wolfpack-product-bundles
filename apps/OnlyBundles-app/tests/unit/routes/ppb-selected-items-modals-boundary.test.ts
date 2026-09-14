import React from "react";

import {
  PpbSelectedItemsModals,
  type PpbSelectedItemsModalsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectedItemsModals";

function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

describe("PPB selected-resource modal boundary", () => {
  it("opens the selected Shopify product through the explicit route action", () => {
    const openProductInAdmin = jest.fn();
    const props = {
      closeDiscardModal: jest.fn(),
      collectionsModalRef: { current: null },
      currentModalStepId: "step-1",
      handleCloseCollectionsModal: jest.fn(),
      handleCloseProductsModal: jest.fn(),
      handleConfirmDiscard: jest.fn(),
      openProductInAdmin,
      productsModalRef: { current: null },
      selectedCollections: {},
      showDiscardModal: false,
      stepsState: {
        steps: [
          {
            id: "step-1",
            name: "Products",
            StepProduct: [
              {
                id: "gid://shopify/Product/123",
                productId: "123",
                title: "Selected product",
              },
            ],
          },
        ],
      } as unknown as PpbSelectedItemsModalsProps["stepsState"],
    } as unknown as PpbSelectedItemsModalsProps;

    const view = PpbSelectedItemsModals(props);
    const productAction = findElement(
      view,
      (element) =>
        element.type === "s-button" && element.props.variant === "tertiary",
    );
    productAction!.props.onClick();

    expect(openProductInAdmin).toHaveBeenCalledWith("123");
  });
});
