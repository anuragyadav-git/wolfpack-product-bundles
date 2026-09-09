import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbImagesGifsSection,
  type PpbImagesGifsSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbImagesGifsSection";

const mockAssetUpload = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock("../../../app/components/shared/AssetUpload", () => ({
  AssetUpload: (props: Record<string, unknown>) => mockAssetUpload(props),
}));

describe("PPB Images and GIFs boundary", () => {
  it("updates step banners and loading animation through explicit owners", () => {
    const markAsDirty = jest.fn();
    const setLoadingGif = jest.fn();
    const updateStepField = jest.fn();
    const props = {
      activeAssetTabIndex: 0,
      activeSection: "images_gifs",
      loadingGif: "https://cdn.example.test/loading.gif",
      markAsDirty,
      setActiveAssetTabIndex: jest.fn(),
      setLoadingGif,
      stepsState: {
        steps: [
          {
            id: "step-1",
            name: "Choose products",
            bannerImageUrl: "https://cdn.example.test/banner.png",
          },
        ],
        updateStepField,
      } as unknown as PpbImagesGifsSectionProps["stepsState"],
    } satisfies PpbImagesGifsSectionProps;

    renderToStaticMarkup(React.createElement(PpbImagesGifsSection, props));

    const bannerUpload = mockAssetUpload.mock.calls.find(
      ([pickerProps]) => pickerProps.value === "https://cdn.example.test/banner.png",
    )?.[0] as { onChange: (url: string | null) => void };
    const loadingUpload = mockAssetUpload.mock.calls.find(
      ([pickerProps]) => pickerProps.value === "https://cdn.example.test/loading.gif",
    )?.[0] as {
      accept?: string;
      invalidTypeErrorMessage?: string;
      onChange: (url: string | null) => void;
    };

    bannerUpload.onChange("https://cdn.example.test/new-banner.png");
    loadingUpload.onChange("https://cdn.example.test/new-loading.gif");

    expect(updateStepField).toHaveBeenCalledWith(
      "step-1",
      "bannerImageUrl",
      "https://cdn.example.test/new-banner.png",
    );
    expect(setLoadingGif).toHaveBeenCalledWith(
      "https://cdn.example.test/new-loading.gif",
    );
    expect(markAsDirty).toHaveBeenCalledTimes(2);
    expect(loadingUpload.accept).toBe("image/gif");
    expect(loadingUpload.invalidTypeErrorMessage).toBeTruthy();
  });
});
