import { parseCountdownSettings } from "../../../app/lib/bundle-countdown";

describe("parseCountdownSettings", () => {
  it("returns opt-in presentation defaults without creating a deadline", () => {
    expect(parseCountdownSettings(new FormData())).toEqual({
      countdownEnabled: false,
      countdownLayout: "compact",
      countdownPosition: "above",
      countdownTitle: "",
      countdownExpiryAction: "hide",
      countdownExpiredMessage: "",
    });
  });

  it("preserves supported presentation values", () => {
    const formData = new FormData();
    formData.set("countdownEnabled", "true");
    formData.set("countdownLayout", "full");
    formData.set("countdownPosition", "below");
    formData.set("countdownTitle", "Ends soon");
    formData.set("countdownExpiryAction", "show_message");
    formData.set("countdownExpiredMessage", "This offer has ended");

    expect(parseCountdownSettings(formData)).toEqual({
      countdownEnabled: true,
      countdownLayout: "full",
      countdownPosition: "below",
      countdownTitle: "Ends soon",
      countdownExpiryAction: "show_message",
      countdownExpiredMessage: "This offer has ended",
    });
  });

  it("normalizes unsupported options to the documented defaults", () => {
    const formData = new FormData();
    formData.set("countdownLayout", "banner");
    formData.set("countdownPosition", "fixed");
    formData.set("countdownExpiryAction", "restart");

    expect(parseCountdownSettings(formData)).toMatchObject({
      countdownLayout: "compact",
      countdownPosition: "above",
      countdownExpiryAction: "hide",
    });
  });
});
