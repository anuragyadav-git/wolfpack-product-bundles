import type { ReactNode } from "react";
import { translateAdmin } from "~/i18n/config";
import { TUTORIAL_LINKS } from "../../../lib/tutorial-links";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbStepFlowCardProps = Pick<
  PpbConfigureFlow,
  "activeTabIndex" | "handleAddNewStep" | "navigateToStep" | "stepsState"
> & { children: ReactNode };

export function PpbStepFlowCard({
  activeTabIndex,
  children,
  handleAddNewStep,
  navigateToStep,
  stepsState,
}: PpbStepFlowCardProps) {
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
                TUTORIAL_LINKS.productPageSetup,
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
        <s-button
          variant="primary"
          icon="plus"
          accessibilityLabel={translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.addStep"
          )}
          onClick={handleAddNewStep}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupsection.addStep"
          )}
        </s-button>
      </div>
      {children}
    </div>
  );
}
