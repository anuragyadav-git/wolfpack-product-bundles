import { getProductPageModalValidationToastOptions } from "../../../app/assets/widgets/product-page/methods/modal-state-methods.js";
import { ToastManager } from "../../../app/assets/widgets/shared/toast-manager.js";

describe("PPB modal validation toast placement", () => {
  it("keeps validation feedback body-mounted and dismissible", () => {
    expect(getProductPageModalValidationToastOptions()).toEqual({
      dismissible: true,
      dismissButton: true,
      className: "bundle-toast--modal",
      role: "alert",
    });
  });

  it("renders a keyboard-operable named dismiss control", () => {
    const attributes = new Map<string, string>();
    const closeControl = { addEventListener: jest.fn() };
    const toast = {
      id: "",
      className: "",
      classList: { add: jest.fn() },
      innerHTML: "",
      parentNode: null,
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      querySelector: (selector: string) => selector === ".toast-close" ? closeControl : null,
      remove: jest.fn(),
    };
    const originalDocument = global.document;
    const originalGetComputedStyle = global.getComputedStyle;
    global.document = {
      getElementById: () => null,
      createElement: () => toast,
      body: { appendChild: jest.fn() },
      documentElement: {},
    } as unknown as Document;
    global.getComputedStyle = (() => ({ getPropertyValue: () => "" })) as unknown as typeof getComputedStyle;

    try {
      ToastManager.show("Validation message", 0, getProductPageModalValidationToastOptions());
    } finally {
      global.document = originalDocument;
      global.getComputedStyle = originalGetComputedStyle;
    }

    expect(attributes.get("role")).toBe("alert");
    expect(toast.innerHTML).toContain('<button type="button" class="toast-close" aria-label="Close">');
    expect(closeControl.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
  });
});
