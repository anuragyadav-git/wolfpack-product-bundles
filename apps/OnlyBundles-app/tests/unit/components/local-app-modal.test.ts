import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalAppModal } from "../../../app/components/bundle-configure/LocalAppModal";

describe("LocalAppModal", () => {
  it("delegates app-owned modal behavior to the Polaris modal", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        LocalAppModal,
        {
          title: "Discard changes",
          onClose: jest.fn(),
          primaryAction: React.createElement("button", null, "Discard"),
          children: React.createElement("p", null, "Unsaved changes"),
        },
      ),
    );

    expect(markup).toContain("<s-modal");
    expect(markup).not.toContain("<dialog");
    expect(markup).toContain("Discard changes");
    expect(markup).toContain("Unsaved changes");
  });
});
