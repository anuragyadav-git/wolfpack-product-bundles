import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DisabledConfigurationRegion } from "../../../app/routes/app/_shared/bundle-configure/DisabledConfigurationRegion";

describe("DisabledConfigurationRegion", () => {
  it("keeps enabled content interactive", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        DisabledConfigurationRegion,
        { disabled: false },
        React.createElement("button", null, "Configure")
      )
    );

    expect(view).not.toContain("inert");
    expect(view).not.toContain('aria-disabled="true"');
    expect(view).toContain("Configure");
  });

  it("keeps disabled content rendered with inert semantics", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        DisabledConfigurationRegion,
        { disabled: true },
        React.createElement("button", null, "Configured value")
      )
    );

    expect(view).toContain("inert");
    expect(view).toContain('aria-disabled="true"');
    expect(view).toContain("Configured value");
  });
});
