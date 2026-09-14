import type { TemplateKey } from "../../../lib/bundle-config/template-selection";
import type {
  DesignPreviewArea,
  DesignPreviewAvailableSize,
  DesignPreviewContextFidelity,
  DesignPreviewScenario,
  DesignPreviewViewport,
} from "./design-preview-contract";

export const DESIGN_PREVIEW_VIEWPORTS: Readonly<
  Record<DesignPreviewViewport, { width: number; height: number }>
> = {
  desktop: { width: 1280, height: 1136 },
  mobile: { width: 390, height: 844 },
};

const DESIGN_PREVIEW_MOBILE_DEVICE_SIZE = { width: 428, height: 882 } as const;
const DESIGN_PREVIEW_DESKTOP_DEVICE_SIZE = { width: 1320, height: 920 } as const;

export function getDesignPreviewCanvasSize(viewport: DesignPreviewViewport) {
  return viewport === "mobile"
    ? DESIGN_PREVIEW_MOBILE_DEVICE_SIZE
    : DESIGN_PREVIEW_DESKTOP_DEVICE_SIZE;
}

export function calculateDesignPreviewFitScale(
  availableSize: DesignPreviewAvailableSize,
  viewport: DesignPreviewViewport
) {
  const logicalViewport = getDesignPreviewCanvasSize(viewport);
  const ratios = [
    Number.isFinite(availableSize.width) && availableSize.width > 0
      ? availableSize.width / logicalViewport.width
      : null,
    Number.isFinite(availableSize.height) && availableSize.height > 0
      ? availableSize.height / logicalViewport.height
      : null,
  ].filter((ratio): ratio is number => ratio !== null);

  if (ratios.length === 0) return 1;

  const fitScale = Math.min(...ratios);
  return viewport === "desktop" ? fitScale : Math.min(1, fitScale);
}

export function getDesignPreviewFitPresentation(
  availableSize: DesignPreviewAvailableSize,
  viewport: DesignPreviewViewport
) {
  const logicalCanvas = getDesignPreviewCanvasSize(viewport);
  const scale = calculateDesignPreviewFitScale(availableSize, viewport);

  return {
    scale,
    canvasWidth: logicalCanvas.width * scale,
    canvasHeight: logicalCanvas.height * scale,
  };
}

export function getDesignPreviewContextFidelity(
  _templateKey: TemplateKey,
  _context: DesignPreviewArea | DesignPreviewScenario
): DesignPreviewContextFidelity {
  return "storefront";
}
