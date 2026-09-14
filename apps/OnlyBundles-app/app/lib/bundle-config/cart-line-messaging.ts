interface CartLineMessagingSettings {
  isEnabled: boolean;
  showBundleContains: boolean;
  showOriginalPrice: boolean;
  discountDisplay: {
    isEnabled: boolean;
    format: string;
  };
}

interface CartLineMessagingValues {
  box?: string;
  items: string;
  retailPrice: string;
  youSave: string;
}

type CartLineDisplayProperties = Record<string, string>;

export function serializeCartLineDisplayProperties(
  settings: CartLineMessagingSettings,
  values: CartLineMessagingValues,
): CartLineDisplayProperties {
  const properties: CartLineDisplayProperties = {
    Box: values.box ?? "1",
    _Items: "",
  };

  if (!settings.isEnabled) {
    return properties;
  }

  if (settings.showBundleContains) {
    properties.Items = values.items;
  }

  if (settings.showOriginalPrice) {
    properties["Retail Price"] = values.retailPrice;
  }

  if (settings.discountDisplay.isEnabled) {
    properties["You Save"] = values.youSave;
  }

  return properties;
}
