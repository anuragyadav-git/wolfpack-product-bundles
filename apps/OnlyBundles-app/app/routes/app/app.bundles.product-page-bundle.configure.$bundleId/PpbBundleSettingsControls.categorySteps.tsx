import { translateAdmin } from "~/i18n/config";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbCategoryStepSettingsProps = Pick<
  PpbConfigureFlow,
  | "markAsDirty"
  | "setUseSingleStepCategoriesAsBundleSteps"
  | "useSingleStepCategoriesAsBundleSteps"
>;

export function PpbCategoryStepSettings({
  markAsDirty,
  setUseSingleStepCategoriesAsBundleSteps,
  useSingleStepCategoriesAsBundleSteps,
}: PpbCategoryStepSettingsProps) {

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <s-stack direction="inline" alignItems="center" gap="small">
          <s-text>
            {translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsCategorysteps.useCategoriesAsBundleSteps"
            )}
          </s-text>
          <s-switch
            accessibilityLabel={translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsCategorysteps.useCategoriesAsBundleSteps"
            )}
            checked={useSingleStepCategoriesAsBundleSteps || undefined}
            onChange={(event) => {
              setUseSingleStepCategoriesAsBundleSteps(
                (event.target as HTMLInputElement).checked
              );
              markAsDirty();
            }}
          />
        </s-stack>
        <s-text tone="neutral">
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsCategorysteps.showOneCategoryAtATimeWithStepNavigation"
          )}
        </s-text>
      </s-stack>
    </s-section>
  );
}
