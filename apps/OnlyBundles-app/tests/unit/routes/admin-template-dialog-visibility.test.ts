import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@shopify/app-bridge-react", () => ({
  Modal: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? React.createElement("ui-modal", null, children) : null,
}));

jest.mock("../../../app/lib/theme-editor-navigation.client", () => ({
  openThemeEditorInNewTab: jest.fn(),
}));

jest.mock(
  "../../../app/components/bundle-configure/TemplateReadyScreen",
  () => ({
    TemplateReadyScreen: () => null,
  })
);

const ppbContext = {
  closeSelectTemplateDialog: jest.fn(),
  handleTemplateNext: jest.fn(),
  handleTemplatePreview: jest.fn(),
  isPreviewBundleLoading: false,
  isSelectTemplateModalOpen: false,
  pendingDesignPresetId: null as string | null,
  pendingDesignTemplate: null as string | null,
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
  () => ({ usePpbConfigureContext: () => ppbContext })
);

describe("Admin template save loading", () => {
  it("keeps the PPB template step visible with a loading Next action while saving", async () => {
    const { PpbSelectTemplateDialog } = await import(
      "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog"
    );

    ppbContext.isSelectTemplateModalOpen = true;
    ppbContext.pendingDesignPresetId = "SIMPLIFIED";
    ppbContext.pendingDesignTemplate = "PDP_MODAL";
    ppbContext.templateFetcher.state = "submitting";

    const view = renderToStaticMarkup(
      React.createElement(PpbSelectTemplateDialog)
    );

    expect(view).toMatch(/<s-button[^>]*loading="true"[^>]*>Next<\/s-button>/);
    expect(view).toContain("Customize your bundle");

    ppbContext.templateFetcher.state = "idle";
  });

  it("keeps the FPB template step visible with a loading Next action while saving", async () => {
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
      isSelectTemplateModalOpen: true,
      pendingDesignPresetId: "DEFAULT_FBP",
      pendingDesignTemplate: "FBP_SIDE_FOOTER",
      setPendingDesignPresetId: jest.fn(),
      setPendingDesignTemplate: jest.fn(),
      setTemplateModalStep: jest.fn(),
      templateFetcher: { state: "submitting" },
      templateModalStep: "templates",
      templateSaveError: null,
      themeEditorUrl: null,
    };

    const view = renderToStaticMarkup(
      React.createElement(FpbTemplateDialog, { flow: flow as any })
    );

    expect(view).toMatch(/<s-button[^>]*loading="true"[^>]*>Next<\/s-button>/);
    expect(view).toContain("Customize your bundle");
  });
});
