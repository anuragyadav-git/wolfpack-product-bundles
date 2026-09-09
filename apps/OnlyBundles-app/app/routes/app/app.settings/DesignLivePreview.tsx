import { translateAdmin } from "~/i18n/config";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import type {
  BundleContractType,
  TemplateKey,
} from "../../../lib/bundle-config/template-selection";
import {
  DESIGN_PREVIEW_TEMPLATES,
  buildDesignPreviewStorefrontCss,
  getDefaultDesignPreviewArea,
} from "./design-preview-model";
import type {
  DesignPreviewArea,
  DesignPreviewScenario,
} from "./design-preview-contract";
import {
  DESIGN_PREVIEW_VIEWPORTS,
  getDesignPreviewCanvasSize,
  getDesignPreviewFitPresentation,
} from "./design-preview-layout";
import styles from "./DesignSettingsView.module.css";
import type { ShopBrandColors } from "../../../lib/shop-brand-colors";
import {
  PREVIEW_PROTOCOL_VERSION,
  isStorefrontPreviewEvent,
  isTrustedStorefrontPreviewMessage,
  type StorefrontPreviewCommand,
} from "./storefront-preview-protocol";
import {
  createDesignPreviewState,
  isDesignPreviewAreaSupported,
  isDesignPreviewScenarioSupported,
  setDesignPreviewArea,
  setDesignPreviewBundleType,
  setDesignPreviewScenario,
  setDesignPreviewTemplate,
  setDesignPreviewViewport,
  type DesignPreviewState,
} from "./design-preview-state";

