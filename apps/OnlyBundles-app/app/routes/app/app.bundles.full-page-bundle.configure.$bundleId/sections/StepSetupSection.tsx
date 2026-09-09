import type { ComponentProps } from "react";
import type { CommonStepCategoryAccordionAdapter } from "../../_shared/bundle-configure/CommonStepCategoryAccordion";
import { FpbStepCategoryCard } from "./StepSetupCategoryCard";
import { FpbStepConfigCard } from "./StepSetupConfigCard";
import { FpbStepSetupDetailsCard } from "./StepSetupDetailsCard";
import { FpbStepRulesCard } from "./StepSetupRulesCard";
import { translateAdmin } from "~/i18n/config";
import { TUTORIAL_LINKS } from "../../../../lib/tutorial-links";
import { QuestionHelpTooltip } from "../SmallComponents";

export function StepSetupSection({
  activeSection,
  activeTabIndex,
  styles,
  onAddStep,
  onNavigateStep,
  slideDir,
  slideKey,
  steps,
  categoryAdapter,
  details,
  ruleMode,
  config,
}: {
  activeSection: string;
  activeTabIndex: number;
  styles: Record<string, string>;
  onAddStep: () => void;
  onNavigateStep: (index: number) => void;
  slideDir: "forward" | "backward" | null;
  slideKey: number;
  steps: any[];
  categoryAdapter: CommonStepCategoryAccordionAdapter;
  details: {
    cloneStep: (stepId: string) => void;
    deleteStep: (stepId: string) => void;
    markAsDirty: () => void;
    openTranslations: (stepId: string) => void;
    translationsDisabled: boolean;
    updateStepField: (stepId: string, field: string, value: unknown) => void;
    validationErrors: Record<string, string>;
    clearValidationError: (path: string) => void;
  };
  ruleMode: ComponentProps<typeof FpbStepRulesCard>["ruleMode"];
  config: {
    markAsDirty: () => void;
    pickerStepId: string | null;
    setPickerStepId: (
      value: string | null | ((previous: string | null) => string | null)
    ) => void;
    updateStepField: (stepId: string, field: string, value: unknown) => void;
  };
}) {
  if (activeSection !== "step_setup") return null;

  return (
    <div data-tour-target="fpb-step-setup">
      <div className={`${styles.card} ${styles.stepFlowCard}`}>
        <s-stack direction="block" gap="small">
          <div className={styles.stepFlowTitleRow}>
            <span className={styles.headingWithHelp}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>
                {translateAdmin("tooltips.stepFlow.title")}
              </h3>
              <QuestionHelpTooltip tooltipKey="stepFlow" />
            </span>
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="play"
              accessibilityLabel={translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
              onClick={() =>
                window.open(
                  TUTORIAL_LINKS.fullPageSetup,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
            </s-button>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.createStepsForYourMultiStepBundleHereSelectProductOptionsForEach"
            )}
          </p>
        </s-stack>
        {/* Step Chip Navigation */}
        <div className={styles.stepNav}>
          {steps.map((step, i) => (
            <button
              key={step.id}
              className={
                activeTabIndex === i ? styles.stepChipActive : styles.stepChip
              }
              onClick={() => onNavigateStep(i)}
            >
              <span className={styles.stepChipNumber}>{i + 1}</span>
              <span className={styles.stepChipLabel}>
                {step.name || `Step ${i + 1}`}
              </span>
              <span className={styles.stepChipChevron}>›</span>
            </button>
          ))}
          <s-button variant="primary" icon="plus" onClick={onAddStep}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.addStep"
            )}
          </s-button>
        </div>
        {steps.map(
          (step, index) =>
            activeTabIndex === index && (
              <div
                key={`${step.id}-${slideKey}-details`}
                className={
                  slideDir === "forward"
                    ? styles.slideForward
                    : slideDir === "backward"
                    ? styles.slideBackward
                    : ""
                }
              >
                <FpbStepSetupDetailsCard
                  styles={styles}
                  step={step}
                  isFirstStep={index === 0}
                  stepCount={steps.length}
                  translationsDisabled={details.translationsDisabled}
                  validationErrors={details.validationErrors}
                  onClearValidationError={details.clearValidationError}
                  onClone={() => details.cloneStep(step.id)}
                  onDelete={() => details.deleteStep(step.id)}
                  onEnabledChange={(enabled) => {
                    details.updateStepField(step.id, "enabled", enabled);
                    details.markAsDirty();
                  }}
                  onNameChange={(name) => {
                    details.updateStepField(step.id, "name", name);
                    details.markAsDirty();
                  }}
                  onOpenTranslations={() => details.openTranslations(step.id)}
                />
              </div>
            )
        )}
      </div>
      {steps.map(
        (step, index) =>
          activeTabIndex === index && (
            <div
              key={`${step.id}-${slideKey}`}
              className={
                slideDir === "forward"
                  ? styles.slideForward
                  : slideDir === "backward"
                  ? styles.slideBackward
                  : ""
              }
            >
              <div
                className={
                  index > 0 && step.enabled === false
                    ? styles.stepDisabledContent
                    : undefined
                }
                inert={index > 0 && step.enabled === false ? "" : undefined}
              >
                <FpbStepCategoryCard
                  adapter={categoryAdapter}
                  styles={styles}
                  step={step}
                  onAddCategory={() => {
                    const categories = (step.StepCategory as any[]) ?? [];
                    details.updateStepField(step.id, "StepCategory", [
                      ...categories,
                      {
                        id: `cat-${Date.now()}`,
                        name: "",
                        title: "",
                        sortOrder: categories.length,
                        products: [],
                        collections: [],
                      },
                    ]);
                    details.markAsDirty();
                  }}
                  onDisplayVariantsChange={(enabled) => {
                    details.updateStepField(
                      step.id,
                      "displayVariantsAsIndividual",
                      enabled
                    );
                    details.markAsDirty();
                  }}
                />
                <FpbStepRulesCard
                  styles={styles}
                  ruleMode={ruleMode}
                  step={step}
                />
                <FpbStepConfigCard
                  styles={styles}
                  step={step}
                  pickerOpen={config.pickerStepId === step.id}
                  onClosePicker={() => config.setPickerStepId(null)}
                  onImageChange={(url) => {
                    config.updateStepField(step.id, "stepImage", url);
                    config.setPickerStepId(null);
                    config.markAsDirty();
                  }}
                  onRemoveImage={() => {
                    config.updateStepField(step.id, "stepImage", null);
                    config.setPickerStepId(null);
                    config.markAsDirty();
                  }}
                  onTitleChange={(title) => {
                    config.updateStepField(step.id, "pageTitle", title);
                    config.markAsDirty();
                  }}
                  onTogglePicker={() =>
                    config.setPickerStepId((previous) =>
                      previous === step.id ? null : step.id
                    )
                  }
                />
              </div>
            </div>
          )
      )}
    </div>
  );
}
