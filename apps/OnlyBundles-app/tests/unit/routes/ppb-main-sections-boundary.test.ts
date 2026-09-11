import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PpbMainSections } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbMainSections";
import type { PpbConfigureFlow } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbConfigureFlow";

const mockAlert = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock("../../../app/components/AdminTaskAlertBanner", () => ({
  AdminTaskAlertBanner: (props: Record<string, unknown>) => mockAlert(props),
}));
describe("PPB main-section composition boundary", () => {
  it("projects route alerts without reading context", () => {
    const clearOperationAlert = jest.fn();
    const flow = {
      activeSection: "unsupported",
      clearOperationAlert,
      operationAlert: null,
      validationIssues: [],
    } as unknown as PpbConfigureFlow;

    renderToStaticMarkup(React.createElement(PpbMainSections, { flow }));

    expect(mockAlert).toHaveBeenCalledWith(
      expect.objectContaining({ onDismiss: clearOperationAlert }),
    );
  });
});
