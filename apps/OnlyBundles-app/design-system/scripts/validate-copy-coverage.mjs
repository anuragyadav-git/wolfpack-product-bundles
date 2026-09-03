import path from 'node:path';
import runtimeInventory from './copy-runtime-inventory.cjs';
import { parseSimpleYamlItems, parseCsv, readText } from './_helpers.mjs';

const copyPath = new URL('../00-inventory/copy-registry.yaml', import.meta.url);
const coveragePath = new URL('../00-inventory/copy-coverage.csv', import.meta.url);
const runtimePath = new URL('../../app/lib/settings-language-runtime.ts', import.meta.url);
const { discoverRuntimeCopyFields } = runtimeInventory;

function main() {
  const copyItems = parseSimpleYamlItems(readText(copyPath));
  const coverageRows = parseCsv(coveragePath);
  const coveredIds = new Set(coverageRows.map((row) => row.item_id).filter(Boolean));
  const registryIds = new Set(copyItems.map((item) => item.id));
  const runtimeFields = discoverRuntimeCopyFields(readText(runtimePath));
  const missing = [];

  for (const item of copyItems) {
    if (!coveredIds.has(item.id)) {
      missing.push(item.id);
    }
  }

  for (const field of runtimeFields) {
    if (!registryIds.has(field.id)) missing.push(`${field.id} (runtime)`);
  }

  if (missing.length > 0) {
    console.error('Copy coverage gaps:');
    for (const id of missing) {
      console.error(` - ${id}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Copy coverage validation passed for ${copyItems.length} copy entries.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
