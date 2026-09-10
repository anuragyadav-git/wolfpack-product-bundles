import { DefaultStepTimelineIcon } from "../../_shared/bundle-configure/DefaultStepTimelineIcon";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

export function FpbStepConfigCard({
  step,
  onImageChange,
  onRemoveImage,
  onTitleChange,
  styles,
}: {
  styles: Record<string, string>;
  step: any;
  onImageChange: (url: string | null) => void;
  onRemoveImage: () => void;
  onTitleChange: (title: string) => void;
}) {
  const stepImage = typeof step.stepImage === "string" ? step.stepImage : null;
  const uploadLabel = translateAdmin("adminAttributes.uploadImage");

  return (
    <div className={styles.card}>
      <h3 className={styles.stepConfigTitle}>
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
            onChange={onImageChange}
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
                    className={styles.defaultTimelineIcon}
                    step={step}
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
              onClick={onRemoveImage}
            />
          ) : null}
        </s-stack>
        <s-text-field
          label={translateAdmin("adminAttributes.stepTitle")}
          placeholder={translateAdmin(
            "adminAttributes.egCustomizedTShirtBundleForYou"
          )}
          value={(step as any).pageTitle ?? ""}
          onInput={(e) => {
            onTitleChange((e.target as HTMLInputElement).value);
          }}
          autocomplete="off"
        />
      </s-grid>
    </div>
  );
}
