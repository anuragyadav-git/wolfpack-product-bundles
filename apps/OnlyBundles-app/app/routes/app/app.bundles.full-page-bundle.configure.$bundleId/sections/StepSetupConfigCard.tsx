import { DefaultStepTimelineIcon } from "../../_shared/bundle-configure/DefaultStepTimelineIcon";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

export function FpbStepConfigCard({
  styles,
  step,
  pickerOpen,
  onClosePicker,
  onImageChange,
  onRemoveImage,
  onTitleChange,
  onTogglePicker,
}: {
  styles: Record<string, string>;
  step: any;
  pickerOpen: boolean;
  onClosePicker: () => void;
  onImageChange: (url: string | null) => void;
  onRemoveImage: () => void;
  onTitleChange: (title: string) => void;
  onTogglePicker: () => void;
}) {
  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.stepConfigTitle}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupconfigcard.stepConfig"
          )}
        </h3>
        <div className={styles.stepConfigRow}>
          <div className={styles.stepConfigIconBox}>
            {(step as any).stepImage ? (
              <>
                <div className={styles.iconImg}>
                  <s-image
                    src={(step as any).stepImage}
                    alt={translateAdmin("adminAttributes.stepIcon")}
                    aspectRatio="1/1"
                    objectFit="contain"
                  />
                </div>
                <span className={styles.iconRemoveButton}>
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    icon="delete"
                    accessibilityLabel={translateAdmin(
                      "adminAttributes.removeStepIcon"
                    )}
                    onClick={onRemoveImage}
                  />
                </span>
              </>
            ) : (
              <div className={styles.iconPlaceholder}>
                <DefaultStepTimelineIcon
                  className={styles.defaultTimelineIcon}
                  step={step}
                />
              </div>
            )}
          </div>
          <div className={styles.iconUploadButton}>
            <s-button
              icon="replace"
              onClick={onTogglePicker}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
              )}
            </s-button>
          </div>
          <div className={styles.fieldsColumn}>
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
          </div>
        </div>
        {pickerOpen && (
          <AssetUpload
            value={(step as any).stepImage ?? null}
            onChange={(url: string | null) => {
              onImageChange(url);
            }}
            label={translateAdmin("adminAttributes.uploadImage")}
          />
        )}
      </div>
    </>
  );
}
