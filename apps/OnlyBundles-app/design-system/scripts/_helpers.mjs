import fs from 'node:fs';

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function parseSimpleYamlItems(yamlText) {
  const lines = yamlText.replace(/\r/g, '').split('\n');
  const items = [];
  let currentItem = null;
  let inItems = false;

  const parseValue = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }

    return trimmed.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  };

  for (const line of lines) {
    const itemsMatch = line.match(/^items:\s*$/);
    if (itemsMatch) {
      inItems = true;
      continue;
    }

    if (!inItems) continue;

    const itemMatch = line.match(/^\s*-\s*id:\s*(.+)\s*$/);
    if (itemMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = { id: parseValue(itemMatch[1]) };
      continue;
    }

    const keyMatch = line.match(/^\s{2,}(\w+)\s*:\s*(.*)\s*$/);
    if (keyMatch && currentItem) {
      const key = keyMatch[1];
      currentItem[key] = parseValue(keyMatch[2]);
      continue;
    }

    const arrayItemMatch = line.match(/^\s{4,}-\s*(.+)\s*$/);
    if (arrayItemMatch && currentItem) {
      const lastKey = Object.keys(currentItem).slice(-1)[0];
      const value = parseValue(arrayItemMatch[1]);
      const existing = currentItem[lastKey];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        currentItem[lastKey] = [existing, value].filter((entry) => entry !== undefined && entry !== '').filter(Boolean);
      }
    }
  }

  if (currentItem) items.push(currentItem);
  return items;
}

export function parseCsv(filePath) {
  const text = readText(filePath).replace(/\r/g, '');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((header) => header.trim());
  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current.trim());
    return values;
  };

  return lines.slice(1).map((line) => {
    const values = parseLine(line).map((value) => value.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

export function hasBannedLegacyTokens(text) {
  return /(?:^|[^A-Z0-9_])(COGNIVE|CASCADE|SIMPLIFIED|MODAL)(?:[^A-Z0-9_]|$)/i.test(text);
}

export const canonicalTemplateIds = [
  'STANDARD',
  'CLASSIC',
  'COMPACT',
  'HORIZONTAL',
  'GRID',
  'LIST',
  'HORIZONTAL_SLOTS',
  'VERTICAL_SLOTS',
];

export function isCanonicalTemplateId(value) {
  if (typeof value !== 'string') return false;
  return canonicalTemplateIds.includes(value.trim().toUpperCase());
}
