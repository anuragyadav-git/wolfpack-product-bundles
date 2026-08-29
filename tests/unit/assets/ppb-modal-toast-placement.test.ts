import { getProductPageModalValidationToastOptions } from "../../../app/assets/widgets/product-page/methods/modal-state-methods.js";
import { ToastManager } from "../../../app/assets/widgets/shared/toast-manager.js";
import { JSDOM } from "jsdom";

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
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const originalDocument = global.document;
    const originalGetComputedStyle = global.getComputedStyle;
    global.document = runtimeDocument;
    global.getComputedStyle = (() => ({ getPropertyValue: () => "" })) as unknown as typeof getComputedStyle;

    try {
      ToastManager.show("Validation message", 0, getProductPageModalValidationToastOptions());
    } finally {
      global.document = originalDocument;
      global.getComputedStyle = originalGetComputedStyle;
    }

    const toast = runtimeDocument.getElementById('bundle-toast');
    const closeControl = toast?.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    expect(toast?.getAttribute("role")).toBe("alert");
    expect(closeControl?.type).toBe('button');
    expect(closeControl).not.toBeNull();
  });
});
