import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfigureValidationSummary } from "../../../app/routes/app/_shared/bundle-configure/ConfigureValidationSummary";

describe("ConfigureValidationSummary", () => {
  const issues = [
    {
      path: "steps.step-1.name",
      message: "Enter a step name.",
      section: "step_setup",
    },
    {
      path: "widget.buttonText",
      message: "Enter widget button text.",
      section: "bundle_widget",
    },
  ];

  it("shows only errors belonging to the active configure section", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ConfigureValidationSummary, {
        activeSection: "bundle_widget",
        issues,
      }),
    );

    expect(markup).toContain("Fix the following fields before saving:");
    expect(markup).toContain("Enter widget button text.");
    expect(markup).not.toContain("Enter a step name.");
  });

  it("renders nothing when the active section has no errors", () => {
    expect(
      renderToStaticMarkup(
        React.createElement(ConfigureValidationSummary, {
          activeSection: "bundle_settings",
          issues,
        }),
      ),
    ).toBe("");
  });
});
