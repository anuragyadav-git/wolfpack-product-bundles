import type { CommonStepCategoryAccordionAdapter } from "../../_shared/bundle-configure/CommonStepCategoryAccordion";
import { FpbStepCategoryAccordion } from "./StepSetupCategoryAccordion";
import { FpbStepCategoryFooter } from "./StepSetupCategoryFooter";
import { translateAdmin } from "~/i18n/config";
import { QuestionHelpTooltip } from "../SmallComponents";

export function FpbStepCategoryCard({
  adapter,
  styles,
  step,
  onAddCategory,
  onDisplayVariantsChange,
}: {
  adapter: CommonStepCategoryAccordionAdapter;
  styles: Record<string, string>;
  step: any;
  onAddCategory: () => void;
  onDisplayVariantsChange: (enabled: boolean) => void;
}) {
  const categories = (step.StepCategory as any[] | undefined) ?? [];

  return (
    <>
      <div className={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {translateAdmin("tooltips.category.title")}
          </h3>
          <QuestionHelpTooltip tooltipKey="category" />
        </div>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: "#6d7175",
          }}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategorycard.addAllProductSelectionsInThisStepToASingleCategoryOrSeparateThem"
          )}
        </p>
        {categories.length === 0 && (
          <div className={styles.emptyState}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategorycard.noCategoryDefinedYet"
            )}
          </div>
        )}
        {categories.map((cat: any, catIndex: number) => (
          <FpbStepCategoryAccordion
            key={cat.id ?? catIndex}
            adapter={adapter}
            step={step}
            cat={cat}
            catIndex={catIndex}
          />
        ))}
        <FpbStepCategoryFooter
          styles={styles}
          step={step}
          onAddCategory={onAddCategory}
          onDisplayVariantsChange={onDisplayVariantsChange}
        />
      </div>
    </>
  );
}
