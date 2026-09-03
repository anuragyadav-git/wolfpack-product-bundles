import {
  resolveTemplateReadyStep,
  shouldProcessTemplateResponse,
} from "../../../app/lib/template-ready-step";

describe("resolveTemplateReadyStep", () => {
  it("opens the ready screen immediately when the app embed is enabled", () => {
    expect(resolveTemplateReadyStep(true)).toBe("confirm");
  });

  it("opens app-embed setup when the app embed is disabled", () => {
    expect(resolveTemplateReadyStep(false)).toBe("enableThemeExtension");
  });
});

describe("shouldProcessTemplateResponse", () => {
  it("does not process the stale idle state immediately after submit", () => {
    expect(
      shouldProcessTemplateResponse({
        fetcherState: "idle",
        hasRequest: true,
        submissionStarted: false,
      })
    ).toBe(false);
  });

  it("processes the response only after the submission has started and returned to idle", () => {
    expect(
      shouldProcessTemplateResponse({
        fetcherState: "idle",
        hasRequest: true,
        submissionStarted: true,
      })
    ).toBe(true);
  });

  it("does not process while the submission is active or no request exists", () => {
    expect(
      shouldProcessTemplateResponse({
        fetcherState: "submitting",
        hasRequest: true,
        submissionStarted: true,
      })
    ).toBe(false);
    expect(
      shouldProcessTemplateResponse({
        fetcherState: "idle",
        hasRequest: false,
        submissionStarted: true,
      })
    ).toBe(false);
  });
});
