const startTransition = jest.fn((update: () => void) => update());

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  startTransition,
}));

describe("deferred configure overlay hydration", () => {
  it("reveals the overlay tree inside a React transition", async () => {
    const reveal = jest.fn();
    const { revealDeferredConfigureOverlays } = await import(
      "../../../app/routes/app/_shared/bundle-configure/deferred-configure-overlays"
    );

    revealDeferredConfigureOverlays(reveal);

    expect(startTransition).toHaveBeenCalledTimes(1);
    expect(startTransition).toHaveBeenCalledWith(expect.any(Function));
    expect(reveal).toHaveBeenCalledTimes(1);
  });
});
