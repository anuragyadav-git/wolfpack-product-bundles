const {
  removeBootstrapLoadingScreen,
  transferBootstrapLoadingScreen,
} = require("../../../app/assets/widgets/full-page/bootstrap-skeleton");

describe("FPB bootstrap loading screen handoff", () => {
  it("moves the required proxy loading screen into the widget container", () => {
    const loadingScreen = { ariaHidden: false };
    const marker = {
      querySelector: jest.fn().mockReturnValue(loadingScreen),
    };
    const container = {
      replaceChildren: jest.fn(),
      setAttribute: jest.fn(),
    };

    transferBootstrapLoadingScreen(marker, container);

    expect(marker.querySelector).toHaveBeenCalledWith("[data-wpb-loading-screen]");
    expect(container.replaceChildren).toHaveBeenCalledWith(loadingScreen);
    expect(container.setAttribute).toHaveBeenCalledWith("aria-busy", "true");
  });

  it("fails fast when canonical proxy markup has no loading screen", () => {
    const marker = {
      querySelector: jest.fn().mockReturnValue(null),
    };
    const container = {
      replaceChildren: jest.fn(),
      setAttribute: jest.fn(),
    };

    expect(() => transferBootstrapLoadingScreen(marker, container)).toThrow(
      "FPB bootstrap loading screen is required",
    );
    expect(container.replaceChildren).not.toHaveBeenCalled();
  });

  it("removes the transferred loading screen when widget rendering finishes", () => {
    const loadingScreen = {
      remove: jest.fn(),
    };
    const container = {
      querySelector: jest.fn().mockReturnValue(loadingScreen),
      setAttribute: jest.fn(),
    };

    removeBootstrapLoadingScreen(container);

    expect(loadingScreen.remove).toHaveBeenCalledTimes(1);
    expect(container.setAttribute).toHaveBeenCalledWith("aria-busy", "false");
  });
});
