import { usePpbConfigureContext } from "./PpbConfigureContext";

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
    stepsState,
    validationErrors = {},
    clearValidationError,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.stepSetupDetails}>
      <div className={productPageBundleStyles.stepSetupHeader}>
        <div className={productPageBundleStyles.stepSetupTitleGroup}>
          <h3 className={productPageBundleStyles.stepSetupTitle}>Step Setup</h3>
          <s-switch
            accessibilityLabel="Enable step"
            checked={isFirstStep || step.enabled !== false || undefined}
            disabled={isFirstStep || undefined}
            onChange={(event) => {
              stepsState.updateStepField(
                step.id,
                "enabled",
                (event.target as HTMLInputElement).checked,
              );
              markAsDirty();
            }}
          />
        </div>
        <div className={productPageBundleStyles.stepSetupActions}>
          <span title="Multi Language">
            <s-button
              variant="tertiary"
              icon="language-translate"
              accessibilityLabel="Multi Language"
              onClick={() => openStepMultiLanguageModal(step.id)}
            />
          </span>
          <span title="Clone current step">
            <s-button
              variant="tertiary"
              icon="duplicate"
              accessibilityLabel="Clone current step"
              onClick={() => cloneStep(step.id)}
            />
          </span>
          <span title="Delete current step">
            <s-button
              variant="tertiary"
              icon="delete"
              tone="critical"
              accessibilityLabel="Delete current step"
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
          Edit your step name (Only visible if more than one step is present)
        </p>
        <s-stack direction="block" gap="small">
          <s-text-field
            id={`configure-steps-${step.id}-name`}
            label="Step Name"
            required
            error={validationErrors[`steps.${step.id}.name`]}
            placeholder="Eg:- Add product"
            value={step.name ?? ""}
            onInput={(event) => {
              stepsState.updateStepField(
                step.id,
                "name",
                (event.target as HTMLInputElement).value,
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
