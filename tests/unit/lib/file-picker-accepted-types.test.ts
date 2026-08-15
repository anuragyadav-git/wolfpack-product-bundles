import { isAcceptedFileType } from "../../../app/components/shared/file-picker/utils";

describe("isAcceptedFileType", () => {
  it("accepts only the configured GIF MIME type for the loading screen picker", () => {
    expect(isAcceptedFileType("image/gif", "image/gif")).toBe(true);
    expect(isAcceptedFileType("image/png", "image/gif")).toBe(false);
  });
});
