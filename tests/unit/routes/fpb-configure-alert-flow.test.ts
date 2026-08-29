import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useBundleConfigurationState } from "../../../app/hooks/useBundleConfigurationState";
import { useConfigureBundleController } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController";

jest.mock("@remix-run/react", () => ({
  useFetcher: () => ({ state: "idle" }),
  useLoaderData: () => ({
    apiKey: "test-api-key",
    availableBundles: [],
    bundle: { id: "bundle-1", name: "Bundle", status: "draft" },
    bundleProduct: null,
    shop: "shop.myshopify.com",
    shopCurrencyCode: "USD",
    shopLocales: [],
  }),
  useNavigate: () => jest.fn(),
  useRevalidator: () => ({ revalidate: jest.fn(), state: "idle" }),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({}),
}));

jest.mock("../../../app/hooks/useBundleConfigurationState", () => ({
  useBundleConfigurationState: jest.fn(),
}));

jest.mock("../../../app/store/api/adminApi", () => ({
  useEnsureProductTemplateMutation: () => [jest.fn()],
}));

describe("FPB configure alert flow", () => {
  it("propagates the shared operation alert controls through the bundle controller", () => {
    const clearOperationAlert = jest.fn();
    const setOperationAlert = jest.fn();
    const operationAlert = {
      id: "bundle-save",
      heading: "Bundle save failed",
      message: "Try again.",
      tone: "critical",
    };
    (useBundleConfigurationState as jest.Mock).mockReturnValue({
      clearOperationAlert,
      operationAlert,
      setOperationAlert,
    });

    let controller: ReturnType<typeof useConfigureBundleController> | null = null;
    function Harness() {
      controller = useConfigureBundleController();
      return null;
    }

    renderToStaticMarkup(React.createElement(Harness));

    expect(controller).toEqual(expect.objectContaining({
      clearOperationAlert,
      operationAlert,
      setOperationAlert,
    }));
  });
});
