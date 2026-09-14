import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensionHandle = process.argv[2] ?? "bundle-discount-function";
if (!["bundle-discount-function", "scheduled-bundle-discount"].includes(extensionHandle)) {
  throw new Error(`Unknown Discount Function extension: ${extensionHandle}`);
}
const extensionRoot = resolve(appRoot, "extensions", extensionHandle);
const wasmPath = resolve(
  extensionRoot,
  `target/wasm32-unknown-unknown/release/${extensionHandle}.wasm`,
);

const rustc = spawnSync("rustup", ["which", "--toolchain", "stable", "rustc"], {
  encoding: "utf8",
});

if (rustc.error) throw rustc.error;
if (rustc.status !== 0) {
  process.stderr.write(rustc.stderr);
  process.exit(rustc.status ?? 1);
}

const build = spawnSync(
  "rustup",
  ["run", "stable", "cargo", "build", "--target=wasm32-unknown-unknown", "--release"],
  {
    cwd: extensionRoot,
    env: {
      ...process.env,
      RUSTC: rustc.stdout.trim(),
    },
    stdio: "inherit",
  },
);

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

console.log(`Compiled Discount Function WASM: ${statSync(wasmPath).size} bytes`);
