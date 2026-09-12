import {
  PpbRulesConfigurationCard,
  type PpbRulesConfigurationCardProps,
} from "./PpbRulesConfigurationCard";
import {
  PpbStepCategoriesCard,
  type PpbStepCategoriesCardProps,
} from "./PpbStepCategoriesCard";
import {
  PpbStepConfigCard,
  type PpbStepConfigCardProps,
} from "./PpbStepConfigCard";
import {
  PpbStepFlowCard,
  type PpbStepFlowCardProps,
} from "./PpbStepFlowCard";
import {
  PpbStepSetupDetailsCard,
  type PpbStepSetupDetailsCardProps,
} from "./PpbStepSetupDetailsCard";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";

export type PpbStepSetupSectionProps = Pick<
  PpbConfigureFlow,
  "activeSection" | "slideDir" | "slideKey"
> & {
  stepFlow: Omit<PpbStepFlowCardProps, "children">;
  details: Omit<PpbStepSetupDetailsCardProps, "isFirstStep" | "step">;
  categories: Omit<PpbStepCategoriesCardProps, "step">;
  rules: Omit<PpbRulesConfigurationCardProps, "step">;
  config: Omit<PpbStepConfigCardProps, "step">;
};

export function PpbStepSetupSection({
  activeSection,
  categories,
  config,
  details,
  rules,
  slideDir,
  slideKey,
  stepFlow,
}: PpbStepSetupSectionProps) {
  const {
    activeTabIndex,
    handleAddNewStep,
    navigateToStep,
    stepsState,
  } = stepFlow;

  return (
    <>
      {activeSection === "step_setup" && (
        <div data-tour-target="ppb-product-selection">
          <PpbStepFlowCard
            activeTabIndex={activeTabIndex}
            handleAddNewStep={handleAddNewStep}
            navigateToStep={navigateToStep}
            stepsState={stepsState}
          >
            {stepsState.steps.map(
              (step, index) =>
                activeTabIndex === index && (
                  <div
                    key={`${step.id}-${slideKey}-details`}
                    className={
                      slideDir === "forward"
                        ? productPageBundleStyles.slideForward
                        : slideDir === "backward"
                        ? productPageBundleStyles.slideBackward
                        : ""
                    }
                  >
                    <PpbStepSetupDetailsCard
                      {...details}
                      isFirstStep={index === 0}
                      step={step}
                    />
                  </div>
                )
            )}
          </PpbStepFlowCard>
          {stepsState.steps.map(
            (step, index) =>
              activeTabIndex === index && (
                <div
                  key={`${step.id}-${slideKey}-categories`}
                  className={
                    slideDir === "forward"
                      ? productPageBundleStyles.slideForward
                      : slideDir === "backward"
                      ? productPageBundleStyles.slideBackward
                      : ""
                  }
                >
                  <div
                    className={
                      index > 0 && step.enabled === false
                        ? productPageBundleStyles.stepDisabledContent
                        : undefined
                    }
                    inert={index > 0 && step.enabled === false ? "" : undefined}
                  >
                    <PpbStepCategoriesCard
                      {...categories}
                      step={step}
                    />
                    <PpbRulesConfigurationCard
                      {...rules}
                      step={step}
                    />
                    <PpbStepConfigCard
                      {...config}
                      step={step}
                    />
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </>
  );
}
