import { translateAdmin } from "~/i18n/config";

export function FpbStepSetupDetailsCard({
  styles,
  step,
  isFirstStep,
  stepCount,
  translationsDisabled,
  validationErrors = {},
  onClearValidationError,
  onClone,
  onDelete,
  onEnabledChange,
  onNameChange,
  onOpenTranslations,
}: {
  styles: Record<string, string>;
  step: any;
  isFirstStep: boolean;
  stepCount: number;
  translationsDisabled: boolean;
  validationErrors?: Record<string, string>;
  onClearValidationError: (path: string) => void;
  onClone: () => void;
  onDelete: () => void;
  onEnabledChange: (enabled: boolean) => void;
  onNameChange: (name: string) => void;
  onOpenTranslations: () => void;
}) {
  return (
    <div className={styles.stepSetupDetails}>
      <div className={styles.stepSetupHeader}>
        <div className={styles.stepSetupTitleGroup}>
          <h3 className={styles.stepSetupTitle}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupdetailscard.stepSetup"
            )}
          </h3>
          <s-switch
            accessibilityLabel={translateAdmin("adminAttributes.enableStep")}
            checked={isFirstStep || step.enabled !== false || undefined}
            disabled={isFirstStep || undefined}
            onChange={(e) => {
              onEnabledChange((e.target as HTMLInputElement).checked);
            }}
          />
        </div>
        <div className={styles.stepSetupActions}>
          <span
            title={translateAdmin(
              "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
            )}
          >
            <s-button
              variant="tertiary"
              icon="language-translate"
              accessibilityLabel={translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
              disabled={translationsDisabled || undefined}
              onClick={onOpenTranslations}
            />
          </span>
          <span title={translateAdmin("adminAttributes.cloneCurrentStep")}>
            <s-button
              variant="tertiary"
              icon="duplicate"
              accessibilityLabel={translateAdmin(
                "adminAttributes.cloneCurrentStep"
              )}
              onClick={onClone}
            />
          </span>
          <span
            title={
              stepCount <= 1
                ? "At least one step is required"
                : "Delete current step"
            }
          >
            <s-button
              variant="tertiary"
              icon="delete"
              tone="critical"
              accessibilityLabel={translateAdmin(
                "adminAttributes.deleteCurrentStep"
              )}
              disabled={stepCount <= 1 || undefined}
              onClick={onDelete}
            />
          </span>
        </div>
      </div>
      <div
        className={
          step.enabled === false && !isFirstStep
            ? styles.stepDisabledContent
            : undefined
        }
        inert={step.enabled === false && !isFirstStep ? "" : undefined}
      >
        <p className={styles.stepSetupDescription}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupdetailscard.editYourStepNameOnlyVisibleIfMoreThanOneStepIsPresent"
          )}
        </p>
        <s-stack direction="block" gap="small">
          <s-text-field
            id={`configure-steps-${step.id}-name`}
            label={translateAdmin("adminAttributes.stepName")}
            required
            error={validationErrors[`steps.${step.id}.name`]}
            placeholder={translateAdmin("adminAttributes.egAddProduct")}
            value={step.name ?? ""}
            onInput={(e) => {
              onNameChange((e.target as HTMLInputElement).value);
              onClearValidationError(`steps.${step.id}.name`);
            }}
            autocomplete="off"
          />
          {validationErrors[`steps.${step.id}.resources`] && (
            <s-text id={`configure-steps-${step.id}-resources`} tone="critical">
              {validationErrors[`steps.${step.id}.resources`]}
            </s-text>
          )}
        </s-stack>
      </div>
    </div>
  );
}
