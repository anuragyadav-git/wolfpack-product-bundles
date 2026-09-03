const ts = require('typescript');

const TEMPLATE_IDS = {
  FPB: ['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'],
  PPB: ['GRID', 'LIST', 'VERTICAL_SLOTS', 'HORIZONTAL_SLOTS'],
  SHARED: [
    'STANDARD',
    'CLASSIC',
    'COMPACT',
    'HORIZONTAL',
    'GRID',
    'LIST',
    'VERTICAL_SLOTS',
    'HORIZONTAL_SLOTS',
  ],
};

function kebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function conditionFieldId(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function stringValue(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
}

function collectDefaultValues(sourceFile) {
  const defaults = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
      for (const property of declaration.initializer.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const propertyName = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
          ? property.name.text
          : null;
        const value = stringValue(property.initializer);
        if (propertyName !== null && value !== null) {
          defaults.set(`${declaration.name.text}.${propertyName}`, value);
        }
      }
    }
  }
  return defaults;
}

function resolveFallback(node, defaults) {
  const direct = stringValue(node);
  if (direct !== null) return direct;
  if (ts.isPropertyAccessExpression(node)) {
    return defaults.get(`${node.expression.getText()}.${node.name.text}`) ?? null;
  }
  return null;
}

function readGetField(call, defaults) {
  if (!call || !ts.isCallExpression(call) || call.expression.getText() !== 'getField') return null;
  const runtimePath = stringValue(call.arguments[1]);
  const fallback = resolveFallback(call.arguments[2], defaults);
  if (!runtimePath || fallback === null) return null;
  return { runtimePath, fallback };
}

function familyFromPath(runtimePath) {
  const prefix = runtimePath.split('.')[0].toUpperCase();
  return Object.prototype.hasOwnProperty.call(TEMPLATE_IDS, prefix) ? prefix : null;
}

function placeholdersIn(value) {
  return [...new Set([...String(value).matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)].map((match) => match[1]))];
}

function discoverRuntimeCopyFields(sourceText) {
  const sourceFile = ts.createSourceFile(
    'settings-language-runtime.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const defaults = collectDefaultValues(sourceFile);
  const fields = [];
  const seen = new Set();

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callName = node.expression.getText();
      let runtimeId = null;
      let adminLabel = null;
      let getFieldCall = null;

      if (callName === 'languageField') {
        runtimeId = stringValue(node.arguments[0]);
        adminLabel = stringValue(node.arguments[1]);
        getFieldCall = node.arguments[2];
      } else if (callName === 'conditionField') {
        adminLabel = stringValue(node.arguments[0]);
        runtimeId = adminLabel === null ? null : conditionFieldId(adminLabel);
        getFieldCall = node.arguments[1];
      }

      if (runtimeId && adminLabel) {
        const runtime = readGetField(getFieldCall, defaults);
        if (runtime) {
          const family = familyFromPath(runtime.runtimePath);
          if (!family) throw new Error(`unsupported runtime copy path ${runtime.runtimePath}`);
          const key = `${family}:${runtimeId}`;
          if (seen.has(key)) throw new Error(`duplicate runtime copy field ${key}`);
          seen.add(key);
          fields.push({
            id: `${family.toLowerCase()}-${kebabCase(runtimeId)}`,
            family,
            templates: TEMPLATE_IDS[family],
            field_name: runtimeId,
            admin_label: adminLabel,
            runtime_path: runtime.runtimePath,
            fallback: runtime.fallback,
            allowed_placeholders: placeholdersIn(runtime.fallback),
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return fields;
}

module.exports = {
  TEMPLATE_IDS,
  conditionFieldId,
  discoverRuntimeCopyFields,
  kebabCase,
};
