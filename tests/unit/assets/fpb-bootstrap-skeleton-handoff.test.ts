const {
  removeBootstrapSkeleton,
  transferBootstrapSkeleton,
} = require("../../../app/assets/widgets/full-page/bootstrap-skeleton");

describe("FPB bootstrap skeleton handoff", () => {
  it("moves the required proxy skeleton into the widget container", () => {
    const skeleton = { ariaHidden: true };
    const marker = {
      querySelector: jest.fn().mockReturnValue(skeleton),
    };
    const container = {
      replaceChildren: jest.fn(),
      setAttribute: jest.fn(),
    };

    transferBootstrapSkeleton(marker, container);

    expect(marker.querySelector).toHaveBeenCalledWith("[data-wpb-bootstrap-skeleton]");
    expect(container.replaceChildren).toHaveBeenCalledWith(skeleton);
    expect(container.setAttribute).toHaveBeenCalledWith("aria-busy", "true");
  });

  it("fails fast when canonical proxy markup has no skeleton", () => {
    const marker = {
      querySelector: jest.fn().mockReturnValue(null),
    };
    const container = {
      replaceChildren: jest.fn(),
      setAttribute: jest.fn(),
    };

    expect(() => transferBootstrapSkeleton(marker, container)).toThrow(
      "FPB bootstrap skeleton is required",
    );
    expect(container.replaceChildren).not.toHaveBeenCalled();
  });

  it("removes the transferred skeleton when widget rendering finishes", () => {
    const skeleton = {
      remove: jest.fn(),
    };
    const container = {
      querySelector: jest.fn().mockReturnValue(skeleton),
      setAttribute: jest.fn(),
    };

    removeBootstrapSkeleton(container);

    expect(skeleton.remove).toHaveBeenCalledTimes(1);
    expect(container.setAttribute).toHaveBeenCalledWith("aria-busy", "false");
  });
});
