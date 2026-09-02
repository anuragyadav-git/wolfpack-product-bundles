import {
  parseAdditionalConfigurationsNavigation,
  serializeAdditionalConfigurationsNavigation,
} from "../../../app/lib/additional-configurations-navigation";

describe("Additional Configurations navigation", () => {
  it("uses the stable landing-page configuration default", () => {
    expect(parseAdditionalConfigurationsNavigation(new URLSearchParams())).toEqual({
      layout: "Landing Page Layout",
      tab: "Configuration",
      group: "Bundle Settings",
    });
  });

  it("preserves a valid product-page CSS deep link", () => {
    expect(parseAdditionalConfigurationsNavigation(new URLSearchParams({
      layout: "product-page",
      tab: "css-scripts",
      group: "javascript-selectors",
    }))).toEqual({
      layout: "Product Page Layout",
      tab: "CSS & Scripts",
      group: "JavaScript & Selectors",
    });
  });

  it("rejects tabs that are unavailable for the selected layout", () => {
    expect(parseAdditionalConfigurationsNavigation(new URLSearchParams({
      layout: "product-page",
      tab: "advanced",
    }))).toEqual({
      layout: "Product Page Layout",
      tab: "Configuration",
      group: "Bundle Settings",
    });
  });

  it("falls back to the first visible group", () => {
    expect(parseAdditionalConfigurationsNavigation(new URLSearchParams({
      layout: "landing-page",
      tab: "css-scripts",
      group: "unknown",
    }))).toEqual({
      layout: "Landing Page Layout",
      tab: "CSS & Scripts",
      group: "CSS",
    });
  });

  it("serializes canonical route state", () => {
    expect(serializeAdditionalConfigurationsNavigation({
      layout: "Landing Page Layout",
      tab: "Integrations",
      group: "Integrate with Judge Me",
    }).toString()).toBe(
      "layout=landing-page&tab=integrations&group=integrate-with-judge-me",
    );
  });
});
