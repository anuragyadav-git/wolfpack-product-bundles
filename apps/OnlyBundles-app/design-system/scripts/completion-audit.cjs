const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_ARTIFACTS = [
  '02-shared-components/skeleton.md',
  '02-shared-components/toast.md',
  '02-shared-components/empty-state.md',
  '02-shared-components/error-state.md',
  '07-prototypes/fpb/README.md',
  '07-prototypes/ppb/README.md',
  '08-qa/reports/README.md',
  '08-qa/reports/2026-08-10-storefront-template-release.md',
];

const TEMPLATE_IDS = [
  'STANDARD',
  'CLASSIC',
  'COMPACT',
  'HORIZONTAL',
  'GRID',
  'LIST',
  'VERTICAL_SLOTS',
  'HORIZONTAL_SLOTS',
];

const CONFIGURATION_FIELDS = [
  'id', 'family', 'templates', 'admin_label', 'admin_location', 'field_name',
  'persisted_location', 'runtime_location', 'type', 'allowed_values', 'default',
  'nullable', 'dependencies', 'mutual_exclusions', 'visibility_condition',
  'affected_components', 'affected_states', 'merchant_editable',
  'responsive_impact', 'accessibility_impact', 'fixture_ids', 'test_case_ids',
  'status', 'evidence', 'notes',
];

const COPY_FIELDS = [
  'id', 'family', 'templates', 'surface', 'admin_label', 'field_name', 'fallback',
  'required', 'merchant_editable', 'localizable', 'allowed_placeholders',
  'character_guidance', 'supports_pluralization', 'supports_rich_text',
  'sanitization', 'affected_states', 'fixture_ids', 'test_case_ids', 'status',
  'evidence',
];

const STATE_FIELDS = [
  'id', 'family', 'templates', 'trigger', 'data_precondition',
  'applicable_configurations', 'expected_visual_result',
  'expected_interaction_result', 'expected_accessibility_semantics',
  'desktop_behavior', 'mobile_behavior', 'automated_assertions',
  'screenshot_requirement', 'approval_status', 'fixture_ids', 'test_case_ids',
  'status', 'evidence',
];

const ALLOWED_STATUSES = new Set([
  'CONFIRMED_CURRENT', 'DISCOVERED_CURRENT', 'PROPOSED_MERCHANT_SETTING',
  'SYSTEM_GENERATED', 'LOCALIZABLE_SYSTEM_COPY', 'DESIGN_ONLY',
  'NOT_APPLICABLE', 'DEPRECATED',
]);

function parseValue(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === '[]') return [];
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((entry) => entry.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  return value.replace(/^['"]|['"]$/g, '');
}

function parseItems(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '').split('\n');
  const items = [];
  let current = null;
  let activeKey = null;

  for (const line of lines) {
    const itemMatch = line.match(/^\s*-\s+id:\s*(.+)$/);
    if (itemMatch) {
      if (current) items.push(current);
      current = { id: parseValue(itemMatch[1]) };
      activeKey = 'id';
      continue;
    }
    if (!current) continue;

    const keyMatch = line.match(/^\s{4}([a-zA-Z0-9_]+):\s*(.*)$/);
    if (keyMatch) {
      activeKey = keyMatch[1];
      current[activeKey] = parseValue(keyMatch[2]);
      continue;
    }

    const listMatch = line.match(/^\s{6}-\s+(.+)$/);
    if (listMatch && activeKey) {
      const existing = Array.isArray(current[activeKey]) ? current[activeKey] : [];
      current[activeKey] = [...existing, parseValue(listMatch[1])];
    }
  }
  if (current) items.push(current);
  return items;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function validateEntries(kind, entries, requiredFields, references, violations, requireApprovals) {
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) violations.push(`${kind} registry has duplicate id ${entry.id}`);
    ids.add(entry.id);

    for (const field of requiredFields) {
      if (!(field in entry)) violations.push(`${kind} ${entry.id} is missing ${field}`);
    }
    for (const field of ['templates', 'fixture_ids', 'test_case_ids']) {
      if (isEmpty(entry[field])) violations.push(`${kind} ${entry.id} has no ${field}`);
    }
    for (const fixtureId of entry.fixture_ids || []) {
      if (!references.fixtureIds.has(fixtureId)) violations.push(`${kind} ${entry.id} references unknown fixture ${fixtureId}`);
    }
    for (const testCaseId of entry.test_case_ids || []) {
      if (!references.testCaseIds.has(testCaseId)) violations.push(`${kind} ${entry.id} references unknown test case ${testCaseId}`);
    }
    if (isEmpty(entry.evidence)) violations.push(`${kind} ${entry.id} has no evidence`);
    if (!ALLOWED_STATUSES.has(String(entry.status || ''))) {
      violations.push(`${kind} ${entry.id} has invalid status ${entry.status || '<missing>'}`);
    }
    if (requireApprovals && kind === 'state' && !['APPROVED', 'WAIVED'].includes(String(entry.approval_status || ''))) {
      violations.push(`state ${entry.id} is not approved or waived`);
    }
  }
}

function auditDesignSystem(rootDir, options = {}) {
  const requireApprovals = options.requireApprovals !== false;
  const designSystemRoot = path.join(rootDir, 'design-system');
  const violations = [];
  for (const relativePath of REQUIRED_ARTIFACTS) {
    if (!fs.existsSync(path.join(designSystemRoot, relativePath))) {
      violations.push(`missing required artifact ${relativePath}`);
    }
  }

  const manifestPath = path.join(designSystemRoot, 'design-system-manifest.yaml');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  for (const artifact of [...manifest.matchAll(/^\s+-\s+(design-system\/[^\s]+)$/gm)].map((match) => match[1])) {
    if (!fs.existsSync(path.join(rootDir, artifact))) violations.push(`manifest artifact does not exist: ${artifact}`);
  }

  const inventoryRoot = path.join(designSystemRoot, '00-inventory');
  const fixtures = JSON.parse(fs.readFileSync(path.join(designSystemRoot, '06-fixtures/fixtures.json'), 'utf8'));
  const fixtureIds = new Set(Object.values(fixtures).flat());
  const browserPlan = fs.readFileSync(path.join(designSystemRoot, '08-qa/browser-test-plan.yaml'), 'utf8');
  const testCaseIds = new Set([...browserPlan.matchAll(/^\s+-\s+id:\s+([^\s]+)$/gm)].map((match) => match[1]));
  const references = { fixtureIds, testCaseIds };
  const templates = parseItems(path.join(inventoryRoot, 'template-registry.yaml'));
  const actualTemplates = templates.map((entry) => String(entry.template || '')).sort();
  const expectedTemplates = [...TEMPLATE_IDS].sort();
  if (JSON.stringify(actualTemplates) !== JSON.stringify(expectedTemplates)) {
    violations.push(`template registry must contain exactly ${expectedTemplates.join(', ')}`);
  }

  validateEntries('configuration', parseItems(path.join(inventoryRoot, 'configuration-registry.yaml')), CONFIGURATION_FIELDS, references, violations, requireApprovals);
  validateEntries('copy', parseItems(path.join(inventoryRoot, 'copy-registry.yaml')), COPY_FIELDS, references, violations, requireApprovals);
  validateEntries('state', parseItems(path.join(inventoryRoot, 'state-registry.yaml')), STATE_FIELDS, references, violations, requireApprovals);
  return violations;
}

module.exports = { auditDesignSystem };
