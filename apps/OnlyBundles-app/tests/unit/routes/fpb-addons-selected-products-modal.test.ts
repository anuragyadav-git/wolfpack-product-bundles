import React from "react";

import { FpbSelectedItemsModals } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureSelectedItemsModals";

function childElements(element: React.ReactElement): React.ReactElement[] {
  return React.Children.toArray(element.props.children).filter(
    React.isValidElement
  ) as React.ReactElement[];
}

function descendants(element: React.ReactElement): React.ReactElement[] {
  const children = childElements(element);
  return children.flatMap((child) => [child, ...descendants(child)]);
}

describe("FPB selected-items modal behavior", () => {
  const onAdd = jest.fn();
  const onCloseAddon = jest.fn();
  const onRemove = jest.fn();
  const onOpenProduct = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  function renderModals() {
    return FpbSelectedItemsModals({
      products: {
        modalRef: { current: null },
        selected: [
          {
            id: "gid://shopify/Product/1",
            productId: "1",
            title: "Selected product",
            variants: [{ id: "gid://shopify/ProductVariant/2" }],
          },
        ],
        onClose: jest.fn(),
        onOpenInAdmin: onOpenProduct,
      },
      addonProducts: {
        modalRef: { current: null },
        tierIndex: 2,
        selected: [
          { id: "gid://shopify/Product/3", title: "Add-on product" },
        ],
        onAdd,
        onClose: onCloseAddon,
        onRemove,
      },
      collections: {
        modalRef: { current: null },
        selected: [],
        onClose: jest.fn(),
      },
      variables: {
        templateModalRef: { current: null },
        discountModalRef: { current: null },
        addonModalRef: { current: null },
        onCloseTemplate: jest.fn(),
      },
      disableAddon: {
        modalRef: { current: null },
        onCancel: jest.fn(),
        onConfirm: jest.fn(),
      },
      styles: new Proxy({}, { get: (_, key) => String(key) }),
    } as never) as React.ReactElement;
  }

  it("delegates add-on close and picker actions with the active tier", () => {
    const modals = childElements(renderModals());
    const addonModalChildren = childElements(modals[1]);

    addonModalChildren.at(-2)?.props.onClick();
    addonModalChildren.at(-1)?.props.onClick();

    expect(onCloseAddon).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(2, {
      reopenSelectedProductsModal: true,
    });
  });

  it("delegates selected product navigation and add-on removal", () => {
    const modals = childElements(renderModals());
    const productOpenButton = descendants(modals[0]).find(
      (element) =>
        element.type === "s-button" &&
        element.props.children === "Selected product"
    );
    productOpenButton?.props.onClick();

    const removeButton = descendants(modals[1]).find(
      (element) =>
        element.type === "s-button" &&
        element.props.accessibilityLabel === "Remove Add-on product"
    );
    removeButton?.props.onClick();

    expect(onOpenProduct).toHaveBeenCalledWith("1");
    expect(onRemove).toHaveBeenCalledWith(2, 0);
  });
});
