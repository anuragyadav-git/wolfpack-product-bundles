import { resolveFilePickerInitialOpen } from "../../../app/lib/file-picker-upload-state";

describe("resolveFilePickerInitialOpen", () => {
  it("opens an auto-open picker on its first render", () => {
    expect(resolveFilePickerInitialOpen(true)).toBe(true);
  });

  it("keeps a normal picker closed on its first render", () => {
    expect(resolveFilePickerInitialOpen(false)).toBe(false);
  });
});
