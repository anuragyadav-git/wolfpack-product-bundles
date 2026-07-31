import { blockUnsavedAdminNavigation } from "../../../app/lib/admin-unsaved-navigation";

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
