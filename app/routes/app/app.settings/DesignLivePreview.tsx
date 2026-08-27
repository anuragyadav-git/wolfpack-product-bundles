import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type {
  BundleContractType,
  TemplateKey,
} from "../../../lib/bundle-config/template-selection";
import {
  DESIGN_PREVIEW_FIXTURE,
  DESIGN_PREVIEW_TEMPLATES,
  DESIGN_PREVIEW_VIEWPORTS,
  buildDesignPreviewTheme,
  calculateDesignPreviewFitScale,
  getDefaultDesignPreviewSurface,
  getDesignPreviewContextKind,
  getDesignPreviewFieldTarget,
  getDesignPreviewSurfaceFidelity,
  getSupportedDesignPreviewSurfaces,
  isDesignPreviewFieldApplicable,
  type DesignPreviewSurface,
  type DesignPreviewTemplateDescriptor,
  type DesignPreviewViewport,
} from "./design-preview-model";
import styles from "./DesignSettingsView.module.css";
import type { ShopBrandColors } from "../../../lib/shop-brand-colors";
import { BundleHeaderSurface } from "./preview-surfaces/BundleHeaderSurface";
import { NavigationSurface } from "./preview-surfaces/NavigationSurface";
import { CategoriesSurface } from "./preview-surfaces/CategoriesSurface";
import { ProductCardsSurface } from "./preview-surfaces/ProductCardsSurface";
import { ProductSlotsSurface } from "./preview-surfaces/ProductSlotsSurface";
import { ProductPickerSurface } from "./preview-surfaces/ProductPickerSurface";
import { CartSummarySurface } from "./preview-surfaces/CartSummarySurface";
import { LoadingSurface, ValidationSurface, UpsellSurface } from "./preview-surfaces/OverlaysSurfaces";

export { DESIGN_PREVIEW_TEMPLATES } from "./design-preview-model";
export type { DesignPreviewViewport } from "./design-preview-model";

export type DesignPreviewState = {
  bundleType: BundleContractType;
  templateKey: TemplateKey;
  viewport: DesignPreviewViewport;
  surface: DesignPreviewSurface;
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
      DESIGN_PREVIEW_FIXTURE.products.map((product) => [product.id, product.quantity]),
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
  delta: number,
): PreviewInteractionState {
  const quantity = Math.max(0, (state.quantities[productId] ?? 0) + delta);
  return { ...state, quantities: { ...state.quantities, [productId]: quantity } };
}

export function setPreviewProductQuantity(
  state: PreviewInteractionState,
  productId: string,
  quantity: number,
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
  categoryId: string,
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
      0,
    ),
  };
}

export function advancePreviewProgress(state: PreviewInteractionState): PreviewInteractionState {
  const finalStep = DESIGN_PREVIEW_FIXTURE.discountTiers.length;
  if (state.progressStep >= finalStep) {
    return triggerPreviewDiscountFeedback(state, "complete");
  }
  return {
    ...state,
    progressStep: state.progressStep + 1,
  };
}

export function retreatPreviewProgress(state: PreviewInteractionState): PreviewInteractionState {
  return { ...state, progressStep: Math.max(0, state.progressStep - 1) };
}

export function togglePreviewMobileSummary(state: PreviewInteractionState): PreviewInteractionState {
  return { ...state, isMobileSummaryOpen: !state.isMobileSummaryOpen };
}

export function triggerPreviewDiscountFeedback(
  state: PreviewInteractionState,
  feedbackState: "tier" | "complete",
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
  replay: number,
): PreviewInteractionState {
  if (state.discountFeedback.replay !== replay) return state;

  return {
    ...state,
    discountFeedback: { state: null, replay },
  };
}

type Translate = (key: string) => string;

