import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PpbRulesConfigurationCard } from "./PpbRulesConfigurationCard";
import { PpbStepCategoriesCard } from "./PpbStepCategoriesCard";
import { PpbStepConfigCard } from "./PpbStepConfigCard";
import { PpbStepFlowCard } from "./PpbStepFlowCard";
import { PpbStepSetupDetailsCard } from "./PpbStepSetupDetailsCard";
import { getStepCategories } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";

export function PpbStepSetupSection() {
  const {
    activeSection,
    activeTabIndex,
    productPageBundleStyles,
    slideDir,
    slideKey,
    stepsState,
  } = usePpbConfigureContext();

  return (
    <>
      {activeSection === "step_setup" && (
        <div data-tour-target="ppb-product-selection">
          <PpbStepFlowCard>
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
                      step={step}
                      isFirstStep={index === 0}
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
                    <PpbStepCategoriesCard step={step} />
                    <PpbRulesConfigurationCard step={step} />
                    <PpbStepConfigCard step={step} />
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </>
  );
}
