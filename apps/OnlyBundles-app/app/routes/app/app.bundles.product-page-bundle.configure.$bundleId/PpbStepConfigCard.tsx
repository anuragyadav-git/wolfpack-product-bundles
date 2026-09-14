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
  "markAsDirty" | "stepsState"
> & { step: PpbStep };

export function PpbStepConfigCard({
  markAsDirty,
  step,
  stepsState,
}: PpbStepConfigCardProps) {
  const stepRecord: Record<string, unknown> = step;
  const stepImage =
    typeof stepRecord.stepImage === "string" ? stepRecord.stepImage : null;
  const pageTitle =
    typeof stepRecord.pageTitle === "string" ? stepRecord.pageTitle : "";
  const uploadLabel = translateAdmin("adminAttributes.uploadImage");

  return (
    <div className={productPageBundleStyles.card}>
      <h3 className={productPageBundleStyles.stepConfigTitle}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupconfigcard.stepConfig"
        )}
      </h3>
      <s-grid
        gridTemplateColumns="86px minmax(0, 1fr)"
        gap="base"
        alignItems="start"
      >
        <s-stack direction="block" gap="small">
          <AssetUpload
            value={stepImage}
            onChange={(url: string | null) => {
              stepsState.updateStepField(step.id, "stepImage", url);
              markAsDirty();
            }}
            label={uploadLabel}
            labelAccessibilityVisibility="exclusive"
            showValuePreview={false}
            dropZoneContentMinBlockSize="54px"
            dropZoneContent={
              stepImage ? (
                <s-image
                  src={stepImage}
                  alt={translateAdmin("adminAttributes.stepIcon")}
                  aspectRatio="1/1"
                  objectFit="contain"
                />
              ) : (
                <s-box inlineSize="28px" blockSize="28px">
                  <DefaultStepTimelineIcon
                    className={productPageBundleStyles.defaultTimelineIcon}
                    step={{
                      isDefault: step.isDefault,
                      isFreeGift: step.isFreeGift === true,
                    }}
                  />
                </s-box>
              )
            }
          />
          {stepImage ? (
            <s-button
              variant="tertiary"
              tone="critical"
              icon="delete"
              accessibilityLabel={translateAdmin(
                "adminAttributes.removeStepIcon"
              )}
              onClick={() => {
                stepsState.updateStepField(step.id, "stepImage", null);
                markAsDirty();
              }}
            />
          ) : null}
        </s-stack>
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
      </s-grid>
    </div>
  );
}
