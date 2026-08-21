const CART_MESSAGING_CHILDREN = [
  "shared.cartMessaging.showBundleContains",
  "shared.cartMessaging.showOriginalPrice",
  "shared.cartMessaging.discountDisplay.isEnabled",
  "shared.cartMessaging.discountDisplay.format",
] as const;

const CART_INTEGRATION_FIELDS = [
  "landingPage.integrations.cartItemSelectors",
  "landingPage.integrations.cartItemRemoveParentSelectors",
  "landingPage.integrations.cartItemRemoveSelectors",
  "landingPage.integrations.cartItemQuantityButtonSelectors",
  "landingPage.integrations.customCartIntegrationScript",
] as const;

function isChecked(values: Record<string, string>, key: string) {
  return values[key] === "Checked";
}

function hasField(values: Record<string, string>, label: string) {
  return Object.prototype.hasOwnProperty.call(values, label);
}

export function getDisabledAdditionalConfigurationFields(
  values: Record<string, string>,
) {
  const disabled = new Set<string>();

  if (hasField(values, "shared.cartMessaging.isEnabled") && !isChecked(values, "shared.cartMessaging.isEnabled")) {
    CART_MESSAGING_CHILDREN.forEach((key) => disabled.add(key));
  } else if (hasField(values, "shared.cartMessaging.discountDisplay.isEnabled") && !isChecked(values, "shared.cartMessaging.discountDisplay.isEnabled")) {
    disabled.add("shared.cartMessaging.discountDisplay.format");
  }

  if (
    hasField(values, "landingPage.integrations.customThemeScriptEnabled")
    && !isChecked(values, "landingPage.integrations.customThemeScriptEnabled")
  ) {
    disabled.add("landingPage.integrations.customThemeIntegrationScript");
  }

  if (hasField(values, "landingPage.integrations.cartIntegrationEnabled") && !isChecked(values, "landingPage.integrations.cartIntegrationEnabled")) {
    CART_INTEGRATION_FIELDS.forEach((key) => disabled.add(key));
  }

  if (hasField(values, "landingPage.integrations.judgeMeEnabled") && !isChecked(values, "landingPage.integrations.judgeMeEnabled")) {
    disabled.add("landingPage.integrations.judgeMePublicToken");
  }

  return disabled;
}

export function isAdditionalConfigurationActionDisabled(
  key: string,
  values: Record<string, string>,
) {
  return key === "shared.cartMessaging.isEnabled" && !isChecked(values, "shared.cartMessaging.isEnabled");
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
