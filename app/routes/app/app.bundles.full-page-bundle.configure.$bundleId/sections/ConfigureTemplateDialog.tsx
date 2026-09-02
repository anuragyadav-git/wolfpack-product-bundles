import { Modal } from "@shopify/app-bridge-react";
import { useState } from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { openThemeEditorInNewTab } from "../../../../lib/theme-editor-navigation.client";
import { TemplateReadyScreen } from "../../../../components/bundle-configure/TemplateReadyScreen";
import { TemplatePreviewFeedbackModal } from "../../../../components/bundle-configure/TemplatePreviewFeedbackModal";
import { translateAdmin } from "~/i18n/config";

export function FpbTemplateDialog({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const [previewFeedbackUrl, setPreviewFeedbackUrl] = useState<string | null>(
    null
  );
  const {
    fullPageBundleStyles,
    fullPageTemplateOptions,
    handleTemplateNext,
    handleTemplatePreview,
    isPreviewBundleLoading,
    isSelectTemplateModalOpen,
    pendingDesignPresetId,
    pendingDesignTemplate,
    setPendingDesignPresetId,
    setPendingDesignTemplate,
    setTemplateModalStep,
    templateFetcher,
    templateModalStep,
    templateSaveError,
    themeEditorUrl,
  } = flow;

  return (
    <>
      <Modal
        id="fpb-template-customization-modal"
        open={isSelectTemplateModalOpen}
        onHide={flow.closeSelectTemplateModal}
        variant="max"
      >
        <ui-title-bar title={translateAdmin("adminAttributes.customization")} />
        {isSelectTemplateModalOpen ? (
          <div className={fullPageBundleStyles.templateDialogContent}>
            {templateModalStep === "templates" ? (
              <>
                <div className={fullPageBundleStyles.templateDialogBody}>
                  <div className={fullPageBundleStyles.templateDialogIntro}>
                    <s-stack direction="block" gap="small">
                      <s-heading>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.customizeYourBundle"
                        )}
                      </s-heading>
                      <s-paragraph color="subdued">
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.chooseADesignThatSuitsYourNeedsAndFitsYourBrand"
                        )}
                      </s-paragraph>
                    </s-stack>
                    <s-button
                      variant="secondary"
                      icon="paint-brush-flat"
                      onClick={() => setTemplateModalStep("colorsAndCorners")}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.customizeColorsAmpLanguage"
                      )}
                    </s-button>
                  </div>
                  {templateSaveError ? (
                    <s-box paddingBlockEnd="small-200">
                      <s-banner
                        heading={translateAdmin(
                          "adminAttributes.templateNotSaved"
                        )}
                        tone="critical"
                      >
                        {templateSaveError}
                      </s-banner>
                    </s-box>
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
                          className={`${
                            fullPageBundleStyles.templateOptionCard
                          } ${
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
                              className={
                                fullPageBundleStyles.templateOptionImage
                              }
                              width={400}
                              height={300}
                              loading="eager"
                              fetchPriority="high"
                            />
                          </span>
                          <span
                            className={
                              fullPageBundleStyles.templateOptionFooter
                            }
                          >
                            <span
                              className={
                                fullPageBundleStyles.templateOptionLabel
                              }
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
                    icon="arrow-right"
                    disabled={!pendingDesignPresetId || undefined}
                    loading={
                      templateFetcher.state === "submitting" || undefined
                    }
                    onClick={handleTemplateNext}
                  >
                    {translateAdmin("createBundle.actions.next")}
                  </s-button>
                </div>
              </>
            ) : templateModalStep === "colorsAndCorners" ? (
              <>
                <div className={fullPageBundleStyles.templateDialogBody}>
                  <div className={fullPageBundleStyles.templateDialogIntro}>
                    <s-stack direction="block" gap="small">
                      <s-heading>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.customizeYourBundle"
                        )}
                      </s-heading>
                      <s-paragraph color="subdued">
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.fineTuneColorsAndCornersBeforePreviewingTheBundle"
                        )}
                      </s-paragraph>
                    </s-stack>
                    <div
                      className={fullPageBundleStyles.templateDialogTabs}
                      role="tablist"
                      aria-label={translateAdmin(
                        "adminAttributes.templateCustomization"
                      )}
                    >
                      <button
                        type="button"
                        className={fullPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("templates")}
                      >
                        {translateAdmin("billing.comparison.templates")}
                      </button>
                      <button
                        type="button"
                        className={`${fullPageBundleStyles.templateDialogTab} ${fullPageBundleStyles.templateDialogTabActive}`}
                        aria-current="page"
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.colorsAndCorners"
                        )}
                      </button>
                      <button
                        type="button"
                        className={fullPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("textAndImages")}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.textAndImages"
                        )}
                      </button>
                    </div>
                  </div>
                  <div
                    className={fullPageBundleStyles.templateCustomizationGrid}
                  >
                    <s-section
                      heading={translateAdmin("adminAttributes.brandColors")}
                    >
                      <s-paragraph>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.useSettingsRarrDesignColorControlsForPrimarySecondaryBackgroundT"
                        )}
                      </s-paragraph>
                    </s-section>
                    <s-section
                      heading={translateAdmin("adminAttributes.corners")}
                    >
                      <s-paragraph>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.reviewBorderRadiusAndCardRoundingBeforeApplyingTheSelectedTempla"
                        )}
                      </s-paragraph>
                    </s-section>
                  </div>
                </div>
                <div className={fullPageBundleStyles.templateDialogFooter}>
                  <s-button
                    variant="secondary"
                    icon="arrow-left"
                    onClick={() => setTemplateModalStep("templates")}
                  >
                    {translateAdmin("settingsDcp.preview.surface.back")}
                  </s-button>
                  <s-button
                    variant="primary"
                    icon="arrow-right"
                    onClick={() => setTemplateModalStep("textAndImages")}
                  >
                    {translateAdmin("createBundle.actions.next")}
                  </s-button>
                </div>
              </>
            ) : templateModalStep === "textAndImages" ? (
              <>
                <div className={fullPageBundleStyles.templateDialogBody}>
                  <div className={fullPageBundleStyles.templateDialogIntro}>
                    <s-stack direction="block" gap="small">
                      <s-heading>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.customizeYourBundle"
                        )}
                      </s-heading>
                      <s-paragraph color="subdued">
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.reviewTemplateLanguageLabelsAndMediaBeforeFinishingCustomization"
                        )}
                      </s-paragraph>
                    </s-stack>
                    <div
                      className={fullPageBundleStyles.templateDialogTabs}
                      role="tablist"
                      aria-label={translateAdmin(
                        "adminAttributes.templateCustomization"
                      )}
                    >
                      <button
                        type="button"
                        className={fullPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("templates")}
                      >
                        {translateAdmin("billing.comparison.templates")}
                      </button>
                      <button
                        type="button"
                        className={fullPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("colorsAndCorners")}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.colorsAndCorners"
                        )}
                      </button>
                      <button
                        type="button"
                        className={`${fullPageBundleStyles.templateDialogTab} ${fullPageBundleStyles.templateDialogTabActive}`}
                        aria-current="page"
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.textAndImages"
                        )}
                      </button>
                    </div>
                  </div>
                  {templateSaveError ? (
                    <s-box paddingBlockEnd="small-200">
                      <s-banner
                        heading={translateAdmin(
                          "adminAttributes.templateNotSaved"
                        )}
                        tone="critical"
                      >
                        {templateSaveError}
                      </s-banner>
                    </s-box>
                  ) : null}
                  <div
                    className={fullPageBundleStyles.templateCustomizationGrid}
                  >
                    <s-section
                      heading={translateAdmin(
                        "adminAttributes.textAndLanguage"
                      )}
                    >
                      <s-paragraph>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.reviewProductCardBundleCartBundlePopupsToastsAndAddonsTextFromSe"
                        )}
                      </s-paragraph>
                    </s-section>
                    <s-section
                      heading={translateAdmin("adminAttributes.imagesAndGIFs")}
                    >
                      <s-paragraph>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.confirmTemplateMediaUploadedImagesAndLoadingGifsBeforeSavingTheT"
                        )}
                      </s-paragraph>
                    </s-section>
                  </div>
                </div>
                <div className={fullPageBundleStyles.templateDialogFooter}>
                  <s-button
                    variant="secondary"
                    icon="arrow-left"
                    onClick={() => setTemplateModalStep("colorsAndCorners")}
                  >
                    {translateAdmin("settingsDcp.preview.surface.back")}
                  </s-button>
                  <s-button
                    type="button"
                    variant="primary"
                    icon="check"
                    disabled={!pendingDesignPresetId || undefined}
                    loading={
                      templateFetcher.state === "submitting" || undefined
                    }
                    onClick={handleTemplateNext}
                  >
                    {translateAdmin(
                      "dashboard.storefrontSetup.enableModal.done"
                    )}
                  </s-button>
                </div>
              </>
            ) : templateModalStep === "enableThemeExtension" ? (
              <div className={fullPageBundleStyles.templateDialogBody}>
                <s-stack direction="block" gap="small">
                  <s-heading>
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.enableYourPreview"
                    )}
                  </s-heading>
                  <s-paragraph color="subdued">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.aSimpleSwitchInYourThemeEditorNothingChangesOnYourStoreUntilYouD"
                    )}
                  </s-paragraph>
                </s-stack>
                <div className={fullPageBundleStyles.templateReadyPanel}>
                  <div className={fullPageBundleStyles.templateReadyIcon}>
                    <s-icon type="view" />
                  </div>
                  <s-heading>
                    {translateAdmin("common.appEmbed.guideTitle")}
                  </s-heading>
                  <s-paragraph color="subdued">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.openYourThemeEditorEnableTheOnlyBundlesAppEmbedThenReturnHereToP"
                    )}
                  </s-paragraph>
                  <s-stack
                    direction="inline"
                    gap="small"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <s-button
                      variant="secondary"
                      icon="theme-edit"
                      onClick={() =>
                        themeEditorUrl
                          ? openThemeEditorInNewTab(themeEditorUrl)
                          : undefined
                      }
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.openThemeEditor"
                      )}
                    </s-button>
                    <s-button
                      variant="primary"
                      icon="check"
                      onClick={() => setTemplateModalStep("confirm")}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.iVeEnabledIt"
                      )}
                    </s-button>
                  </s-stack>
                </div>
              </div>
            ) : (
              <TemplateReadyScreen
                isPreviewLoading={
                  isPreviewBundleLoading || templateFetcher.state !== "idle"
                }
                onPreview={() => {
                  void handleTemplatePreview(setPreviewFeedbackUrl);
                }}
              />
            )}
          </div>
        ) : null}
      </Modal>
      {previewFeedbackUrl ? (
        <TemplatePreviewFeedbackModal
          previewUrl={previewFeedbackUrl}
          onClose={() => setPreviewFeedbackUrl(null)}
        />
      ) : null}
    </>
  );
}
