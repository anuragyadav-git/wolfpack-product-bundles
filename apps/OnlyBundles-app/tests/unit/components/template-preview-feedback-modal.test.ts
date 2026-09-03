import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildTemplatePreviewSupportMessage,
  TemplatePreviewFeedbackModal,
} from "../../../app/components/bundle-configure/TemplatePreviewFeedbackModal";

describe("TemplatePreviewFeedbackModal", () => {
  it("renders the shared question and both merchant choices", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplatePreviewFeedbackModal, {
        previewUrl: "https://shop.test/apps/product-bundles/wpb/1",
        onClose: jest.fn(),
      }),
    );

    expect(view).toContain("Were you able to preview the bundle?");
    expect(view).toContain("Bundle is visible on store");
    expect(view).toContain("Having issues with the bundle? Contact us");
    expect(view.match(/<s-clickable/g)).toHaveLength(2);
  });

  it("builds the exact Crisp support message with the final preview URL", () => {
    expect(buildTemplatePreviewSupportMessage("https://shop.test/preview?token=abc"))
      .toBe(
        "Having issues seeing the bundle on storefront: https://shop.test/preview?token=abc",
      );
  });
});
