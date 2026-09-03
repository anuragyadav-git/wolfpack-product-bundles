import path from 'node:path';
import { parseSimpleYamlItems, parseCsv, readText } from './_helpers.mjs';

const statePath = new URL('../00-inventory/state-registry.yaml', import.meta.url);
const coveragePath = new URL('../00-inventory/state-coverage.csv', import.meta.url);

function main() {
  const stateItems = parseSimpleYamlItems(readText(statePath));
  const coverageRows = parseCsv(coveragePath);
  const covered = new Set(coverageRows.map((row) => row.item_id).filter(Boolean));
  const missing = [];

  for (const item of stateItems) {
    if (!covered.has(item.id)) {
      missing.push(item.id);
    }
  }

  if (missing.length > 0) {
    console.error('State coverage gaps:');
    for (const id of missing) {
      console.error(` - ${id}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`State coverage validation passed for ${stateItems.length} state entries.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
