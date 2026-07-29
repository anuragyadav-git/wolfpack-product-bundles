import {
  AppRouteSkeleton,
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
  it("opens the existing onboarding route for a newly installed shop", () => {
    expect(getInitialAppDestination(true, true)).toBe("/app/onboarding");
  });

  it("opens the dashboard for returning shops and intentional app-home visits", () => {
    expect(getInitialAppDestination(true, false)).toBe("/app/dashboard");
    expect(getInitialAppDestination(false, true)).toBeNull();
  });

  it("renders a stable route-shaped loading state while client routing resolves", () => {
    const markup = renderToStaticMarkup(React.createElement(AppRouteSkeleton));

    expect(markup).toContain('aria-label="Loading Wolfpack Product Bundles"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Loading your workspace");
  });
});
