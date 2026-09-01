import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useSelector } from "react-redux";

jest.mock("@remix-run/react", () => ({
  Await: ({ children }: { children: (value: unknown[]) => React.ReactNode }) => children([{}, []]),
  useLoaderData: () => ({ settingsPage: {}, previewBundles: [] }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../app/routes/app/app.settings/SettingsRoute", () => ({
  SettingsRoute: () => {
    useSelector((state: unknown) => state);
    return React.createElement("span", null, "Controls workspace");
  },
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: { findUnique: jest.fn(), findMany: jest.fn() },
    bundle: { findMany: jest.fn() },
  },
}));

jest.mock("../../../app/services/theme-colors.server", () => ({
  syncThemeColors: jest.fn(),
}));

describe("Settings Controls direct load", () => {
  it("provides the application store to the directly loaded Settings workspace", async () => {
    const { default: SettingsControlsRoute } = await import(
      "../../../app/routes/app/app.settings_.controls"
    );

    expect(() => renderToStaticMarkup(
      React.createElement(SettingsControlsRoute),
    )).not.toThrow();
  });
});
