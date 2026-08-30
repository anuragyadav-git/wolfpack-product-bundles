const SELECTOR_MODES = new Set([
  "dropdown",
  "pill",
  "color_swatch",
  "image_swatch",
]);

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function asColorMap(value: any) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeConfiguration(value: any = {}) {
  const variantSelectorMode = value.variantSelectorMode ?? "dropdown";
  if (!SELECTOR_MODES.has(variantSelectorMode)) {
    throw new Error("Unsupported PPB variant selector mode");
  }
  return {
    variantSelectorMode,
    swatchTooltipEnabled:
      variantSelectorMode === "color_swatch" && value.swatchTooltipEnabled === true,
    variantColorMap: asColorMap(value.variantColorMap),
  };
}

export function resolvePpbCategoryVariantSelectorConfiguration(
  step: any,
  stepIndex: string | number,
  activeCategoryIndexes: Record<string | number, number> = {},
) {
  const categories = Array.isArray(step?.categories) ? step.categories : [];
  if (categories.length === 0) return normalizeConfiguration(step);
  const activeIndex = typeof activeCategoryIndexes?.[stepIndex] === "number"
    ? activeCategoryIndexes[stepIndex]
    : 0;
  return normalizeConfiguration(categories[activeIndex] ?? categories[0]);
}

export function resolvePpbSwatchColor(
  optionValue: unknown,
  colorMap: Record<string, unknown> = {},
) {
  const resolved = colorMap[String(optionValue ?? "")];
  return typeof resolved === "string" && HEX_COLOR.test(resolved)
    ? resolved
    : null;
}

export function resolvePpbTooltipPosition({
  anchorLeft,
  anchorTop,
  anchorWidth,
  tooltipWidth,
  tooltipHeight,
  viewportWidth,
  edgeGap = 8,
}: any) {
  const desiredLeft = anchorLeft + (anchorWidth / 2) - (tooltipWidth / 2);
  const maximumLeft = Math.max(edgeGap, viewportWidth - tooltipWidth - edgeGap);
  const clampedLeft = Math.min(Math.max(desiredLeft, edgeGap), maximumLeft);
  return {
    placement: anchorTop < tooltipHeight + edgeGap ? "below" : "above",
    shiftX: Math.round(clampedLeft - desiredLeft),
  };
}

function variantImageUrl(variant: any) {
  return variant?.image?.src
    || variant?.image?.url
    || variant?.image?.originalSrc
    || variant?.imageUrl
    || "";
}

function variantLabel(variant: any) {
  return String(variant?.title || variant?.option1 || variant?.id || "").trim();
}

function swatchColorForVariant(variant: any, colorMap: Record<string, unknown>) {
  const candidates = [
    variant?.title,
    variant?.option1,
    variant?.option2,
    variant?.option3,
    ...(Array.isArray(variant?.selectedOptions)
      ? variant.selectedOptions.map((option: any) => option?.value)
      : []),
  ];
  for (const candidate of candidates) {
    const color = resolvePpbSwatchColor(candidate, colorMap);
    if (color) return color;
  }
  return null;
}

