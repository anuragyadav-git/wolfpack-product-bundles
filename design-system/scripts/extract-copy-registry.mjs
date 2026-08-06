import fs from 'node:fs';
import path from 'node:path';
import { parseSimpleYamlItems, parseCsv, readText } from './_helpers.mjs';

const sourcePath = new URL('../00-inventory/copy-registry.yaml', import.meta.url);
const outputPath = new URL('../00-inventory/copy-registry.json', import.meta.url);

function toOutput(items) {
  const payload = {
    count: items.length,
    families: Array.from(new Set(items.map((item) => item.family))),
    items,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function main() {
  const items = parseSimpleYamlItems(readText(sourcePath));
  const payload = toOutput(items);
  const coverage = parseCsv(new URL('../00-inventory/copy-coverage.csv', import.meta.url));
  const coverageMap = new Map(coverage.map((row) => [row.item_id, row]));

  const uncovered = [];
  for (const item of items) {
    if (!coverageMap.has(item.id)) {
      uncovered.push(item.id);
    }
  }

  console.log(`Extracted ${payload.count} copy rows from copy-registry.`);
  if (uncovered.length > 0) {
    console.log('Missing copy coverage entries:');
    for (const id of uncovered) {
      console.log(`  - ${id}`);
    }
  }
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
