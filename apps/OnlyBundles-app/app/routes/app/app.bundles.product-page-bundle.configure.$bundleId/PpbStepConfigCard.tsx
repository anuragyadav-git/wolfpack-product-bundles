import { DefaultStepTimelineIcon } from "../_shared/bundle-configure/DefaultStepTimelineIcon";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../components/shared/AssetUpload";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbStep = {
  id: string;
  isDefault?: boolean;
  isFreeGift?: boolean | null;
  [key: string]: unknown;
};

export type PpbStepConfigCardProps = Pick<
  PpbConfigureFlow,
  | "markAsDirty"
  | "setShowIconPickerForStep"
  | "showIconPickerForStep"
  | "stepsState"
> & { step: PpbStep };

export function PpbStepConfigCard({
  markAsDirty,
  setShowIconPickerForStep,
  showIconPickerForStep,
  step,
  stepsState,
}: PpbStepConfigCardProps) {
  const stepRecord: Record<string, unknown> = step;
  const stepImage =
    typeof stepRecord.stepImage === "string" ? stepRecord.stepImage : null;
  const pageTitle =
    typeof stepRecord.pageTitle === "string" ? stepRecord.pageTitle : "";

  return (
    <div className={productPageBundleStyles.card}>
      <h3 className={productPageBundleStyles.stepConfigTitle}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupconfigcard.stepConfig"
        )}
      </h3>
      <div className={productPageBundleStyles.stepConfigRow}>
        <div className={productPageBundleStyles.stepConfigIconBox}>
          {stepImage ? (
            <>
              <div className={productPageBundleStyles.iconImg}>
                <s-image
                  src={stepImage}
                  alt={translateAdmin("adminAttributes.stepIcon")}
                  aspectRatio="1/1"
                  objectFit="contain"
                />
              </div>
              <span className={productPageBundleStyles.iconRemoveButton}>
                <s-button
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel={translateAdmin(
                    "adminAttributes.removeStepIcon"
                  )}
                  onClick={() => {
                    stepsState.updateStepField(step.id, "stepImage", null);
                    setShowIconPickerForStep(null);
                    markAsDirty();
                  }}
                />
              </span>
            </>
          ) : (
            <div className={productPageBundleStyles.iconPlaceholder}>
              <DefaultStepTimelineIcon
                className={productPageBundleStyles.defaultTimelineIcon}
                step={{
                  isDefault: step.isDefault,
                  isFreeGift: step.isFreeGift === true,
                }}
              />
            </div>
          )}
        </div>
        <div className={productPageBundleStyles.iconUploadButton}>
          <s-button
            icon="replace"
            accessibilityLabel={translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
            )}
            onClick={() =>
              setShowIconPickerForStep((prev) =>
                prev === step.id ? null : step.id
              )
            }
          >
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
            )}
          </s-button>
        </div>
        <div className={productPageBundleStyles.fieldsColumn}>
          <s-text-field
            label={translateAdmin("adminAttributes.stepTitle")}
            placeholder={translateAdmin(
              "adminAttributes.egCustomizedTShirtBundleForYou"
            )}
            value={pageTitle}
            onInput={(e) => {
              stepsState.updateStepField(
                step.id,
                "pageTitle",
                (e.target as HTMLInputElement).value
              );
              markAsDirty();
            }}
            autocomplete="off"
          />
        </div>
      </div>
      {showIconPickerForStep === step.id && (
        <AssetUpload
          value={stepImage}
          onChange={(url: string | null) => {
            stepsState.updateStepField(step.id, "stepImage", url);
            setShowIconPickerForStep(null);
            markAsDirty();
          }}
          label={translateAdmin("adminAttributes.uploadImage")}
        />
      )}
    </div>
  );
}
