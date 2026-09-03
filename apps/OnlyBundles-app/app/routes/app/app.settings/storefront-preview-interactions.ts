type ProductPickerController = {
  openModal?: (stepIndex: number, originFocusElement?: HTMLElement) => void;
  setBottomSheetVisibility?: (isOpen: boolean) => void;
  elements?: {
    modal?: HTMLElement;
    bsOverlay?: HTMLElement;
  };
};

type StorefrontPreviewRendererState = {
  bundleType: string;
  templateKey: string;
};

type LoadingPreviewController = {
  showLoadingOverlay?: (gifUrl: null, options: { bootstrap: true }) => unknown;
  hideLoadingOverlay?: (...args: unknown[]) => unknown;
};

type LoadingPreviewState = {
  persistent: boolean;
  hide: ((...args: unknown[]) => unknown) | undefined;
};

const loadingPreviewStates = new WeakMap<object, LoadingPreviewState>();

export function getStorefrontPreviewRendererKey(
  state: StorefrontPreviewRendererState | null | undefined,
  resetVersion: number,
) {
  return `${state?.bundleType ?? "pending"}:${state?.templateKey ?? "pending"}:${resetVersion}`;
}

export function setStorefrontPreviewLoadingPersistent(
  controller: LoadingPreviewController,
  persistent: boolean,
) {
  let previewState = loadingPreviewStates.get(controller);
  if (!previewState) {
    previewState = {
      persistent: false,
      hide: controller.hideLoadingOverlay?.bind(controller),
    };
    loadingPreviewStates.set(controller, previewState);
    controller.hideLoadingOverlay = (...args: unknown[]) => {
      if (previewState?.persistent) return;
      return previewState?.hide?.(...args);
    };
  }

  const wasPersistent = previewState.persistent;
  previewState.persistent = persistent;
  if (persistent) {
    if (!wasPersistent) controller.showLoadingOverlay?.(null, { bootstrap: true });
    return;
  }
  previewState.hide?.();
}

export function createStorefrontPreviewOverlayHost(documentRef: Document) {
  const host = documentRef.createElement("div");
  documentRef.body.append(host);
  return {
    host,
    cleanup: () => host.remove(),
  };
}

export function mountStorefrontPreviewOverlays(
  controller: Pick<ProductPickerController, "elements">,
  host: HTMLElement,
) {
  const overlay = controller.elements?.bsOverlay;
  const modal = controller.elements?.modal;
  if (overlay) host.append(overlay);
  if (modal) host.append(modal);
}

function exposeRenderedProductPicker(controller: ProductPickerController) {
  const modal = controller.elements?.modal;
  if (!modal) return;

  modal.hidden = false;
  modal.removeAttribute("aria-hidden");
  modal.removeAttribute("inert");
  modal.style.removeProperty("display");
  modal.classList.add("bw-bs-panel--open");
  controller.elements?.bsOverlay?.classList.add("bw-bs-overlay--open");
}

export function openStorefrontPreviewProductPicker(
  controller: ProductPickerController,
  widgetRoot: HTMLElement,
) {
  const renderedTrigger = widgetRoot.querySelector<HTMLElement>(
    ".bw-slot-card--empty[data-step-index]",
  );

  if (renderedTrigger) {
    const stepIndex = Number(renderedTrigger.dataset.stepIndex);
    controller.openModal?.(Number.isFinite(stepIndex) ? stepIndex : 0, renderedTrigger);
    controller.setBottomSheetVisibility?.(true);
    exposeRenderedProductPicker(controller);
    return true;
  }

  controller.openModal?.(0);
  controller.setBottomSheetVisibility?.(true);
  exposeRenderedProductPicker(controller);
  return false;
}
