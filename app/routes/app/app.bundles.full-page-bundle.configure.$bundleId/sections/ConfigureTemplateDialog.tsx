import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { openThemeEditorInNewTab } from "../../../../lib/theme-editor-navigation.client";
import { TemplateReadyScreen } from "../../../../components/bundle-configure/TemplateReadyScreen";

export function FpbTemplateDialog({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    fullPageBundleStyles,
    fullPageTemplateOptions,
    handleTemplateNext,
    handleTemplatePreview,
    isPreviewBundleLoading,
    OptimisedImage,
    pendingDesignPresetId,
    pendingDesignTemplate,
    selectTemplateModalRef,
    setPendingDesignPresetId,
    setPendingDesignTemplate,
    setTemplateModalStep,
    templateFetcher,
    templateModalStep,
    templateSaveError,
    themeEditorUrl,
  } = flow;

  return (
    <s-modal
      id="fpb-template-customization-modal"
      ref={selectTemplateModalRef}
      heading="Customization"
      size="large"
    >
      <div className={fullPageBundleStyles.templateDialogContent}>
        {templateModalStep === "templates" ? (
          <>
            <div className={fullPageBundleStyles.templateDialogBody}>
              <div className={fullPageBundleStyles.templateDialogIntro}>
                <div>
                  <h3 className={fullPageBundleStyles.templateDialogSubheading}>
                    Customize your bundle
                  </h3>
                  <p className={fullPageBundleStyles.templateDialogDescription}>
                    Choose a design that suits your needs and fits your brand
                  </p>
                </div>
                <s-button
                  variant="secondary"
                  onClick={() => setTemplateModalStep("colorsAndCorners")}
                >
                  Customize Colors &amp; Language
                </s-button>
              </div>
              {templateSaveError ? (
                <p
                  role="alert"
                  className={fullPageBundleStyles.templateDialogError}
                >
                  {templateSaveError}
                </p>
              ) : null}
              <div className={fullPageBundleStyles.templateDialogGrid}>
                {fullPageTemplateOptions.map((tpl) => {
                  const isSelected =
                    pendingDesignPresetId === tpl.presetId &&
                    pendingDesignTemplate === "FBP_SIDE_FOOTER";
                  return (
                    <button
                      key={tpl.presetId}
                      type="button"
                      className={`${fullPageBundleStyles.templateOptionCard} ${
                        isSelected
                          ? fullPageBundleStyles.templateOptionCardSelected
                          : ""
                      }`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setPendingDesignTemplate("FBP_SIDE_FOOTER");
                        setPendingDesignPresetId(tpl.presetId);
                      }}
                    >
                      <span
                        className={
                          fullPageBundleStyles.templateOptionImageFrame
                        }
                      >
                        <OptimisedImage
                          src={tpl.image}
                          alt={tpl.label}
                          className={fullPageBundleStyles.templateOptionImage}
                          width={400}
                          height={300}
                          loading="eager"
                          fetchPriority="high"
                        />
                      </span>
                      <span
                        className={fullPageBundleStyles.templateOptionFooter}
                      >
                        <span
                          className={fullPageBundleStyles.templateOptionLabel}
                        >
                          {tpl.label}
                        </span>
                        <span
                          className={`${
                            fullPageBundleStyles.templateOptionAction
                          } ${
                            isSelected
                              ? fullPageBundleStyles.templateOptionActionSelected
                              : ""
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={fullPageBundleStyles.templateDialogFooter}>
              <s-button
                type="button"
                variant="primary"
                disabled={!pendingDesignPresetId || undefined}
                loading={templateFetcher.state === "submitting" || undefined}
                onClick={handleTemplateNext}
              >
                Next
              </s-button>
            </div>
          </>
        ) : templateModalStep === "colorsAndCorners" ? (
          <>
            <div className={fullPageBundleStyles.templateDialogBody}>
              <div className={fullPageBundleStyles.templateDialogIntro}>
                <div>
                  <h3 className={fullPageBundleStyles.templateDialogSubheading}>
                    Customize your bundle
                  </h3>
                  <p className={fullPageBundleStyles.templateDialogDescription}>
                    Fine tune colors and corners before previewing the bundle
                  </p>
                </div>
                <div
                  className={fullPageBundleStyles.templateDialogTabs}
                  role="tablist"
                  aria-label="Template customization"
                >
                  <button
                    type="button"
                    className={fullPageBundleStyles.templateDialogTab}
                    onClick={() => setTemplateModalStep("templates")}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    className={`${fullPageBundleStyles.templateDialogTab} ${fullPageBundleStyles.templateDialogTabActive}`}
                    aria-current="page"
                  >
                    Colors and corners
                  </button>
                  <button
                    type="button"
                    className={fullPageBundleStyles.templateDialogTab}
                    onClick={() => setTemplateModalStep("textAndImages")}
                  >
                    Text and images
                  </button>
                </div>
              </div>
              <div className={fullPageBundleStyles.templateCustomizationGrid}>
                <div className={fullPageBundleStyles.templateCustomizationCard}>
                  <h4>Brand colors</h4>
                  <p>
                    Use Settings &rarr; Design color controls for primary,
                    secondary, background, text, border, and discount accents.
                  </p>
                </div>
                <div className={fullPageBundleStyles.templateCustomizationCard}>
                  <h4>Corners</h4>
                  <p>
                    Review border radius and card rounding before applying the
                    selected template.
                  </p>
                </div>
              </div>
            </div>
            <div className={fullPageBundleStyles.templateDialogFooter}>
              <s-button
                variant="secondary"
                onClick={() => setTemplateModalStep("templates")}
              >
                Back
              </s-button>
              <s-button
                variant="primary"
                onClick={() => setTemplateModalStep("textAndImages")}
              >
                Next
              </s-button>
            </div>
          </>
        ) : templateModalStep === "textAndImages" ? (
          <>
            <div className={fullPageBundleStyles.templateDialogBody}>
              <div className={fullPageBundleStyles.templateDialogIntro}>
                <div>
                  <h3 className={fullPageBundleStyles.templateDialogSubheading}>
                    Customize your bundle
                  </h3>
                  <p className={fullPageBundleStyles.templateDialogDescription}>
                    Review template language, labels, and media before finishing
                    customization
                  </p>
                </div>
                <div
                  className={fullPageBundleStyles.templateDialogTabs}
                  role="tablist"
                  aria-label="Template customization"
                >
                  <button
                    type="button"
                    className={fullPageBundleStyles.templateDialogTab}
                    onClick={() => setTemplateModalStep("templates")}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    className={fullPageBundleStyles.templateDialogTab}
                    onClick={() => setTemplateModalStep("colorsAndCorners")}
                  >
                    Colors and corners
                  </button>
                  <button
                    type="button"
                    className={`${fullPageBundleStyles.templateDialogTab} ${fullPageBundleStyles.templateDialogTabActive}`}
                    aria-current="page"
                  >
                    Text and images
                  </button>
                </div>
              </div>
              {templateSaveError ? (
                <p
                  role="alert"
                  className={fullPageBundleStyles.templateDialogError}
                >
                  {templateSaveError}
                </p>
              ) : null}
              <div className={fullPageBundleStyles.templateCustomizationGrid}>
                <div className={fullPageBundleStyles.templateCustomizationCard}>
                  <h4>Text and language</h4>
                  <p>
                    Review Product Card, Bundle Cart, Bundle, Popups, Toasts,
                    and Addons text from Settings Language.
                  </p>
                </div>
                <div className={fullPageBundleStyles.templateCustomizationCard}>
                  <h4>Images and GIFs</h4>
                  <p>
                    Confirm template media, uploaded images, and loading GIFs
                    before saving the template selection.
                  </p>
                </div>
              </div>
            </div>
            <div className={fullPageBundleStyles.templateDialogFooter}>
              <s-button
                variant="secondary"
                onClick={() => setTemplateModalStep("colorsAndCorners")}
              >
                Back
              </s-button>
              <s-button
                type="button"
                variant="primary"
                disabled={!pendingDesignPresetId || undefined}
                loading={templateFetcher.state === "submitting" || undefined}
                onClick={handleTemplateNext}
              >
                Done
              </s-button>
            </div>
          </>
        ) : templateModalStep === "enableThemeExtension" ? (
          <div className={fullPageBundleStyles.templateDialogBody}>
            <div className={fullPageBundleStyles.templateDialogConfirmHeader}>
              <h3 className={fullPageBundleStyles.templateDialogSubheading}>
                Enable your preview
              </h3>
              <p className={fullPageBundleStyles.templateDialogDescription}>
                A simple switch in your theme editor. Nothing changes on your
                store until you decide.
              </p>
            </div>
            <div className={fullPageBundleStyles.templateReadyPanel}>
              <div className={fullPageBundleStyles.templateReadyIcon}>
                <s-icon type="view" />
              </div>
              <h3 className={fullPageBundleStyles.templateReadyTitle}>
                Enable app embed
              </h3>
              <p className={fullPageBundleStyles.templateReadyText}>
                Open your theme editor, enable the Wolfpack Bundles app embed,
                then return here to preview your bundle.
              </p>
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="center"
              >
                <s-button
                  variant="secondary"
                  onClick={() =>
                    themeEditorUrl
                      ? openThemeEditorInNewTab(themeEditorUrl)
                      : undefined
                  }
                >
                  Open theme editor
                </s-button>
                <s-button
                  variant="primary"
                  onClick={() => setTemplateModalStep("confirm")}
                >
                  I've enabled it
                </s-button>
              </s-stack>
            </div>
          </div>
        ) : (
              <TemplateReadyScreen
                isPreviewLoading={
                  isPreviewBundleLoading ||
                  templateFetcher.state !== "idle"
                }
                onPreview={handleTemplatePreview}
              />
        )}
      </div>
    </s-modal>
  );
}
