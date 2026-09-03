import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbCategoryStepSettings() {
  const {
    markAsDirty,
    setUseSingleStepCategoriesAsBundleSteps,
    useSingleStepCategoriesAsBundleSteps,
  } = usePpbConfigureContext();

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
        <s-text tone={"subdued" as any}>
          {translateAdmin(
            "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsCategorysteps.showOneCategoryAtATimeWithStepNavigation"
          )}
        </s-text>
      </s-stack>
    </s-section>
  );
}