function PreviewContextFrame({
  descriptor,
  surface,
  viewport,
  children,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  surface: DesignPreviewSurface;
  viewport: DesignPreviewViewport;
  children: ReactNode;
}) {
  const contextKind = getDesignPreviewContextKind(descriptor.key);

  return (
    <div
      className={styles.previewContextFrame}
      data-preview-context={contextKind}
      data-preview-context-surface={surface}
      data-preview-context-viewport={viewport}
    >
      <div className={styles.previewContextBackdrop} aria-hidden="true">
        <span className={styles.previewContextHeader} />
        <span className={styles.previewContextMedia} />
        <span className={styles.previewContextWorkspace} />
        <span className={styles.previewContextRail} />
        <span className={styles.previewContextTray} />
      </div>
      <div className={styles.previewContextSelected}>{children}</div>
    </div>
  );
}

export function getDefaultTemplateKey(bundleType: BundleContractType): TemplateKey {
  return bundleType === "full_page" ? "standard" : "product-list";
}

export function isTemplateValidForBundleType(
  bundleType: BundleContractType,
  templateKey: TemplateKey,
) {
  return DESIGN_PREVIEW_TEMPLATES.some(
    (template) => template.bundleType === bundleType && template.key === templateKey,
  );
}

export function isDesignPreviewSurfaceSupported(
  templateKey: TemplateKey,
  surface: DesignPreviewSurface,
) {
  return getSupportedDesignPreviewSurfaces(templateKey).includes(surface);
}

export function createDesignPreviewState(
  bundleType: BundleContractType = "full_page",
): DesignPreviewState {
  const templateKey = getDefaultTemplateKey(bundleType);
  return {
    bundleType,
    templateKey,
    viewport: "desktop",
    surface: getDefaultDesignPreviewSurface(templateKey),
  };
}

export function setDesignPreviewBundleType(
  state: DesignPreviewState,
  bundleType: BundleContractType,
): DesignPreviewState {
  const templateKey = getDefaultTemplateKey(bundleType);
  return {
    ...state,
    bundleType,
    templateKey,
    surface: getDefaultDesignPreviewSurface(templateKey),
  };
}

export function setDesignPreviewTemplate(
  state: DesignPreviewState,
  templateKey: TemplateKey,
): DesignPreviewState {
  if (!isTemplateValidForBundleType(state.bundleType, templateKey)) {
    throw new Error(`Invalid Design preview template "${templateKey}" for ${state.bundleType}`);
  }
  return {
    ...state,
    templateKey,
    surface: isDesignPreviewSurfaceSupported(templateKey, state.surface)
      ? state.surface
      : getDefaultDesignPreviewSurface(templateKey),
  };
}

export function setDesignPreviewViewport(
  state: DesignPreviewState,
  viewport: DesignPreviewViewport,
): DesignPreviewState {
  return { ...state, viewport };
}

export function setDesignPreviewSurface(
  state: DesignPreviewState,
  surface: DesignPreviewSurface,
): DesignPreviewState {
  return isDesignPreviewSurfaceSupported(state.templateKey, surface)
    ? { ...state, surface }
    : state;
}

export type DesignPreviewFieldFocusRequest = {
  fieldKey: string;
  requestId: number;
};

export function applyDesignPreviewFieldFocus(
  state: DesignPreviewState,
  request: DesignPreviewFieldFocusRequest | null | undefined,
  handledRequestId: number,
): { state: DesignPreviewState; handledRequestId: number } {
  if (!request || request.requestId <= handledRequestId) {
    return { state, handledRequestId };
  }
  const target = getDesignPreviewFieldTarget(request.fieldKey, state.templateKey);
  const nextState = target && isDesignPreviewFieldApplicable(request.fieldKey, state.templateKey)
    ? setDesignPreviewSurface(state, target.surface)
    : state;
  return { state: nextState, handledRequestId: request.requestId };
}



