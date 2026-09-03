import {
  createAdminTaskAlert,
  isPersistentAdminOperationError,
  showAdminTransientErrorToast,
} from "../../../app/lib/admin-alert-feedback";

describe("admin alert feedback", () => {
  it("normalizes a merchant-safe task alert", () => {
    expect(createAdminTaskAlert({
      id: "settings-preview",
      heading: " Preview unavailable ",
      message: " Try again. ",
    })).toEqual({
      id: "settings-preview",
      heading: "Preview unavailable",
      message: "Try again.",
    });
  });

  it.each([
    { id: "", heading: "Preview unavailable", message: "Try again." },
    { id: "preview", heading: " ", message: "Try again." },
    { id: "preview", heading: "Preview unavailable", message: " " },
  ])("does not fabricate missing alert copy", (input) => {
    expect(createAdminTaskAlert(input)).toBeNull();
  });
});

describe("showAdminTransientErrorToast", () => {
  it("shows a concise retryable operation failure as a Shopify error toast", () => {
    const show = jest.fn();

    showAdminTransientErrorToast({ toast: { show } }, "Preview unavailable");

    expect(show).toHaveBeenCalledWith("Preview unavailable", {
      isError: true,
      duration: 5000,
    });
  });

  it("does not fabricate missing toast copy", () => {
    const show = jest.fn();

    showAdminTransientErrorToast({ toast: { show } }, "   ");

    expect(show).not.toHaveBeenCalled();
  });
});

describe("isPersistentAdminOperationError", () => {
  it("treats a failed save as persistent while the form remains dirty", () => {
    expect(isPersistentAdminOperationError("saveBundle")).toBe(true);
  });

  it.each([
    "syncProduct",
    "syncBundle",
    "getThemeTemplates",
    "updateBundleProduct",
    null,
  ])("treats %s as a transient operation failure", (intent) => {
    expect(isPersistentAdminOperationError(intent)).toBe(false);
  });
});
