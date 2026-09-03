import path from 'node:path';
import {
  canonicalTemplateIds,
  hasBannedLegacyTokens,
  isCanonicalTemplateId,
  parseSimpleYamlItems,
  readText,
} from './_helpers.mjs';

const templateRegistryPath = new URL('../00-inventory/template-registry.yaml', import.meta.url);
const canonicalSet = new Set(canonicalTemplateIds);

function normalizeAlias(value) {
  return String(value || '').trim().toUpperCase();
}

function validateAliases(item) {
  const templateId = normalizeAlias(item.template);
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  const normalizedAliases = aliases.map(normalizeAlias).filter(Boolean);
  const seen = new Set();
  const duplicates = new Set();
  const nonCanonical = [];

  for (const alias of normalizedAliases) {
    if (!isCanonicalTemplateId(alias)) {
      nonCanonical.push(alias);
      continue;
    }
    if (seen.has(alias)) duplicates.add(alias);
    seen.add(alias);
  }

  if (templateId && !normalizedAliases.includes(templateId)) {
    nonCanonical.push(`missing canonical alias ${templateId}`);
  }

  return { nonCanonical, duplicates: Array.from(duplicates) };
}

function main() {
  const text = readText(templateRegistryPath);
  const items = parseSimpleYamlItems(text);
  const violations = [];
  const bannedTemplateAliases = ['COGNIVE', 'CASCADE', 'SIMPLIFIED', 'MODAL'];

  for (const item of items) {
    const templateId = normalizeAlias(item.template);
    const fields = [item.id, item.family, item.template, ...(item.aliases || [])];

    const hasLegacy = fields
      .filter(Boolean)
      .some((value) => bannedTemplateAliases.includes(String(value).toUpperCase()));

    if (!isCanonicalTemplateId(templateId)) {
      violations.push(`template-registry entry ${item.id} uses non-canonical template "${item.template}"`);
    }

    if (!canonicalSet.has(templateId)) {
      violations.push(`template-registry entry ${item.id} has template not in canonical template set`);
    }

    if (hasLegacy) {
      violations.push(`template-registry entry ${item.id} contains deprecated alias/label`);
    }

    const aliasValidation = validateAliases(item);
    if (aliasValidation.nonCanonical.length > 0) {
      violations.push(
        `template-registry entry ${item.id} has non-canonical aliases: ${aliasValidation.nonCanonical.join(', ')}`
      );
    }
    if (aliasValidation.duplicates.length > 0) {
      violations.push(
        `template-registry entry ${item.id} has duplicate aliases: ${aliasValidation.duplicates.join(', ')}`
      );
    }
  }

  if (hasBannedLegacyTokens(text)) {
    violations.push('found deprecated identifiers inside template-registry.yaml raw text');
  }

  if (violations.length > 0) {
    console.error('Registry validation failed:');
    for (const issue of violations) {
      console.error(` - ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Registry validation passed for ${items.length} template entries.`);
}

if (path.extname(process.argv[1]) === '.mjs') {
  main();
}
