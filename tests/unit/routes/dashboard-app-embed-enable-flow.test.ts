import fs from "node:fs";
import path from "node:path";
import {
  APP_EMBED_GUIDE_SOURCES,
  checkAppEmbedActivation,
  createAppEmbedReturnCheckCoordinator,
  getAppEmbedGuideMediaProps,
  getAppEmbedModalView,
  initialAppEmbedEnableFlow,
  reduceAppEmbedEnableFlow,
  restoreAppEmbedEnableActionFocus,
  shouldCheckAppEmbedOnClose,
} from "../../../app/routes/app/app.dashboard/dashboard-app-embed-enable-flow";

describe("dashboard app embed enable flow", () => {
  it("opens instructions without visiting Theme Editor or changing status", () => {
    expect(reduceAppEmbedEnableFlow(initialAppEmbedEnableFlow, { type: "open" }))
      .toEqual({ open: true, phase: "idle", visitedThemeEditor: false });
  });

  it("moves through detecting, success, failure, and close states", () => {
    const open = reduceAppEmbedEnableFlow(initialAppEmbedEnableFlow, { type: "open" });
    const detecting = reduceAppEmbedEnableFlow(open, { type: "theme_editor_opened" });
    expect(detecting).toEqual({ open: true, phase: "detecting", visitedThemeEditor: true });
    expect(reduceAppEmbedEnableFlow(detecting, { type: "check_succeeded" }).phase).toBe("success");
    expect(reduceAppEmbedEnableFlow(detecting, { type: "check_failed" }).phase).toBe("failure");
    expect(reduceAppEmbedEnableFlow(detecting, { type: "close" }).open).toBe(false);
  });

  it("requires a final check only after an unresolved Theme Editor visit", () => {
    expect(shouldCheckAppEmbedOnClose({ open: true, phase: "idle", visitedThemeEditor: false })).toBe(false);
    expect(shouldCheckAppEmbedOnClose({ open: true, phase: "failure", visitedThemeEditor: true })).toBe(true);
    expect(shouldCheckAppEmbedOnClose({ open: true, phase: "success", visitedThemeEditor: true })).toBe(false);
  });

  it("restores focus to the banner action after the modal closes", () => {
    const action = { focus: jest.fn() };
    restoreAppEmbedEnableActionFocus(action, (restoreFocus) => restoreFocus());
    expect(action.focus).toHaveBeenCalledTimes(1);
  });

  it("deduplicates focus and visibility return events and supports retry", async () => {
    let checks = 0;
    const coordinator = createAppEmbedReturnCheckCoordinator(async () => {
      checks += 1;
      return checks;
    });

    coordinator.arm();
    const focusCheck = coordinator.requestOnReturn();
    const visibilityCheck = coordinator.requestOnReturn();
    expect(visibilityCheck).toBeNull();
    await expect(focusCheck).resolves.toBe(1);
    expect(checks).toBe(1);

    coordinator.arm();
    await expect(coordinator.requestOnReturn()).resolves.toBe(2);
    expect(checks).toBe(2);
  });

  it("maps active, inactive, and rejected App Bridge checks without optimism", async () => {
    await expect(checkAppEmbedActivation(async () => ({ appEmbedEnabled: true })))
      .resolves.toEqual({ phase: "success", appEmbedEnabled: true });
    await expect(checkAppEmbedActivation(async () => ({ appEmbedEnabled: false })))
      .resolves.toEqual({ phase: "failure", appEmbedEnabled: false });
    await expect(checkAppEmbedActivation(async () => { throw new Error("unavailable"); }))
      .resolves.toEqual({ phase: "failure", appEmbedEnabled: false });
  });

  it("defines semantic content and actions for every modal state", () => {
    expect(getAppEmbedModalView("idle")).toMatchObject({ showGuide: true, primaryAction: "open", secondaryAction: "cancel" });
    expect(getAppEmbedModalView("detecting")).toMatchObject({ showSpinner: true, primaryAction: null });
    expect(getAppEmbedModalView("success")).toMatchObject({ tone: "success", primaryAction: "done" });
    expect(getAppEmbedModalView("failure")).toMatchObject({ tone: "warning", showGuide: true, primaryAction: "retry", secondaryAction: "support" });
  });

  it("uses WebM before MP4 and respects reduced motion", () => {
    expect(APP_EMBED_GUIDE_SOURCES).toEqual([
      { src: "/media/app-embed-guide.webm", type: "video/webm" },
      { src: "/media/app-embed-guide.mp4", type: "video/mp4" },
    ]);
    expect(getAppEmbedGuideMediaProps(false)).toMatchObject({
      autoPlay: true,
      controls: false,
      muted: true,
      loop: true,
      playsInline: true,
      preload: "metadata",
      accessibilityLabelKey: "dashboard.storefrontSetup.enableModal.mediaLabel",
    });
    expect(getAppEmbedGuideMediaProps(true)).toMatchObject({ autoPlay: false, controls: true });
  });

  it("ships valid guide assets within the requested transfer budget", () => {
    const mediaDir = path.join(process.cwd(), "public/media");
    const webm = fs.readFileSync(path.join(mediaDir, "app-embed-guide.webm"));
    const mp4 = fs.readFileSync(path.join(mediaDir, "app-embed-guide.mp4"));

    expect(webm.subarray(0, 4)).toEqual(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    expect(mp4.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(webm.byteLength).toBeLessThanOrEqual(300_000);
    expect(mp4.byteLength).toBeLessThanOrEqual(300_000);
  });
});
