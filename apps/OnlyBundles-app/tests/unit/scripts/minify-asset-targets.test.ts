import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

type CssTarget = string | {
  source: string;
  target: string;
};

function loadCssTargets(): CssTarget[] {
  const moduleUrl = pathToFileURL(
    path.join(process.cwd(), "scripts", "minify-assets", "targets.js"),
  ).href;
  const script = [
    `import { createTargets } from ${JSON.stringify(moduleUrl)};`,
    "process.stdout.write(JSON.stringify(createTargets(process.cwd()).css));",
  ].join("\n");

  return JSON.parse(execFileSync(
    process.execPath,
    ["--input-type=module", "--eval", script],
    { cwd: process.cwd(), encoding: "utf8" },
  ));
}

describe("asset minifier targets", () => {
  it("only transforms owned source CSS into a distinct extension asset", () => {
    const targets = loadCssTargets();

    expect(targets.every((target) => typeof target !== "string")).toBe(true);
    for (const target of targets) {
      if (typeof target === "string") continue;
      expect(path.resolve(target.source)).not.toBe(path.resolve(target.target));
      expect(path.basename(target.target)).not.toBe("modal-discount-bar.css");
    }
  });
});
