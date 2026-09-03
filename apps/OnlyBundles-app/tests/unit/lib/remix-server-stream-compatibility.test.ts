import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import semver from "semver";

type PackageManifest = {
  version: string;
  dependencies?: Record<string, string>;
};

function readPackageManifest(manifestPath: string): PackageManifest {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as PackageManifest;
}

describe("Remix server stream dependency contract", () => {
  it("installs the turbo-stream version declared by Remix", () => {
    const rootRequire = createRequire(path.join(process.cwd(), "package.json"));
    const remixManifestPath = rootRequire.resolve("@remix-run/react/package.json");
    const remixRequire = createRequire(remixManifestPath);
    const remixReact = readPackageManifest(remixManifestPath);
    const turboStream = readPackageManifest(
      remixRequire.resolve("turbo-stream/package.json"),
    );
    const supportedRange = remixReact.dependencies?.["turbo-stream"];

    expect(supportedRange).toBeDefined();
    expect(semver.satisfies(turboStream.version, supportedRange!)).toBe(true);
  });
});
