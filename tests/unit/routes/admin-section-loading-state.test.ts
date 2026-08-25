import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminSectionLoadingState } from "../../../app/components/AdminSectionLoadingState";

describe("AdminSectionLoadingState", () => {
  it("renders Polaris loading feedback with one accessible visible label", () => {
    const view = renderToStaticMarkup(
      React.createElement(AdminSectionLoadingState, {
        label: "Loading your workspace",
      }),
    );

    expect(view).toContain("<s-spinner");
    expect(view).toContain('accessibilityLabel="Loading your workspace"');
    expect(view).toContain("<s-text>Loading your workspace</s-text>");
    expect(view).not.toContain("skeleton");
  });
});
