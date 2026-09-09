import React from "react";

import {
  PpbUtilityModals,
  type PpbUtilityModalsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbUtilityModals";

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

describe("PPB utility modal boundary", () => {
  it("uses explicit sync state and owned actions", () => {
    const handleSyncBundleConfirm = jest.fn();
    const setIsSyncModalOpen = jest.fn();
    const props = {
      discountVariablesModalRef: { current: null },
      fetcher: { state: "submitting" },
      handleSyncBundleConfirm,
      setIsSyncModalOpen,
      syncModalRef: { current: null },
      templateVariablesModalRef: { current: null },
    } as unknown as PpbUtilityModalsProps;

    const view = PpbUtilityModals(props);
    const confirm = findElement(
      view,
      (element) =>
        element.type === "s-button" && element.props.slot === "primary-action",
    );
    const cancel = findElement(
      view,
      (element) =>
        element.type === "s-button" && element.props.slot === "secondary-actions",
    );

    expect(confirm!.props.loading).toBe(true);
    confirm!.props.onClick();
    cancel!.props.onClick();
    expect(handleSyncBundleConfirm).toHaveBeenCalledTimes(1);
    expect(setIsSyncModalOpen).toHaveBeenCalledWith(false);
  });
});
