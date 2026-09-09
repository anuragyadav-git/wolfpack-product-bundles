import type {
  BundleContractType,
  TemplateKey,
} from "../../../lib/bundle-config/template-selection";
import {
  DESIGN_PREVIEW_FIXTURE,
  DESIGN_PREVIEW_TEMPLATES,
  getDefaultDesignPreviewArea,
  getSupportedDesignPreviewAreas,
  getSupportedDesignPreviewScenarios,
  type DesignPreviewArea,
  type DesignPreviewScenario,
  type DesignPreviewViewport,
} from "./design-preview-model";

export type DesignPreviewState = {
  bundleType: BundleContractType;
  templateKey: TemplateKey;
  viewport: DesignPreviewViewport;
  area: DesignPreviewArea;
  scenario: DesignPreviewScenario;
};

export type PreviewInteractionState = {
  quantities: Record<string, number>;
  activeCategoryId: string;
  progressStep: number;
  isMobileSummaryOpen: boolean;
  discountFeedback: {
    state: "tier" | "complete" | null;
    replay: number;
  };
};

export function createPreviewInteractionState(): PreviewInteractionState {
  return {
    quantities: Object.fromEntries(
      DESIGN_PREVIEW_FIXTURE.products.map((product) => [
        product.id,
        product.quantity,
      ])
    ),
    activeCategoryId: DESIGN_PREVIEW_FIXTURE.categories[0].id,
    progressStep: 0,
    isMobileSummaryOpen: false,
    discountFeedback: { state: null, replay: 0 },
  };
}

export function updatePreviewProductQuantity(
  state: PreviewInteractionState,
  productId: string,
  delta: number
): PreviewInteractionState {
  const quantity = Math.max(0, (state.quantities[productId] ?? 0) + delta);
  return {
    ...state,
    quantities: { ...state.quantities, [productId]: quantity },
  };
}

export function setPreviewProductQuantity(
  state: PreviewInteractionState,
  productId: string,
  quantity: number
): PreviewInteractionState {
  return {
    ...state,
    quantities: {
      ...state.quantities,
      [productId]: Math.max(0, quantity),
    },
  };
}

export function selectPreviewCategory(
  state: PreviewInteractionState,
  categoryId: string
): PreviewInteractionState {
  return { ...state, activeCategoryId: categoryId };
}

export function getPreviewSelectionSummary(state: PreviewInteractionState) {
  const products = DESIGN_PREVIEW_FIXTURE.products.flatMap((product) => {
    const quantity = Math.max(0, state.quantities[product.id] ?? 0);
    return quantity > 0 ? [{ product, quantity }] : [];
  });
  return {
    products,
    itemCount: products.reduce((total, item) => total + item.quantity, 0),
    totalCents: products.reduce(
      (total, item) => total + item.product.priceCents * item.quantity,
      0
    ),
  };
}

export function advancePreviewProgress(
  state: PreviewInteractionState
): PreviewInteractionState {
  const finalStep = DESIGN_PREVIEW_FIXTURE.discountTiers.length;
  if (state.progressStep >= finalStep) {
    return triggerPreviewDiscountFeedback(state, "complete");
  }
  return {
    ...state,
    progressStep: state.progressStep + 1,
  };
}

export function retreatPreviewProgress(
  state: PreviewInteractionState
): PreviewInteractionState {
  return { ...state, progressStep: Math.max(0, state.progressStep - 1) };
}

export function togglePreviewMobileSummary(
  state: PreviewInteractionState
): PreviewInteractionState {
  return { ...state, isMobileSummaryOpen: !state.isMobileSummaryOpen };
}

export function triggerPreviewDiscountFeedback(
  state: PreviewInteractionState,
  feedbackState: "tier" | "complete"
): PreviewInteractionState {
  return {
    ...state,
    discountFeedback: {
      state: feedbackState,
      replay: state.discountFeedback.replay + 1,
    },
  };
}

export function clearPreviewDiscountFeedback(
  state: PreviewInteractionState,
  replay: number
): PreviewInteractionState {
  if (state.discountFeedback.replay !== replay) return state;

  return {
    ...state,
    discountFeedback: { state: null, replay },
  };
}

export function getDefaultTemplateKey(
  bundleType: BundleContractType
): TemplateKey {
  return bundleType === "full_page" ? "standard" : "product-list";
}

export function isTemplateValidForBundleType(
  bundleType: BundleContractType,
  templateKey: TemplateKey
) {
  return DESIGN_PREVIEW_TEMPLATES.some(
    (template) =>
      template.bundleType === bundleType && template.key === templateKey
  );
}

export function isDesignPreviewAreaSupported(
  templateKey: TemplateKey,
  area: DesignPreviewArea
) {
  return getSupportedDesignPreviewAreas(templateKey).includes(area);
}

export function isDesignPreviewScenarioSupported(
  templateKey: TemplateKey,
  scenario: DesignPreviewScenario
) {
  return getSupportedDesignPreviewScenarios(templateKey).includes(scenario);
}

export function createDesignPreviewState(
  bundleType: BundleContractType = "full_page"
): DesignPreviewState {
  const templateKey = getDefaultTemplateKey(bundleType);
  return {
    bundleType,
    templateKey,
    viewport: "desktop",
    area: getDefaultDesignPreviewArea(templateKey),
    scenario: "default",
  };
}

export function setDesignPreviewBundleType(
  state: DesignPreviewState,
  bundleType: BundleContractType
): DesignPreviewState {
  const templateKey = getDefaultTemplateKey(bundleType);
  return {
    ...state,
    bundleType,
    templateKey,
    area: getDefaultDesignPreviewArea(templateKey),
    scenario: "default",
  };
}

export function setDesignPreviewTemplate(
  state: DesignPreviewState,
  templateKey: TemplateKey
): DesignPreviewState {
  if (!isTemplateValidForBundleType(state.bundleType, templateKey)) {
    throw new Error(
      `Invalid Design preview template "${templateKey}" for ${state.bundleType}`
    );
  }
  return {
    ...state,
    templateKey,
    area: isDesignPreviewAreaSupported(templateKey, state.area)
      ? state.area
      : getDefaultDesignPreviewArea(templateKey),
    scenario: "default",
  };
}

export function setDesignPreviewViewport(
  state: DesignPreviewState,
  viewport: DesignPreviewViewport
): DesignPreviewState {
  return { ...state, viewport };
}

export function setDesignPreviewArea(
  state: DesignPreviewState,
  area: DesignPreviewArea
): DesignPreviewState {
  return isDesignPreviewAreaSupported(state.templateKey, area)
    ? { ...state, area, scenario: "default" }
    : state;
}

export function setDesignPreviewScenario(
  state: DesignPreviewState,
  scenario: DesignPreviewScenario
): DesignPreviewState {
  return isDesignPreviewScenarioSupported(state.templateKey, scenario)
    ? { ...state, scenario }
    : state;
}
