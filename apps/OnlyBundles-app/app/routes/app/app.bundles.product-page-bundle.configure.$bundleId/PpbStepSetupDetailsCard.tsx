import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbStep = PpbConfigureFlow["stepsState"]["steps"][number];

export type PpbStepSetupDetailsCardProps = Pick<
  PpbConfigureFlow,
  | "clearValidationError"
  | "cloneStep"
  | "deleteStep"
  | "markAsDirty"
  | "openStepMultiLanguageModal"
  | "shopLocales"
  | "stepsState"
  | "validationErrors"
> & {
  step: PpbStep;
  isFirstStep: boolean;
};

export function PpbStepSetupDetailsCard({
  clearValidationError,
  cloneStep,
  deleteStep,
  isFirstStep,
  markAsDirty,
  openStepMultiLanguageModal,
  shopLocales,
  step,
  stepsState,
  validationErrors = {},
}: PpbStepSetupDetailsCardProps) {
  const translationsTooltipId = `ppb-step-${step.id}-translations-tooltip`;
  const cloneTooltipId = `ppb-step-${step.id}-clone-tooltip`;
  const deleteTooltipId = `ppb-step-${step.id}-delete-tooltip`;
  const translationsLabel = translateAdmin(
    "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
  );
  const cloneLabel = translateAdmin("adminAttributes.cloneCurrentStep");
  const deleteLabel =
    stepsState.steps.length <= 1
      ? "At least one step is required"
      : "Delete current step";

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
          <s-tooltip id={translationsTooltipId}>{translationsLabel}</s-tooltip>
          <s-button
            variant="tertiary"
            icon="language-translate"
            accessibilityLabel={translationsLabel}
            interestFor={translationsTooltipId}
            disabled={shopLocales.length === 0 || undefined}
            onClick={() => openStepMultiLanguageModal(step.id)}
          />
          <s-tooltip id={cloneTooltipId}>{cloneLabel}</s-tooltip>
          <s-button
            variant="tertiary"
            icon="duplicate"
            accessibilityLabel={cloneLabel}
            interestFor={cloneTooltipId}
            onClick={() => cloneStep(step.id)}
          />
          <s-tooltip id={deleteTooltipId}>{deleteLabel}</s-tooltip>
          <s-button
            variant="tertiary"
            icon="delete"
            tone="critical"
            accessibilityLabel={translateAdmin(
              "adminAttributes.deleteCurrentStep"
            )}
            interestFor={deleteTooltipId}
            disabled={stepsState.steps.length <= 1 || undefined}
            onClick={() => deleteStep(step.id)}
          />
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
        </s-stack>
      </div>
    </div>
  );
}
