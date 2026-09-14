import {
  blockUnsavedAdminNavigation,
  navigateWithSaveBarConfirmation,
} from "../../../app/lib/admin-unsaved-navigation";

describe("blockUnsavedAdminNavigation", () => {
  it("blocks navigation and irritates the contextual save bar when changes are unsaved", () => {
    const irritateSaveBar = jest.fn();

    expect(blockUnsavedAdminNavigation(true, irritateSaveBar)).toBe(true);
    expect(irritateSaveBar).toHaveBeenCalledTimes(1);
  });

  it("allows navigation without save bar feedback when there are no unsaved changes", () => {
    const irritateSaveBar = jest.fn();

    expect(blockUnsavedAdminNavigation(false, irritateSaveBar)).toBe(false);
    expect(irritateSaveBar).not.toHaveBeenCalled();
  });
});

describe("navigateWithSaveBarConfirmation", () => {
  it("waits for App Bridge confirmation before programmatic navigation", async () => {
    let confirmLeave: (() => void) | undefined;
    const leaveConfirmation = jest.fn(
      () => new Promise<void>((resolve) => {
        confirmLeave = resolve;
      }),
    );
    const navigate = jest.fn();

    const result = navigateWithSaveBarConfirmation(
      leaveConfirmation,
      navigate,
    );

    expect(navigate).not.toHaveBeenCalled();
    confirmLeave?.();
    await expect(result).resolves.toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("keeps the merchant in place when App Bridge rejects leaving", async () => {
    const navigate = jest.fn();

    await expect(
      navigateWithSaveBarConfirmation(
        () => Promise.reject(new Error("stay")),
        navigate,
      ),
    ).resolves.toBe(false);

    expect(navigate).not.toHaveBeenCalled();
  });
});
