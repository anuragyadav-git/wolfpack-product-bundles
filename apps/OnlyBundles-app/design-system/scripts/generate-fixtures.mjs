import fs from 'node:fs';
import path from 'node:path';
import { parseSimpleYamlItems, readText } from './_helpers.mjs';

const registryPaths = {
  config: new URL('../00-inventory/configuration-registry.yaml', import.meta.url),
  copy: new URL('../00-inventory/copy-registry.yaml', import.meta.url),
  template: new URL('../00-inventory/template-registry.yaml', import.meta.url),
  state: new URL('../00-inventory/state-registry.yaml', import.meta.url),
};

const outputPath = new URL('../06-fixtures/fixtures.json', import.meta.url);

function main() {
  const fixtures = {};
  for (const [key, filePath] of Object.entries(registryPaths)) {
    fixtures[key] = parseSimpleYamlItems(readText(filePath)).map((entry) => entry.id);
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(fixtures, null, 2)}\n`);
  console.log(`Generated fixture index with ${Object.keys(fixtures).length} sections at 06-fixtures/fixtures.json`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