function stableDomId(value: unknown) {
  return String(value ?? "value").replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function positionTooltip(control: HTMLElement, tooltip: HTMLElement) {
  const anchor = control.getBoundingClientRect();
  const placement = resolvePpbTooltipPosition({
    anchorLeft: anchor.left,
    anchorTop: anchor.top,
    anchorWidth: anchor.width,
    tooltipWidth: tooltip.offsetWidth,
    tooltipHeight: tooltip.offsetHeight,
    viewportWidth: control.ownerDocument.defaultView?.innerWidth ?? 0,
  });
  tooltip.dataset.placement = placement.placement;
  tooltip.style.setProperty("--wpb-ppb-tooltip-shift-x", `${placement.shiftX}px`);
}

export function createPpbVariantSelectorElement({
  product,
  configuration,
  label,
  document: runtimeDocument = document,
  isUnavailable = (variant: any) => variant?.available === false,
  onVariantChange,
}: any) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length <= 1) return null;
  const config = normalizeConfiguration(configuration);
  const productId = String(product?.id || product?.productId || product?.variantId || "product");

  const wrapper = runtimeDocument.createElement("div");
  wrapper.className = "variant-selector-wrapper ppb-variant-selector-wrapper";

  if (config.variantSelectorMode === "dropdown") {
    const selectLabel = runtimeDocument.createElement("label");
    const selectId = `ppb-variant-${stableDomId(productId)}`;
    selectLabel.htmlFor = selectId;
    selectLabel.textContent = String(label || "");
    const select = runtimeDocument.createElement("select");
    select.id = selectId;
    select.className = "variant-selector";
    select.dataset.baseProductId = productId;
    select.setAttribute("aria-label", String(label || ""));
    variants.forEach((variant: any) => {
      const option = runtimeDocument.createElement("option");
      option.value = String(variant.id ?? "");
      option.textContent = isUnavailable(variant)
        ? `${variantLabel(variant)} — out of stock`
        : variantLabel(variant);
      option.selected = String(variant.id) === String(product.variantId);
      option.disabled = isUnavailable(variant);
      select.append(option);
    });
    wrapper.append(selectLabel, select);
    return wrapper;
  }

  wrapper.setAttribute("role", "radiogroup");
  wrapper.setAttribute("aria-label", String(label || ""));
  wrapper.dataset.variantSelectorMode = config.variantSelectorMode;
  const options = runtimeDocument.createElement("div");
  options.className = "ppb-variant-selector-options";
  const groupName = `ppb-variant-${stableDomId(productId)}`;

  variants.forEach((variant: any, index: number) => {
    const value = String(variant.id ?? "");
    const optionLabel = variantLabel(variant);
    const unavailable = isUnavailable(variant);
    const control = runtimeDocument.createElement("label");
    control.className = `ppb-variant-selector-option ppb-variant-selector-option--${config.variantSelectorMode}`;
    control.dataset.unavailable = unavailable ? "true" : "false";

    const input = runtimeDocument.createElement("input");
    input.type = "radio";
    input.name = groupName;
    input.value = value;
    input.className = "ppb-variant-selector-input";
    input.dataset.baseProductId = productId;
    input.checked = value === String(product.variantId);
    input.disabled = unavailable;
    input.setAttribute(
      "aria-label",
      unavailable ? `${optionLabel} — unavailable` : optionLabel,
    );

    const visual = runtimeDocument.createElement("span");
    visual.className = "ppb-variant-selector-visual";
    if (config.variantSelectorMode === "image_swatch") {
      const imageUrl = variantImageUrl(variant);
      if (imageUrl) {
        const image = runtimeDocument.createElement("img");
        image.src = imageUrl;
        image.alt = "";
        visual.append(image);
      }
      const accessibleText = runtimeDocument.createElement("span");
      accessibleText.className = "ppb-variant-selector-option-text";
      accessibleText.textContent = optionLabel;
      visual.append(accessibleText);
    } else if (config.variantSelectorMode === "color_swatch") {
      const color = swatchColorForVariant(variant, config.variantColorMap);
      control.dataset.colorMapped = color ? "true" : "false";
      if (color) control.style.setProperty("--wpb-ppb-swatch-color", color);
      const accessibleText = runtimeDocument.createElement("span");
      accessibleText.className = "ppb-variant-selector-option-text";
      accessibleText.textContent = optionLabel;
      visual.append(accessibleText);
      if (config.swatchTooltipEnabled) {
        const tooltip = runtimeDocument.createElement("span");
        tooltip.id = `${groupName}-tooltip-${index + 1}`;
        tooltip.className = "ppb-variant-selector-tooltip";
        tooltip.setAttribute("role", "tooltip");
        tooltip.textContent = optionLabel;
        input.setAttribute("aria-describedby", tooltip.id);
        control.append(input, visual, tooltip);
        const updatePosition = () => positionTooltip(control, tooltip);
        control.addEventListener("pointerenter", updatePosition);
        input.addEventListener("focus", updatePosition);
        options.append(control);
        return;
      }
    } else {
      visual.textContent = optionLabel;
    }

    control.append(input, visual);
    options.append(control);
  });

  const selectedLabel = runtimeDocument.createElement("span");
  selectedLabel.className = "ppb-variant-selector-selected-label";
  selectedLabel.setAttribute("aria-live", "polite");
  const selectedVariant = variants.find(
    (variant: any) => String(variant.id) === String(product.variantId),
  );
  selectedLabel.textContent = variantLabel(selectedVariant ?? variants[0]);

  wrapper.addEventListener("change", (event: any) => {
    const input = event.target?.closest?.(".ppb-variant-selector-input");
    if (!input || input.disabled) return;
    const variant = variants.find(
      (candidate: any) => String(candidate.id) === String(input.value),
    );
    if (!variant) return;
    selectedLabel.textContent = variantLabel(variant);
    onVariantChange?.(String(variant.id));
  });

  wrapper.append(options, selectedLabel);
  return wrapper;
}
