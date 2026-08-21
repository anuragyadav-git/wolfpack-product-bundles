import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalAppModal } from "../../../app/components/bundle-configure/LocalAppModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key === "common.actions.close" ? "Close" : key,
  }),
}));

describe("LocalAppModal", () => {
  it("renders app-owned modal workflows in a native modal dialog", () => {
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

    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="local-app-modal-title"');
    expect(markup).toContain("Discard changes");
    expect(markup).toContain("Unsaved changes");
  });
});
