---
schema_version: 1
id: discount-function-build-toolchain
title: Discount Function Build Toolchain
type: test-spec
status: active
summary: Verifies the Discount Function extension build uses one rustup-owned compiler and writes its configured WASM target.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - shopify-functions
systems:
  - discount-function
  - rust
source_paths:
  - apps/OnlyBundles-app/scripts/build-discount-function.mjs
  - apps/OnlyBundles-app/extensions/bundle-discount-function/shopify.extension.toml
related_docs:
  - internal docs/Architecture/Cart Transform Function.md
tags:
  - build
  - shopify-function
keywords:
  - rustup
  - wasm32-unknown-unknown
---

# Test Spec: Discount Function Build Toolchain

**Spec ID:** discount-function-build-toolchain  **Created:** 2026-09-09

## Purpose

Ensure the extension build command cannot mix a Homebrew Cargo process with a
rustup target library. The configured command must resolve both Cargo and Rustc
through the stable rustup toolchain before compiling the declared WASM target.

## Test Cases

### DiscountFunctionBuild

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Multiple Rust installations | Homebrew binaries precede rustup in `PATH` | Build selects rustup stable Cargo and Rustc | Prevents `can't find crate for core` |
| 2 | Shopify CLI command runner | Run the exact plain `extensions.build.command` without shell expansion | The Node build owner resolves rustup and writes release WASM to `extensions.build.path` | Avoids shell assignment and command-substitution parsing differences |
| 3 | Function behavior | Run Rust unit tests and the Shopify Function fixture test | Existing discount candidates and fail-closed authorization remain unchanged | Configuration-only remediation |

## Acceptance Criteria

- [x] The build command resolves Rustc from the same rustup stable toolchain as Cargo.
- [x] The configured `wasm32-unknown-unknown` release build succeeds.
- [x] The configured WASM output exists and is non-empty.
- [x] Rust unit tests and the Shopify Function fixture test pass.
- [x] The Shopify extension command contains no shell assignment or command substitution.
