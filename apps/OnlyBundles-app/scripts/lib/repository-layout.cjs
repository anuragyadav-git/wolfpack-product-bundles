const fs = require("node:fs");
const path = require("node:path");

const APP_WORKSPACE_PATH = "apps/OnlyBundles-app";
const REQUIRED_WORKSPACES = [
  APP_WORKSPACE_PATH,
  `${APP_WORKSPACE_PATH}/extensions/*`,
  "apps/OnlyBundles-website",
];

function normalizeRepositoryPath(value) {
  return String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}

function findRepositoryRoot(startPath = process.cwd()) {
  let candidate = path.resolve(startPath);
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
    candidate = path.dirname(candidate);
  }

  while (true) {
    const manifestPath = path.join(candidate, "package.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (
        Array.isArray(manifest.workspaces) &&
        REQUIRED_WORKSPACES.every(
          (workspace, index) => manifest.workspaces[index] === workspace,
        )
      ) {
        return candidate;
      }
    }

    const parent = path.dirname(candidate);
    if (parent === candidate) {
      throw new Error(`Could not locate the Only Bundles repository root from ${startPath}`);
    }
    candidate = parent;
  }
}

function resolveAppPath(repositoryRoot, ...segments) {
  return path.join(repositoryRoot, APP_WORKSPACE_PATH, ...segments);
}

module.exports = {
  APP_WORKSPACE_PATH,
  findRepositoryRoot,
  normalizeRepositoryPath,
  resolveAppPath,
};
