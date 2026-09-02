import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbStepCategoryCard } from "./StepSetupCategoryCard";
import { FpbStepConfigCard } from "./StepSetupConfigCard";
import { FpbStepSetupDetailsCard } from "./StepSetupDetailsCard";
import { FpbStepRulesCard } from "./StepSetupRulesCard";
import { translateAdmin } from "~/i18n/config";

export function StepSetupSection({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    activeSection,
    activeTabIndex,
    fullPageBundleStyles,
    handleAddNewStep,
    navigateToStep,
    QuestionHelpTooltip,
    slideDir,
    slideKey,
    stepsState,
  } = flow;

  if (activeSection !== "step_setup") return null;

  return (
    <div data-tour-target="fpb-step-setup">
      <div
        className={`${fullPageBundleStyles.card} ${fullPageBundleStyles.stepFlowCard}`}
      >
        <s-stack direction="block" gap="small">
          <div className={fullPageBundleStyles.stepFlowTitleRow}>
            <span className={fullPageBundleStyles.headingWithHelp}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>
                {translateAdmin("tooltips.stepFlow.title")}
              </h3>
              <QuestionHelpTooltip tooltipKey="stepFlow" />
            </span>
            <s-press-button
              variant="tertiary"
              tone="neutral"
              icon="play"
              accessibilityLabel={translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=5p_B81I7tWE",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
            </s-press-button>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.createStepsForYourMultiStepBundleHereSelectProductOptionsForEach"
            )}
          </p>
        </s-stack>
        {/* Step Chip Navigation */}
        <div className={fullPageBundleStyles.stepNav}>
          {stepsState.steps.map((step, i) => (
            <button
              key={step.id}
              className={
                activeTabIndex === i
                  ? fullPageBundleStyles.stepChipActive
                  : fullPageBundleStyles.stepChip
              }
              onClick={() => navigateToStep(i)}
            >
              <span className={fullPageBundleStyles.stepChipNumber}>
                {i + 1}
              </span>
              <span className={fullPageBundleStyles.stepChipLabel}>
                {step.name || `Step ${i + 1}`}
              </span>
              <span className={fullPageBundleStyles.stepChipChevron}>›</span>
            </button>
          ))}
          <button
            className={fullPageBundleStyles.addStepBtn}
            onClick={handleAddNewStep}
          >
            <span aria-hidden="true">
              <s-icon type="plus" />
            </span>{" "}
            <span>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.addStep"
              )}
            </span>
          </button>
        </div>
        {stepsState.steps.map(
          (step, index) =>
            activeTabIndex === index && (
              <div
                key={`${step.id}-${slideKey}-details`}
                className={
                  slideDir === "forward"
                    ? fullPageBundleStyles.slideForward
                    : slideDir === "backward"
                    ? fullPageBundleStyles.slideBackward
                    : ""
                }
              >
                <FpbStepSetupDetailsCard
                  flow={flow}
                  step={step}
                  isFirstStep={index === 0}
                />
              </div>
            )
        )}
      </div>
      {stepsState.steps.map(
        (step, index) =>
          activeTabIndex === index && (
            <div
              key={`${step.id}-${slideKey}`}
              className={
                slideDir === "forward"
                  ? fullPageBundleStyles.slideForward
                  : slideDir === "backward"
                  ? fullPageBundleStyles.slideBackward
                  : ""
              }
            >
              <div
                className={
                  index > 0 && step.enabled === false
                    ? fullPageBundleStyles.stepDisabledContent
                    : undefined
                }
                inert={index > 0 && step.enabled === false ? "" : undefined}
              >
                <FpbStepCategoryCard flow={flow} step={step} />
                <FpbStepRulesCard flow={flow} step={step} />
                <FpbStepConfigCard flow={flow} step={step} />
              </div>
            </div>
          )
      )}
    </div>
  );
}
