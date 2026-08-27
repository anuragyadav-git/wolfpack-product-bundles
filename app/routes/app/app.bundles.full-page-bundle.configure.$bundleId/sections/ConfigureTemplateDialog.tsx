import { Modal } from "@shopify/app-bridge-react";
import { useState } from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { openThemeEditorInNewTab } from "../../../../lib/theme-editor-navigation.client";
import { TemplateReadyScreen } from "../../../../components/bundle-configure/TemplateReadyScreen";
import { TemplatePreviewFeedbackModal } from "../../../../components/bundle-configure/TemplatePreviewFeedbackModal";

export function FpbTemplateDialog({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const [previewFeedbackUrl, setPreviewFeedbackUrl] = useState<string | null>(null);
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
      <ui-title-bar title="Customization" />
      {isSelectTemplateModalOpen ? (
        <div className={fullPageBundleStyles.templateDialogContent}>
          {templateModalStep === "templates" ? (
            <>
              <div className={fullPageBundleStyles.templateDialogBody}>
                <div className={fullPageBundleStyles.templateDialogIntro}>
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Choose a design that suits your needs and fits your brand
                    </s-paragraph>
                  </s-stack>
                  <s-button
                    variant="secondary"
                    onClick={() => setTemplateModalStep("colorsAndCorners")}
                  >
                    Customize Colors &amp; Language
                  </s-button>
                </div>
                {templateSaveError ? (
                  <s-banner tone="critical">{templateSaveError}</s-banner>
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
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Fine tune colors and corners before previewing the bundle
                    </s-paragraph>
                  </s-stack>
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
                  <s-stack direction="block" gap="small">
                    <s-heading>Customize your bundle</s-heading>
                    <s-paragraph color="subdued">
                      Review template language, labels, and media before
                      finishing customization
                    </s-paragraph>
                  </s-stack>
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
                  <s-banner tone="critical">{templateSaveError}</s-banner>
                ) : null}
                <div className={fullPageBundleStyles.templateCustomizationGrid}>
                  <s-section heading="Text and language">
                    <s-paragraph>
                      Review Product Card, Bundle Cart, Bundle, Popups, Toasts,
                      and Addons text from Settings Language.
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
              <s-stack direction="block" gap="small">
                <s-heading>Enable your preview</s-heading>
                <s-paragraph color="subdued">
                  A simple switch in your theme editor. Nothing changes on your
                  store until you decide.
                </s-paragraph>
              </s-stack>
              <div className={fullPageBundleStyles.templateReadyPanel}>
                <div className={fullPageBundleStyles.templateReadyIcon}>
                  <s-icon type="view" />
                </div>
                <s-heading>Enable app embed</s-heading>
                <s-paragraph color="subdued">
                  Open your theme editor, enable the Wolfpack Bundles app embed,
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
