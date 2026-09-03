import {
  getThemeExtensionStatusFromAppBridge,
  verifyAppEmbedEnabledBeforePreview,
} from "../../../app/lib/app-embed-status-check.client";

describe("native app embed status", () => {
  it("normalizes Shopify extension resources and identifies the active embed", async () => {
    const extensions = jest.fn().mockResolvedValue([{
      handle: "bundle-builder",
      type: "theme_app_extension",
      activations: [{
        handle: "bundle-app-embed",
        name: "Wolfpack Bundle",
        target: "body",
        status: "active",
        activations: [{ themeId: "gid://shopify/OnlineStoreTheme/1", target: "theme" }],
      }],
    }]);

    const result = await getThemeExtensionStatusFromAppBridge({ app: { extensions } });

    expect(result.appEmbedEnabled).toBe(true);
    expect(result.resources.find(({ handle }) => handle === "bundle-app-embed"))
      .toMatchObject({ enabled: true, status: "active" });
  });

  it("does not revalidate when the current app-owned state is disabled", async () => {
    const checkStatus = jest.fn();

    await expect(verifyAppEmbedEnabledBeforePreview(false, checkStatus))
      .resolves.toBe(false);
    expect(checkStatus).not.toHaveBeenCalled();
  });

  it("runs app-owned loading callbacks around a blocked live check", async () => {
    const events: string[] = [];

    await expect(verifyAppEmbedEnabledBeforePreview(true, async () => {
      events.push("check");
      return false;
    }, {
      onValidationStart: () => events.push("start"),
      onValidationBlocked: () => events.push("blocked"),
    })).resolves.toBe(false);

    expect(events).toEqual(["start", "check", "blocked"]);
  });
});
