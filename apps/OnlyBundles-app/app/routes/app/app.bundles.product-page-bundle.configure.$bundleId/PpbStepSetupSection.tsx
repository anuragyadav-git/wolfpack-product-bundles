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
import { getStepCategories } from "./PpbStepSetupShared";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";
import { translateAdmin } from "~/i18n/config";
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
                    {step.StepProduct &&
                      step.StepProduct.length > 0 &&
                      getStepCategories(step).length === 0 && (
                        <s-box paddingBlockEnd="small-200">
                          <s-banner
                            tone="warning"
                            heading={translateAdmin(
                              "common.warningGroup.heading"
                            )}
                            dismissible={false}
                            hidden={false}
                          >
                            <p style={{ margin: 0, fontSize: 14 }}>
                              <strong>
                                {translateAdmin(
                                  "adminExtracted.appBundlesProductPageBundleConfigure.ppbstepsetupsection.actionNeeded"
                                )}
                              </strong>{" "}
                              {translateAdmin(
                                "adminDynamic.legacyStepProducts",
                                {
                                  count: step.StepProduct.length,
                                }
                              )}
                            </p>
                          </s-banner>
                        </s-box>
                      )}
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
