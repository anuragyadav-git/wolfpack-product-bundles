import {
  CONTROL_LAYOUTS,
  DESIGN_CONFIGURATION,
  INTEGRATION_CATEGORIES,
  LANGUAGE_CONFIGURATION,
  SETTINGS_CARDS,
  SETTINGS_PANELS,
  getIntegrationCardCount,
} from "../../../app/lib/admin-configuration-surfaces";

describe("recovered admin surfaces contract", () => {
  it("keeps the recovered Settings card order and panel coverage", () => {
    expect(SETTINGS_CARDS.map((card) => card.id)).toEqual(["design", "language", "controls"]);
    expect(SETTINGS_CARDS.map((card) => card.title)).toEqual(["Design", "Language", "Controls"]);
    expect(SETTINGS_CARDS.map((card) => card.description)).toEqual([
      "Modify and customize all design elements of the bundle here",
      "Configure all text, labels, and translations for your bundle here",
      "Change loading screen gif, add custom CSS, modify checkout settings and more",
    ]);
    expect(SETTINGS_CARDS.every((card) => !("actionLabel" in card))).toBe(true);
    expect(Object.keys(SETTINGS_PANELS)).toEqual(["design", "language", "controls"]);
  });

  it("keeps detailed design and language fields from the deployed settings surface", () => {
    expect(DESIGN_CONFIGURATION.map((tab) => tab.title)).toEqual([
      "Brand Colors",
      "Typography",
      "Corners",
      "Images & GIFs",
    ]);
    expect(DESIGN_CONFIGURATION[0]?.fields.map((field) => field.label)).toContain("Primary Color");
    expect(DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs")?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "FPB Loading GIF", kind: "loadingGif", value: "" }),
        expect.objectContaining({
          label: "Loading Screen Background Color",
          kind: "color",
          value: "#ffffff",
        }),
        expect.objectContaining({ label: "Checkout GIF", kind: "loadingSpinner", value: "Default spinner" }),
      ])
    );
    expect(LANGUAGE_CONFIGURATION.enabled).toBe(true);
    expect(LANGUAGE_CONFIGURATION.selectedLanguage).toBe("English");
    expect(LANGUAGE_CONFIGURATION.supportedLanguages).toContain("Portuguese (BR)");
    expect(LANGUAGE_CONFIGURATION.sharedCartFields.map((field) => field.value)).toEqual([
      "Items",
      "Retail Price",
      "You Save",
    ]);
    expect(LANGUAGE_CONFIGURATION.templateSections).toEqual([
      "Product Card",
      "Bundle Cart",
      "Bundle",
      "Popups",
      "Toasts",
      "Addons",
      "Messages",
    ]);
    expect(LANGUAGE_CONFIGURATION.productPageTemplateSections).toEqual([
      "Product Card",
      "Bundle Cart",
      "Bundle",
      "Toasts",
    ]);
    expect(LANGUAGE_CONFIGURATION.productCardFields.map((field) => field.value)).toEqual([
      "Add To Box",
    ]);
    expect(LANGUAGE_CONFIGURATION.productPageTemplateFields["Product Card"]?.[0]?.fields.map((field) => field.value)).toEqual([
      "Add to Cart",
      "Select variant",
      "Added x{{allowedQuantity}}",
      "Add +",
    ]);
  });

  it("separates landing-page and product-page controls with setup-specific tabs", () => {
    expect(CONTROL_LAYOUTS.map((layout) => layout.label)).toEqual([
      "Landing Page Layout",
      "Product Page Layout",
    ]);

    expect(CONTROL_LAYOUTS[0]?.tabs.map((tab) => tab.title)).toEqual([
      "Configuration",
      "CSS & Scripts",
      "Integrations",
      "Advanced",
    ]);
    expect(CONTROL_LAYOUTS[1]?.tabs.map((tab) => tab.title)).toEqual([
      "Configuration",
      "CSS & Scripts",
    ]);

    const productPageConfiguration = CONTROL_LAYOUTS[1]?.tabs.find((tab) => tab.title === "Configuration");
    expect(productPageConfiguration?.contentTitle).toBe("Bundle Settings");
    expect(productPageConfiguration?.fields.map((field) => field.label)).toEqual([
      "Hide Out Of Stock Products",
      "Track inventory on Add To Cart (in beta)",
      "Add bundle to cart after the last step is completed",
      "Display empty state boxes based on bundle condition",
      "Hide Step Titles in completed state",
      "Add to cart when product card is clicked",
      "Redirect Collection Page 'Quick Add' to Bundle",
      "Cart Messaging",
      "Bundle Items",
      "Original Bundle Price",
      "Discount Display",
      "Discount format",
      "Redirect Settings",
      "Execute Script",
    ]);
    expect(productPageConfiguration?.fields.map((field) => field.group)).toEqual([
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Redirect Settings",
      "Redirect Settings",
    ]);
    const productPageCss = CONTROL_LAYOUTS[1]?.tabs.find((tab) => tab.title === "CSS & Scripts");
    expect(productPageCss?.fields.map((field) => field.label)).toEqual([
      "Custom CSS for Mix And Match Bundles",
      "Execute Custom Script",
      "Selectors",
      "Side cart selector",
      "Side cart section ID",
      "Cart page items selector",
      "Cart page items section ID",
      "Side cart open button selector",
      "Product page price selector",
    ]);
    expect(productPageCss?.fields.map((field) => field.group)).toEqual([
      "CSS",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
    ]);

    const landingConfiguration = CONTROL_LAYOUTS[0]?.tabs.find((tab) => tab.title === "Configuration");
    expect(landingConfiguration?.contentTitle).toBe("Bundle Settings");
    expect(landingConfiguration?.contentDescription).toBe("Additional bundle level settings applicable to all bundles created");
    expect(landingConfiguration?.fields.map((field) => field.label)).toEqual([
      "Show Compare At Price",
      "Hide Irrelevant variant images",
      "Track inventory on Add To Cart (in beta)",
      "Redirect Collection Page 'Quick Add' to Bundle",
      "Cart Messaging",
      "Bundle Items",
      "Original Bundle Price",
      "Discount Display",
      "Discount format",
      "Checkout Settings",
      "Checkout Integration",
      "Execute Script",
      "Custom Font",
    ]);
    expect(landingConfiguration?.fields.find((field) => field.label === "Discount format")?.options).toEqual([
      "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
      "Amount only (Eg: \"You save $73.00\")",
      "Percentage only (Eg: \"You save 19%\")",
    ]);
    expect(landingConfiguration?.fields.map((field) => field.group)).toEqual([
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Bundle Settings",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Cart Messaging",
      "Checkout Settings",
      "Checkout Settings",
      "Checkout Settings",
      "Font Settings",
    ]);
    expect(landingConfiguration?.fields.find((field) => field.label === "Checkout Integration")).toMatchObject({
      kind: "select",
      options: [
        "Shopify checkout",
        "Theme cart drawer",
        "GoKwik",
        "Shopflo",
      ],
    });

    const landingCss = CONTROL_LAYOUTS[0]?.tabs.find((tab) => tab.title === "CSS & Scripts");
    expect(landingCss?.fields.map((field) => field.group)).toEqual([
      "CSS",
      "CSS",
      "CSS",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
      "JavaScript & Selectors",
    ]);

    const landingIntegrations = CONTROL_LAYOUTS[0]?.tabs.find((tab) => tab.title === "Integrations");
    expect(landingIntegrations?.fields.map((field) => field.group)).toEqual([
      "Integrate JS with custom elements from the store theme",
      "Integrate JS with custom elements from the store theme",
      "Integrate JS bundle script with Cart page",
      "Integrate JS bundle script with Cart page",
      "Integrate JS bundle script with Cart page",
      "Integrate JS bundle script with Cart page",
      "Integrate JS bundle script with Cart page",
      "Integrate JS bundle script with Cart page",
      "Integrate with Judge Me",
      "Integrate with Judge Me",
    ]);

    const landingAdvanced = CONTROL_LAYOUTS[0]?.tabs.find((tab) => tab.title === "Advanced");
    expect(landingAdvanced?.contentTitle).toBe("Video Player Page Settings");
    expect(landingAdvanced?.contentDescription).toBe("Customize the video player page of the bundle video message");
    expect(landingAdvanced?.fields.map((field) => field.label)).toEqual([
      "Logo",
      "Background Color",
      "Upload file",
      "Update Image",
    ]);
    expect(landingAdvanced?.fields.map((field) => field.group)).toEqual([
      "Video Player Page Settings",
      "Video Player Page Settings",
      "Video Player Page Settings",
      "Video Player Page Settings",
    ]);
  });

  it("keeps the recovered integrations inventory and action types", () => {
    expect(INTEGRATION_CATEGORIES.map((category) => category.title)).toEqual([
      "Reviews",
      "Checkout",
    ]);
    expect(getIntegrationCardCount()).toBe(5);

    const cards = INTEGRATION_CATEGORIES.flatMap((category) => category.cards);
    expect(cards.map((card) => card.id)).toEqual([
      "judgeme",
      "gokwik",
      "shopflo",
      "native-checkout",
      "theme_cart_drawer",
    ]);
    expect(cards.filter((card) => card.ctaType === "guide")).toHaveLength(5);
    expect(cards.filter((card) => card.ctaType === "chat")).toHaveLength(0);
    expect(cards.every((card) => card.ctaLabel === "View Setup")).toBe(true);
    expect(cards.map((card) => card.id)).toEqual(expect.arrayContaining([
      "judgeme",
      "native-checkout",
      "gokwik",
      "shopflo",
      "theme_cart_drawer",
    ]));
    expect(cards).toContainEqual(expect.objectContaining({
      id: "judgeme",
      setupUrl: "https://wolfpackapps.com",
    }));
    expect(cards).toContainEqual(expect.objectContaining({
      id: "theme_cart_drawer",
      setupUrl: "https://wolfpackapps.com",
    }));
    expect(cards).toContainEqual(expect.objectContaining({
      id: "gokwik",
      setupUrl: "https://wolfpackapps.com",
    }));
    expect(cards).toContainEqual(expect.objectContaining({
      id: "shopflo",
      setupUrl: "https://wolfpackapps.com",
    }));
    expect(cards).toContainEqual(expect.objectContaining({
      id: "native-checkout",
      setupUrl: "https://help.shopify.com/manual/checkout",
    }));
    expect(new Set(cards.map((card) => card.status))).toEqual(new Set([
      "Supported",
      "Guided setup",
    ]));
    expect(JSON.stringify(INTEGRATION_CATEGORIES)).not.toMatch(
      /easybundles|skailama|id_token|hmac|session=/i,
    );
  });

  it("preserves setup behavior summaries from help evidence", () => {
    const cards = INTEGRATION_CATEGORIES.flatMap((category) => category.cards);
    const checkout = cards.find((card) => card.id === "native-checkout");

    expect(checkout?.guideSummary.join(" ")).toContain("Shopify-native flow");
  });
});
