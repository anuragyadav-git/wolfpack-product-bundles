import { resolveCanonicalOptionValueSwatch } from "../shared/variant-selector.js";

const SELECTOR_MODES = new Set([
  "dropdown",
  "pill",
  "color_swatch",
  "image_swatch",
]);
const selectorInstanceCounts = new WeakMap<Document, number>();

function nextSelectorInstanceId(runtimeDocument: Document, productId: unknown) {
  const count = (selectorInstanceCounts.get(runtimeDocument) || 0) + 1;
  selectorInstanceCounts.set(runtimeDocument, count);
  return `ppb-variant-${stableDomId(productId)}-${count}`;
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

export function resolvePpbVariantSwatch(product: any, variant: any) {
  const productOptions = Array.isArray(product?.options) ? product.options : [];
  const selectedOptions = Array.isArray(variant?.selectedOptions)
    ? variant.selectedOptions
    : [];

  for (const selectedOption of selectedOptions) {
    const swatch = resolveCanonicalOptionValueSwatch(
      { options: productOptions },
      selectedOption?.name,
      selectedOption?.value,
    );
    if (swatch) return swatch;
  }

  return {
    color: null,
    image: null,
    label: variantLabel(variant),
  };
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

function variantLabel(variant: any) {
  return String(variant?.title || variant?.option1 || variant?.id || "").trim();
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

function getVariantOptionValue(variant: any, optionName: string, optionIndex: number) {
  const selectedOptions = Array.isArray(variant?.selectedOptions)
    ? variant.selectedOptions
    : [];
  const selected = selectedOptions.find((option: any) => (
    String(option?.name ?? "") === String(optionName)
  ));
  return String(selected?.value ?? variant?.[`option${optionIndex + 1}`] ?? "");
}

function getOptionDimensions(product: any, variants: any[], fallbackLabel: string) {
  const productOptions = Array.isArray(product?.options) ? product.options : [];
  const dimensions = productOptions
    .map((option: any, optionIndex: number) => {
      if (!option || typeof option !== "object") return null;
      const name = String(option.name ?? "").trim();
      if (!name) return null;
      const values: string[] = [];
      const addValue = (value: unknown) => {
        const normalized = String(value ?? "").trim();
        if (normalized && !values.includes(normalized)) values.push(normalized);
      };
      (Array.isArray(option.optionValues) ? option.optionValues : [])
        .forEach((optionValue: any) => addValue(optionValue?.name));
      variants.forEach((variant: any) => (
        addValue(getVariantOptionValue(variant, name, optionIndex))
      ));
      return values.length > 0 ? { name, option, optionIndex, values } : null;
    })
    .filter(Boolean);

  if (dimensions.length > 0) return dimensions;
  return [{
    name: fallbackLabel,
    option: null,
    optionIndex: 0,
    values: variants.map(variantLabel).filter((value: string, index: number, values: string[]) => (
      Boolean(value) && values.indexOf(value) === index
    )),
  }];
}

function findVariantForOptionValue({
  variants,
  dimensions,
  selectedVariant,
  dimension,
  value,
  isUnavailable,
}: any) {
  const candidates = variants.filter((variant: any) => (
    getVariantOptionValue(variant, dimension.name, dimension.optionIndex) === String(value)
  ));
  const availableCandidates = candidates.filter((variant: any) => !isUnavailable(variant));
  const preservingCandidate = availableCandidates.find((variant: any) => (
    dimensions.every((candidateDimension: any) => (
      candidateDimension.optionIndex === dimension.optionIndex
      || getVariantOptionValue(
        variant,
        candidateDimension.name,
        candidateDimension.optionIndex,
      ) === getVariantOptionValue(
        selectedVariant,
        candidateDimension.name,
        candidateDimension.optionIndex,
      )
    ))
  ));
  return {
    candidate: preservingCandidate || availableCandidates[0] || candidates[0] || null,
    unavailable: availableCandidates.length === 0,
  };
}

function resolveDimensionSwatch(dimension: any, value: string, product: any, variant: any) {
  if (!dimension.option) return resolvePpbVariantSwatch(product, variant);
  return resolveCanonicalOptionValueSwatch(product, dimension.name, value) || {
    color: null,
    image: null,
    label: value,
  };
}

function resolveCompactVisualDimensionIndex({
  configuredMode,
  dimensions,
  product,
}: any) {
  if (dimensions.length <= 1 || configuredMode === "dropdown") return null;

  const requestedSwatchKey = configuredMode === "color_swatch"
    ? "color"
    : configuredMode === "image_swatch"
      ? "image"
      : null;
  const candidates = dimensions.filter((dimension: any) => {
    if (configuredMode === "pill") return true;
    if (!requestedSwatchKey) return false;
    return dimension.values.some((value: string) => {
      const swatch = resolveCanonicalOptionValueSwatch(
        product,
        dimension.name,
        value,
      );
      return requestedSwatchKey === "color"
        ? typeof swatch?.color === "string" && swatch.color.trim().length > 0
        : Boolean(swatch?.image?.src || swatch?.image?.url);
    });
  });
  if (candidates.length === 0) return null;

  return candidates.reduce((compactest: any, dimension: any) => (
    dimension.values.length < compactest.values.length ? dimension : compactest
  )).optionIndex;
}

export function resolvePpbOptionDimensionPresentation({
  configuredMode,
  dimension,
  product,
  dimensionCount,
  visualDimensionIndex,
}: any) {
  if (
    dimensionCount <= 1
    || configuredMode === "dropdown"
  ) {
    return configuredMode;
  }

  if (
    typeof visualDimensionIndex === "number"
    && dimension.optionIndex !== visualDimensionIndex
  ) {
    return "dropdown";
  }
  if (configuredMode === "pill") return configuredMode;

  const requestedSwatchKey = configuredMode === "color_swatch"
    ? "color"
    : configuredMode === "image_swatch"
      ? "image"
      : null;
  if (!requestedSwatchKey) return configuredMode;

  const hasRequestedSwatch = dimension.values.some((value: string) => {
    const swatch = resolveCanonicalOptionValueSwatch(
      product,
      dimension.name,
      value,
    );
    if (requestedSwatchKey === "color") {
      return typeof swatch?.color === "string" && swatch.color.trim().length > 0;
    }
    return Boolean(swatch?.image?.src || swatch?.image?.url);
  });

  return hasRequestedSwatch ? configuredMode : "dropdown";
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
  const instanceId = nextSelectorInstanceId(runtimeDocument, productId);
  let currentVariant = variants.find(
    (variant: any) => String(variant.id) === String(product.variantId),
  ) || variants[0];
  const dimensions = getOptionDimensions(product, variants, String(label || "Select variant"));
  const visualDimensionIndex = resolveCompactVisualDimensionIndex({
    configuredMode: config.variantSelectorMode,
    dimensions,
    product,
  });

  const wrapper = runtimeDocument.createElement("div");
  wrapper.className = "variant-selector-wrapper ppb-variant-selector-wrapper";
  wrapper.dataset.variantSelectorMode = config.variantSelectorMode;
  wrapper.dataset.optionDimensionCount = String(dimensions.length);

  dimensions.forEach((dimension: any, dimensionIndex: number) => {
    const presentationMode = resolvePpbOptionDimensionPresentation({
      configuredMode: config.variantSelectorMode,
      dimension,
      product,
      dimensionCount: dimensions.length,
      visualDimensionIndex,
    });
    const group = runtimeDocument.createElement("div");
    group.className = "ppb-variant-selector-group";
    group.dataset.optionIndex = String(dimension.optionIndex);
    group.dataset.optionPresentation = presentationMode;
    const groupId = `${instanceId}-option-${dimensionIndex + 1}`;
    const groupLabelText = dimension.name || String(label || "Select variant");

    if (presentationMode === "dropdown") {
      const selectLabel = runtimeDocument.createElement("label");
      const selectId = `${groupId}-select`;
      selectLabel.htmlFor = selectId;
      selectLabel.textContent = groupLabelText;
      const select = runtimeDocument.createElement("select");
      select.id = selectId;
      select.className = "variant-selector";
      select.dataset.baseProductId = productId;
      select.dataset.optionIndex = String(dimension.optionIndex);
      select.setAttribute("aria-label", groupLabelText);
      dimension.values.forEach((optionValue: string) => {
        const resolved = findVariantForOptionValue({
          variants,
          dimensions,
          selectedVariant: currentVariant,
          dimension,
          value: optionValue,
          isUnavailable,
        });
        if (!resolved.candidate) return;
        const option = runtimeDocument.createElement("option");
        option.value = String(resolved.candidate.id ?? "");
        option.dataset.optionValue = optionValue;
        option.textContent = resolved.unavailable
          ? `${optionValue} — out of stock`
          : optionValue;
        option.selected = getVariantOptionValue(
          currentVariant,
          dimension.name,
          dimension.optionIndex,
        ) === optionValue;
        option.defaultSelected = option.selected;
        option.disabled = resolved.unavailable;
        select.append(option);
      });
      group.append(selectLabel, select);
      wrapper.append(group);
      return;
    }

    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", groupLabelText);
    const visibleLabel = runtimeDocument.createElement("span");
    visibleLabel.id = `${groupId}-label`;
    visibleLabel.className = "ppb-variant-selector-group-label";
    visibleLabel.textContent = groupLabelText;
    group.setAttribute("aria-labelledby", visibleLabel.id);
    const options = runtimeDocument.createElement("div");
    options.className = "ppb-variant-selector-options";

    dimension.values.forEach((optionValue: string, valueIndex: number) => {
      const resolved = findVariantForOptionValue({
        variants,
        dimensions,
        selectedVariant: currentVariant,
        dimension,
        value: optionValue,
        isUnavailable,
      });
      if (!resolved.candidate) return;
      const swatch = resolveDimensionSwatch(
        dimension,
        optionValue,
        product,
        resolved.candidate,
      );
      const optionLabel = swatch.label || optionValue;
      const control = runtimeDocument.createElement("label");
      control.className = `ppb-variant-selector-option ppb-variant-selector-option--${presentationMode}`;
      control.dataset.unavailable = resolved.unavailable ? "true" : "false";

      const input = runtimeDocument.createElement("input");
      input.type = "radio";
      input.id = `${groupId}-value-${valueIndex + 1}`;
      input.name = groupId;
      input.value = String(resolved.candidate.id ?? "");
      input.className = "ppb-variant-selector-input";
      input.dataset.baseProductId = productId;
      input.dataset.optionIndex = String(dimension.optionIndex);
      input.dataset.optionValue = optionValue;
      input.checked = getVariantOptionValue(
        currentVariant,
        dimension.name,
        dimension.optionIndex,
      ) === optionValue;
      input.defaultChecked = input.checked;
      input.disabled = resolved.unavailable;
      input.setAttribute(
        "aria-label",
        resolved.unavailable ? `${optionLabel} — unavailable` : optionLabel,
      );

      const visual = runtimeDocument.createElement("span");
      visual.className = "ppb-variant-selector-visual";
      if (presentationMode === "image_swatch") {
        const imageUrl = swatch.image?.src || swatch.image?.url || "";
        control.dataset.imageMapped = imageUrl ? "true" : "false";
        if (imageUrl) {
          const image = runtimeDocument.createElement("img");
          image.src = imageUrl;
          image.alt = "";
          visual.append(image);
        }
        const optionText = runtimeDocument.createElement("span");
        optionText.className = "ppb-variant-selector-option-text";
        optionText.textContent = optionLabel;
        visual.append(optionText);
      } else if (presentationMode === "color_swatch") {
        const color = typeof swatch.color === "string" ? swatch.color : null;
        control.dataset.colorMapped = color ? "true" : "false";
        if (color) control.style.setProperty("--wpb-ppb-swatch-color", color);
        const optionText = runtimeDocument.createElement("span");
        optionText.className = "ppb-variant-selector-option-text";
        optionText.textContent = optionLabel;
        visual.append(optionText);
        if (config.swatchTooltipEnabled) {
          const tooltip = runtimeDocument.createElement("span");
          tooltip.id = `${groupId}-tooltip-${valueIndex + 1}`;
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
    selectedLabel.textContent = getVariantOptionValue(
      currentVariant,
      dimension.name,
      dimension.optionIndex,
    );
    group.append(visibleLabel, options, selectedLabel);
    wrapper.append(group);
  });

  wrapper.addEventListener("change", (event: any) => {
    const input = event.target?.closest?.(
      ".ppb-variant-selector-input, .variant-selector",
    );
    if (!input || input.disabled) return;
    const optionIndex = Number(input.dataset.optionIndex);
    const changedDimension = dimensions.find(
      (dimension: any) => dimension.optionIndex === optionIndex,
    );
    const optionValue = input.tagName === "SELECT"
      ? input.selectedOptions?.[0]?.dataset?.optionValue
      : input.dataset.optionValue;
    if (!changedDimension || !optionValue) return;
    const resolved = findVariantForOptionValue({
      variants,
      dimensions,
      selectedVariant: currentVariant,
      dimension: changedDimension,
      value: optionValue,
      isUnavailable,
    });
    if (!resolved.candidate || resolved.unavailable) return;
    const variant = resolved.candidate;
    currentVariant = variant;
    input.dataset.resolvedVariantId = String(variant.id);
    dimensions.forEach((dimension: any) => {
      const selectedValue = getVariantOptionValue(
        variant,
        dimension.name,
        dimension.optionIndex,
      );
      const group = wrapper.querySelector(
        `.ppb-variant-selector-group[data-option-index="${dimension.optionIndex}"]`,
      );
      const selectedLabel = group?.querySelector(".ppb-variant-selector-selected-label");
      if (selectedLabel) selectedLabel.textContent = selectedValue;
      group?.querySelectorAll("option").forEach((option: any) => {
        option.selected = String(option.dataset.optionValue) === selectedValue;
      });
      group?.querySelectorAll(".ppb-variant-selector-input").forEach((radio: any) => {
        radio.checked = String(radio.dataset.optionValue) === selectedValue;
      });
    });
    onVariantChange?.(String(variant.id));
  });
  wrapper.addEventListener("click", (event: Event) => {
    if ((event.target as Element | null)?.closest?.(".ppb-variant-selector-option")) {
      event.stopPropagation();
    }
  });

  return wrapper;
}
