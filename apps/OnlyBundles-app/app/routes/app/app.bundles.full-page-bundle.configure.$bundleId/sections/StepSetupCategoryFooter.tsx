import { translateAdmin } from "~/i18n/config";

export function FpbStepCategoryFooter({
  step,
  onAddCategory,
  onDisplayVariantsChange,
}: {
  step: any;
  onAddCategory: () => void;
  onDisplayVariantsChange: (enabled: boolean) => void;
}) {
  return (
    <>
      <s-button
        variant="secondary"
        icon="plus"
        accessibilityLabel={translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategoryfooter.addCategory"
        )}
        onClick={onAddCategory}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategoryfooter.addCategory"
        )}
      </s-button>
      <div style={{ margin: "12px 0" }}>
        <s-divider />
      </div>
      <s-checkbox
        label={translateAdmin(
          "adminAttributes.displayVariantsAsIndividualProducts2"
        )}
        checked={step.displayVariantsAsIndividual ?? undefined}
        onChange={(e) => {
          const checked = (e.target as HTMLInputElement).checked;
          onDisplayVariantsChange(checked);
        }}
      />
    </>
  );
}
