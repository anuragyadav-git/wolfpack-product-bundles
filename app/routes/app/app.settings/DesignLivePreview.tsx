import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  BundleContractType,
  TemplateKey,
} from "../../../lib/bundle-config/template-selection";
import {
  DESIGN_PREVIEW_FIXTURE,
  DESIGN_PREVIEW_TEMPLATES,
  DESIGN_PREVIEW_VIEWPORTS,
  buildDesignPreviewStorefrontCss,
  calculateDesignPreviewFitScale,
  getDesignPreviewCanvasSize,
  getDefaultDesignPreviewSurface,
  getDesignPreviewFieldTarget,
  getSupportedDesignPreviewSurfaces,
  isDesignPreviewFieldApplicable,
  type DesignPreviewSurface,
  type DesignPreviewViewport,
} from "./design-preview-model";
import styles from "./DesignSettingsView.module.css";
import type { ShopBrandColors } from "../../../lib/shop-brand-colors";
import {
  PREVIEW_PROTOCOL_VERSION,
  isStorefrontPreviewEvent,
  isTrustedStorefrontPreviewMessage,
  type StorefrontPreviewCommand,
} from "./storefront-preview-protocol";

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
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const handledFieldFocusRequestRef = useRef(0);
  const [previewState, setPreviewState] = useState<DesignPreviewState>(
    initialState ?? createDesignPreviewState(),
  );
  const [fitScale, setFitScale] = useState(1);
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);
  const availableTemplates = DESIGN_PREVIEW_TEMPLATES.filter(
    (template) => template.bundleType === previewState.bundleType,
  );
  const activeTemplate = DESIGN_PREVIEW_TEMPLATES.find(
    (template) => template.key === previewState.templateKey,
  ) ?? DESIGN_PREVIEW_TEMPLATES[0];
  const supportedSurfaces = activeTemplate.supportedSurfaces;
  const activeFieldKey = fieldFocusRequest?.fieldKey ?? null;
  const isApplicable = !activeFieldKey || isDesignPreviewFieldApplicable(activeFieldKey, activeTemplate.key);
  const designCss = useMemo(
    () => buildDesignPreviewStorefrontCss({
      fieldValues,
      inheritedColorFieldKeys,
      shopBrandColors,
      templateKey: activeTemplate.key,
    }),
    [activeTemplate.key, fieldValues, inheritedColorFieldKeys, shopBrandColors],
  );
  const previewViewport = DESIGN_PREVIEW_VIEWPORTS[previewState.viewport];
  const previewCanvasSize = getDesignPreviewCanvasSize(previewState.viewport);
  const initializePayloadRef = useRef({
    bundleType: previewState.bundleType,
    templateKey: previewState.templateKey,
    viewport: previewState.viewport,
    surface: previewState.surface,
    designCss,
    locale: i18n?.resolvedLanguage ?? i18n?.language ?? "en",
    currency: "USD",
  });
  initializePayloadRef.current = {
    bundleType: previewState.bundleType,
    templateKey: previewState.templateKey,
    viewport: previewState.viewport,
    surface: previewState.surface,
    designCss,
    locale: i18n?.resolvedLanguage ?? i18n?.language ?? "en",
    currency: "USD",
  };

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
    const onMessage = (event: MessageEvent) => {
      const frameWindow = previewFrameRef.current?.contentWindow ?? null;
      if (!isTrustedStorefrontPreviewMessage(event, window.location.origin, frameWindow)) return;
      if (!isStorefrontPreviewEvent(event.data)) return;
      if (event.data.type === "READY") {
        setFrameError(null);
        setIsFrameReady(true);
      } else if (event.data.type === "ERROR") {
        setFrameError(event.data.payload.message);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "INITIALIZE",
      payload: initializePayloadRef.current,
    };
    previewFrameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [isFrameReady]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "UPDATE_DESIGN",
      payload: { designCss },
    };
    previewFrameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [designCss, isFrameReady]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_TEMPLATE",
      payload: { bundleType: previewState.bundleType, templateKey: previewState.templateKey },
    };
    previewFrameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [isFrameReady, previewState.bundleType, previewState.templateKey]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_VIEWPORT",
      payload: { viewport: previewState.viewport },
    };
    previewFrameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [isFrameReady, previewState.viewport]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_SURFACE",
      payload: { surface: previewState.surface },
    };
    previewFrameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [isFrameReady, previewState.surface]);

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
        </div>
      </div>

      {!isApplicable ? (
        <div className={styles.previewApplicability}>
          <s-icon type="info" size="small" />
          <span>{t("settingsDcp.preview.notApplicable")}</span>
        </div>
      ) : null}

      {frameError ? <s-banner tone="critical">{frameError}</s-banner> : null}

      <div
        ref={previewStageRef}
        className={styles.previewStage}
        data-preview-viewport={previewState.viewport}
        aria-busy={!isFrameReady}
      >
        {!isFrameReady ? (
          <div className={styles.previewLoading} role="status">
            <s-box className={styles.previewLoadingIndicator}>
              <s-spinner
                size="large"
                accessibilityLabel={t("settingsDcp.preview.loading")}
              />
            </s-box>
          </div>
        ) : null}
        <div
          className={styles.previewCanvas}
          data-preview-ready={isFrameReady || undefined}
          style={{
            width: `${previewCanvasSize.width * fitScale}px`,
            height: `${previewCanvasSize.height * fitScale}px`,
          }}
        >
          <div
            className={styles.previewScaledShell}
            data-preview-viewport={previewState.viewport}
            style={{
              width: `${previewCanvasSize.width}px`,
              height: `${previewCanvasSize.height}px`,
              transform: `scale(${fitScale})`,
            }}
          >
            <div className={styles.mobileDevice}>
              <span className={styles.mobileDeviceSideButton} aria-hidden="true" />
              <span className={styles.mobileDeviceIsland} aria-hidden="true" />
              <div className={styles.mobileDeviceScreen}>
                <div
                  className={styles.previewSurface}
                  data-template-key={previewState.templateKey}
                  data-preview-surface={previewState.surface}
                  style={{
                    width: `${previewViewport.width}px`,
                    height: `${previewViewport.height}px`,
                  }}
                >
                  <iframe
                    ref={previewFrameRef}
                    className={styles.previewFrame}
                    src="/settings-design-preview-frame"
                    title={t("settingsDcp.preview.heading")}
                    sandbox="allow-scripts allow-same-origin"
                    onLoad={() => setFrameError(null)}
                  />
                </div>
              </div>
              <span className={styles.mobileDeviceHomeIndicator} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
