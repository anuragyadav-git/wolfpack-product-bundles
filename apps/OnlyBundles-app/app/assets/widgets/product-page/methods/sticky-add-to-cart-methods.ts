type StickyAddToCartConfig = {
  enabled?: boolean;
  showDesktop?: boolean;
  showMobile?: boolean;
  action?: string;
};

export function shouldMountStickyAddToCart(
  config: StickyAddToCartConfig | null | undefined,
  isMobile: boolean,
) {
  if (config?.enabled !== true) return false;
  return isMobile
    ? config.showMobile !== false
    : config.showDesktop !== false;
}

export function resolveStickyAddToCartIntent(
  action: string | null | undefined,
  primaryDisabled: boolean,
) {
  return action === "add_selected_offer" && !primaryDisabled
    ? "delegate"
    : "scroll";
}

function findFirstIncompleteStepIndex(widget: any) {
  const steps = Array.isArray(widget.selectedBundle?.steps)
    ? widget.selectedBundle.steps
    : [];

  return steps.findIndex((step: any, stepIndex: number) => {
    if (step?.isDefault || step?.isFreeGift) return false;
    return widget.validateStep?.(stepIndex) !== true;
  });
}

function focusFirstIncompleteControl(widget: any) {
  const stepIndex = findFirstIncompleteStepIndex(widget);
  if (stepIndex >= 0 && widget._usesCascadeStepFlow?.() === true) {
    widget.currentStepIndex = stepIndex;
    widget.renderSteps?.();
    widget.renderFooter?.();
    widget.updateAddToCartButton?.();
  }

  const selector = stepIndex >= 0
    ? `[data-step-index="${stepIndex}"]`
    : null;
  const target =
    (selector && widget.elements?.stepsContainer?.querySelector?.(selector)) ||
    widget.elements?.stepsContainer ||
    widget.container ||
    widget.elements?.addToCartButton;

  if (!target) return;
  target.scrollIntoView?.({ behavior: "smooth", block: "center" });
  target.focus?.({ preventScroll: true });
}

export const ProductPageStickyAddToCartMethods: Record<string, any> &
  ThisType<any> = {
  setupStickyAddToCart() {
    const config = this.selectedBundle?.stickyAddToCart;
    const runtimeWindow = typeof window === "undefined" ? null : window;
    const runtimeDocument = typeof document === "undefined" ? null : document;
    const primary = this.elements?.addToCartButton;
    if (!runtimeWindow || !runtimeDocument || !primary) return;

    const isMobile =
      runtimeWindow.matchMedia?.("(max-width: 749px)").matches === true;
    if (!shouldMountStickyAddToCart(config, isMobile)) return;

    runtimeDocument
      .querySelector?.("[data-wpb-sticky-add-to-cart]")
      ?.remove?.();

    const surface = runtimeDocument.createElement("div");
    surface.className = "wpb-ppb-sticky-add-to-cart";
    surface.setAttribute("data-wpb-sticky-add-to-cart", "");
    surface.hidden = typeof runtimeWindow.IntersectionObserver === "function";

    const button = runtimeDocument.createElement("button");
    button.type = "button";
    button.className = "wpb-ppb-sticky-add-to-cart__button";
    surface.appendChild(button);
    runtimeDocument.body.appendChild(surface);

    const syncButton = () => {
      const label = primary.textContent?.trim() || "";
      button.textContent = label;
      if (label) {
        button.setAttribute("aria-label", label);
      } else {
        button.removeAttribute("aria-label");
      }
    };
    syncButton();

    if (typeof runtimeWindow.MutationObserver === "function") {
      this._stickyAddToCartMutationObserver = new runtimeWindow.MutationObserver(
        syncButton,
      );
      this._stickyAddToCartMutationObserver.observe(primary, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    if (typeof runtimeWindow.IntersectionObserver === "function") {
      this._stickyAddToCartIntersectionObserver =
        new runtimeWindow.IntersectionObserver((entries: IntersectionObserverEntry[]) => {
          surface.hidden = entries[0]?.isIntersecting !== false;
        });
      this._stickyAddToCartIntersectionObserver.observe(primary);
    }

    button.addEventListener("click", () => {
      const intent = resolveStickyAddToCartIntent(
        config?.action,
        primary.disabled === true,
      );
      if (intent === "delegate") {
        primary.click();
        return;
      }
      focusFirstIncompleteControl(this);
    });

    this.elements.stickyAddToCart = surface;
    this.elements.stickyAddToCartButton = button;
  },
};
