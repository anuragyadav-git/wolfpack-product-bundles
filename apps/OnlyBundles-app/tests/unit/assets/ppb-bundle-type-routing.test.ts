import { ProductPageLayoutShellMethods } from "../../../app/assets/widgets/product-page/methods/layout-shell-methods";

function context(bundleType?: string) {
  return {
    elements: {
      stepsContainer: { replaceChildren: jest.fn() },
    },
    selectedBundle: {
      bundleType,
      steps: [],
    },
    _markProductPageTemplate: jest.fn(),
    renderProductPageLayout: jest.fn(),
    renderFullPageLayout: jest.fn(),
  };
}

describe("Product Page layout bundle type", () => {
  it("renders steps only for the canonical Product Page type", () => {
    const current = context("product_page");

    ProductPageLayoutShellMethods.renderSteps.call(current);

    expect(current.renderProductPageLayout).toHaveBeenCalledTimes(1);
    expect(current.renderFullPageLayout).not.toHaveBeenCalled();
  });

  it.each([undefined, "full_page"])(
    "fails closed for bundle type %s",
    (bundleType) => {
      const current = context(bundleType);

      ProductPageLayoutShellMethods.renderSteps.call(current);

      expect(current.renderProductPageLayout).not.toHaveBeenCalled();
      expect(current.renderFullPageLayout).not.toHaveBeenCalled();
    },
  );
});
