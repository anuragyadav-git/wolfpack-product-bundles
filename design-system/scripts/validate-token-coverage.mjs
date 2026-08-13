import path from 'node:path';
import designInventory from './design-configuration-inventory.cjs';
import { parseSimpleYamlItems, parseCsv, readText } from './_helpers.mjs';

const configPath = new URL('../00-inventory/configuration-registry.yaml', import.meta.url);
const coveragePath = new URL('../00-inventory/configuration-coverage.csv', import.meta.url);
const designSourcePath = new URL('../../app/lib/admin-configuration-surfaces.ts', import.meta.url);
const { discoverDesignConfigurationFields } = designInventory;

function main() {
  const configItems = parseSimpleYamlItems(readText(configPath));
  const coverageRows = parseCsv(coveragePath);
  const coveredIds = new Set(coverageRows.map((row) => row.item_id).filter(Boolean));
  const registryIds = new Set(configItems.map((item) => item.id));
  const designFields = discoverDesignConfigurationFields(readText(designSourcePath));
  const missing = [];

  for (const item of configItems) {
    if (!coveredIds.has(item.id)) {
      missing.push(item.id);
    }
  }

  for (const field of designFields) {
    if (!registryIds.has(field.id)) missing.push(`${field.id} (Admin Design)`);
  }

  if (missing.length > 0) {
    console.error('Configuration coverage gaps:');
    for (const id of missing) {
      console.error(` - ${id}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Token coverage validation passed for ${configItems.length} configuration entries.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
