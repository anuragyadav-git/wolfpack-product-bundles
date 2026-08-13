import { useCallback, useMemo, useState } from "react";
import {
  getConfigureFieldErrorMap,
  submitValidBundleConfigureForm,
  type BundleConfigureKind,
  type ConfigureValidationIssue,
} from "../../../../lib/bundle-config/configure-validation";

function sectionForPath(path: string): string {
  if (path.startsWith("subscriptions.")) return "subscriptions";
  if (path.startsWith("discount.")) return "discount_pricing";
  if (path.startsWith("settings.")) return "bundle_settings";
  if (path.startsWith("widget.")) return "bundle_widget";
  if (path.startsWith("embed.")) return "bundle_embed";
  if (path.startsWith("addons.")) return "free_gift_addons";
  return "step_setup";
}

export function useConfigureValidation({
  kind,
  setActiveSection,
  revealIssue,
}: {
  kind: BundleConfigureKind;
  setActiveSection: (section: string) => void;
  revealIssue?: (issue: ConfigureValidationIssue) => void;
}) {
  const [validationIssues, setValidationIssues] = useState<
    ConfigureValidationIssue[]
  >([]);
  const validationErrors = useMemo(
    () => getConfigureFieldErrorMap(validationIssues),
    [validationIssues],
  );

  const focusIssue = useCallback(
    (firstIssue: ConfigureValidationIssue | undefined) => {
      if (!firstIssue) return;
      setActiveSection(firstIssue.section);
      revealIssue?.(firstIssue);
      window.setTimeout(() => {
        const target = document.getElementById(firstIssue.controlId ?? "") ||
          document.querySelector<HTMLElement>(
            `[data-validation-path="${CSS.escape(firstIssue.path)}"]`,
          );
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus?.();
      }, 50);
    },
    [revealIssue, setActiveSection],
  );

  const validateConfigureForm = useCallback(
    (formData: FormData, submit?: (validFormData: FormData) => void) => {
      const issues = submitValidBundleConfigureForm(
        formData,
        kind,
        submit ?? (() => {}),
      );
      setValidationIssues(issues);
      focusIssue(issues[0]);
      return issues.length === 0;
    },
    [focusIssue, kind],
  );

  const setServerFieldErrors = useCallback(
    (fieldErrors: Array<{ path: string; message: string }>) => {
      const issues = fieldErrors.map(({ path, message }) => ({
        path,
        message,
        section: sectionForPath(path),
        controlId: `configure-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
      }));
      setValidationIssues(issues);
      focusIssue(issues[0]);
    },
    [focusIssue],
  );

  const clearValidationError = useCallback((path: string) => {
    setValidationIssues((current) =>
      current.filter((currentIssue) => currentIssue.path !== path),
    );
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationIssues([]);
  }, []);

  return {
    clearValidationError,
    clearValidationErrors,
    setServerFieldErrors,
    validateConfigureForm,
    validationErrors,
    validationIssues,
  };
}
