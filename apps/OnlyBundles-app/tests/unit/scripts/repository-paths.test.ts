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
    expect(manifest.scripts["app:dev:sit"]).toBe(
      "npm run dev:sit --workspace=wolfpack-product-bundles",
    );
  });

  it("pins every Shopify CLI script to the app workspace", () => {
    const repositoryRoot = findRepositoryRoot(process.cwd());
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(repositoryRoot, "apps", "OnlyBundles-app", "package.json"),
        "utf8",
      ),
    );
    const shopifyScripts = Object.entries(manifest.scripts)
      .filter(([, command]) => /\bshopify\b/.test(String(command)))
      .map(([name, command]) => [name, String(command)]);

    expect(shopifyScripts.map(([name]) => name)).toEqual([
      "dev",
      "dev:sit",
      "config:link",
      "generate",
      "deploy",
      "deploy:prod",
      "deploy:sit",
      "config:use",
      "env",
      "shopify",
    ]);
    for (const [, command] of shopifyScripts) {
      expect(command).toMatch(/(?:^|&& )SHOPIFY_FLAG_PATH=\. shopify(?: |$)/);
    }
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
