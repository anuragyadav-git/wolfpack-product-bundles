jest.mock("../../../app/lib/auth-guards.server", () => ({
  requireAdminSession: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: { findUnique: jest.fn() },
    bundle: { findMany: jest.fn() },
  },
}));
jest.mock("../../../app/services/theme-colors.server", () => ({
  syncThemeColors: jest.fn().mockResolvedValue(null),
}));

const { requireAdminSession } = require("../../../app/lib/auth-guards.server");
const { prisma } = require("../../../app/db.server");
const { syncThemeColors } = require("../../../app/services/theme-colors.server");

function makeDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("Settings loader critical path", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    syncThemeColors.mockResolvedValue(null);
  });
  it("returns the landing response before workspace data resolves", async () => {
    requireAdminSession.mockResolvedValue({
      admin: {},
      session: { shop: "test-shop.myshopify.com" },
    });
    const settings = makeDeferred<null>();
    const bundles = makeDeferred<unknown[]>();
    prisma.designSettings.findUnique.mockReturnValue(settings.promise);
    prisma.bundle.findMany.mockReturnValue(bundles.promise);
    const { loader } = await import("../../../app/routes/app/app.settings");

    const result = await loader({
      request: new Request("https://app.test/app/settings"),
      params: {},
      context: {},
    } as any);

    expect((result as any).data.settingsPage).toBeInstanceOf(Promise);
    expect((result as any).data.previewBundles).toBeInstanceOf(Promise);

    settings.resolve(null);
    bundles.resolve([]);
    await expect((result as any).data.settingsPage).resolves.toEqual(expect.objectContaining({
      controls: expect.objectContaining({
        "landingPage.checkout.providerId": "Shopify checkout",
      }),
    }));
    await expect((result as any).data.previewBundles).resolves.toEqual([]);
  });

  it("returns the freshly fetched Shop Brand pairs with the Design workspace", async () => {
    const colors = {
      primary: { background: "#123456", foreground: "#ffffff" },
      secondary: { background: "#e8eef5", foreground: "#17202a" },
    };
    requireAdminSession.mockResolvedValue({
      admin: { graphql: jest.fn() },
      session: { shop: "test-shop.myshopify.com" },
    });
    syncThemeColors.mockResolvedValue(colors);
    prisma.designSettings.findUnique.mockResolvedValue(null);
    prisma.bundle.findMany.mockResolvedValue([]);
    const { loader } = await import("../../../app/routes/app/app.settings");

    const result = await loader({
      request: new Request("https://app.test/app/settings"),
      params: {},
      context: {},
    } as any);

    await expect((result as any).data.settingsPage).resolves.toEqual(expect.objectContaining({
      shopBrandColors: colors,
    }));
    expect(syncThemeColors).toHaveBeenCalledWith(expect.anything(), "test-shop.myshopify.com");
  });

  it("keeps the Settings landing page pending until data and the loading bar are ready", async () => {
    const settings = makeDeferred<Record<string, unknown> | null>();
    const bundles = makeDeferred<unknown[]>();
    const loadingBar = makeDeferred<void>();
    const routeReady = jest.fn();
    const { waitForSettingsRouteReady } = await import(
      "../../../app/routes/app/app.settings"
    );

    void waitForSettingsRouteReady(
      settings.promise,
      bundles.promise,
      loadingBar.promise,
    ).then(routeReady);

    settings.resolve(null);
    bundles.resolve([]);
    await Promise.resolve();
    expect(routeReady).not.toHaveBeenCalled();

    loadingBar.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(routeReady).toHaveBeenCalledWith([null, [], undefined]);
  });
});
