import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CountdownSettingsSection } from "../../../app/routes/app/_shared/bundle-configure/CountdownSettingsSection";

function render(overrides: Record<string, unknown> = {}) {
  return renderToStaticMarkup(React.createElement(CountdownSettingsSection, {
    enabled: false,
    layout: "compact",
    position: "above",
    title: "",
    expiryAction: "hide",
    expiredMessage: "",
    scheduledEndsAt: null,
    markAsDirty: jest.fn(),
    setEnabled: jest.fn(),
    setLayout: jest.fn(),
    setPosition: jest.fn(),
    setTitle: jest.fn(),
    setExpiryAction: jest.fn(),
    setExpiredMessage: jest.fn(),
    ...overrides,
  } as any));
}

describe("CountdownSettingsSection", () => {
  it("keeps presentation controls disabled until countdown is enabled", () => {
    const view = render();

    expect(view).toContain('accessibilityLabel="Countdown timer"');
    expect(view).toContain('label="Layout"');
    expect(view).toContain('disabled="true"');
  });

  it("requires the existing offer schedule end without adding another deadline field", () => {
    const view = render({ enabled: true });

    expect(view).toContain("Add an offer schedule end time");
    expect(view).not.toContain('label="Countdown end"');
  });

  it("shows expired message copy only for the message expiry action", () => {
    expect(render({ enabled: true, scheduledEndsAt: "2030-01-02T03:04:05.000Z" }))
      .not.toContain('label="Expired message"');
    expect(render({
      enabled: true,
      scheduledEndsAt: "2030-01-02T03:04:05.000Z",
      expiryAction: "show_message",
    })).toContain('label="Expired message"');
  });
});
