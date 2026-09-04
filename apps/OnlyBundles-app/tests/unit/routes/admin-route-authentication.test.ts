import fs from "node:fs";
import path from "node:path";

const ROUTES_ROOT = path.resolve(__dirname, "../../../app/routes/app");

const AUTHENTICATION_POLICY: Record<
  string,
  { directCalls: number; owner?: string }
> = {
  "app.tsx": { directCalls: 1 },
  "app._index.tsx": { directCalls: 0, owner: "app.tsx" },
  "app.attribution.tsx": { directCalls: 2 },
  "app.billing.return.tsx": { directCalls: 1 },
  "app.billing.tsx": { directCalls: 2 },
  "app.billing_.plans.tsx": { directCalls: 2 },
  "app.bundles.$bundleType.configure.$bundleId.prepare-preview.tsx": {
    directCalls: 2,
  },
  "app.bundles.create/route.tsx": { directCalls: 2 },
  "app.bundles.full-page-bundle.configure.$bundleId/route.tsx": {
    directCalls: 2,
  },
  "app.bundles.product-page-bundle.configure.$bundleId.validate-widget-placement.tsx": {
    directCalls: 2,
  },
  "app.bundles.product-page-bundle.configure.$bundleId/route.tsx": {
    directCalls: 2,
  },
  "app.bundles.products.$productId/route.tsx": { directCalls: 1 },
  "app.dashboard/route.tsx": { directCalls: 2 },
  "app.integrations.tsx": { directCalls: 1 },
  "app.offer-operations.export.tsx": { directCalls: 1 },
  "app.offer-operations.tsx": { directCalls: 2 },
  "app.settings.tsx": { directCalls: 2 },
  "app.settings_.controls.tsx": {
    directCalls: 0,
    owner: "app.settings.tsx",
  },
  "app.store-files.tsx": { directCalls: 1 },
  "app.upload-store-file.tsx": { directCalls: 2 },
};

function discoverRouteModules(directory: string, relative = ""): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return discoverRouteModules(absolutePath, relativePath);
    }

    const isTopLevelFlatRoute =
      relative === "" &&
      (entry.name === "app.tsx" || /^app\..*\.tsx$/.test(entry.name));
    const isRouteFolderEntry = entry.name === "route.tsx";
    return isTopLevelFlatRoute || isRouteFolderEntry ? [relativePath] : [];
  });
}

describe("Admin route authentication ownership", () => {
  it("classifies every Admin route module", () => {
    expect(discoverRouteModules(ROUTES_ROOT).sort()).toEqual(
      Object.keys(AUTHENTICATION_POLICY).sort()
    );
  });

  it.each(Object.entries(AUTHENTICATION_POLICY))(
    "%s has the declared Shopify Admin authentication owner",
    (relativePath, policy) => {
      const source = fs.readFileSync(path.join(ROUTES_ROOT, relativePath), "utf8");
      const directCalls = source.match(/authenticate\.admin\(request\)/g)?.length ?? 0;

      expect(directCalls).toBe(policy.directCalls);
      if (policy.owner) {
        const ownerSource = fs.readFileSync(
          path.join(ROUTES_ROOT, policy.owner),
          "utf8"
        );
        expect(ownerSource).toContain("authenticate.admin(request)");
      }
    }
  );
});
