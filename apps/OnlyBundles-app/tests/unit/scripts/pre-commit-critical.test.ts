const core = require("../../../scripts/pre-commit-critical-core.cjs");

describe("pre-commit critical hook planner", () => {
  it("excludes only exact rename destinations from authored-file checks", () => {
    expect(
      core.excludeExactRenameDestinations(
        [
          "apps/OnlyBundles-app/tests/unit/routes/existing-layout.test.ts",
          "apps/OnlyBundles-app/tests/unit/routes/changed.test.ts",
        ],
        ["R100\ttests/unit/routes/existing-layout.test.ts\tapps/OnlyBundles-app/tests/unit/routes/existing-layout.test.ts"],
      ),
    ).toEqual(["apps/OnlyBundles-app/tests/unit/routes/changed.test.ts"]);
  });

  it("classifies staged source files into fast critical checks", () => {
    const plan = core.createCheckPlan([
      "apps/OnlyBundles-app/app/routes/app/app.billing.tsx",
      "apps/OnlyBundles-app/app/assets/widgets/full-page/methods/step-footer-methods.js",
      "apps/OnlyBundles-app/app/assets/widgets/product-page-css/templates/inpage-cascade.css",
      "apps/OnlyBundles-app/extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js",
      "prisma.config.ts",
    ]);

    expect(plan.lintFiles).toContain("apps/OnlyBundles-app/app/routes/app/app.billing.tsx");
    expect(plan.lintFiles).toContain("apps/OnlyBundles-app/app/assets/widgets/full-page/methods/step-footer-methods.js");
    expect(plan.lintFiles).not.toContain("apps/OnlyBundles-app/extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js");
    expect(plan.lintFiles).not.toContain("prisma.config.ts");
    expect(plan.syntaxFiles).toContain("apps/OnlyBundles-app/app/assets/widgets/full-page/methods/step-footer-methods.js");
    expect(plan.widgetBuildTargets).toEqual(["full-page"]);
    expect(plan.shouldMinifyCss).toBe(true);
    expect(plan.shouldRunGraphify).toBe(true);
  });

  it("blocks partially staged checked files", () => {
    const plan = core.createCheckPlan(
      ["apps/OnlyBundles-app/app/lib/pricing-display-options.ts", "docs/readme.md"],
      ["apps/OnlyBundles-app/app/lib/pricing-display-options.ts", "docs/readme.md"],
    );

    expect(plan.partialFiles).toEqual(["apps/OnlyBundles-app/app/lib/pricing-display-options.ts"]);
  });

  it("reports banned UI styling unit-test patterns", () => {
    const bannedSource = ["ex", "pect(source).toContain('class", "Name=\"hero\"');"].join("");
    const findings = core.findBannedTestPatterns({
      "apps/OnlyBundles-app/tests/unit/routes/foo-layout.test.ts": bannedSource,
      "apps/OnlyBundles-app/tests/unit/routes/behavior.test.ts": "expect(result.success).toBe(true);",
    });

    expect(findings).toEqual([
      {
        file: "apps/OnlyBundles-app/tests/unit/routes/foo-layout.test.ts",
        reason: expect.stringContaining("layout/ui-contract test filename"),
      },
      {
        file: "apps/OnlyBundles-app/tests/unit/routes/foo-layout.test.ts",
        reason: expect.stringContaining(["class", "Name/style source assertion"].join("")),
      },
    ]);
  });

  it("treats graphify local runtime failures as warn-only configuration failures", () => {
    expect(
      core.isGraphifyConfigurationFailure(
        "Graphify rebuild failed with /Users/dev/.local/share/uv/tools/graphifyy/bin/python. If this is a runtime selection issue, set GRAPHIFY_PYTHON",
      ),
    ).toBe(true);
    expect(
      core.isGraphifyConfigurationFailure(
        "Graphify rebuild failed through the public CLI. Install or upgrade the graphifyy uv tool and retry.",
      ),
    ).toBe(true);
    expect(core.isGraphifyConfigurationFailure("[Errno 1] Operation not permitted")).toBe(true);
    expect(core.isGraphifyConfigurationFailure("graphify graph contains 2 invalid file_type value(s)")).toBe(false);
  });
});
