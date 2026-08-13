import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OptimisedImage } from "../../../components/OptimisedImage";
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
  getDesignPreviewFieldTarget,
  getDesignPreviewSurfaceFidelity,
  getSupportedDesignPreviewSurfaces,
  isDesignPreviewFieldApplicable,
  type DesignPreviewFixtureProduct,
  type DesignPreviewSurface,
  type DesignPreviewTemplateDescriptor,
  type DesignPreviewViewport,
} from "./design-preview-model";
import styles from "./DesignSettingsView.module.css";

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
  progressStep: number;
  isMobileSummaryOpen: boolean;
};

export function createPreviewInteractionState(): PreviewInteractionState {
  return {
    quantities: Object.fromEntries(
      DESIGN_PREVIEW_FIXTURE.products.map((product) => [product.id, product.quantity]),
    ),
    progressStep: 0,
    isMobileSummaryOpen: false,
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

export function advancePreviewProgress(state: PreviewInteractionState): PreviewInteractionState {
  return {
    ...state,
    progressStep: (state.progressStep + 1) % (DESIGN_PREVIEW_FIXTURE.discountTiers.length + 1),
  };
}

export function togglePreviewMobileSummary(state: PreviewInteractionState): PreviewInteractionState {
  return { ...state, isMobileSummaryOpen: !state.isMobileSummaryOpen };
}

type Translate = (key: string) => string;

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

function ProductImage({
  product = DESIGN_PREVIEW_FIXTURE.products[0],
  compact = false,
}: {
  product?: DesignPreviewFixtureProduct;
  compact?: boolean;
}) {
  return (
    <span className={compact ? styles.previewProductImageCompact : styles.previewProductImage}>
      <OptimisedImage
        src={product.imageUrl}
        width={compact ? 72 : 320}
        height={compact ? 72 : 320}
        loading="lazy"
        alt=""
      />
    </span>
  );
}

function ProductCard({
  product,
  quantity,
  onQuantityChange,
  variant,
  t,
}: {
  product: DesignPreviewFixtureProduct;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  variant: "grid" | "compact" | "row";
  t: Translate;
}) {
  return (
    <article
      className={styles.previewProductCard}
      data-card-variant={variant}
      data-selected={quantity > 0 || undefined}
    >
      <ProductImage product={product} compact={variant === "row"} />
      <span className={styles.previewProductCopy}>
        <strong>{t(`${product.translationKey}.name`)}</strong>
        <small>{t("settingsDcp.preview.surface.variant")}</small>
        <span className={styles.previewPrices}>
          <strong>{t(`${product.translationKey}.price`)}</strong>
          <del>{t(`${product.translationKey}.compareAt`)}</del>
        </span>
      </span>
      {quantity > 0 ? (
        <span className={styles.previewQuantity} aria-label={t("settingsDcp.preview.previewOnly")}>
          <button type="button" onClick={() => onQuantityChange(-1)}>−</button>
          <strong>{quantity}</strong>
          <button type="button" onClick={() => onQuantityChange(1)}>+</button>
        </span>
      ) : (
        <button type="button" onClick={() => onQuantityChange(1)}>
          {t("settingsDcp.preview.surface.add")}
        </button>
      )}
    </article>
  );
}

function StepNavigation({
  descriptor,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
}) {
  if (descriptor.navigation === "none") return null;
  const region = descriptor.navigation === "list-steps"
    ? "product-list-step-flow"
    : descriptor.navigation === "grid-steps"
      ? "product-grid-step-headers"
      : descriptor.navigation;

  if (descriptor.navigation === "list-steps" || descriptor.navigation === "grid-steps") {
    return (
      <div className={styles.previewStepHeaders} data-preview-region={region}>
        {DESIGN_PREVIEW_FIXTURE.steps.map((step, index) => (
          <span key={step.id} data-active={index === 0 || undefined}>
            <b>{index + 1}</b>
            <span><strong>{t(step.translationKey)}</strong><small>{t("settingsDcp.preview.surface.selectionRule")}</small></span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <nav
      className={styles.previewTimeline}
      data-navigation={descriptor.navigation}
      data-preview-region={region}
      aria-label={t("settingsDcp.preview.surface.navigationLabel")}
    >
      <span data-complete="true"><b>✓</b>{t("settingsDcp.preview.surface.stepOneShort")}</span>
      <i aria-hidden="true" />
      <span data-active="true"><b>2</b>{t("settingsDcp.preview.surface.stepTwoShort")}</span>
      <i aria-hidden="true" />
      <span><b>3</b>{t("settingsDcp.preview.surface.stepThreeShort")}</span>
    </nav>
  );
}

function CategoryNavigation({
  descriptor,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
}) {
  if (descriptor.categories === "none") return null;
  const region = descriptor.categories === "accordion"
    ? "category-accordion"
    : descriptor.categories === "pills"
      ? "pill-categories"
      : descriptor.categories === "underline"
        ? "underline-categories"
        : "category-tabs";

  if (descriptor.categories === "accordion") {
    return (
      <div className={styles.previewCategoryAccordion} data-preview-region={region}>
        <span><strong>{t("settingsDcp.preview.surface.categoryOne")}</strong><small>{t("settingsDcp.preview.surface.selectionRule")}</small><b>⌃</b></span>
      </div>
    );
  }

  return (
    <nav
      className={styles.previewTabs}
      data-category-mode={descriptor.categories}
      data-preview-region={region}
      aria-label={t("settingsDcp.preview.surface.navigationLabel")}
    >
      {DESIGN_PREVIEW_FIXTURE.categories.map((category, index) => (
        <span key={category.id} data-active={index === 0 || undefined}>{t(category.translationKey)}</span>
      ))}
    </nav>
  );
}

function DiscountProgress({ t, progressStep = 0, onAdvance }: { t: Translate; progressStep?: number; onAdvance?: () => void }) {
  const progress = `${Math.min(100, 25 + progressStep * 25)}%`;
  return (
    <button type="button" className={styles.previewDiscount} onClick={onAdvance}>
      <span>{t("settingsDcp.preview.surface.discount")}</span>
      <i><b style={{ width: progress }} /></i>
      <small>{DESIGN_PREVIEW_FIXTURE.discountTiers.map((tier) => `${tier.percentage}%`).join(" · ")}</small>
    </button>
  );
}

function BundleSummary({
  descriptor,
  viewport,
  t,
  interaction,
  onToggleMobileSummary,
  onAdvanceProgress,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
  interaction: PreviewInteractionState;
  onToggleMobileSummary: () => void;
  onAdvanceProgress: () => void;
}) {
  const usesSlots = descriptor.summary === "slot-grid" || descriptor.summary === "compact-slots";
  const viewportRegions = viewport === "mobile"
    ? descriptor.sceneRegions.mobile
    : descriptor.sceneRegions.desktop;
  const region = descriptor.family === "full-page"
    ? viewportRegions.at(-1) ?? "summary-sidebar"
    : descriptor.summary === "list-selected-drawer" ? "product-list-selected-drawer" : descriptor.summary;

  return (
    <aside className={styles.previewSummary} data-summary={descriptor.summary} data-preview-region={region} data-expanded={viewport === "mobile" && interaction.isMobileSummaryOpen || undefined}>
      <header>
        <button type="button" onClick={viewport === "mobile" ? onToggleMobileSummary : undefined}>{t("settingsDcp.preview.surface.summary")}</button>
        <small>{t("settingsDcp.preview.surface.selectedCount")}</small>
      </header>
      <DiscountProgress t={t} progressStep={interaction.progressStep} onAdvance={onAdvanceProgress} />
      {usesSlots ? (
        <div className={styles.previewSummarySlots}>
          <ProductImage product={DESIGN_PREVIEW_FIXTURE.products[0]} compact />
          {DESIGN_PREVIEW_FIXTURE.emptySlots.map((slot) => <span key={slot.id} className={styles.previewEmptySlot}>+</span>)}
        </div>
      ) : (
        <div className={styles.previewSummaryRows}>
          {DESIGN_PREVIEW_FIXTURE.products.filter((product) => product.selected).map((product) => (
            <span key={product.id}><ProductImage product={product} compact /><small>{t(`${product.translationKey}.name`)}</small></span>
          ))}
        </div>
      )}
      <footer>
        <span><small>{t("settingsDcp.preview.surface.totalLabel")}</small><strong>{t("settingsDcp.preview.surface.totalPrice")}</strong></span>
        <div>
          <button type="button" disabled>{t("settingsDcp.preview.surface.back")}</button>
          <button type="button" disabled>{t("settingsDcp.preview.surface.next")}</button>
        </div>
      </footer>
    </aside>
  );
}

function ProductGrid({
  descriptor,
  limit,
  t,
  interaction,
  onProductQuantityChange,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  limit?: number;
  t: Translate;
  interaction: PreviewInteractionState;
  onProductQuantityChange: (productId: string, delta: number) => void;
}) {
  const region = descriptor.productCard.mode === "row" ? "product-rows" : "product-grid";
  return (
    <div
      className={styles.previewProducts}
      data-product-mode={descriptor.productCard.mode}
      data-columns-desktop={descriptor.productCard.columns.desktop}
      data-columns-mobile={descriptor.productCard.columns.mobile}
      data-preview-region={region}
    >
      {DESIGN_PREVIEW_FIXTURE.products.slice(0, limit).map((product) => (
        <ProductCard key={product.id} product={product} quantity={interaction.quantities[product.id] ?? 0} onQuantityChange={(delta) => onProductQuantityChange(product.id, delta)} variant={descriptor.productCard.mode} t={t} />
      ))}
    </div>
  );
}

function Slot({
  index,
  filled,
  orientation,
  t,
}: {
  index: number;
  filled?: boolean;
  orientation: "horizontal" | "vertical";
  t: Translate;
}) {
  const product = DESIGN_PREVIEW_FIXTURE.products[index - 1] ?? DESIGN_PREVIEW_FIXTURE.products[0];
  return (
    <span className={styles.previewSlot} data-filled={filled ? true : undefined} data-slot-orientation={orientation}>
      {filled ? <ProductImage product={product} compact /> : <b>+</b>}
      <span>
        <strong>{filled ? t(`${product.translationKey}.name`) : t("settingsDcp.preview.surface.emptySlot")}</strong>
        <small>{t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", String(index))}</small>
      </span>
      {filled ? <small>×</small> : null}
    </span>
  );
}

function BundleHeaderPreview({ t }: { t: Translate }) {
  return (
    <section className={styles.previewComponentSurface} data-preview-region="bundle-header">
      <div className={styles.previewBundleHeader}>
        <small>{t("settingsDcp.preview.bundleType.productPage")}</small>
        <h3>{t("settingsDcp.preview.surface.bundleName")}</h3>
        <p>{t("settingsDcp.preview.surface.description")}</p>
        <DiscountProgress t={t} />
      </div>
    </section>
  );
}

function NavigationPreview({ descriptor, t }: { descriptor: DesignPreviewTemplateDescriptor; t: Translate }) {
  return (
    <section className={styles.previewComponentSurface} data-preview-component="navigation">
      <div className={styles.previewComponentContent}><StepNavigation descriptor={descriptor} t={t} /></div>
    </section>
  );
}

function CategoriesPreview({ descriptor, t }: { descriptor: DesignPreviewTemplateDescriptor; t: Translate }) {
  return (
    <section className={styles.previewComponentSurface} data-preview-component="categories">
      <div className={styles.previewComponentContent}>
        <div className={styles.previewSectionHeading}>
          <span><strong>{t("settingsDcp.preview.surface.categoryOne")}</strong><small>{t("settingsDcp.preview.surface.selectionRule")}</small></span>
          <span>{t("settingsDcp.preview.surface.progressCount")}</span>
        </div>
        <CategoryNavigation descriptor={descriptor} t={t} />
      </div>
    </section>
  );
}

function ProductCardsPreview({ descriptor, t, interaction, onProductQuantityChange }: { descriptor: DesignPreviewTemplateDescriptor; t: Translate; interaction: PreviewInteractionState; onProductQuantityChange: (productId: string, delta: number) => void }) {
  return (
    <section className={styles.previewComponentSurface} data-preview-component="product-card">
      <div className={styles.previewProductComponent}><ProductGrid descriptor={descriptor} t={t} interaction={interaction} onProductQuantityChange={onProductQuantityChange} /></div>
    </section>
  );
}

function ProductSlotsPreview({ descriptor, t }: { descriptor: DesignPreviewTemplateDescriptor; t: Translate }) {
  if (!descriptor.slotOrientation) return null;
  const slotsRegion = `${descriptor.slotOrientation}-slots`;
  return (
    <section className={styles.previewComponentSurface} data-preview-component="product-slots">
      <div className={styles.previewComponentContent}>
        <div className={styles.previewSlots} data-slot-direction={descriptor.slotOrientation} data-preview-region={slotsRegion}>
          <Slot index={1} filled orientation={descriptor.slotOrientation} t={t} />
          <Slot index={2} orientation={descriptor.slotOrientation} t={t} />
          <Slot index={3} orientation={descriptor.slotOrientation} t={t} />
        </div>
      </div>
    </section>
  );
}

function ProductPicker({
  descriptor,
  viewport,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
}) {
  const region = viewport === "mobile" ? "product-picker-bottom-sheet" : "product-picker-modal";
  return (
    <section className={styles.previewProductPicker} data-preview-region={region}>
      <header>
        <strong>{t("settingsDcp.preview.surface.chooseProduct")}</strong>
        {viewport === "desktop" ? <button type="button" disabled>×</button> : null}
      </header>
      <ProductGrid descriptor={descriptor} limit={3} t={t} interaction={createPreviewInteractionState()} onProductQuantityChange={() => undefined} />
    </section>
  );
}

function CartSummarySurface({
  descriptor,
  viewport,
  t,
  interaction,
  onToggleMobileSummary,
  onAdvanceProgress,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
  interaction: PreviewInteractionState;
  onToggleMobileSummary: () => void;
  onAdvanceProgress: () => void;
}) {
  if (descriptor.family === "full-page") {
    return (
      <div className={styles.previewCartFocus}>
        <BundleSummary descriptor={descriptor} viewport={viewport} t={t} interaction={interaction} onToggleMobileSummary={onToggleMobileSummary} onAdvanceProgress={onAdvanceProgress} />
      </div>
    );
  }
  return (
    <div className={styles.previewCartFocus} data-preview-region="neutral-pdp-shell">
      <BundleSummary descriptor={descriptor} viewport={viewport} t={t} interaction={interaction} onToggleMobileSummary={onToggleMobileSummary} onAdvanceProgress={onAdvanceProgress} />
      <footer className={styles.previewPdpFooter} data-preview-region={descriptor.summary === "modal-footer" ? "modal-footer" : "pdp-footer"}>
        <span><small>{t("settingsDcp.preview.surface.totalLabel")}</small><strong>{t("settingsDcp.preview.surface.totalPrice")}</strong></span>
        <button type="button" disabled>{t("settingsDcp.preview.surface.addBundle")}</button>
      </footer>
    </div>
  );
}

function UpsellPreview({ t }: { t: Translate }) {
  return (
    <section className={styles.previewUpsellState} data-preview-region="upsell-overlay">
      <ProductImage product={DESIGN_PREVIEW_FIXTURE.upsell} />
      <span>
        <small>{t("settingsDcp.preview.surface.upsellEyebrow")}</small>
        <h3>{t("settingsDcp.preview.surface.upsellTitle")}</h3>
        <p>{t("settingsDcp.preview.surface.upsellBody")}</p>
        <strong>{t(`${DESIGN_PREVIEW_FIXTURE.upsell.translationKey}.price`)}</strong>
      </span>
      <button type="button" disabled>{t("settingsDcp.preview.surface.add")}</button>
    </section>
  );
}

function PreviewSurface({
  descriptor,
  surface,
  viewport,
  loadingGifUrl,
  t,
  interaction,
  onInteractionChange,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  surface: DesignPreviewSurface;
  viewport: DesignPreviewViewport;
  loadingGifUrl: string;
  t: Translate;
  interaction: PreviewInteractionState;
  onInteractionChange: (state: PreviewInteractionState) => void;
}) {
  if (surface === "bundle-header") return <BundleHeaderPreview t={t} />;
  if (surface === "navigation") return <NavigationPreview descriptor={descriptor} t={t} />;
  if (surface === "categories") return <CategoriesPreview descriptor={descriptor} t={t} />;
  if (surface === "product-card") return <ProductCardsPreview descriptor={descriptor} t={t} interaction={interaction} onProductQuantityChange={(productId, delta) => onInteractionChange(updatePreviewProductQuantity(interaction, productId, delta))} />;
  if (surface === "product-slots") return <ProductSlotsPreview descriptor={descriptor} t={t} />;
  if (surface === "product-picker") return <ProductPicker descriptor={descriptor} viewport={viewport} t={t} />;
  if (surface === "upsell") return <UpsellPreview t={t} />;
  if (surface === "cart-summary") return <CartSummarySurface descriptor={descriptor} viewport={viewport} t={t} interaction={interaction} onToggleMobileSummary={() => onInteractionChange(togglePreviewMobileSummary(interaction))} onAdvanceProgress={() => onInteractionChange(advancePreviewProgress(interaction))} />;
  if (surface === "loading") {
    return (
      <div className={styles.previewLoadingState} data-preview-region="loading-screen">
        {loadingGifUrl ? (
          <img className={styles.previewLoadingGif} src={loadingGifUrl} alt="" />
        ) : (
          <s-spinner size="large" accessibilityLabel={t("settingsDcp.preview.loading")} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.previewValidationToast} data-preview-region="validation-overlay" role="alert">
      {t(DESIGN_PREVIEW_FIXTURE.validationMessage)}
    </div>
  );
}

export function DesignLivePreview({
  fieldValues,
  isExpertControlsEnabled,
  activeFieldKey,
  initialState,
  onSurfaceChange,
  onContextChange,
}: {
  fieldValues: Record<string, string>;
  isExpertControlsEnabled: boolean;
  activeFieldKey?: string | null;
  initialState?: DesignPreviewState;
  onSurfaceChange?: (surface: DesignPreviewSurface) => void;
  onContextChange?: (context: Pick<DesignPreviewState, "bundleType" | "templateKey" | "surface">) => void;
}) {
  const { t } = useTranslation();
  const previewStageRef = useRef<HTMLDivElement>(null);
  const [previewState, setPreviewState] = useState<DesignPreviewState>(
    initialState ?? createDesignPreviewState(),
  );
  const [fitScale, setFitScale] = useState(1);
  const [interaction, setInteraction] = useState(createPreviewInteractionState);
  const availableTemplates = DESIGN_PREVIEW_TEMPLATES.filter(
    (template) => template.bundleType === previewState.bundleType,
  );
  const activeTemplate = DESIGN_PREVIEW_TEMPLATES.find(
    (template) => template.key === previewState.templateKey,
  ) ?? DESIGN_PREVIEW_TEMPLATES[0];
  const supportedSurfaces = activeTemplate.supportedSurfaces;
  const fieldTarget = activeFieldKey
    ? getDesignPreviewFieldTarget(activeFieldKey, activeTemplate.key)
    : undefined;
  const fieldTargetSurface = fieldTarget?.surface;
  const isFieldOnActiveSurface = Boolean(
    fieldTarget
    && (fieldTarget.surface === previewState.surface || fieldTarget.surfaces?.includes(previewState.surface)),
  );
  const isApplicable = !activeFieldKey || isDesignPreviewFieldApplicable(activeFieldKey, activeTemplate.key);
  const previewTheme = useMemo(
    () => buildDesignPreviewTheme(fieldValues, isExpertControlsEnabled, activeTemplate.key),
    [activeTemplate.key, fieldValues, isExpertControlsEnabled],
  );
  const previewViewport = DESIGN_PREVIEW_VIEWPORTS[previewState.viewport];
  const surfaceFidelity = getDesignPreviewSurfaceFidelity(
    activeTemplate.key,
    previewState.surface,
  );

  useEffect(() => {
    if (!fieldTargetSurface || !isApplicable || isFieldOnActiveSurface) return;
    setPreviewState((current) => setDesignPreviewSurface(current, fieldTargetSurface));
  }, [activeFieldKey, fieldTargetSurface, isApplicable, isFieldOnActiveSurface]);

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
    const stage = previewStageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;

    const updateFitScale = () => {
      const computedStyle = window.getComputedStyle(stage);
      const horizontalPadding =
        Number.parseFloat(computedStyle.paddingLeft) +
        Number.parseFloat(computedStyle.paddingRight);
      setFitScale(
        calculateDesignPreviewFitScale(
          Math.max(0, stage.clientWidth - horizontalPadding),
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
            <PreviewSurface
              descriptor={activeTemplate}
              surface={previewState.surface}
              viewport={previewState.viewport}
              loadingGifUrl={fieldValues["generalSettings.loadingGifUrl"] ?? ""}
              t={t}
              interaction={interaction}
              onInteractionChange={setInteraction}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
