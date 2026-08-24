import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("../../../app/lib/theme-editor-navigation.client", () => ({
  openThemeEditorInNewTab: jest.fn(),
}));

jest.mock("../../../app/components/bundle-configure/TemplateReadyScreen", () => ({
  TemplateReadyScreen: () => null,
}));

const ppbContext = {
  closeSelectTemplateDialog: jest.fn(),
  handleTemplateNext: jest.fn(),
  handleTemplatePreview: jest.fn(),
  isPreviewBundleLoading: false,
  isSelectTemplateModalOpen: false,
  pendingDesignPresetId: null,
  pendingDesignTemplate: null,
  productPageBundleStyles: {},
  productPageTemplateOptions: [],
  selectTemplateDialogRef: { current: null },
  setPendingDesignPresetId: jest.fn(),
  setPendingDesignTemplate: jest.fn(),
  setTemplateModalStep: jest.fn(),
  templateFetcher: { state: "idle" },
  templateModalStep: "templates",
  templateSaveError: null,
  themeEditorUrl: null,
};

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({ usePpbConfigureContext: () => ppbContext }),
);

describe("Admin projected template dialog visibility", () => {
  it("renders the PPB customization workflow only while app state is open", async () => {
    const { PpbSelectTemplateDialog } = await import(
      "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog"
    );

    ppbContext.isSelectTemplateModalOpen = false;
    expect(renderToStaticMarkup(React.createElement(PpbSelectTemplateDialog))).not.toContain(
      "Customize your bundle",
    );

    ppbContext.isSelectTemplateModalOpen = true;
    expect(renderToStaticMarkup(React.createElement(PpbSelectTemplateDialog))).toContain(
      "Customize your bundle",
    );
  });

  it("renders the FPB customization workflow only while app state is open", async () => {
    const { FpbTemplateDialog } = await import(
      "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureTemplateDialog"
    );
    const flow = {
      closeSelectTemplateModal: jest.fn(),
      fullPageBundleStyles: {},
      fullPageTemplateOptions: [],
      handleTemplateNext: jest.fn(),
      handleTemplatePreview: jest.fn(),
      isPreviewBundleLoading: false,
      isSelectTemplateModalOpen: false,
      OptimisedImage: () => null,
      pendingDesignPresetId: null,
      pendingDesignTemplate: null,
      selectTemplateModalRef: { current: null },
      setPendingDesignPresetId: jest.fn(),
      setPendingDesignTemplate: jest.fn(),
      setTemplateModalStep: jest.fn(),
      templateFetcher: { state: "idle" },
      templateModalStep: "templates",
      templateSaveError: null,
      themeEditorUrl: null,
    };

    expect(renderToStaticMarkup(React.createElement(FpbTemplateDialog, { flow: flow as any }))).not.toContain(
      "Customize your bundle",
    );

    flow.isSelectTemplateModalOpen = true;
    expect(renderToStaticMarkup(React.createElement(FpbTemplateDialog, { flow: flow as any }))).toContain(
      "Customize your bundle",
    );
  });
});
