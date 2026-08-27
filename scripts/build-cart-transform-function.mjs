import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensionRoot = resolve(repoRoot, "extensions/bundle-cart-transform-rs");
const wasmPath = resolve(
  extensionRoot,
  "target/wasm32-unknown-unknown/release/bundle_cart_transform_rs.wasm",
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: extensionRoot,
    env: process.env,
    stdio: "inherit",
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const rustc = spawnSync("rustup", ["which", "--toolchain", "stable", "rustc"], {
  encoding: "utf8",
});
if (rustc.error) throw rustc.error;
if (rustc.status !== 0) {
  process.stderr.write(rustc.stderr);
  process.exit(rustc.status ?? 1);
}

run(
  "rustup",
  ["run", "stable", "cargo", "build", "--target=wasm32-unknown-unknown", "--release"],
  {
    env: {
      ...process.env,
      RUSTC: rustc.stdout.trim(),
    },
  },
);

console.log(`Compiled Cart Transform WASM: ${statSync(wasmPath).size} bytes`);
