import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DESIGN_CONFIGURATION } from "../../../app/lib/admin-configuration-surfaces";
import { DesignSettingsView } from "../../../app/routes/app/app.settings/DesignSettingsView";
import { BundlePreviewModal, DesignFields } from "../../../app/routes/app/app.settings/SettingsDesignFields";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({ saveBar: { show: jest.fn(), hide: jest.fn() } }),
}));

jest.mock("../../../app/components/shared/FilePicker", () => ({
  FilePicker: ({ label }: { label: string }) => React.createElement("div", null, label),
}));

describe("DesignSettingsView live preview", () => {
  it("disables Image Fit while the Loading preview surface is active", () => {
    const imageFields = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs")?.fields ?? [];
    const view = renderToStaticMarkup(
      React.createElement(DesignFields, {
        title: "Images & GIFs",
        fields: imageFields,
        values: {},
        disabledFieldKeys: ["Image Fit"],
        onFieldChange: jest.fn(),
      }),
    );

    expect(view).toContain('<s-select label="Image Fit" name="Image Fit" value="Cover" disabled="true">');
    expect(view).toContain("FPB Loading GIF");
    expect(view).toContain("Loading Screen Background Color");
  });

  it("renders live feedback inside the existing design settings view", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        designFieldValues: { "Primary Color": "#123456" },
        inheritedColorFieldKeys: [],
        shopBrandColors: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [{ id: "bundle-1", name: "Summer Box", type: "Landing Page", bundleType: "full_page", viewUrl: "https://shop.test/pages/bundle" }],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setInheritedColorFieldKeys: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('src="/settings-design-preview-frame"');
    expect(view).toContain('sandbox="allow-scripts allow-same-origin"');
    expect(view).toContain('<s-query-container containerName="design-settings">');
    expect(view).toContain('aria-label="settingsDcp.preview.workspace.label"');
    expect(view).toContain("settingsDcp.preview.workspace.preview");
    expect(view).toContain("settingsDcp.preview.workspace.customize");
    expect(view).toContain('aria-pressed="true"');
    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).not.toContain('aria-label="settingsDcp.preview.previewOnly"');
    expect(view).toContain("disabled");
    expect(view).toContain("<s-color-field");
    expect(view).toContain("<s-button");
    expect(view).toContain("Customize this component");
    expect(view).not.toContain("Expert Color Controls");
    expect(view).not.toContain("Brand Colors");
  });

  it("marks inherited contextual colors as Shop Brand values", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        designFieldValues: {},
        inheritedColorFieldKeys: ["expert.productCard.productCardButtonColor"],
        shopBrandColors: {
          primary: { background: "#123456", foreground: "#ffffff" },
          secondary: { background: "#e8eef5", foreground: "#17202a" },
        },
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setInheritedColorFieldKeys: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('<s-badge tone="info">Shop Brand</s-badge>');
    expect(view).toContain('value="#123456"');
  });

  it("keeps local Design controls and preview available without a storefront bundle", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        designFieldValues: {},
        inheritedColorFieldKeys: [],
        shopBrandColors: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setInheritedColorFieldKeys: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).toContain("<s-color-field");
    expect(view).not.toContain("inert");
  });

  it("keeps FPB loading controls hidden until the Loading surface is selected", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs");
    expect(imagesTab).toBeDefined();

    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        designFieldValues: {},
        inheritedColorFieldKeys: [],
        shopBrandColors: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [{ id: "bundle-1", name: "Summer Box", type: "Landing Page", bundleType: "full_page", viewUrl: "https://shop.test/pages/bundle" }],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setInheritedColorFieldKeys: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).not.toContain("FPB Loading GIF");
    expect(view).not.toContain("Loading Screen Background Color");
    expect(view).toContain('<s-option value="loading">');
  });

  it("requires saved Design settings before storefront preview", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        designFieldValues: {},
        inheritedColorFieldKeys: [],
        shopBrandColors: null,
        isActiveSubpageDirty: true,
        isDesignSaving: false,
        isPreviewModalOpen: false,
        previewBundles: [{
          id: "bundle-1",
          name: "Summer Box",
          type: "Landing Page",
          bundleType: "full_page",
          viewUrl: "https://shop.test/apps/product-bundles/wpb/1",
        }],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setInheritedColorFieldKeys: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain("settingsDcp.preview.storefront.saveBeforePreview");
    expect(view).toContain('accessibilityLabel="settingsDcp.preview.storefront.open" disabled="true"');
  });

  it("renders the storefront bundle chooser as a Polaris modal and table", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundlePreviewModal, {
        bundles: [{
          id: "bundle-1",
          name: "Summer Box",
          type: "Landing Page",
          bundleType: "full_page",
          viewUrl: "https://shop.test/apps/product-bundles/wpb/1",
        }],
        onClose: jest.fn(),
      }),
    );

    expect(view).toContain('<s-modal id="settings-design-bundle-preview"');
    expect(view).toContain("<s-table");
    expect(view).toContain("settingsDcp.preview.storefront.view");
    expect(view).not.toContain('role="dialog"');
  });
});
