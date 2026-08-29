import {
  SETTINGS_DESIGN_COLOR_FIELD_KEYS,
  SETTINGS_DESIGN_DEFAULT_FIELD_VALUES,
  parseSettingsDesignPayload,
  type SettingsDesignPayload,
} from "../settings-design-contract";
import {
  EntitlementDeniedError,
  type PlanEntitlements,
} from "./entitlements";

const FREE_DESIGN_FIELD_KEYS = new Set([
  "Primary Color",
  "Button Text Color",
  "Primary Text Color",
  "Secondary Color",
  "Product Background Color",
  "Primary Font Size",
  "Primary Font Weight",
  "Secondary Font Size",
  "Secondary Font Weight",
  "Body Font Size",
  "Body Font Weight",
]);

const ADVANCED_DESIGN_FIELD_KEYS = Object.freeze(
  Object.keys(SETTINGS_DESIGN_DEFAULT_FIELD_VALUES).filter(
    (key) => !FREE_DESIGN_FIELD_KEYS.has(key),
  ),
);

const ADVANCED_COLOR_FIELD_KEYS = new Set(
  SETTINGS_DESIGN_COLOR_FIELD_KEYS.filter(
    (key) => !FREE_DESIGN_FIELD_KEYS.has(key),
  ),
);

export function getAdvancedDesignFieldKeys(): readonly string[] {
  return ADVANCED_DESIGN_FIELD_KEYS;
}

export function designRequiresGrowth(payload: SettingsDesignPayload): boolean {
  const customizedAdvancedField = ADVANCED_DESIGN_FIELD_KEYS.some(
    (key) => payload.fieldValues[key] !== SETTINGS_DESIGN_DEFAULT_FIELD_VALUES[key],
  );
  if (customizedAdvancedField) return true;

  return [...ADVANCED_COLOR_FIELD_KEYS].some(
    (key) => !payload.inheritedColorFieldKeys.includes(key),
  );
}

export function savedSettingsUseAdvancedDesign(
  generalSettings: unknown,
): boolean {
  if (!generalSettings || typeof generalSettings !== "object" || Array.isArray(generalSettings)) {
    return false;
  }
  const settingsPage = (generalSettings as Record<string, unknown>).settingsPage;
  if (!settingsPage || typeof settingsPage !== "object" || Array.isArray(settingsPage)) {
    return false;
  }
  const design = (settingsPage as Record<string, unknown>).design;
  if (design === undefined) return false;
  try {
    return designRequiresGrowth(parseSettingsDesignPayload(design));
  } catch {
    return true;
  }
}

export function assertDesignSaveAllowed(
  payload: SettingsDesignPayload,
  entitlements: PlanEntitlements | null,
): void {
  if (!designRequiresGrowth(payload)) return;
  if (!entitlements) {
    throw new EntitlementDeniedError({
      code: "BILLING_UNVERIFIED",
      entitlement: "design.advanced",
      remediation: "RETRY",
    });
  }
  if (!entitlements.capabilities.advancedDesign) {
    throw new EntitlementDeniedError({
      code: "ENTITLEMENT_REQUIRED",
      entitlement: "design.advanced",
      remediation: "UPGRADE",
    });
  }
}
