import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminTaskAlertBanner } from "../../../app/components/AdminTaskAlertBanner";

describe("AdminTaskAlertBanner", () => {
  it("renders a dismissible critical banner with the supplied recovery action", () => {
    const view = renderToStaticMarkup(
      React.createElement(AdminTaskAlertBanner, {
        alert: {
          id: "bundle-save",
          heading: "Bundle not saved",
          message: "Review the bundle and try again.",
        },
        actionLabel: "Try again",
        onAction: jest.fn(),
        onDismiss: jest.fn(),
      }),
    );

    expect(view).toContain('tone="critical"');
    expect(view).toContain('heading="Bundle not saved"');
    expect(view).toContain('dismissible="true"');
    expect(view).toContain("Review the bundle and try again.");
    expect(view).toContain("Try again");
  });

  it("renders nothing without an alert", () => {
    expect(renderToStaticMarkup(
      React.createElement(AdminTaskAlertBanner, {
        alert: null,
        onDismiss: jest.fn(),
      }),
    )).toBe("");
  });
});
