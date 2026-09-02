import fs from "node:fs";
import path from "node:path";

const {
  findRepositoryRoot,
  normalizeRepositoryPath,
  resolveAppPath,
} = require("../../../scripts/lib/repository-layout.cjs");

describe("repository layout", () => {
  it("normalizes path separators for repository-owned paths", () => {
    expect(normalizeRepositoryPath("apps\\OnlyBundles-app\\app")).toBe(
      "apps/OnlyBundles-app/app",
    );
  });

  it("discovers the monorepo root from inside the Shopify workspace", () => {
    const repositoryRoot = findRepositoryRoot(
      path.join(process.cwd(), "app", "services"),
    );
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    );

    expect(manifest.workspaces).toEqual([
      "apps/OnlyBundles-app",
      "apps/OnlyBundles-app/extensions/*",
      "apps/OnlyBundles-website",
    ]);
  });

  it("resolves Shopify-owned paths below the app workspace", () => {
    const repositoryRoot = findRepositoryRoot(process.cwd());

    expect(resolveAppPath(repositoryRoot, "prisma/schema.prisma")).toBe(
      path.join(
        repositoryRoot,
        "apps",
        "OnlyBundles-app",
        "prisma",
        "schema.prisma",
      ),
    );
  });

  it("preserves root commands through explicit Shopify workspace wrappers", () => {
    const repositoryRoot = findRepositoryRoot(process.cwd());
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    );

    expect(manifest.scripts.build).toBe("npm run app:build");
    expect(manifest.scripts.test).toBe("npm run app:test");
    expect(manifest.scripts["dev:sit"]).toBe("npm run app:dev:sit");
    expect(manifest.scripts["deploy:prod"]).toBe("npm run app:deploy:prod");
    expect(manifest.scripts["deploy:sit"]).toBe("npm run app:deploy:sit");
    expect(manifest.scripts["webhook-worker"]).toBe(
      "npm run app:webhook-worker",
    );
    expect(manifest.scripts["graphify:rebuild"]).toBe(
      "npm run app:graphify:rebuild",
    );
  });

  it("exposes explicit app, website, and aggregate verification commands", () => {
    const repositoryRoot = findRepositoryRoot(process.cwd());
    const manifest = JSON.parse(
      fs.readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    );

    expect(manifest.scripts["app:build"]).toContain("--workspace");
    expect(manifest.scripts["website:build"]).toContain("--workspace");
    expect(manifest.scripts["website:verify"]).toContain("--workspace");
    expect(manifest.scripts["verify:all"]).toBe(
      "npm run app:verify && npm run website:verify",
    );
  });
});
