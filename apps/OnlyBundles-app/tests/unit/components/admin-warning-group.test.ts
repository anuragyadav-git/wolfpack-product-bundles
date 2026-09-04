import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AdminWarningGroup,
  getAdminWarningPresentation,
  runAdminWarningAction,
} from "../../../app/components/AdminWarningGroup";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      "common.actions.close": "Close",
      "common.actions.manage": "Manage",
      "common.warningGroup.heading": "Some items need your attention",
      "common.warningGroup.modalTitle": "Actions needed",
      "common.warningGroup.summary": "Few actions are needed to publish the bundle.",
    })[key] ?? key,
  }),
}));

const warnings = [
  {
    id: "embed",
    heading: "Enable app embed",
    message: "Enable the app embed.",
    actionLabel: "Enable Here",
    onAction: jest.fn(),
  },
  {
    id: "unlisted",
    heading: "Your bundle is Unlisted",
    message: "Change the product status to Active.",
    actionLabel: "Manage",
    onAction: jest.fn(),
  },
];

describe("AdminWarningGroup", () => {
  it("does not render without active warnings", () => {
    expect(getAdminWarningPresentation([])).toBe("none");
    expect(renderToStaticMarkup(React.createElement(AdminWarningGroup, { warnings: [] }))).toBe("");
  });

  it("renders one warning directly with its original action", () => {
    expect(getAdminWarningPresentation([warnings[0]])).toBe("single");
    const html = renderToStaticMarkup(
      React.createElement(AdminWarningGroup, { warnings: [warnings[0]] }),
    );

    expect(html.match(/<s-banner/g)).toHaveLength(1);
    expect(html).toContain("Enable app embed");
    expect(html).toContain("Enable Here");
    expect(html).not.toContain("Few actions are needed");
  });

  it("renders one summary banner and keeps every warning action in the modal", () => {
    expect(getAdminWarningPresentation(warnings)).toBe("multiple");
    const html = renderToStaticMarkup(
      React.createElement(AdminWarningGroup, { warnings }),
    );

    expect(html.match(/<s-banner/g)).toHaveLength(1);
    expect(html).toContain("Some items need your attention");
    expect(html).toContain("Few actions are needed to publish the bundle.");
    expect(html).toContain(">Manage</s-button>");
    expect(html).toContain("Enable app embed");
    expect(html).toContain("Enable Here");
    expect(html).toContain("Your bundle is Unlisted");
    expect(html).toContain("Manage");
  });

  it("closes the modal before running a warning action", () => {
    const calls: string[] = [];
    runAdminWarningAction(
      { current: { hideOverlay: () => { calls.push("close"); } } },
      () => calls.push("action"),
    );

    expect(calls).toEqual(["close", "action"]);
  });
});
