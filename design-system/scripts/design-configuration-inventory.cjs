const ts = require('typescript');

const ALL_TEMPLATES = [
  'STANDARD',
  'CLASSIC',
  'COMPACT',
  'HORIZONTAL',
  'GRID',
  'LIST',
  'VERTICAL_SLOTS',
  'HORIZONTAL_SLOTS',
];

function kebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function propertyName(property) {
  return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
    ? property.name.text
    : null;
}

function property(object, name) {
  return object.properties.find((candidate) => (
    ts.isPropertyAssignment(candidate) && propertyName(candidate) === name
  ));
}

function stringValue(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
}

function stringProperty(object, name, fallback = '') {
  const candidate = property(object, name);
  if (!candidate || !ts.isPropertyAssignment(candidate)) return fallback;
  return stringValue(candidate.initializer) ?? fallback;
}

function stringArrayProperty(object, name) {
  const candidate = property(object, name);
  if (!candidate || !ts.isPropertyAssignment(candidate) || !ts.isArrayLiteralExpression(candidate.initializer)) return [];
  return candidate.initializer.elements.map(stringValue).filter((value) => value !== null);
}

function findVariable(sourceFile, variableName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
        return declaration.initializer;
      }
    }
  }
  return null;
}

function registryItem(field, group, expert) {
  const key = field.key || field.label;
  const disabled = field.kind === 'loadingSpinner';
  return {
    id: `design-${kebabCase(key)}`,
    family: 'SHARED',
    templates: ALL_TEMPLATES,
    admin_label: field.label,
    admin_location: `Settings > Design > ${group}`,
    field_name: key,
    persisted_location: `DesignSettings.settingsData.fieldValues.${key}`,
    runtime_location: `buildSettingsDesignRuntime.fieldValues.${key}`,
    type: field.kind || 'text',
    allowed_values: field.options,
    default: field.value,
    nullable: false,
    dependencies: [],
    mutual_exclusions: [],
    visibility_condition: expert ? 'visible component owns this color role' : 'visible component owns this setting',
    affected_components: [field.description || group],
    affected_states: ['default', 'selected', 'disabled', 'focus'],
    merchant_editable: !disabled,
    responsive_impact: 'Semantic token propagates to all applicable responsive adapters',
    accessibility_impact: field.kind === 'color' ? 'Configured color pair requires contrast validation' : 'No semantic change',
    fixture_ids: ['fpb-all-templates', 'ppb-all-templates'],
    test_case_ids: ['fpb-all-template-summary', 'product-page-bundle-template-design-verification'],
    status: disabled ? 'DESIGN_ONLY' : 'CONFIRMED_CURRENT',
    evidence: 'app/lib/admin-configuration-surfaces.ts; app/lib/settings-design-runtime.ts',
    notes: 'Generated from the canonical Admin Design field contract.',
  };
}

function parseField(node) {
  if (!ts.isObjectLiteralExpression(node)) return null;
  const label = stringProperty(node, 'label');
  if (!label) return null;
  return {
    key: stringProperty(node, 'key'),
    label,
    value: stringProperty(node, 'value'),
    kind: stringProperty(node, 'kind', 'text'),
    description: stringProperty(node, 'description'),
    options: stringArrayProperty(node, 'options'),
  };
}

function discoverDesignConfigurationFields(sourceText) {
  const sourceFile = ts.createSourceFile(
    'admin-configuration-surfaces.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const items = [];
  const seen = new Set();

  function addField(field, group, expert) {
    const key = field.key || field.label;
    if (seen.has(key)) throw new Error(`duplicate Design configuration key ${key}`);
    seen.add(key);
    items.push(registryItem(field, group, expert));
  }

  const base = findVariable(sourceFile, 'DESIGN_CONFIGURATION');
  if (!base || !ts.isArrayLiteralExpression(base)) throw new Error('DESIGN_CONFIGURATION must be an array literal');
  for (const tabNode of base.elements) {
    if (!ts.isObjectLiteralExpression(tabNode)) continue;
    const group = stringProperty(tabNode, 'title', 'Design');
    const fieldsProperty = property(tabNode, 'fields');
    if (!fieldsProperty || !ts.isPropertyAssignment(fieldsProperty) || !ts.isArrayLiteralExpression(fieldsProperty.initializer)) continue;
    for (const fieldNode of fieldsProperty.initializer.elements) {
      const field = parseField(fieldNode);
      if (field) addField(field, group, false);
    }
  }

  const expert = findVariable(sourceFile, 'EXPERT_COLOR_CONTROLS');
  if (!expert || !ts.isObjectLiteralExpression(expert)) throw new Error('EXPERT_COLOR_CONTROLS must be an object literal');
  for (const groupProperty of expert.properties) {
    if (!ts.isPropertyAssignment(groupProperty) || !ts.isArrayLiteralExpression(groupProperty.initializer)) continue;
    const group = propertyName(groupProperty) || 'Expert';
    for (const fieldNode of groupProperty.initializer.elements) {
      const field = parseField(fieldNode);
      if (field) addField(field, group, true);
    }
  }

  return items;
}

module.exports = { ALL_TEMPLATES, discoverDesignConfigurationFields, kebabCase };
