import {
  AppRouteLoadingWorkspace,
  getInitialAppDestination,
} from "../../../app/routes/app/app._index";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.loading.appLabel": "Loading Wolfpack Product Bundles",
        "common.loading.workspace": "Loading your workspace",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("initial app destination", () => {
  it("opens the dashboard for every authenticated app entry", () => {
    expect(getInitialAppDestination(true)).toBe("/app/dashboard");
  });

  it("keeps intentional app-home visits on the landing page", () => {
    expect(getInitialAppDestination(false)).toBeNull();
  });

  it("renders Polaris workspace feedback while client routing resolves", () => {
    const markup = renderToStaticMarkup(React.createElement(AppRouteLoadingWorkspace));

    expect(markup).toContain("<s-spinner");
    expect(markup).toContain('accessibilityLabel="Loading your workspace"');
    expect(markup).toContain("Loading your workspace");
  });
});
