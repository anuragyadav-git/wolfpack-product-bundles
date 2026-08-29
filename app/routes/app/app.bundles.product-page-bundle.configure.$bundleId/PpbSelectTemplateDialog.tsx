import { Modal } from "@shopify/app-bridge-react";
import { useState } from "react";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import { TemplateReadyScreen } from "../../../components/bundle-configure/TemplateReadyScreen";
import { TemplatePreviewFeedbackModal } from "../../../components/bundle-configure/TemplatePreviewFeedbackModal";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbSelectTemplateDialog() {
  const [previewFeedbackUrl, setPreviewFeedbackUrl] = useState<string | null>(null);
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
      <ui-title-bar title="Customization" />
      {isSelectTemplateModalOpen ? (
        <div className={productPageBundleStyles.templateDialogContent}>
          {templateModalStep === "templates" ? (
            <>
              <div className={productPageBundleStyles.templateDialogBody}>
                <div className={productPageBundleStyles.templateDialogIntro}>
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Choose a design that suits your needs and fits your brand
                    </s-paragraph>
                  </s-stack>
                  <s-button
                    variant="secondary"
                    icon="paint-brush-flat"
                    onClick={() => setTemplateModalStep("colorsAndCorners")}
                  >
                    Customize Colors &amp; Language
                  </s-button>
                </div>
                {templateSaveError ? (
                  <s-box paddingBlockEnd="base">
                    <s-banner heading="Template not saved" tone="critical">{templateSaveError}</s-banner>
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
                  loading={templateFetcher.state === "submitting" || undefined}
                  onClick={handleTemplateNext}
                >
                  Next
                </s-button>
              </div>
            </>
          ) : templateModalStep === "colorsAndCorners" ? (
            <>
              <div className={productPageBundleStyles.templateDialogBody}>
                <div className={productPageBundleStyles.templateDialogIntro}>
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Fine tune colors and corners before previewing the bundle
                    </s-paragraph>
                  </s-stack>
                  <div
                    className={productPageBundleStyles.templateDialogTabs}
                    role="tablist"
                    aria-label="Template customization"
                  >
                    <button
                      type="button"
                      className={productPageBundleStyles.templateDialogTab}
                      onClick={() => setTemplateModalStep("templates")}
                    >
                      Templates
                    </button>
                    <button
                      type="button"
                      className={`${productPageBundleStyles.templateDialogTab} ${productPageBundleStyles.templateDialogTabActive}`}
                      aria-current="page"
                    >
                      Colors and corners
                    </button>
                    <button
                      type="button"
                      className={productPageBundleStyles.templateDialogTab}
                      onClick={() => setTemplateModalStep("textAndImages")}
                    >
                      Text and images
                    </button>
                  </div>
                </div>
                <div
                  className={productPageBundleStyles.templateCustomizationGrid}
                >
                  <s-section heading="Brand colors">
                    <s-paragraph>
                      Use Settings &rarr; Design color controls for primary,
                      secondary, background, text, border, and discount accents.
                    </s-paragraph>
                  </s-section>
                  <s-section heading="Corners">
                    <s-paragraph>
                      Review border radius and card rounding before applying the
                      selected template.
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
                  Back
                </s-button>
                <s-button
                  variant="primary"
                  icon="arrow-right"
                  onClick={() => setTemplateModalStep("textAndImages")}
                >
                  Next
                </s-button>
              </div>
            </>
          ) : templateModalStep === "textAndImages" ? (
            <>
              <div className={productPageBundleStyles.templateDialogBody}>
                <div className={productPageBundleStyles.templateDialogIntro}>
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Review template language, labels, and media before
                      finishing customization
                    </s-paragraph>
                  </s-stack>
                  <div
                    className={productPageBundleStyles.templateDialogTabs}
                    role="tablist"
                    aria-label="Template customization"
                  >
                    <button
                      type="button"
                      className={productPageBundleStyles.templateDialogTab}
                      onClick={() => setTemplateModalStep("templates")}
                    >
                      Templates
                    </button>
                    <button
                      type="button"
                      className={productPageBundleStyles.templateDialogTab}
                      onClick={() => setTemplateModalStep("colorsAndCorners")}
                    >
                      Colors and corners
                    </button>
                    <button
                      type="button"
                      className={`${productPageBundleStyles.templateDialogTab} ${productPageBundleStyles.templateDialogTabActive}`}
                      aria-current="page"
                    >
                      Text and images
                    </button>
                  </div>
                </div>
                {templateSaveError ? (
                  <s-box paddingBlockEnd="base">
                    <s-banner heading="Template not saved" tone="critical">{templateSaveError}</s-banner>
                  </s-box>
                ) : null}
                <div
                  className={productPageBundleStyles.templateCustomizationGrid}
                >
                  <s-section heading="Text and language">
                    <s-paragraph>
                      Review Product Card, Bundle Cart, Bundle, Popups, Toasts,
                      Addons, and Messages text from Settings Language.
                    </s-paragraph>
                  </s-section>
                  <s-section heading="Images and GIFs">
                    <s-paragraph>
                      Confirm template media, uploaded images, and loading GIFs
                      before saving the template selection.
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
                  Back
                </s-button>
                <s-button
                  variant="primary"
                  icon="check"
                  disabled={!pendingDesignPresetId || undefined}
                  loading={templateFetcher.state === "submitting" || undefined}
                  onClick={handleTemplateNext}
                >
                  Done
                </s-button>
              </div>
            </>
          ) : templateModalStep === "enableThemeExtension" ? (
            <div className={productPageBundleStyles.templateDialogBody}>
              <s-stack direction="block" gap="small">
                <s-heading>Enable your preview</s-heading>
                <s-paragraph color="subdued">
                  A simple switch in your theme editor. Nothing changes on your
                  store until you decide.
                </s-paragraph>
              </s-stack>
              <div className={productPageBundleStyles.templateReadyPanel}>
                <div className={productPageBundleStyles.templateReadyIcon}>
                  <s-icon type="view" />
                </div>
                <s-heading>Enable app embed</s-heading>
                <s-paragraph color="subdued">
                  Open your theme editor, enable the Only Bundles app embed,
                  then return here to preview your bundle.
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
                    Open theme editor
                  </s-button>
                  <s-button
                    variant="primary"
                    icon="check"
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
