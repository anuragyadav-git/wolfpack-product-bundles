import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {ConfigureCanvasHeader} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader";
import {PpbCanvasHeader} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader";
import {SettingsControlsWorkspace} from "../../../app/routes/app/app.settings/SettingsControlsWorkspace";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (value: string) => value,
}));

jest.mock("../../../app/components/AdminPageNavigation", () => ({
  AdminPageTitleBar: () => null,
}));

jest.mock("../../../app/components/AdminWarningGroup", () => ({
  AdminWarningGroup: () => null,
}));

jest.mock("../../../app/components/AppEmbedBanner", () => ({
  AppEmbedBanner: () => null,
}));

jest.mock("../../../app/components/UnlistedBundleBanner", () => ({
  UnlistedBundleBanner: () => null,
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ppb-warning-presentation",
  () => ({
    buildPpbCanvasWarnings: () => [],
    getPpbStandaloneUnlistedWarning: () => null,
  }),
);

jest.mock(
  "../../../app/routes/app/app.settings/SettingsDesignFields",
  () => ({getControlTabIcon: () => "settings"}),
);

jest.mock("../../../app/routes/app/app.settings/SettingsControls", () => ({
  ControlsContentCards: () => null,
  SettingsVariablesModal: () => null,
}));

jest.mock("../../../app/routes/app/app.settings/SettingsFeedback", () => ({
  SettingsContextualSaveBar: () => null,
  SettingsHelpModal: () => null,
}));

describe("Admin workspace back actions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  function activateBack(label: string) {
    const action = Array.from(
      container.querySelectorAll<HTMLElement>("button, s-button"),
    ).find(
      (element) =>
        element.getAttribute("aria-label") === label ||
        element.getAttribute("accessibilitylabel") === label,
    );

    expect(action).toBeDefined();
    flushSync(() => {
      action?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
    });
  }

  it("delegates the FPB back action to its route owner", () => {
    const handleBackClick = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(ConfigureCanvasHeader, {
          appEmbedEnabled: true,
          bundleProduct: null,
          bundleProductId: null,
          fetcherState: "idle",
          fullPageBundleStyles: {},
          handleBackClick,
          handlePreviewBundle: jest.fn(),
          isPreviewBundleLoading: false,
          openThemeEditorForAppEmbed: jest.fn(),
          openProductInAdmin: jest.fn(),
          parentProductStatusUi: {
            isLoading: false,
            showUnlistedBanner: false,
          },
          readinessScore: 0,
          setReadinessOpen: jest.fn(),
          shop: "store.myshopify.com",
          themeEditorUrl: null,
        } as any),
      );
    });

    activateBack("adminAttributes.backToDashboard");
    expect(handleBackClick).toHaveBeenCalledTimes(1);
  });

  it("delegates the PPB back action to its route owner", () => {
    const handleBackClick = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(PpbCanvasHeader, {
          appEmbedEnabled: true,
          bundle: {},
          fetcher: {state: "idle"},
          handleBackClick,
          handlePreviewBundle: jest.fn(),
          isPreviewBundleLoading: false,
          loadedBundleProduct: null,
          openThemeEditorForAppEmbed: jest.fn(),
          openProductInAdmin: jest.fn(),
          operationAlert: null,
          parentProductStatusUi: {isLoading: false, showUnlistedBanner: false},
          readinessScore: 0,
          setReadinessOpen: jest.fn(),
          shop: "store.myshopify.com",
          themeEditorUrl: null,
        } as unknown as React.ComponentProps<typeof PpbCanvasHeader>),
      );
    });

    activateBack("adminAttributes.backToDashboard");
    expect(handleBackClick).toHaveBeenCalledTimes(1);
  });

  it("delegates the Settings back action to its workspace owner", () => {
    const onBack = jest.fn();
    const layout = {
      label: "Landing Page Layout",
      tabs: [{title: "Product Card", fields: []}],
    };

    flushSync(() => {
      root.render(
        React.createElement(SettingsControlsWorkspace, {
          activeControlLayout: layout.label,
          controlFieldValues: {},
          controlsNavigationRef: {current: null},
          hasNestedControlGroups: false,
          isControlsNavigationOpen: false,
          isDirty: false,
          selectedControlFields: [],
          selectedControlGroupTitle: "",
          selectedControlGroupTitles: [],
          selectedControlLayout: layout,
          selectedControlTab: layout.tabs[0],
          settingsHelpArticle: null,
          settingsVariablesModal: null,
          taskAlert: null,
          onBack,
          onDismissAlert: jest.fn(),
          onDiscard: jest.fn(),
          onFieldAction: jest.fn(),
          onFieldChange: jest.fn(),
          onGroupChange: jest.fn(),
          onHelpClose: jest.fn(),
          onLayoutChange: jest.fn(),
          onNavigationOpenChange: jest.fn(),
          onSave: jest.fn(),
          onTabChange: jest.fn(),
          onVariablesClose: jest.fn(),
        } as any),
      );
    });

    activateBack("adminAttributes.backToSettings");
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
