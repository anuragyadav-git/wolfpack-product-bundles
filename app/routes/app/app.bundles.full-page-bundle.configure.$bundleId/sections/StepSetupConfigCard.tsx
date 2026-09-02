import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DefaultStepTimelineIcon } from "../../_shared/bundle-configure/DefaultStepTimelineIcon";
import { translateAdmin } from "~/i18n/config";

export function FpbStepConfigCard({
  flow,
  step,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
}) {
  const {
    FilePicker,
    fullPageBundleStyles,
    markAsDirty,
    setShowIconPickerForStep,
    showIconPickerForStep,
    stepsState,
  } = flow;

  return (
    <>
      <div className={fullPageBundleStyles.card}>
        <h3 className={fullPageBundleStyles.stepConfigTitle}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupconfigcard.stepConfig"
          )}
        </h3>
        <div className={fullPageBundleStyles.stepConfigRow}>
          <div className={fullPageBundleStyles.stepConfigIconBox}>
            {(step as any).stepImage ? (
              <>
                <img
                  src={(step as any).stepImage}
                  alt={translateAdmin("adminAttributes.stepIcon")}
                  className={fullPageBundleStyles.iconImg}
                />
                <button
                  type="button"
                  className={fullPageBundleStyles.iconRemoveButton}
                  aria-label={translateAdmin("adminAttributes.removeStepIcon")}
                  onClick={() => {
                    stepsState.updateStepField(step.id, "stepImage", null);
                    setShowIconPickerForStep(null);
                    markAsDirty();
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div className={fullPageBundleStyles.iconPlaceholder}>
                <DefaultStepTimelineIcon
                  className={fullPageBundleStyles.defaultTimelineIcon}
                  step={step}
                />
              </div>
            )}
          </div>
          <div className={fullPageBundleStyles.iconUploadButton}>
            <s-button
              inlineSize="fill"
              icon="replace"
              onClick={() =>
                setShowIconPickerForStep((prev: string | null) =>
                  prev === step.id ? null : step.id
                )
              }
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
              )}
            </s-button>
          </div>
          <div className={fullPageBundleStyles.fieldsColumn}>
            <s-text-field
              label={translateAdmin("adminAttributes.stepTitle")}
              placeholder={translateAdmin(
                "adminAttributes.egCustomizedTShirtBundleForYou"
              )}
              value={(step as any).pageTitle ?? ""}
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
          <FilePicker
            autoOpen
            onClose={() => setShowIconPickerForStep(null)}
            value={(step as any).stepImage ?? null}
            onChange={(url: string | null) => {
              stepsState.updateStepField(step.id, "stepImage", url);
              setShowIconPickerForStep(null);
              markAsDirty();
            }}
            label=""
          />
        )}
      </div>
    </>
  );
}
