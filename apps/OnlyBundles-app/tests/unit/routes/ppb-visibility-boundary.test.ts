import {
  PpbBundleVisibilitySection,
  type PpbBundleVisibilitySectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleVisibilitySection";

const mockOverview = jest.fn<unknown, [Record<string, unknown>]>(() => null);
const mockToastShow = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({ toast: { show: mockToastShow } }),
}));

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview",
  () => ({
    CommonBundleVisibilityOverview: (props: Record<string, unknown>) =>
      mockOverview(props),
  }),
);

describe("PPB visibility feature boundary", () => {
  it("uses explicit feature inputs and App Bridge feedback for the bundle link", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { clipboard: { writeText } },
    });
    const handleSectionChange = jest.fn();
    const props = {
      activeSection: "bundle_visibility",
      appEmbedEnabled: true,
      bundle: { shopifyProductHandle: "ppb-bundle" },
      copySpecificLinkOffer: jest.fn(),
      generatedSpecificLink: "",
      generateSpecificLinkOffer: jest.fn(),
      handleSectionChange,
      offerDeliveryState:
        {} as unknown as PpbBundleVisibilitySectionProps["offerDeliveryState"],
      openThemeEditorForAppEmbed: jest.fn(),
      revokeSpecificLinkOffer: jest.fn(),
      setCountryCodes: jest.fn(),
      setCountryTargetingEnabled: jest.fn(),
      setCountryTargetingMode: jest.fn(),
      setOfferEndsAt: jest.fn(),
      setOfferPriority: jest.fn(),
      setOfferRecurrenceAnchorDate: jest.fn(),
      setOfferRecurrenceEndsOn: jest.fn(),
      setOfferRecurrenceFrequency: jest.fn(),
      setOfferRecurrenceRunCount: jest.fn(),
      setOfferRecurrenceTermination: jest.fn(),
      setOfferRecurrenceWindowEnd: jest.fn(),
      setOfferRecurrenceWindowStart: jest.fn(),
      setOfferScheduleMode: jest.fn(),
      setOfferStartsAt: jest.fn(),
      setOfferStopLowerPriority: jest.fn(),
      setSpecificLinkOfferEnabled: jest.fn(),
      shop: "test.myshopify.com",
      specificLinkOfferBusy: false,
      themeEditorUrl: "https://admin.shopify.com/store/test/themes/current/editor",
    } satisfies PpbBundleVisibilitySectionProps;

    PpbBundleVisibilitySection(props);

    const overview = mockOverview.mock.calls[0]?.[0] as {
      link: { url: string };
      onCopyLink: () => void;
      placementOptions: Array<{ onAction: () => void }>;
    };
    expect(overview.link.url).toContain("/products/ppb-bundle");

    overview.onCopyLink();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith(overview.link.url);
    expect(mockToastShow).toHaveBeenCalledWith("Bundle link copied", {
      isError: false,
    });

    overview.placementOptions[0].onAction();
    expect(handleSectionChange).toHaveBeenCalledWith("bundle_widget");
  });
});
