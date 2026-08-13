import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SettingsLandingShell,
} from "../../../app/routes/app/app.settings/SettingsLandingShell";
import { AdminRouteLoadingBar } from "../../../app/components/AdminRouteLoadingBar";

describe("Settings landing shell", () => {
  it("renders three actionable Polaris cards without loading a settings workspace", () => {
    const view = renderToStaticMarkup(
      React.createElement(SettingsLandingShell, { onSelect: jest.fn() }),
    );

    expect(view.match(/<s-clickable/g)).toHaveLength(3);
    expect(view).toContain("Design");
    expect(view).toContain("Language");
    expect(view).toContain("Controls");
    expect(view).toContain('accessibilityLabel="Open Design settings"');
    expect(view).not.toContain("Configure</s-text>");
    expect(view).not.toContain("Design Control Panel");
  });

  it("renders the shared top-edge loading bar during workspace loading", () => {
    const view = renderToStaticMarkup(
      React.createElement(AdminRouteLoadingBar, { label: "Loading Settings" }),
    );

    expect(view).toContain('aria-label="Loading Settings"');
    expect(view).toContain('aria-busy="true"');
    expect(view).toContain('role="progressbar"');
    expect(view).not.toContain("data-settings-skeleton-card");
    expect(view).not.toContain("<s-spinner");
  });
});
