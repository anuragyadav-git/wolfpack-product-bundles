import type { ReactNode } from "react";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbStepFlowCard({ children }: { children: ReactNode }) {
  const {
    activeTabIndex,
    handleAddNewStep,
    navigateToStep,
    productPageBundleStyles,
    QuestionHelpTooltip,
    stepsState,
  } = usePpbConfigureContext();

  return (
    <div
      className={`${productPageBundleStyles.card} ${productPageBundleStyles.stepFlowCard}`}
    >
      <s-stack direction="block" gap="small">
        <div className={productPageBundleStyles.stepFlowTitleRow}>
          <span className={productPageBundleStyles.headingWithHelp}>
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
                "https://www.youtube.com/watch?v=5ClNNtFybHo",
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
      <div className={productPageBundleStyles.stepNav}>
        {stepsState.steps.map((step, i) => (
          <button
            key={step.id}
            className={
              activeTabIndex === i
                ? productPageBundleStyles.stepChipActive
                : productPageBundleStyles.stepChip
            }
            onClick={() => navigateToStep(i)}
          >
            <span className={productPageBundleStyles.stepChipNumber}>
              {i + 1}
            </span>
            <span className={productPageBundleStyles.stepChipLabel}>
              {step.name || `Step ${i + 1}`}
            </span>
            <span className={productPageBundleStyles.stepChipChevron}>›</span>
          </button>
        ))}
        <button
          className={productPageBundleStyles.addStepBtn}
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
      {children}
    </div>
  );
}
