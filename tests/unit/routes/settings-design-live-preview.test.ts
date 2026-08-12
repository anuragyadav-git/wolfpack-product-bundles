import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DESIGN_CONFIGURATION } from "../../../app/lib/admin-configuration-surfaces";
import { DesignSettingsView } from "../../../app/routes/app/app.settings/DesignSettingsView";
import { DesignFields } from "../../../app/routes/app/app.settings/SettingsDesignFields";

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
        selectedDesignTab: DESIGN_CONFIGURATION[0],
        isExpertColorControls: false,
        isExpertScopeActive: false,
        activeDesignScope: "General",
        designFieldValues: { "Primary Color": "#123456" },
        designGateMessage: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [{ id: "bundle-1", name: "Summer Box", type: "Landing Page", viewUrl: "https://shop.test/pages/bundle" }],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setActiveDesignTab: jest.fn(),
        setIsExpertScopeActive: jest.fn(),
        setDesignGateMessage: jest.fn(),
        setActiveDesignScope: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setIsExpertColorControls: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).not.toContain("<iframe");
    expect(view).toContain('<s-query-container containerName="design-settings">');
    expect(view).toContain('aria-label="settingsDcp.preview.workspace.label"');
    expect(view).toContain("settingsDcp.preview.workspace.preview");
    expect(view).toContain("settingsDcp.preview.workspace.customize");
    expect(view).toContain('aria-pressed="true"');
    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).toContain('aria-label="settingsDcp.preview.previewOnly"');
    expect(view).toContain("disabled");
    expect(view).toContain("<s-color-field");
    expect(view).toContain("<s-button");
  });

  it("keeps local Design controls and preview available without a storefront bundle", () => {
    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        selectedDesignTab: DESIGN_CONFIGURATION[0],
        isExpertColorControls: false,
        isExpertScopeActive: false,
        activeDesignScope: "General",
        designFieldValues: {},
        designGateMessage: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setActiveDesignTab: jest.fn(),
        setIsExpertScopeActive: jest.fn(),
        setDesignGateMessage: jest.fn(),
        setActiveDesignScope: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setIsExpertColorControls: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).toContain("<s-color-field");
    expect(view).not.toContain("inert");
    expect(view).toContain('<s-button icon="view" disabled="true">Preview Bundle</s-button>');
  });

  it("exposes FPB loading controls and the loading preview surface", () => {
    const imagesTab = DESIGN_CONFIGURATION.find((tab) => tab.title === "Images & GIFs");
    expect(imagesTab).toBeDefined();

    const view = renderToStaticMarkup(
      React.createElement(DesignSettingsView, {
        selectedDesignTab: imagesTab ?? DESIGN_CONFIGURATION[0],
        isExpertColorControls: false,
        isExpertScopeActive: false,
        activeDesignScope: "General",
        designFieldValues: {},
        designGateMessage: null,
        isActiveSubpageDirty: false,
        isPreviewModalOpen: false,
        previewBundles: [{ id: "bundle-1", name: "Summer Box", type: "Landing Page", viewUrl: "https://shop.test/pages/bundle" }],
        saveMessage: null,
        setSettingsView: jest.fn(),
        setIsPreviewModalOpen: jest.fn(),
        setActiveDesignTab: jest.fn(),
        setIsExpertScopeActive: jest.fn(),
        setDesignGateMessage: jest.fn(),
        setActiveDesignScope: jest.fn(),
        setDesignFieldValues: jest.fn(),
        setIsExpertColorControls: jest.fn(),
        setSaveMessage: jest.fn(),
        discardActiveSettingsChanges: jest.fn(),
        saveActiveSettingsChanges: jest.fn(),
      }),
    );

    expect(view).toContain('aria-label="Live bundle preview"');
    expect(view).toContain("FPB Loading GIF");
    expect(view).toContain("Loading Screen Background Color");
    expect(view).toContain('<s-option value="loading">');
  });
});
