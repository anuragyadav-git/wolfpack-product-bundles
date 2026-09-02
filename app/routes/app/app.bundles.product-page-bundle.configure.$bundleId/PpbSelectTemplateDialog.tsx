import { Modal } from "@shopify/app-bridge-react";
import { useState } from "react";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import { TemplateReadyScreen } from "../../../components/bundle-configure/TemplateReadyScreen";
import { TemplatePreviewFeedbackModal } from "../../../components/bundle-configure/TemplatePreviewFeedbackModal";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbSelectTemplateDialog() {
  const [previewFeedbackUrl, setPreviewFeedbackUrl] = useState<string | null>(
    null
  );
  const {
    closeSelectTemplateDialog,
    handleTemplateNext,
    handleTemplatePreview,
    isPreviewBundleLoading,
    isSelectTemplateModalOpen,
    pendingDesignPresetId,
    pendingDesignTemplate,
    productPageBundleStyles,
    productPageTemplateOptions,
    setPendingDesignPresetId,
    setPendingDesignTemplate,
    setTemplateModalStep,
    templateFetcher,
    templateModalStep,
    templateSaveError,
    themeEditorUrl,
  } = usePpbConfigureContext();

  return (
    <>
      <Modal
        id="ppb-template-customization-modal"
        open={isSelectTemplateModalOpen}
        onHide={closeSelectTemplateDialog}
        variant="max"
      >
        <ui-title-bar title={translateAdmin("adminAttributes.customization")} />
        {isSelectTemplateModalOpen ? (
          <div className={productPageBundleStyles.templateDialogContent}>
            {templateModalStep === "templates" ? (
              <>
                <div className={productPageBundleStyles.templateDialogBody}>
                  <div className={productPageBundleStyles.templateDialogIntro}>
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
                  <div className={productPageBundleStyles.templateDialogGrid}>
                    {productPageTemplateOptions.map((templateOption) => {
                      const isSelected =
                        pendingDesignPresetId === templateOption.presetId &&
                        pendingDesignTemplate === templateOption.layoutTemplate;
                      return (
                        <button
                          key={templateOption.presetId}
                          type="button"
                          className={`${
                            productPageBundleStyles.templateOptionCard
                          } ${
                            isSelected
                              ? productPageBundleStyles.templateOptionCardSelected
                              : ""
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => {
                            setPendingDesignTemplate(
                              templateOption.layoutTemplate
                            );
                            setPendingDesignPresetId(templateOption.presetId);
                          }}
                        >
                          <span
                            className={
                              productPageBundleStyles.templateOptionImageFrame
                            }
                          >
                            <img
                              src={templateOption.image}
                              alt={templateOption.label}
                              className={
                                productPageBundleStyles.templateOptionImage
                              }
                            />
                          </span>
                          <span
                            className={
                              productPageBundleStyles.templateOptionFooter
                            }
                          >
                            <span
                              className={
                                productPageBundleStyles.templateOptionLabel
                              }
                            >
                              {templateOption.label}
                            </span>
                            <span
                              className={`${
                                productPageBundleStyles.templateOptionAction
                              } ${
                                isSelected
                                  ? productPageBundleStyles.templateOptionActionSelected
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
                <div className={productPageBundleStyles.templateDialogFooter}>
                  <s-button
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
                <div className={productPageBundleStyles.templateDialogBody}>
                  <div className={productPageBundleStyles.templateDialogIntro}>
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
                      className={productPageBundleStyles.templateDialogTabs}
                      role="tablist"
                      aria-label={translateAdmin(
                        "adminAttributes.templateCustomization"
                      )}
                    >
                      <button
                        type="button"
                        className={productPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("templates")}
                      >
                        {translateAdmin("billing.comparison.templates")}
                      </button>
                      <button
                        type="button"
                        className={`${productPageBundleStyles.templateDialogTab} ${productPageBundleStyles.templateDialogTabActive}`}
                        aria-current="page"
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.colorsAndCorners"
                        )}
                      </button>
                      <button
                        type="button"
                        className={productPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("textAndImages")}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.textAndImages"
                        )}
                      </button>
                    </div>
                  </div>
                  <div
                    className={
                      productPageBundleStyles.templateCustomizationGrid
                    }
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
                <div className={productPageBundleStyles.templateDialogFooter}>
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
                <div className={productPageBundleStyles.templateDialogBody}>
                  <div className={productPageBundleStyles.templateDialogIntro}>
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
                      className={productPageBundleStyles.templateDialogTabs}
                      role="tablist"
                      aria-label={translateAdmin(
                        "adminAttributes.templateCustomization"
                      )}
                    >
                      <button
                        type="button"
                        className={productPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("templates")}
                      >
                        {translateAdmin("billing.comparison.templates")}
                      </button>
                      <button
                        type="button"
                        className={productPageBundleStyles.templateDialogTab}
                        onClick={() => setTemplateModalStep("colorsAndCorners")}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configuretemplatedialog.colorsAndCorners"
                        )}
                      </button>
                      <button
                        type="button"
                        className={`${productPageBundleStyles.templateDialogTab} ${productPageBundleStyles.templateDialogTabActive}`}
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
                    className={
                      productPageBundleStyles.templateCustomizationGrid
                    }
                  >
                    <s-section
                      heading={translateAdmin(
                        "adminAttributes.textAndLanguage"
                      )}
                    >
                      <s-paragraph>
                        {translateAdmin(
                          "adminExtracted.appBundlesProductPageBundleConfigure.ppbselecttemplatedialog.reviewProductCardBundleCartBundlePopupsToastsAddonsAndMessagesTe"
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
                <div className={productPageBundleStyles.templateDialogFooter}>
                  <s-button
                    variant="secondary"
                    icon="arrow-left"
                    onClick={() => setTemplateModalStep("colorsAndCorners")}
                  >
                    {translateAdmin("settingsDcp.preview.surface.back")}
                  </s-button>
                  <s-button
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
              <div className={productPageBundleStyles.templateDialogBody}>
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
                <div className={productPageBundleStyles.templateReadyPanel}>
                  <div className={productPageBundleStyles.templateReadyIcon}>
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
                  handleTemplatePreview(setPreviewFeedbackUrl);
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
