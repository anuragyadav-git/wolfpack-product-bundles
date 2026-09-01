import {
  buildCountdownRuntimeConfig,
  parseCountdownSettings,
} from "../../../app/lib/bundle-countdown";

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

describe("buildCountdownRuntimeConfig", () => {
  const settings = {
    countdownEnabled: true,
    countdownLayout: "full" as const,
    countdownPosition: "below" as const,
    countdownTitle: "Ends soon",
    countdownExpiryAction: "show_message" as const,
    countdownExpiredMessage: "This offer has ended",
  };

  it("derives the only runtime deadline from OfferPolicy.endsAt", () => {
    expect(buildCountdownRuntimeConfig(settings, {
      endsAt: new Date("2030-01-02T03:04:05.000Z"),
    })).toEqual({
      layout: "full",
      position: "below",
      title: "Ends soon",
      expiryAction: "show_message",
      expiredMessage: "This offer has ended",
      endsAt: "2030-01-02T03:04:05.000Z",
    });
  });

  it.each([
    ["disabled", { ...settings, countdownEnabled: false }, { endsAt: "2030-01-02T03:04:05.000Z" }],
    ["missing deadline", settings, null],
    ["invalid deadline", settings, { endsAt: "not-a-date" }],
  ])("omits the runtime countdown when %s", (_scenario, input, policy) => {
    expect(buildCountdownRuntimeConfig(input, policy)).toBeNull();
  });
});
