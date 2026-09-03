import fs from 'node:fs';
import path from 'node:path';
import { parseSimpleYamlItems, readText } from './_helpers.mjs';

const templateRegistryPath = new URL('../00-inventory/template-registry.yaml', import.meta.url);
const outputPath = new URL('../08-qa/browser-test-plan.yaml', import.meta.url);

function main() {
  const templateItems = parseSimpleYamlItems(readText(templateRegistryPath));
  const testEntries = [];

  for (const item of templateItems) {
    testEntries.push({
      template: item.template,
      family: item.family,
      aliases: item.aliases || [],
      desktop: ['320x568', '1280x800'],
      mobile: ['390x844'],
    });
  }

  const yamlLines = [];
  yamlLines.push('tests:');
  for (const entry of testEntries) {
    yamlLines.push(`  - template: ${entry.template}`);
    yamlLines.push(`    family: ${entry.family}`);
    yamlLines.push(`    aliases: [${(entry.aliases || []).join(', ')}]`);
    yamlLines.push(`    viewports: ["desktop", "mobile"]`);
  }

  fs.writeFileSync(outputPath, `${yamlLines.join('\n')}\n`);
  console.log('Generated browser test matrix in 08-qa/browser-test-plan.yaml');
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
