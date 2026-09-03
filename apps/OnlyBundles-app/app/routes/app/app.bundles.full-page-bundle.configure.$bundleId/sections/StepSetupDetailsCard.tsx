import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbStepSetupDetailsCard({
  flow,
  step,
  isFirstStep,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
  isFirstStep: boolean;
}) {
  const {
    cloneStep,
    deleteStep,
    fullPageBundleStyles,
    markAsDirty,
    openStepMultiLanguageModal,
    shopLocales,
    stepsState,
    validationErrors = {},
    clearValidationError,
  } = flow;

  return (
    <div className={fullPageBundleStyles.stepSetupDetails}>
      <div className={fullPageBundleStyles.stepSetupHeader}>
        <div className={fullPageBundleStyles.stepSetupTitleGroup}>
          <h3 className={fullPageBundleStyles.stepSetupTitle}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupdetailscard.stepSetup"
            )}
          </h3>
          <s-switch
            accessibilityLabel={translateAdmin("adminAttributes.enableStep")}
            checked={isFirstStep || step.enabled !== false || undefined}
            disabled={isFirstStep || undefined}
            onChange={(e) => {
              stepsState.updateStepField(
                step.id,
                "enabled",
                (e.target as HTMLInputElement).checked
              );
              markAsDirty();
            }}
          />
        </div>
        <div className={fullPageBundleStyles.stepSetupActions}>
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
            ? fullPageBundleStyles.stepDisabledContent
            : undefined
        }
        inert={step.enabled === false && !isFirstStep ? "" : undefined}
      >
        <p className={fullPageBundleStyles.stepSetupDescription}>
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
              stepsState.updateStepField(
                step.id,
                "name",
                (e.target as HTMLInputElement).value
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
