import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AppEmbedBanner } from "../../../app/components/AppEmbedBanner";
import { openThemeEditorInNewTab } from "../../../app/lib/theme-editor-navigation.client";

jest.mock("../../../app/lib/theme-editor-navigation.client", () => ({
  openThemeEditorInNewTab: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.actions.enableHere": "Enable Here",
        "common.appEmbed.body":
          "Enable the Theme app extension for Wolfpack Bundles to place and preview the bundle.",
        "common.appEmbed.guideTitle": "Enable app embed",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("AppEmbedBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when the app embed is enabled", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppEmbedBanner, {
        appEmbedEnabled: true,
        themeEditorUrl: "https://theme-editor.test",
      }),
    );

    expect(html).toBe("");
  });

  it("renders a persistent enable warning without a dismiss control when the app embed is disabled", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppEmbedBanner, {
        appEmbedEnabled: false,
        themeEditorUrl: "https://theme-editor.test",
      }),
    );

    expect(html).toContain("Enable the Theme app extension for Wolfpack Bundles");
    expect(html).toContain("Enable Here");
    expect(html).not.toContain("Dismiss");
    expect(html).not.toContain("common.actions.dismiss");
  });
});
