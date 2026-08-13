import React from "react";

import { DiscountPricingTipBanner } from "../../../app/routes/app/_shared/bundle-configure/DiscountPricingTipBanner";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

describe("Shared Discount & Pricing tip banner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the FPB banner contract and dismisses locally", () => {
    const setDismissed = jest.fn();
    (React.useState as jest.Mock).mockReturnValueOnce([false, setDismissed]);
    const banner = DiscountPricingTipBanner() as React.ReactElement<any>;

    expect(banner.type).toBe("s-banner");
    expect(banner.props.tone).toBe("info");
    expect(banner.props.heading).toBe("Discount setup tip");
    expect(banner.props.title).toBeUndefined();
    expect(banner.props.dismissible).toBe(true);
    expect(React.Children.toArray(banner.props.children).join(" ")).toContain(
      "Default Product",
    );
    banner.props.onDismiss();
    expect(setDismissed).toHaveBeenCalledWith(true);
  });

  it("hides after dismissal", () => {
    (React.useState as jest.Mock).mockReturnValueOnce([true, jest.fn()]);

    expect(DiscountPricingTipBanner()).toBeNull();
  });
});
