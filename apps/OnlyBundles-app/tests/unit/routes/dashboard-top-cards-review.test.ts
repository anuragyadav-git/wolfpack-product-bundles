import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardTopCards } from "../../../app/routes/app/app.dashboard/DashboardTopCards";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, number>) => values
      ? `${key}:${values.count}`
      : key,
  }),
}));

describe("DashboardTopCards BFS review fixes", () => {
  it("shows support issue paths without bundle count pills", () => {
    const view = renderToStaticMarkup(
      React.createElement(DashboardTopCards as any, {
        handleDirectChat: jest.fn(),
      }),
    );

    expect(view).not.toContain("dashboard.home.summary.total");
    expect(view).not.toContain("dashboard.home.summary.active");
    expect(view).toContain("dashboard.supportIssues.title");
    expect(view).toContain("dashboard.supportIssues.bundleNotShowing");
    expect(view).toContain("dashboard.supportIssues.uninstallHelp");
    expect(view).toContain("dashboard.supportIssues.storeDesignHelp");
    expect(view).toContain("dashboard.supportIssues.description");
    expect(view).toContain("dashboard.supportIssues.cta");
    expect(view).toContain(
      'accessibilityLabel="dashboard.supportIssues.cta"',
    );
  });

  it("delegates both full-width support actions to native clickables", () => {
    const handleDirectChat = jest.fn();
    const view = DashboardTopCards({ handleDirectChat });

    const actions = React.Children.toArray(
      (function collect(node: React.ReactNode): React.ReactElement[] {
        if (!React.isValidElement(node)) return [];
        const current = node.type === "s-clickable" ? [node] : [];
        return [
          ...current,
          ...React.Children.toArray(node.props.children).flatMap((child) =>
            collect(child),
          ),
        ];
      })(view),
    ) as React.ReactElement[];

    expect(actions).toHaveLength(2);
    expect(actions.map((action) => action.props.accessibilityLabel)).toEqual([
      "dashboard.support.cta",
      "dashboard.supportIssues.cta",
    ]);

    actions.forEach((action) => action.props.onClick());
    expect(handleDirectChat).toHaveBeenCalledTimes(2);
  });
});
