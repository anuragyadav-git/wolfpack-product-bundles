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
    await expect((result as any).data.settingsPage).resolves.toBeNull();
    await expect((result as any).data.previewBundles).resolves.toEqual([]);
  });
});
