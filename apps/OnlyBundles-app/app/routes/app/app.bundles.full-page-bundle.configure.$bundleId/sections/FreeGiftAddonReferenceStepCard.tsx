import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { ConfigureHelpPopover } from "../../_shared/bundle-configure/ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

export function FpbAddonReferenceStepCard({
  enabled,
  imageUrl,
  showImagePicker,
  stepName,
  stepTitle,
  styles,
  translationsAvailable,
  onEnabledChange,
  onImageChange,
  onImagePickerOpenChange,
  onOpenTranslations,
  onStepNameChange,
  onStepTitleChange,
  validationErrors,
}: {
  enabled: boolean;
  imageUrl: string | null;
  showImagePicker: boolean;
  stepName: string;
  stepTitle: string;
  styles: Record<string, string>;
  translationsAvailable: boolean;
  validationErrors?: Record<string, string>;
  onEnabledChange: (enabled: boolean) => void;
  onImageChange: (url: string | null) => void;
  onImagePickerOpenChange: (open: boolean) => void;
  onOpenTranslations: () => void;
  onStepNameChange: (value: string) => void;
  onStepTitleChange: (value: string) => void;
}) {
  return (
    <>
      <div className={`${styles.card} ${styles.addonsReferenceStepCard}`}>
        <div className={styles.panelHeader}>
          <div className={styles.addonsTitleCluster}>
            <h3 className={styles.panelTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.addOnsAndGiftingStep"
              )}
              <ConfigureHelpPopover tooltipKey="freeGiftAddons" />
            </h3>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableAddOnsAndGiftingStep"
              )}
              checked={enabled || undefined}
              onChange={(e) =>
                onEnabledChange((e.target as HTMLInputElement).checked)
              }
            />
          </div>
          <div className={styles.addonsHeaderActions}>
            <s-button
              variant="secondary"
              icon="language-translate"
              disabled={!enabled || !translationsAvailable || undefined}
              onClick={onOpenTranslations}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </div>
        </div>
        <DisabledConfigurationRegion disabled={!enabled}>
          <div
            className={`${styles.mediaFieldGrid} ${styles.addonsMediaFieldGrid}`}
          >
            <div className={styles.addonsIconReplaceGroup}>
              <div className={styles.addonsIconColumn}>
                <div className={styles.addonsIconBox}>
                  {imageUrl ? (
                    <div className={styles.iconImg}>
                      <s-image
                        src={imageUrl}
                        alt={translateAdmin("adminAttributes.addOnsStepIcon")}
                        aspectRatio="1/1"
                        objectFit="contain"
                      />
                    </div>
                  ) : (
                    <svg
                      className={styles.addonsGiftBoxDefault}
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 20H38V40C38 42.2 36.2 44 34 44H14C11.8 44 10 42.2 10 40V20Z"
                        fill="#F6F6F7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 15H41V22H7V15Z"
                        fill="#FFFFFF"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M24 15V44"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 22H41"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M24 15C20.7 10.2 17.7 8 15.5 8C13.3 8 11.5 9.8 11.5 12C11.5 14.2 13.3 15 16 15H24Z"
                        fill="#FFFFFF"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M24 15C27.3 10.2 30.3 8 32.5 8C34.7 8 36.5 9.8 36.5 12C36.5 14.2 34.7 15 32 15H24Z"
                        fill="#FFFFFF"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <s-button
                variant="secondary"
                disabled={!enabled || undefined}
                onClick={() => onImagePickerOpenChange(true)}
              >
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
                )}
              </s-button>
            </div>
            <div className={styles.addonsStepTextGroup}>
              <div className={styles.addonsStepNameGroup}>
                <s-text-field
                  id="configure-addons-gifting-stepName"
                  label={translateAdmin("adminAttributes.stepName")}
                  disabled={!enabled || undefined}
                  error={validationErrors?.["addons.gifting.stepName"]}
                  value={stepName}
                  placeholder={translateAdmin("adminAttributes.addOn")}
                  onInput={(e) => {
                    onStepNameChange((e.target as HTMLInputElement).value);
                  }}
                  autocomplete="off"
                />
              </div>
              <div className={styles.addonsStepTitleGroup}>
                <s-text-field
                  id="configure-addons-gifting-stepTitle"
                  label={translateAdmin("adminAttributes.stepTitle")}
                  disabled={!enabled || undefined}
                  error={validationErrors?.["addons.gifting.stepTitle"]}
                  value={stepTitle}
                  onInput={(e) =>
                    onStepTitleChange((e.target as HTMLInputElement).value)
                  }
                  autocomplete="off"
                />
              </div>
            </div>
          </div>
        </DisabledConfigurationRegion>
        {showImagePicker && (
          <div className={styles.addonsIconPickerRow}>
            <AssetUpload
              disabled={!enabled}
              value={imageUrl}
              maxUploadBytes={50 * 1024}
              maxUploadErrorMessage={translateAdmin(
                "adminDynamic.fileMustBeSmallerThan50Kb"
              )}
              onChange={(url: string | null) => {
                onImageChange(url);
                onImagePickerOpenChange(false);
              }}
              label={translateAdmin("adminAttributes.uploadImage")}
            />
          </div>
        )}
      </div>
    </>
  );
}
