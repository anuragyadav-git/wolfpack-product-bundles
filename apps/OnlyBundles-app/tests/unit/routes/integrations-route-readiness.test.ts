import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import IntegrationsRouteShell from "../../../app/routes/app/app.integrations/IntegrationsRouteShell";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Integrations route readiness", () => {
  it("renders the catalog immediately without an artificial loading interval", () => {
    const view = renderToStaticMarkup(
      React.createElement(IntegrationsRouteShell, { onBack: jest.fn() }),
    );

    expect(view).toContain("Integrations Hub");
    expect(view).not.toContain('aria-label="Loading Integrations"');
  });
});
