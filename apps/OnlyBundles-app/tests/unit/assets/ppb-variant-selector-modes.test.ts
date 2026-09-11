// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createPpbVariantSelectorElement,
  resolvePpbOptionDimensionPresentation,
  resolvePpbCategoryVariantSelectorConfiguration,
  resolvePpbVariantSwatch,
  resolvePpbTooltipPosition,
} = require("../../../app/assets/widgets/product-page/variant-selector-modes.js");

function product() {
  return {
    id: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/11",
    options: [{
      id: "gid://shopify/ProductOption/1",
      name: "Color",
      optionValues: [
        {
          id: "gid://shopify/ProductOptionValue/1",
          name: "Navy",
          swatch: { color: "#001F3F", image: null },
        },
        {
          id: "gid://shopify/ProductOptionValue/2",
          name: "Soft pink",
          swatch: {
            color: null,
            image: { src: "https://cdn.example/shopify-pink.jpg", altText: "Soft pink" },
          },
        },
        {
          id: "gid://shopify/ProductOptionValue/3",
          name: "Sold out",
          swatch: null,
        },
      ],
    }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/11",
        title: "Navy",
        option1: "Navy",
        selectedOptions: [{ name: "Color", value: "Navy" }],
        available: true,
        image: { src: "https://cdn.example/navy.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/12",
        title: "Soft pink",
        option1: "Soft pink",
        selectedOptions: [{ name: "Color", value: "Soft pink" }],
        available: true,
        image: { src: "https://cdn.example/pink.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/13",
        title: "Sold out",
        option1: "Sold out",
        selectedOptions: [{ name: "Color", value: "Sold out" }],
        available: false,
      },
    ],
  };
}

function sizeByColorProduct() {
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const colors = [
    ["Black", "#111111"],
    ["Navy", "#14213d"],
    ["White", "#ffffff"],
    ["Gray", "#808080"],
  ];
  const variants = sizes.flatMap((size) => colors.map(([color]) => ({
    id: `${size}-${color}`,
    title: `${size} / ${color}`,
    selectedOptions: [
      { name: "Size", value: size },
      { name: "Color", value: color },
    ],
    available: true,
  })));
  return {
    id: "gid://shopify/Product/9506401616131",
    variantId: "S-Black",
    options: [
      {
        name: "Size",
        optionValues: sizes.map((name) => ({ name, swatch: null })),
      },
      {
        name: "Color",
        optionValues: colors.map(([name, color]) => ({
          name,
          swatch: { color, image: null },
        })),
      },
    ],
    variants,
  };
}

describe("PPB variant selector modes", () => {
  const runtimeDocument = new JSDOM("<!doctype html><html><body></body></html>").window.document;

  it("resolves the active category configuration without inventing mappings", () => {
    expect(resolvePpbCategoryVariantSelectorConfiguration({
      categories: [
        { variantSelectorMode: "pill" },
        {
          variantSelectorMode: "color_swatch",
          swatchTooltipEnabled: true,
        },
      ],
    }, 0, { 0: 1 })).toEqual({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
    });
    expect(resolvePpbVariantSwatch(product(), product().variants[0])).toEqual({
      color: "#001F3F",
      image: null,
      label: "Navy",
    });
  });

  it("skips selected options without Shopify swatches", () => {
    const multiOptionProduct = product();
    multiOptionProduct.options.unshift({
      id: "gid://shopify/ProductOption/2",
      name: "Size",
      optionValues: [{
        id: "gid://shopify/ProductOptionValue/4",
        name: "Small",
        swatch: null,
      }],
    });
    multiOptionProduct.variants[0].selectedOptions.unshift({
      name: "Size",
      value: "Small",
    });

    expect(resolvePpbVariantSwatch(
      multiOptionProduct,
      multiOptionProduct.variants[0],
    )).toEqual({
      color: "#001F3F",
      image: null,
      label: "Navy",
    });
  });

  it("renders semantic pills and reports an exact selected variant", () => {
    const changes: string[] = [];
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
      onVariantChange: (variantId: string) => changes.push(variantId),
    });

    expect(selector.querySelector('[role="radiogroup"]')).not.toBeNull();
    const pink = selector.querySelector('input[value="gid://shopify/ProductVariant/12"]');
    expect(pink.getAttribute("aria-label")).toBe("Soft pink");
    pink.checked = true;
    pink.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));

    expect(changes).toEqual(["gid://shopify/ProductVariant/12"]);
    expect(selector.querySelector('[aria-live="polite"]').textContent).toBe("Soft pink");
  });

  it("renders Shopify color swatches with focus descriptions and no guessed color", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: {
        variantSelectorMode: "color_swatch",
        swatchTooltipEnabled: true,
      },
      label: "Select color",
      document: runtimeDocument,
    });

    const navy = selector.querySelector('input[value="gid://shopify/ProductVariant/11"]');
    const navyControl = navy.closest("label");
    const tooltip = navyControl.querySelector('[role="tooltip"]');
    expect(navy.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(tooltip.textContent).toBe("Navy");
    expect(navyControl.style.getPropertyValue("--wpb-ppb-swatch-color")).toBe("#001F3F");

    const pink = selector.querySelector('input[value="gid://shopify/ProductVariant/12"]');
    expect(pink.closest("label").style.getPropertyValue("--wpb-ppb-swatch-color")).toBe("");
  });

  it("uses Shopify option-value imagery for image swatches and removes unavailable values from focus", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "image_swatch" },
      label: "Select variant",
      document: runtimeDocument,
      isUnavailable: (variant: { available?: boolean }) => variant.available === false,
    });

    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/11"] + span img'))
      .toBeNull();
    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/12"] + span img').src)
      .toBe("https://cdn.example/shopify-pink.jpg");
    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/13"]').disabled).toBe(true);
  });

  it("clamps tooltip placement and flips it below a top-edge anchor", () => {
    expect(resolvePpbTooltipPosition({
      anchorLeft: 4,
      anchorTop: 3,
      anchorWidth: 44,
      tooltipWidth: 120,
      tooltipHeight: 28,
      viewportWidth: 390,
      edgeGap: 8,
    })).toEqual({ placement: "below", shiftX: 42 });
  });

  it("scopes dropdown and radio identities to each rendered selector instance", () => {
    const dropdownOne = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "dropdown" },
      label: "Select variant",
      document: runtimeDocument,
    });
    const dropdownTwo = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "dropdown" },
      label: "Select variant",
      document: runtimeDocument,
    });
    expect(dropdownOne.querySelector("select").id)
      .not.toBe(dropdownTwo.querySelector("select").id);

    const pillOne = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
    });
    const pillTwo = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
    });
    expect(pillOne.querySelector("input").name)
      .not.toBe(pillTwo.querySelector("input").name);
  });

  it("does not call the change callback for an unavailable value", () => {
    const changes: string[] = [];
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
      onVariantChange: (variantId: string) => changes.push(variantId),
    });
    const unavailable = selector.querySelector(
      'input[value="gid://shopify/ProductVariant/13"]',
    );

    unavailable.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));

    expect(unavailable.disabled).toBe(true);
    expect(changes).toEqual([]);
  });

  it("renders one labeled group per Shopify option dimension and resolves the matching variant", () => {
    const multiOptionProduct = {
      id: "gid://shopify/Product/2",
      variantId: "red-small",
      options: [
        {
          name: "Color",
          optionValues: [
            { name: "Red", swatch: { color: "#f00", image: null } },
            { name: "Blue", swatch: { color: "#00f", image: null } },
          ],
        },
        {
          name: "Size",
          optionValues: [
            { name: "Small", swatch: null },
            { name: "Large", swatch: null },
          ],
        },
      ],
      variants: [
        {
          id: "red-small",
          title: "Red / Small",
          selectedOptions: [
            { name: "Color", value: "Red" },
            { name: "Size", value: "Small" },
          ],
          available: true,
        },
        {
          id: "red-large",
          title: "Red / Large",
          selectedOptions: [
            { name: "Color", value: "Red" },
            { name: "Size", value: "Large" },
          ],
          available: true,
        },
        {
          id: "blue-small",
          title: "Blue / Small",
          selectedOptions: [
            { name: "Color", value: "Blue" },
            { name: "Size", value: "Small" },
          ],
          available: true,
        },
        {
          id: "blue-large",
          title: "Blue / Large",
          selectedOptions: [
            { name: "Color", value: "Blue" },
            { name: "Size", value: "Large" },
          ],
          available: true,
        },
      ],
    };
    const changes: string[] = [];
    const selector = createPpbVariantSelectorElement({
      product: multiOptionProduct,
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
      onVariantChange: (variantId: string) => changes.push(variantId),
    });

    const groups = selector.querySelectorAll('.ppb-variant-selector-group');
    expect(groups).toHaveLength(2);
    expect(groups[0].getAttribute("role")).toBe("radiogroup");
    expect(selector.querySelector(`#${groups[0].getAttribute("aria-labelledby")}`).textContent)
      .toBe("Color");
    expect(groups[1].querySelector("label").textContent).toBe("Size");

    const large = groups[1].querySelector('select[aria-label="Size"]');
    large.value = "red-large";
    large.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));
    const blue = groups[0].querySelector('input[aria-label="Blue"]');
    blue.checked = true;
    blue.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));

    expect(changes).toEqual(["red-large", "blue-large"]);
  });

  it("uses a compact native select only for a non-swatch dimension in a multi-dimensional color-swatch configuration", () => {
    const multiOptionProduct = sizeByColorProduct();
    const dimensions = [
      { option: multiOptionProduct.options[0], name: "Size", values: ["S", "M"] },
      { option: multiOptionProduct.options[1], name: "Color", values: ["Black", "Navy"] },
    ];

    expect(resolvePpbOptionDimensionPresentation({
      configuredMode: "color_swatch",
      dimension: dimensions[0],
      product: multiOptionProduct,
      dimensionCount: 2,
    })).toBe("dropdown");
    expect(resolvePpbOptionDimensionPresentation({
      configuredMode: "color_swatch",
      dimension: dimensions[1],
      product: multiOptionProduct,
      dimensionCount: 2,
    })).toBe("color_swatch");

    const selector = createPpbVariantSelectorElement({
      product: multiOptionProduct,
      configuration: { variantSelectorMode: "color_swatch" },
      label: "Select variant",
      document: runtimeDocument,
    });

    const sizeGroup = selector.querySelector('[data-option-index="0"]');
    const colorGroup = selector.querySelector('[data-option-index="1"]');
    expect(sizeGroup.querySelectorAll("select")).toHaveLength(1);
    expect(sizeGroup.querySelectorAll("option")).toHaveLength(7);
    expect(sizeGroup.querySelector('[role="radiogroup"]')).toBeNull();
    expect(colorGroup.getAttribute("role")).toBe("radiogroup");
    expect(colorGroup.querySelectorAll('input[type="radio"]')).toHaveLength(4);
  });

  it("resolves an exact Size by Color variant across the compact select and swatch controls", () => {
    const changes: string[] = [];
    const selector = createPpbVariantSelectorElement({
      product: sizeByColorProduct(),
      configuration: { variantSelectorMode: "color_swatch" },
      label: "Select variant",
      document: runtimeDocument,
      onVariantChange: (variantId: string) => changes.push(variantId),
    });
    const size = selector.querySelector('[data-option-index="0"] select');
    size.value = "3XL-Black";
    size.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));
    const white = selector.querySelector(
      '[data-option-index="1"] input[data-option-value="White"]',
    );
    white.checked = true;
    white.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));

    expect(changes).toEqual(["3XL-Black", "3XL-White"]);
    expect(size.selectedOptions[0].dataset.optionValue).toBe("3XL");
    expect(white.checked).toBe(true);
  });

  it("renders each compact dimension at the product's current variant after a card rebuild", () => {
    const selectedProduct = sizeByColorProduct();
    selectedProduct.variantId = "M-Navy";

    const selector = createPpbVariantSelectorElement({
      product: selectedProduct,
      configuration: { variantSelectorMode: "dropdown" },
      label: "Select variant",
      document: runtimeDocument,
    });

    const size = selector.querySelector('[data-option-index="0"] select');
    const color = selector.querySelector('[data-option-index="1"] select');
    expect(size.selectedOptions[0].dataset.optionValue).toBe("M");
    expect(color.selectedOptions[0].dataset.optionValue).toBe("Navy");
  });

  it("falls back each unmapped dimension to a native select for image-swatch mode", () => {
    const selector = createPpbVariantSelectorElement({
      product: sizeByColorProduct(),
      configuration: { variantSelectorMode: "image_swatch" },
      label: "Select variant",
      document: runtimeDocument,
    });

    expect(selector.querySelectorAll("select")).toHaveLength(2);
    expect(selector.querySelectorAll('[role="radiogroup"]')).toHaveLength(0);
  });

  it("keeps the smaller visual dimension as pills and compacts the other dimension to a native select", () => {
    const selector = createPpbVariantSelectorElement({
      product: sizeByColorProduct(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
    });

    const sizeGroup = selector.querySelector('[data-option-index="0"]');
    const colorGroup = selector.querySelector('[data-option-index="1"]');

    expect(sizeGroup.querySelectorAll("select")).toHaveLength(1);
    expect(sizeGroup.querySelector('[role="radiogroup"]')).toBeNull();
    expect(colorGroup.getAttribute("role")).toBe("radiogroup");
    expect(colorGroup.querySelectorAll('input[type="radio"]')).toHaveLength(4);
  });
});
