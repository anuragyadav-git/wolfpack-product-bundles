export {};

describe("FPB product modal read-only quick view", () => {
  function createClassList() {
    const classes = new Set<string>();
    return {
      add: (className: string) => classes.add(className),
      remove: (className: string) => classes.delete(className),
      contains: (className: string) => classes.has(className),
    };
  }

  function createStyleDeclaration() {
    const values = new Map<string, string>();
    return {
      setProperty: (name: string, value: string) => values.set(name, value),
      removeProperty: (name: string) => values.delete(name),
    };
  }

  beforeEach(() => {
    jest.resetModules();
    const bodyClassList = createClassList();
    const rootClassList = createClassList();
    (globalThis as any).window = {
      scrollY: 240,
      scrollBy: (_x: number, y: number) => {
        if (!rootClassList.contains("modal-open")) {
          (globalThis as any).window.scrollY += y;
        }
      },
    };
    (globalThis as any).document = {
      body: {
        classList: bodyClassList as any,
        style: createStyleDeclaration(),
        scrollTop: 240,
      },
      documentElement: {
        classList: rootClassList as any,
        scrollTop: 240,
      },
    };
  });

  function buildWidget() {
    return {
      selectedBundle: {
        steps: [{ id: "step-1" }],
      },
      updateProductSelection: jest.fn(),
      formatPrice: (price: number) => `$${(price / 100).toFixed(2)}`,
    };
  }

  async function createModal(widget: ReturnType<typeof buildWidget>) {
    const { BundleProductModal: Modal } = await import("../../../app/assets/bundle-modal-component.js");
    class TestModal extends Modal {
      init() {
        this.modalElement = {
          classList: createClassList(),
          dataset: {},
          querySelector: () => null,
        };
      }

      populateModal() {}

      showSuccessFeedback() {}
    }

    return new TestModal(widget);
  }

  async function createModalForPopulate(widget: ReturnType<typeof buildWidget>) {
    const { BundleProductModal: Modal } = await import("../../../app/assets/bundle-modal-component.js");
    const elements: Record<string, any> = {
      "modal-product-title": { textContent: "" },
      "modal-product-description": { textContent: "", innerHTML: "" },
      "modal-qty-display": { textContent: "" },
    };
    (globalThis as typeof globalThis & { document: any }).document = {
      body: {
        classList: createClassList(),
        style: createStyleDeclaration(),
        scrollTop: 0,
      },
      documentElement: {
        classList: createClassList(),
        scrollTop: 0,
      },
      getElementById: (id: string) => elements[id] ?? null,
    };

    class TestModal extends Modal {
      init() {
        this.modalElement = {
          classList: createClassList(),
          dataset: {},
          querySelector: () => null,
        };
      }

      loadImage() {}

      createVariantSelectors() {}

      updatePrice() {}

      updateReadOnlyState() {}
    }

    return { modal: new TestModal(widget), elements };
  }

  const product = {
    id: "product-1",
    variantId: "variant-1",
    title: "Detail product",
    imageUrl: "https://cdn.example/product.png",
    price: 1000,
    available: true,
    variants: [
      {
        id: "variant-1",
        variantId: "variant-1",
        title: "Default Title",
        price: 1000,
        available: true,
      },
    ],
  };

  it("does not mutate selection when a read-only quick view add path is invoked", async () => {
    const widget = buildWidget();
    const modal = await createModal(widget);

    modal.open(product, { id: "step-1" }, { readOnly: true });
    modal.addToBundle();

    expect(widget.updateProductSelection).not.toHaveBeenCalled();
    const isActive = modal.modalElement.classList.contains("active");
    expect(isActive).toBe(true);
  });

  it("keeps the existing actionable modal add path available", async () => {
    const widget = buildWidget();
    const modal = await createModal(widget);

    modal.open(product, { id: "step-1" });
    modal.addToBundle();

    expect(widget.updateProductSelection).toHaveBeenCalledWith(0, "variant-1", 1);
    const isActive = modal.modalElement.classList.contains("active");
    expect(isActive).toBe(false);
  });

  it("prevents the storefront behind the product modal from scrolling", async () => {
    const widget = buildWidget();
    const modal = await createModal(widget);

    modal.open(product, { id: "step-1" }, { readOnly: true });
    window.scrollBy(0, 100);

    expect(window.scrollY).toBe(240);

    modal.close();
    window.scrollBy(0, 100);

    expect(window.scrollY).toBe(340);
  });

  it("renders Shopify product descriptionHtml as modal HTML", async () => {
    const widget = buildWidget();
    const { modal, elements } = await createModalForPopulate(widget);

    modal.currentProduct = {
      ...product,
      description: "Soft cotton product description.",
      descriptionHtml: "<p>Soft <strong>cotton</strong> product description.</p>",
    };
    modal.selectedQuantity = 1;
    modal.populateModal();

    expect(elements["modal-product-description"].innerHTML).toBe(
      "<p>Soft <strong>cotton</strong> product description.</p>",
    );
    expect(elements["modal-product-description"].textContent).toBe("");
  });

  it("renders plain product descriptions as text when descriptionHtml is missing", async () => {
    const widget = buildWidget();
    const { modal, elements } = await createModalForPopulate(widget);

    modal.currentProduct = {
      ...product,
      description: "Plain <strong>text</strong> fallback.",
    };
    modal.selectedQuantity = 1;
    modal.populateModal();

    expect(elements["modal-product-description"].textContent).toBe(
      "Plain <strong>text</strong> fallback.",
    );
    expect(elements["modal-product-description"].innerHTML).toBe("");
  });

  it("shows and cycles carousel navigation for multiple distinct product images", async () => {
    const { BundleProductModal: Modal } = await import("../../../app/assets/bundle-modal-component.js");
    const mainImage = { src: "", alt: "" };
    const imageFrame = { classList: { toggle: jest.fn() } };
    const navButtons = [{ hidden: true }, { hidden: true }];
    (globalThis as typeof globalThis & { document: any }).document = {
      getElementById: (id: string) => id === "modal-main-image" ? mainImage : null,
    };

    class TestModal extends Modal {
      init() {
        this.modalElement = {
          querySelector: () => imageFrame,
          querySelectorAll: () => navButtons,
        };
      }
    }

    const modal = new TestModal(buildWidget());
    modal.currentProduct = {
      ...product,
      images: [
        { src: "https://cdn.example/product.png" },
        { src: "https://cdn.example/detail.png" },
      ],
    };
    modal.loadImage();

    expect(navButtons.every((button) => button.hidden === false)).toBe(true);
    expect(mainImage.src).toBe("https://cdn.example/product.png");

    modal.showAdjacentImage(1);
    expect(mainImage.src).toBe("https://cdn.example/detail.png");

    modal.showAdjacentImage(1);
    expect(mainImage.src).toBe("https://cdn.example/product.png");
  });

  it("maps intentional horizontal image swipes to carousel direction", async () => {
    const { getProductCarouselSwipeDirection } = await import("../../../app/assets/bundle-modal-component.js");

    expect(getProductCarouselSwipeDirection({ distanceX: -64, distanceY: 8 })).toBe(1);
    expect(getProductCarouselSwipeDirection({ distanceX: 64, distanceY: 8 })).toBe(-1);
    expect(getProductCarouselSwipeDirection({ distanceX: 20, distanceY: 2 })).toBe(0);
    expect(getProductCarouselSwipeDirection({ distanceX: -64, distanceY: 80 })).toBe(0);
  });

  it("clears stale variant summary when opening a single-variant product", async () => {
    const { BundleModalVariantMethods } = await import("../../../app/assets/widgets/full-page/modal/variant-methods.js");
    const elements: Record<string, any> = {
      "modal-variants-container": {
        innerHTML: "<button>Old variant</button>",
        querySelectorAll: jest.fn(() => []),
      },
      "modal-selection-summary": {
        style: { display: "flex" },
        hidden: false,
      },
      "modal-selection-text": {
        textContent: "Blue / Medium",
      },
    };
    (globalThis as typeof globalThis & { document: any }).document = {
      getElementById: (id: string) => elements[id] ?? null,
    };
    const modal: any = {
      currentProduct: {
        id: "product-2",
        title: "Single variant product",
        variants: [{ id: "variant-2", title: "Default Title" }],
      },
      selectedOptions: { 0: "Blue", 1: "Medium" },
      selectedVariant: { id: "old-variant" },
      ...BundleModalVariantMethods,
    };

    modal.createVariantSelectors();

    expect(elements["modal-variants-container"].innerHTML).toBe("");
    expect(elements["modal-selection-summary"].hidden).toBe(true);
    expect(elements["modal-selection-text"].textContent).toBe("");
    expect(modal.selectedOptions).toEqual({});
    expect(modal.selectedVariant).toEqual({ id: "variant-2", title: "Default Title" });
  });
});
