import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TemplateReadyScreen } from "../../../app/components/bundle-configure/TemplateReadyScreen";

describe("TemplateReadyScreen", () => {
  it("renders the preview completion content", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplateReadyScreen, {
        isPreviewLoading: false,
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain("View your bundle");
    expect(view).toContain("View your bundle with your customizations");
    expect(view).toContain("Your bundle is ready");
    expect(view).toContain("Preview it now with your customizations");
    expect(view).toContain("Preview bundle");
  });

  it("disables the preview action while preview generation is running", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplateReadyScreen, {
        isPreviewLoading: true,
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain("disabled");
    expect(view).toContain('aria-busy="true"');
  });

  it("renders the preview action as a semantic projected control", () => {
    const view = renderToStaticMarkup(
      React.createElement(TemplateReadyScreen, {
        isPreviewLoading: false,
        onPreview: jest.fn(),
      })
    );

    expect(view).toContain('<button type="button"');
    expect(view).toContain("Preview bundle</button>");
  });
});
