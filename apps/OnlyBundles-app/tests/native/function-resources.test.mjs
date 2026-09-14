import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import test from 'node:test';

const fixture = new URL('../fixtures/functions/scheduled-addon-resource-boundary.json', import.meta.url);
const runner = process.env.SHOPIFY_FUNCTION_RUNNER;
const wasm = process.env.SCHEDULED_DISCOUNT_WASM;

test('ten production-length static scheduled add-ons fit Shopify execution budgets', () => {
  assert.ok(runner && wasm, 'Provide SHOPIFY_FUNCTION_RUNNER and SCHEDULED_DISCOUNT_WASM from the Shopify CLI build');
  const result = JSON.parse(execFileSync(runner, ['-f', wasm, '-i', fixture.pathname, '-e', 'scheduled_cart_lines_discounts_generate_run', '-j'], { encoding: 'utf8' }));
  assert.equal(result.success, true);
  assert.equal(result.output.operations[0].productDiscountsAdd.candidates.length, 10);
  assert.ok(statSync(wasm).size <= 256000);
  assert.ok(Buffer.byteLength(JSON.stringify(JSON.parse(readFileSync(fixture, 'utf8')))) <= 128000);
  assert.ok(Buffer.byteLength(JSON.stringify(result.output)) <= 20000);
  assert.ok(result.instructions <= 11000000, `${result.instructions} instructions exceed 11000000`);
});

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${createHmac('sha256', 'secret').update(encoded).digest('base64url')}`;
}

function execute(input) {
  const directory = mkdtempSync(join(tmpdir(), 'bundle-resource-'));
  try {
    const path = join(directory, 'input.json');
    writeFileSync(path, JSON.stringify(input));
    const result = JSON.parse(execFileSync(runner, ['-f', wasm, '-i', path, '-e', 'scheduled_cart_lines_discounts_generate_run', '-j'], { encoding: 'utf8' }));
    const metrics = { inputBytes: Buffer.byteLength(JSON.stringify(input)), outputBytes: Buffer.byteLength(JSON.stringify(result.output)), instructions: result.instructions };
    console.log(metrics);
    assert.equal(result.success, true);
    const scale = Math.max(1, input.cart.lines.length / 200);
    assert.ok(metrics.inputBytes <= 128000 * scale);
    assert.ok(metrics.outputBytes <= 20000 * scale);
    assert.ok(metrics.instructions <= 11000000 * scale, `${metrics.instructions} instructions`);
    return result.output.operations[0]?.productDiscountsAdd.candidates ?? [];
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const ordinaryCount of [190, 240]) {
  test(`wide policy, near-limit policy map and ${ordinaryCount} ordinary lines`, () => {
    const input = JSON.parse(readFileSync(fixture, 'utf8'));
    for (const line of input.cart.lines) {
      const bundle = JSON.parse(Buffer.from(line.runtimeToken.value.split('.')[0], 'base64url'));
      for (let i = 0; i < 9; i++) bundle.groups.push({ id: `cmf${String(i).padStart(22, '0')}`, role: 'component', minQuantity: 0, maxQuantity: 10 });
      bundle.subscription = { enabled: true, selectedPlanIds: Array.from({ length: 10 }, (_, i) => `gid://shopify/SellingPlan/${12345678901234 + i}`), recurringBundleDiscount: true };
      line.runtimeToken.value = sign(bundle);
    }
    for (let i = 0; i < 73; i++) input.shop.ppbPolicyRevisions.value[`cmf${String(i).padStart(22, '0')}`] = { revision: 'b'.repeat(64), pricingMode: 'scheduled' };
    assert.ok(Buffer.byteLength(JSON.stringify(input.shop.ppbPolicyRevisions.value)) <= 10000);
    for (let i = 0; i < ordinaryCount; i++) {
      const line = structuredClone(input.cart.lines[0]);
      Object.assign(line, { id: `gid://shopify/CartLine/${1000 + i}`, runtimeToken: null, lineAuthorization: null, wolfpackProductBundleOfferId: null, stepType: null });
      input.cart.lines.push(line);
    }
    assert.equal(execute(input).length, 10);
  });
}

test('cached authorization still rejects independently tampered lines', () => {
  const input = JSON.parse(readFileSync(fixture, 'utf8'));
  input.cart.lines[3].lineAuthorization.value += 'x';
  const candidates = execute(input);
  assert.equal(candidates.length, 9);
  assert.ok(candidates.every(candidate => candidate.targets[0].cartLine.id !== input.cart.lines[3].id));
});

test('Cart Transform fits a full 10000-byte cart metafield with ten groups and 190 ordinary lines', () => {
  const transformWasm = process.env.CART_TRANSFORM_WASM;
  assert.ok(transformWasm, 'Provide CART_TRANSFORM_WASM from the Shopify CLI build');
  const path = new URL('../fixtures/functions/cart-transform-resource-boundary.json', import.meta.url);
  const input = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(Buffer.byteLength(input.cart.bundleDetails.value), 10000);
  assert.ok(Buffer.byteLength(JSON.stringify(input.shop.ppbPolicyRevisions.value)) <= 10000);
  for (let i = 0; i < 190; i++) {
    const line = structuredClone(input.cart.lines[0]);
    line.id = `gid://shopify/CartLine/${100 + i}`;
    line.wolfpackProductBundleOfferId = null;
    input.cart.lines.push(line);
  }
  const directory = mkdtempSync(join(tmpdir(), 'transform-resource-'));
  let result;
  try {
    const inputPath = join(directory, 'input.json');
    writeFileSync(inputPath, JSON.stringify(input));
    result = JSON.parse(execFileSync(runner, ['-f', transformWasm, '-i', inputPath, '-e', 'run', '-j'], { encoding: 'utf8' }));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  const metrics = { inputBytes: Buffer.byteLength(JSON.stringify(input)), outputBytes: Buffer.byteLength(JSON.stringify(result.output)), instructions: result.instructions };
  console.log(metrics);
  assert.equal(result.success, true);
  assert.equal(result.output.operations.length, 10);
  assert.ok(statSync(transformWasm).size <= 256000);
  assert.ok(metrics.inputBytes <= 128000);
  assert.ok(metrics.outputBytes <= 20000);
  assert.ok(metrics.instructions <= 11000000);
});
