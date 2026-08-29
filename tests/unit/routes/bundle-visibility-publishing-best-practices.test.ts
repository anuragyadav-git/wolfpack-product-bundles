import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PublishingBestPractices } from "../../../app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview";

describe("shared bundle visibility publishing best practices", () => {
  it("renders the four placement guides shared by FPB and PPB", () => {
    const view = renderToStaticMarkup(
      React.createElement(PublishingBestPractices)
    );

    for (const title of [
      "Hero Banner",
      "Navigation Menu",
      "Announcement Banner",
      "Featured Product Card",
    ]) {
      expect(view).toContain(title);
    }

    expect(view.match(/<s-image/g)).toHaveLength(4);
    expect(view.match(/5 min setup/g)).toHaveLength(4);
    expect(view.match(/Quick Setup Guide/g)).toHaveLength(4);
  });

  it("keeps placement-specific instructions available from each guide", () => {
    const view = renderToStaticMarkup(
      React.createElement(PublishingBestPractices)
    );

    expect(view).toContain("add or select an image banner");
    expect(view).toContain("add the bundle as a main-menu item");
    expect(view).toContain("enable the announcement bar");
    expect(view).toContain("select Featured Collection");
  });
});
