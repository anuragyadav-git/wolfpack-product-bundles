const CART_MESSAGING_CHILDREN = [
  "Bundle Items",
  "Original Bundle Price",
  "Discount Display",
  "Discount format",
] as const;

const CART_INTEGRATION_FIELDS = [
  "Cart Item Selectors",
  "Cart Item Remove Parent Selectors",
  "Cart Item Remove Selectors",
  "Cart Item Quantity Button Selectors",
  "Custom Cart Integration Script",
] as const;

function isChecked(values: Record<string, string>, label: string) {
  return values[label] === "Checked";
}

function hasField(values: Record<string, string>, label: string) {
  return Object.prototype.hasOwnProperty.call(values, label);
}

export function getDisabledAdditionalConfigurationFields(
  values: Record<string, string>,
) {
  const disabled = new Set<string>();

  if (hasField(values, "Cart Messaging") && !isChecked(values, "Cart Messaging")) {
    CART_MESSAGING_CHILDREN.forEach((label) => disabled.add(label));
  } else if (hasField(values, "Discount Display") && !isChecked(values, "Discount Display")) {
    disabled.add("Discount format");
  }

  if (
    hasField(values, "Enable Custom Theme Integration Script")
    && !isChecked(values, "Enable Custom Theme Integration Script")
  ) {
    disabled.add("Custom Theme Integration Script");
  }

  if (hasField(values, "Enable Cart Integration") && !isChecked(values, "Enable Cart Integration")) {
    CART_INTEGRATION_FIELDS.forEach((label) => disabled.add(label));
  }

  if (hasField(values, "Enable Judge Me Integration") && !isChecked(values, "Enable Judge Me Integration")) {
    disabled.add("Public token");
  }

  return disabled;
}

export function isAdditionalConfigurationActionDisabled(
  label: string,
  values: Record<string, string>,
) {
  return label === "Cart Messaging" && !isChecked(values, "Cart Messaging");
}

export function applyAdditionalConfigurationAction(
  label: string,
  values: Record<string, string>,
) {
  if (label !== "Update Image" || !values["Upload file"]) {
    return values;
  }

  return {
    ...values,
    Logo: values["Upload file"],
  };
}

export function createDeferredSettingsNavigation() {
  let pendingNavigation: (() => void) | null = null;

  return {
    request(isDirty: boolean, navigate: () => void) {
      if (!isDirty) {
        pendingNavigation = null;
        navigate();
        return true;
      }

      pendingNavigation = navigate;
      return false;
    },
    complete() {
      const navigate = pendingNavigation;
      pendingNavigation = null;
      navigate?.();
    },
    hasPending() {
      return pendingNavigation !== null;
    },
  };
}