function PreviewSurface({
  descriptor,
  surface,
  viewport,
  loadingGifUrl,
  t,
  interaction,
  onInteractionChange,
  onSurfaceRequest,
  locale,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  surface: DesignPreviewSurface;
  viewport: DesignPreviewViewport;
  loadingGifUrl: string;
  t: Translate;
  interaction: PreviewInteractionState;
  onInteractionChange: (state: PreviewInteractionState) => void;
  onSurfaceRequest: (surface: DesignPreviewSurface) => void;
  locale?: string;
}) {
  if (surface === "bundle-header") {
    return (
      <BundleHeaderSurface
        t={t}
        progressStep={interaction.progressStep}
        onAdvanceProgress={() => onInteractionChange(advancePreviewProgress(interaction))}
      />
    );
  }
  if (surface === "navigation") {
    return <NavigationSurface descriptor={descriptor} t={t} />;
  }
  if (surface === "categories") {
    return (
      <CategoriesSurface
        descriptor={descriptor}
        t={t}
        activeCategoryId={interaction.activeCategoryId}
        onCategorySelect={(categoryId) =>
          onInteractionChange(selectPreviewCategory(interaction, categoryId))
        }
      />
    );
  }
  if (surface === "product-card") {
    return (
      <ProductCardsSurface
        descriptor={descriptor}
        t={t}
        interaction={interaction}
        onProductQuantityChange={(productId, delta) =>
          onInteractionChange(updatePreviewProductQuantity(interaction, productId, delta))
        }
      />
    );
  }
  if (surface === "product-slots") {
    return (
      <ProductSlotsSurface
        descriptor={descriptor}
        t={t}
        interaction={interaction}
        onRemoveProduct={(productId) =>
          onInteractionChange(setPreviewProductQuantity(interaction, productId, 0))
        }
        onOpenPicker={() => onSurfaceRequest("product-picker")}
      />
    );
  }
  if (surface === "product-picker") {
    return (
      <ProductPickerSurface
        descriptor={descriptor}
        viewport={viewport}
        t={t}
        interaction={interaction}
        onClose={() => onSurfaceRequest("product-slots")}
        onAddProduct={(productId) => {
          onInteractionChange(updatePreviewProductQuantity(interaction, productId, 1));
          onSurfaceRequest("product-slots");
        }}
      />
    );
  }
  if (surface === "cart-summary") {
    return (
      <CartSummarySurface
        descriptor={descriptor}
        viewport={viewport}
        t={t}
        interaction={interaction}
        onToggleMobileSummary={() => onInteractionChange(togglePreviewMobileSummary(interaction))}
        onAdvanceProgress={() => onInteractionChange(advancePreviewProgress(interaction))}
        onRetreatProgress={() => onInteractionChange(retreatPreviewProgress(interaction))}
        onComplete={() => onInteractionChange(triggerPreviewDiscountFeedback(interaction, "complete"))}
        locale={locale}
      />
    );
  }
  if (surface === "loading") {
    return <LoadingSurface loadingGifUrl={loadingGifUrl} t={t} />;
  }
  if (surface === "upsell") {
    return (
      <UpsellSurface
        t={t}
        isAdded={(interaction.quantities[DESIGN_PREVIEW_FIXTURE.upsell.id] ?? 0) > 0}
        onAdd={() => onInteractionChange(updatePreviewProductQuantity(
          interaction,
          DESIGN_PREVIEW_FIXTURE.upsell.id,
          1,
        ))}
      />
    );
  }

  return <ValidationSurface t={t} />;
}

