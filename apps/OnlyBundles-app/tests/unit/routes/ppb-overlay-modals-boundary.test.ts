import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbOverlayModals,
  type PpbOverlayModalsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbOverlayModals";

const mockReadiness = jest.fn<unknown, [Record<string, unknown>]>(() => null);
const mockGuidedTour = jest.fn<unknown, [Record<string, unknown>]>(() => null);
const mockLanguage = jest.fn<unknown, [Record<string, unknown>]>(() => null);
const mockPreview = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock("../../../app/components/bundle-configure/BundleReadinessOverlay", () => ({
  BundleReadinessOverlay: (props: Record<string, unknown>) => mockReadiness(props),
}));
jest.mock("../../../app/components/bundle-configure/BundleGuidedTour", () => ({
  BundleGuidedTour: (props: Record<string, unknown>) => mockGuidedTour(props),
}));
jest.mock("../../../app/components/bundle-configure/MultiLanguageTextModal", () => ({
  MultiLanguageTextModal: (props: Record<string, unknown>) => mockLanguage(props),
}));
jest.mock("../../../app/components/EnablePreviewModal", () => ({
  EnablePreviewModal: (props: Record<string, unknown>) => mockPreview(props),
}));
describe("PPB global overlay boundary", () => {
  it("projects explicit readiness, tour, language, and preview contracts", () => {
    const setIsMultiLanguageModalOpen = jest.fn();
    const props = {
      activeMultiLanguageValues: {},
      enablePreviewGate: { modalProps: { open: false } },
      handleGuidedTourStepChange: jest.fn(),
      handleReadinessItemClick: jest.fn(),
      isMultiLanguageModalOpen: true,
      loaderData: { showFirstLoadTour: true },
      multiLanguageFields: [],
      multiLanguageTitle: "Translations",
      readinessItems: [],
      readinessOpen: true,
      saveStepSetupMultiLanguageValues: jest.fn(),
      setIsMultiLanguageModalOpen,
      setReadinessOpen: jest.fn(),
      setTextOverridesLocale: jest.fn(),
      shop: "test.myshopify.com",
      shopLocales: [],
      textOverridesLocale: "en",
    } as unknown as PpbOverlayModalsProps;

    renderToStaticMarkup(React.createElement(PpbOverlayModals, props));

    expect(mockReadiness).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, items: [] }),
    );
    expect(mockGuidedTour).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, shop: "test.myshopify.com" }),
    );
    const languageProps = mockLanguage.mock.calls[0]?.[0] as {
      onClose: () => void;
      open: boolean;
      title: string;
    };
    expect(languageProps).toEqual(
      expect.objectContaining({ open: true, title: "Translations" }),
    );
    languageProps.onClose();
    expect(setIsMultiLanguageModalOpen).toHaveBeenCalledWith(false);
    expect(mockPreview).toHaveBeenCalledWith({ open: false });
  });
});
