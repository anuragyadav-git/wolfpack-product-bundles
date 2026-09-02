import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbStepSetupDetailsCard({
  step,
  isFirstStep,
}: {
  step: any;
  isFirstStep: boolean;
}) {
  const {
    cloneStep,
    deleteStep,
    markAsDirty,
    openStepMultiLanguageModal,
    productPageBundleStyles,
    shopLocales,
    stepsState,
    validationErrors = {},
    clearValidationError,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.stepSetupDetails}>
      <div className={productPageBundleStyles.stepSetupHeader}>
        <div className={productPageBundleStyles.stepSetupTitleGroup}>
          <h3 className={productPageBundleStyles.stepSetupTitle}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupdetailscard.stepSetup"
            )}
          </h3>
          <s-switch
            accessibilityLabel={translateAdmin("adminAttributes.enableStep")}
            checked={isFirstStep || step.enabled !== false || undefined}
            disabled={isFirstStep || undefined}
            onChange={(event) => {
              stepsState.updateStepField(
                step.id,
                "enabled",
                (event.target as HTMLInputElement).checked
              );
              markAsDirty();
            }}
          />
        </div>
        <div className={productPageBundleStyles.stepSetupActions}>
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
              disabled={shopLocales.length === 0 || undefined}
              onClick={() => openStepMultiLanguageModal(step.id)}
            />
          </span>
          <span title={translateAdmin("adminAttributes.cloneCurrentStep")}>
            <s-button
              variant="tertiary"
              icon="duplicate"
              accessibilityLabel={translateAdmin(
                "adminAttributes.cloneCurrentStep"
              )}
              onClick={() => cloneStep(step.id)}
            />
          </span>
          <span
            title={
              stepsState.steps.length <= 1
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
              disabled={stepsState.steps.length <= 1 || undefined}
              onClick={() => deleteStep(step.id)}
            />
          </span>
        </div>
      </div>
      <div
        className={
          step.enabled === false && !isFirstStep
            ? productPageBundleStyles.stepDisabledContent
            : undefined
        }
        inert={step.enabled === false && !isFirstStep ? "" : undefined}
      >
        <p className={productPageBundleStyles.stepSetupDescription}>
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
            onInput={(event) => {
              stepsState.updateStepField(
                step.id,
                "name",
                (event.target as HTMLInputElement).value
              );
              markAsDirty();
              clearValidationError(`steps.${step.id}.name`);
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