export function DesignLivePreview({
  fieldValues,
  inheritedColorFieldKeys,
  shopBrandColors,
  fieldFocusRequest,
  initialState,
  onSurfaceChange,
  onContextChange,
}: {
  fieldValues: Record<string, string>;
  inheritedColorFieldKeys?: string[];
  shopBrandColors?: ShopBrandColors | null;
  fieldFocusRequest?: DesignPreviewFieldFocusRequest | null;
  initialState?: DesignPreviewState;
  onSurfaceChange?: (surface: DesignPreviewSurface) => void;
  onContextChange?: (context: Pick<DesignPreviewState, "bundleType" | "templateKey" | "surface">) => void;
}) {
  const { t, i18n } = useTranslation();
  const previewStageRef = useRef<HTMLDivElement>(null);
  const handledFieldFocusRequestRef = useRef(0);
  const [previewState, setPreviewState] = useState<DesignPreviewState>(
    initialState ?? createDesignPreviewState(),
  );
  const [fitScale, setFitScale] = useState(1);
  const [interaction, setInteraction] = useState(createPreviewInteractionState);
  const discountFeedbackState = interaction.discountFeedback.state;
  const discountFeedbackReplay = interaction.discountFeedback.replay;
  const availableTemplates = DESIGN_PREVIEW_TEMPLATES.filter(
    (template) => template.bundleType === previewState.bundleType,
  );
  const activeTemplate = DESIGN_PREVIEW_TEMPLATES.find(
    (template) => template.key === previewState.templateKey,
  ) ?? DESIGN_PREVIEW_TEMPLATES[0];
  const supportedSurfaces = activeTemplate.supportedSurfaces;
  const activeFieldKey = fieldFocusRequest?.fieldKey ?? null;
  const isApplicable = !activeFieldKey || isDesignPreviewFieldApplicable(activeFieldKey, activeTemplate.key);
  const previewTheme = useMemo(
    () => buildDesignPreviewTheme(
      fieldValues,
      inheritedColorFieldKeys,
      shopBrandColors,
      activeTemplate.key,
    ),
    [activeTemplate.key, fieldValues, inheritedColorFieldKeys, shopBrandColors],
  );
  const previewViewport = DESIGN_PREVIEW_VIEWPORTS[previewState.viewport];
  const surfaceFidelity = getDesignPreviewSurfaceFidelity(
    activeTemplate.key,
    previewState.surface,
  );

  useEffect(() => {
    if (!fieldFocusRequest) return;
    setPreviewState((current) => {
      const result = applyDesignPreviewFieldFocus(
        current,
        fieldFocusRequest,
        handledFieldFocusRequestRef.current,
      );
      handledFieldFocusRequestRef.current = result.handledRequestId;
      return result.state;
    });
  }, [fieldFocusRequest]);

  useEffect(() => {
    onSurfaceChange?.(previewState.surface);
  }, [onSurfaceChange, previewState.surface]);

  useEffect(() => {
    onContextChange?.({
      bundleType: previewState.bundleType,
      templateKey: previewState.templateKey,
      surface: previewState.surface,
    });
  }, [onContextChange, previewState.bundleType, previewState.surface, previewState.templateKey]);

  useEffect(() => {
    if (!discountFeedbackState) return;

    const timeout = window.setTimeout(
      () => setInteraction((current) => clearPreviewDiscountFeedback(current, discountFeedbackReplay)),
      discountFeedbackState === "complete" ? 1200 : 650,
    );
    return () => window.clearTimeout(timeout);
  }, [discountFeedbackReplay, discountFeedbackState]);

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;

    const updateFitScale = () => {
      const computedStyle = window.getComputedStyle(stage);
      const horizontalPadding =
        Number.parseFloat(computedStyle.paddingLeft) +
        Number.parseFloat(computedStyle.paddingRight);
      const verticalPadding =
        Number.parseFloat(computedStyle.paddingTop) +
        Number.parseFloat(computedStyle.paddingBottom);
      setFitScale(
        calculateDesignPreviewFitScale(
          {
            width: Math.max(0, stage.clientWidth - horizontalPadding),
            height: Math.max(0, stage.clientHeight - verticalPadding),
          },
          previewState.viewport,
        ),
      );
    };

    updateFitScale();
    const observer = new ResizeObserver(updateFitScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [previewState.viewport]);

  return (
    <section className={styles.previewPanel} aria-label="Live bundle preview">
      <div className={styles.previewHeader}>
        <div>
          <h2>{t("settingsDcp.preview.heading")}</h2>
          <p>{t("settingsDcp.preview.unsaved")}</p>
        </div>
        <div className={styles.previewControls}>
          <s-select
            label={t("settingsDcp.preview.bundleType.label")}
            value={previewState.bundleType}
            onChange={(event: Event) => {
              const bundleType = (event.target as HTMLSelectElement).value as BundleContractType;
              setPreviewState((current) => setDesignPreviewBundleType(current, bundleType));
            }}
          >
            <s-option value="full_page">{t("settingsDcp.preview.bundleType.landingPage")}</s-option>
            <s-option value="product_page">{t("settingsDcp.preview.bundleType.productPage")}</s-option>
          </s-select>
          <s-select
            label={t("settingsDcp.preview.templateLabel")}
            value={previewState.templateKey}
            onChange={(event: Event) => {
              const templateKey = (event.target as HTMLSelectElement).value as TemplateKey;
              setPreviewState((current) => setDesignPreviewTemplate(current, templateKey));
            }}
          >
            {availableTemplates.map((template) => (
              <s-option key={template.key} value={template.key}>{t(template.translationKey)}</s-option>
            ))}
          </s-select>
          <s-select
            label={t("settingsDcp.preview.surfaceSelector.label")}
            value={previewState.surface}
            onChange={(event: Event) => {
              const surface = (event.target as HTMLSelectElement).value as DesignPreviewSurface;
              setPreviewState((current) => setDesignPreviewSurface(current, surface));
            }}
          >
            {supportedSurfaces.map((surface) => (
              <s-option key={surface} value={surface}>{t(`settingsDcp.preview.surfaceSelector.${surface}`)}</s-option>
            ))}
          </s-select>
          <div className={styles.viewportButtons} aria-label={t("settingsDcp.preview.viewport.label")}>
            {(["desktop", "mobile"] as const).map((viewport) => {
              const isActive = previewState.viewport === viewport;
              const label = t(`settingsDcp.preview.viewport.${viewport}`);
              const tooltipId = `settings-design-preview-${viewport}-tooltip`;
              return (
                <span key={viewport} className={styles.viewportButton} data-selected={isActive || undefined}>
                  <s-button
                    icon={viewport}
                    variant={isActive ? "primary" : "secondary"}
                    accessibilityLabel={label}
                    interestFor={tooltipId}
                    aria-pressed={isActive}
                    onClick={() => setPreviewState((current) => setDesignPreviewViewport(current, viewport))}
                  />
                  <s-tooltip id={tooltipId}>{label}</s-tooltip>
                </span>
              );
            })}
          </div>
          {previewState.surface === "cart-summary" ? (
            <div className={styles.previewFeedbackActions}>
              <s-button
                variant="secondary"
                onClick={() => setInteraction((current) => triggerPreviewDiscountFeedback(current, "tier"))}
              >{t("settingsDcp.preview.feedback.tierHit")}</s-button>
              <s-button
                variant="secondary"
                onClick={() => setInteraction((current) => triggerPreviewDiscountFeedback(current, "complete"))}
              >{t("settingsDcp.preview.feedback.complete")}</s-button>
            </div>
          ) : null}
        </div>
      </div>

      {!isApplicable ? (
        <div className={styles.previewApplicability}>
          <s-icon type="info" size="small" />
          <span>{t("settingsDcp.preview.notApplicable")}</span>
        </div>
      ) : null}

      <div
        ref={previewStageRef}
        className={styles.previewStage}
        data-preview-viewport={previewState.viewport}
      >
        <div
          className={styles.previewCanvas}
          style={{
            width: `${previewViewport.width * fitScale}px`,
            height: `${previewViewport.height * fitScale}px`,
          }}
        >
          <div
            className={styles.previewSurface}
            data-template-key={previewState.templateKey}
            data-preview-surface={previewState.surface}
            data-fidelity={surfaceFidelity}
            style={{
              ...previewTheme,
              width: `${previewViewport.width}px`,
              height: `${previewViewport.height}px`,
              transform: `scale(${fitScale})`,
            }}
          >
            <PreviewContextFrame
              descriptor={activeTemplate}
              surface={previewState.surface}
              viewport={previewState.viewport}
            >
              <PreviewSurface
                descriptor={activeTemplate}
                surface={previewState.surface}
                viewport={previewState.viewport}
                loadingGifUrl={fieldValues["generalSettings.loadingGifUrl"] ?? ""}
                t={t}
                interaction={interaction}
                onInteractionChange={setInteraction}
                onSurfaceRequest={(surface) =>
                  setPreviewState((current) => setDesignPreviewSurface(current, surface))
                }
                locale={i18n?.resolvedLanguage ?? i18n?.language}
              />
            </PreviewContextFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
