import {
  DESIGN_CONFIGURATION,
  EXPERT_COLOR_CONTROLS,
  type SettingsField,
} from "./admin-configuration-surfaces";

export type SettingsDesignPayload = {
  fieldValues: Record<string, string>;
  inheritedColorFieldKeys: string[];
};

const DESIGN_FIELDS = [
  ...DESIGN_CONFIGURATION.flatMap((tab) => tab.fields),
  ...Object.values(EXPERT_COLOR_CONTROLS).flat(),
];

const FIELD_BY_KEY = new Map(
  DESIGN_FIELDS.map((field) => [field.key ?? field.label, field]),
);

export const SETTINGS_DESIGN_DEFAULT_FIELD_VALUES = Object.freeze(Object.fromEntries(
  DESIGN_FIELDS.map((field) => [field.key ?? field.label, field.value ?? ""]),
));

export const SETTINGS_DESIGN_COLOR_FIELD_KEYS = Object.freeze(
  DESIGN_FIELDS
    .filter((field) => field.kind === "color")
    .map((field) => field.key ?? field.label),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCssColor(value: string) {
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|transparent)$/i.test(value);
}

function isNonNegativeSize(value: string) {
  const normalized = value.toLowerCase();
  const unit = ["rem", "px", "em"].find((candidate) => normalized.endsWith(candidate));
  const numericValue = unit ? normalized.slice(0, -unit.length) : normalized;
  if (!numericValue || numericValue.length > 7) return false;
  let decimalCount = 0;
  for (const character of numericValue) {
    if (character === ".") {
      decimalCount += 1;
      if (decimalCount > 1) return false;
      continue;
    }
    if (character < "0" || character > "9") return false;
  }
  const [integer, fraction] = numericValue.split(".");
  if (!integer || integer.length > 3 || fraction?.length === 0 || (fraction?.length ?? 0) > 3) return false;
  return Number(numericValue) <= 999;
}

function validateFieldValue(field: SettingsField, value: string) {
  if (field.kind === "color") return isCssColor(value);
  if (field.kind === "loadingGif" || field.kind === "image" || field.kind === "file") {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && value.length <= 2048;
    } catch {
      return false;
    }
  }
  if (field.kind === "number") return isNonNegativeSize(value);
  if (field.kind === "select") {
    const options = field.options?.length ? field.options : [field.value ?? ""];
    return options.includes(value);
  }
  return value.length <= 2048;
}

export function parseSettingsDesignPayload(value: unknown): SettingsDesignPayload {
  if (!isRecord(value) || !isRecord(value.fieldValues)) {
    throw new Error("Invalid Settings Design payload");
  }

  const inheritedColorFieldKeys = value.inheritedColorFieldKeys === undefined
    ? []
    : Array.isArray(value.inheritedColorFieldKeys)
      ? value.inheritedColorFieldKeys
      : null;
  if (!inheritedColorFieldKeys || inheritedColorFieldKeys.some((key) => (
    typeof key !== "string" || !SETTINGS_DESIGN_COLOR_FIELD_KEYS.includes(key)
  ))) {
    throw new Error("Invalid inherited Design colors");
  }

  const fieldValues = { ...SETTINGS_DESIGN_DEFAULT_FIELD_VALUES } as Record<string, string>;
  for (const [key, field] of FIELD_BY_KEY) {
    const candidate = value.fieldValues[key];
    if (candidate === undefined) continue;
    if (typeof candidate !== "string" || !validateFieldValue(field, candidate.trim())) {
      throw new Error(`Invalid Design field: ${key}`);
    }
    fieldValues[key] = candidate.trim();
  }

  return {
    fieldValues,
    inheritedColorFieldKeys: [...new Set(inheritedColorFieldKeys)],
  };
}

export function createSettingsDesignState(value?: unknown): SettingsDesignPayload {
  if (!isRecord(value)) {
    return {
      fieldValues: { ...SETTINGS_DESIGN_DEFAULT_FIELD_VALUES },
      inheritedColorFieldKeys: [...SETTINGS_DESIGN_COLOR_FIELD_KEYS],
    };
  }

  return parseSettingsDesignPayload({
    fieldValues: isRecord(value.fieldValues) ? value.fieldValues : {},
    inheritedColorFieldKeys: value.inheritedColorFieldKeys,
  });
}