export function DesignLivePreview({
  fieldValues,
  inheritedColorFieldKeys,
  shopBrandColors,
  initialState,
  onContextChange,
}: {
  fieldValues: Record<string, string>;
  inheritedColorFieldKeys?: string[];
  shopBrandColors?: ShopBrandColors | null;
  initialState?: DesignPreviewState;
  onContextChange?: (
    context: Pick<
      DesignPreviewState,
      "bundleType" | "templateKey" | "area" | "scenario"
    >
  ) => void;
}) {
  const { t, i18n } = useTranslation();
  const previewStageRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const previewScaledShellRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const [previewState, setPreviewState] = useState<DesignPreviewState>(() => {
    const state = initialState ?? createDesignPreviewState();
    return {
      ...state,
      area: isDesignPreviewAreaSupported(state.templateKey, state.area)
        ? state.area
        : getDefaultDesignPreviewArea(state.templateKey),
      scenario: isDesignPreviewScenarioSupported(
        state.templateKey,
        state.scenario
      )
        ? state.scenario
        : "default",
    };
  });
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [previewAlert, setPreviewAlert] = useState<AdminTaskAlert | null>(null);
  const availableTemplates = DESIGN_PREVIEW_TEMPLATES.filter(
    (template) => template.bundleType === previewState.bundleType
  );
  const activeTemplate =
    DESIGN_PREVIEW_TEMPLATES.find(
      (template) => template.key === previewState.templateKey
    ) ?? DESIGN_PREVIEW_TEMPLATES[0];
  const supportedAreas = activeTemplate.supportedAreas;
  const supportedScenarios = activeTemplate.supportedScenarios;
  const designCss = useMemo(
    () =>
      buildDesignPreviewStorefrontCss({
        fieldValues,
        inheritedColorFieldKeys,
        shopBrandColors,
        templateKey: activeTemplate.key,
      }),
    [activeTemplate.key, fieldValues, inheritedColorFieldKeys, shopBrandColors]
  );
  const previewViewport = DESIGN_PREVIEW_VIEWPORTS[previewState.viewport];
  const previewCanvasSize = getDesignPreviewCanvasSize(previewState.viewport);
  const initializePayloadRef = useRef({
    bundleType: previewState.bundleType,
    templateKey: previewState.templateKey,
    viewport: previewState.viewport,
    area: previewState.area,
    areaLabel: t("settingsDcp.preview.focusLabel", {
      context: t(`settingsDcp.preview.areaSelector.${previewState.area}`),
    }),
    scenario: previewState.scenario,
    designCss,
    locale: i18n?.resolvedLanguage ?? i18n?.language ?? "en",
    currency: "USD",
  });
  initializePayloadRef.current = {
    bundleType: previewState.bundleType,
    templateKey: previewState.templateKey,
    viewport: previewState.viewport,
    area: previewState.area,
    areaLabel: t("settingsDcp.preview.focusLabel", {
      context: t(`settingsDcp.preview.areaSelector.${previewState.area}`),
    }),
    scenario: previewState.scenario,
    designCss,
    locale: i18n?.resolvedLanguage ?? i18n?.language ?? "en",
    currency: "USD",
  };

  useEffect(() => {
    onContextChange?.({
      bundleType: previewState.bundleType,
      templateKey: previewState.templateKey,
      area: previewState.area,
      scenario: previewState.scenario,
    });
  }, [
    onContextChange,
    previewState.area,
    previewState.bundleType,
    previewState.scenario,
    previewState.templateKey,
  ]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frameWindow = previewFrameRef.current?.contentWindow ?? null;
      if (
        !isTrustedStorefrontPreviewMessage(
          event,
          window.location.origin,
          frameWindow
        )
      )
        return;
      const message: unknown = event.data;
      if (!isStorefrontPreviewEvent(message)) return;
      if (message.type === "READY") {
        setPreviewAlert(null);
        setIsFrameReady(true);
      } else if (message.type === "SCENARIO_CHANGED") {
        setPreviewState((current) =>
          setDesignPreviewScenario(current, message.payload.scenario)
        );
      } else if (message.type === "ERROR") {
        setPreviewAlert({
          id: "design-preview",
          heading: t("common.alerts.previewUnavailable"),
          message: t("settingsDcp.preview.storefront.errors.notReady"),
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [t]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "INITIALIZE",
      payload: initializePayloadRef.current,
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [isFrameReady]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "UPDATE_DESIGN",
      payload: { designCss },
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [designCss, isFrameReady]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_TEMPLATE",
      payload: {
        bundleType: previewState.bundleType,
        templateKey: previewState.templateKey,
      },
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [isFrameReady, previewState.bundleType, previewState.templateKey]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_VIEWPORT",
      payload: { viewport: previewState.viewport },
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [isFrameReady, previewState.viewport]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_AREA",
      payload: {
        area: previewState.area,
        areaLabel: t("settingsDcp.preview.focusLabel", {
          context: t(`settingsDcp.preview.areaSelector.${previewState.area}`),
        }),
      },
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [isFrameReady, previewState.area, t]);

  useEffect(() => {
    if (!isFrameReady) return;
    const command: StorefrontPreviewCommand = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "SET_SCENARIO",
      payload: { scenario: previewState.scenario },
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      command,
      window.location.origin
    );
  }, [isFrameReady, previewState.scenario]);

  useLayoutEffect(() => {
    const stage = previewStageRef.current;
    const canvas = previewCanvasRef.current;
    const scaledShell = previewScaledShellRef.current;
    if (
      !stage ||
      !canvas ||
      !scaledShell ||
      typeof ResizeObserver === "undefined"
    )
      return;

    let animationFrame = 0;
    let latestSize = { width: stage.clientWidth, height: stage.clientHeight };

    const applyLatestFit = () => {
      animationFrame = 0;
      const presentation = getDesignPreviewFitPresentation(
        latestSize,
        previewState.viewport
      );
      canvas.style.width = `${presentation.canvasWidth}px`;
      canvas.style.height = `${presentation.canvasHeight}px`;
      scaledShell.style.transform = `scale(${presentation.scale})`;
    };

    const scheduleFit = (size: { width: number; height: number }) => {
      latestSize = size;
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(applyLatestFit);
    };

    scheduleFit(latestSize);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      scheduleFit({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
    };
  }, [previewState.viewport]);

  return (
    <section
      className={styles.previewPanel}
      aria-label={translateAdmin("adminAttributes.liveBundlePreview")}
    >
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
              const bundleType = (event.target as HTMLSelectElement)
                .value as BundleContractType;
              setPreviewState((current) =>
                setDesignPreviewBundleType(current, bundleType)
              );
            }}
          >
            <s-option value="full_page">
              {t("settingsDcp.preview.bundleType.landingPage")}
            </s-option>
            <s-option value="product_page">
              {t("settingsDcp.preview.bundleType.productPage")}
            </s-option>
          </s-select>
          <s-select
            label={t("settingsDcp.preview.templateLabel")}
            value={previewState.templateKey}
            onChange={(event: Event) => {
              const templateKey = (event.target as HTMLSelectElement)
                .value as TemplateKey;
              setPreviewState((current) =>
                setDesignPreviewTemplate(current, templateKey)
              );
            }}
          >
            {availableTemplates.map((template) => (
              <s-option key={template.key} value={template.key}>
                {t(template.translationKey)}
              </s-option>
            ))}
          </s-select>
          <s-select
            label={t("settingsDcp.preview.areaSelector.label")}
            value={previewState.area}
            onChange={(event: Event) => {
              const area = (event.target as HTMLSelectElement)
                .value as DesignPreviewArea;
              setPreviewState((current) => setDesignPreviewArea(current, area));
            }}
          >
            {supportedAreas.map((area) => (
              <s-option key={area} value={area}>
                {t(`settingsDcp.preview.areaSelector.${area}`)}
              </s-option>
            ))}
          </s-select>
          <s-select
            label={t("settingsDcp.preview.stateSelector.label")}
            value={previewState.scenario}
            onChange={(event: Event) => {
              const scenario = (event.target as HTMLSelectElement)
                .value as DesignPreviewScenario;
              setPreviewState((current) =>
                setDesignPreviewScenario(current, scenario)
              );
            }}
          >
            {supportedScenarios.map((scenario) => (
              <s-option key={scenario} value={scenario}>
                {t(`settingsDcp.preview.stateSelector.${scenario}`)}
              </s-option>
            ))}
          </s-select>
          <div
            className={styles.viewportButtons}
            aria-label={t("settingsDcp.preview.viewport.label")}
          >
            {(["desktop", "mobile"] as const).map((viewport) => {
              const isActive = previewState.viewport === viewport;
              const label = t(`settingsDcp.preview.viewport.${viewport}`);
              const tooltipId = `settings-design-preview-${viewport}-tooltip`;
              return (
                <span
                  key={viewport}
                  className={styles.viewportButton}
                  data-selected={isActive || undefined}
                >
                  <s-button
                    icon={viewport}
                    variant={isActive ? "primary" : "secondary"}
                    accessibilityLabel={label}
                    interestFor={tooltipId}
                    aria-pressed={isActive}
                    onClick={() =>
                      setPreviewState((current) =>
                        setDesignPreviewViewport(current, viewport)
                      )
                    }
                  />
                  <s-tooltip id={tooltipId}>{label}</s-tooltip>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <AdminTaskAlertBanner
        alert={previewAlert}
        onDismiss={() => setPreviewAlert(null)}
      />

      <div
        ref={previewStageRef}
        className={styles.previewStage}
        data-preview-viewport={previewState.viewport}
        aria-busy={!isFrameReady}
      >
        {!isFrameReady ? (
          <div className={styles.previewLoading} role="status">
            <div className={styles.previewLoadingIndicator}>
              <s-spinner
                size="large"
                accessibilityLabel={t("settingsDcp.preview.loading")}
              />
            </div>
          </div>
        ) : null}
        <div
          ref={previewCanvasRef}
          className={styles.previewCanvas}
          data-preview-ready={isFrameReady || undefined}
          style={{
            width: `${previewCanvasSize.width}px`,
            height: `${previewCanvasSize.height}px`,
          }}
        >
          <div
            ref={previewScaledShellRef}
            className={styles.previewScaledShell}
            data-preview-viewport={previewState.viewport}
            style={{
              width: `${previewCanvasSize.width}px`,
              height: `${previewCanvasSize.height}px`,
              transform: "scale(1)",
            }}
          >
            <div className={styles.desktopDevice}>
              <div className={styles.desktopDeviceFrame}>
                <div className={styles.mobileDevice}>
                  <div className={styles.mobileDeviceFrame}>
                    <div className={styles.mobileDeviceScreen}>
                      <div
                        className={styles.previewSurface}
                        data-template-key={previewState.templateKey}
                        data-preview-area={previewState.area}
                        data-preview-scenario={previewState.scenario}
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
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    className={styles.mobileDeviceStripe}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.mobileDeviceHeader}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.mobileDeviceSensors}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.mobileDeviceButtons}
                    aria-hidden="true"
                  />
                  <span
                    className={styles.mobileDevicePower}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <span className={styles.desktopDeviceStand} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
