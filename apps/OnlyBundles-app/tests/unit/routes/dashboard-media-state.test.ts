import {
  getDashboardInitialImagePreloads,
} from "../../../app/routes/app/app.dashboard/dashboard-media-state";

describe("dashboard media state", () => {
  it("preloads only first-render dashboard media", () => {
    expect(getDashboardInitialImagePreloads()).toEqual([
      {
        href: "/Parth.avif",
        imageSizes: "120px",
        imageSrcSet: "/Parth.avif 120w",
        type: "image/avif",
      },
    ]);
  });
});
