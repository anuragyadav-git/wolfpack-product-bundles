import { usePpbConfigureContext } from "./PpbConfigureContext";
import { DefaultStepTimelineIcon } from "../_shared/bundle-configure/DefaultStepTimelineIcon";

export function PpbStepConfigCard({ step }: { step: any }) {
  const {
    FilePicker,
    markAsDirty,
    productPageBundleStyles,
    setShowIconPickerForStep,
    showIconPickerForStep,
    stepsState,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.card}>
      <h3 className={productPageBundleStyles.stepConfigTitle}>
        Step Config
      </h3>
      <div className={productPageBundleStyles.stepConfigRow}>
        <div className={productPageBundleStyles.stepConfigIconBox}>
          {(step as any).stepImage ? (
            <>
              <img
                src={(step as any).stepImage}
                alt="Step icon"
                className={productPageBundleStyles.iconImg}
              />
              <button
                type="button"
                className={productPageBundleStyles.iconRemoveButton}
                aria-label="Remove step icon"
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
            <div className={productPageBundleStyles.iconPlaceholder}>
              <DefaultStepTimelineIcon
                className={productPageBundleStyles.defaultTimelineIcon}
                step={step}
              />
            </div>
          )}
        </div>
        <div className={productPageBundleStyles.iconUploadButton}>
          <s-button
            inlineSize="fill"
            icon="replace"
            onClick={() =>
              setShowIconPickerForStep((prev) =>
                prev === step.id ? null : step.id,
              )
            }
          >
            Replace
          </s-button>
        </div>
        <div className={productPageBundleStyles.fieldsColumn}>
          <s-text-field
            label="Step Title"
            placeholder="Eg:- Customized T-shirt Bundle for you"
            value={(step as any).pageTitle ?? ""}
            onInput={(e) => {
              stepsState.updateStepField(
                step.id,
                "pageTitle",
                (e.target as HTMLInputElement).value,
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
  );
}
