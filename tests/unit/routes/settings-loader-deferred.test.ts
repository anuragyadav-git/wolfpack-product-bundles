jest.mock("../../../app/lib/auth-guards.server", () => ({
  requireAdminSession: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: { findUnique: jest.fn() },
    bundle: { findMany: jest.fn() },
  },
}));

const { requireAdminSession } = require("../../../app/lib/auth-guards.server");
const { prisma } = require("../../../app/db.server");

function makeDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("Settings loader critical path", () => {
  it("returns the landing response before workspace data resolves", async () => {
    requireAdminSession.mockResolvedValue({
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
