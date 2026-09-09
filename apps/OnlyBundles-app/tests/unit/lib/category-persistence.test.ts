import {
  buildStepCategoryCreateInput,
  materializeCanonicalStepProducts,
} from "../../../app/lib/bundle-config/category-persistence";

describe("category persistence", () => {
  it("builds the current category persistence shape", () => {
    expect(buildStepCategoryCreateInput({
      id: "category-1",
      title: "Category 1",
      products: [{ id: "gid://shopify/Product/1" }],
      collections: [],
    }, 0)).toMatchObject({
      id: "category-1",
      name: "Category 1",
      title: "Category 1",
      sortOrder: 0,
      products: [{ id: "gid://shopify/Product/1" }],
    });
  });

  it("unions direct and category selections by canonical Shopify product identity", () => {
    const directProduct = { id: "gid://shopify/Product/1", title: "Direct" };
    const categoryProduct = { id: "gid://shopify/Product/2", title: "Category" };

    expect(materializeCanonicalStepProducts({
      StepProduct: [directProduct],
      StepCategory: [
        { products: [{ ...directProduct, id: "1" }, categoryProduct] },
        { products: [categoryProduct] },
      ],
    })).toEqual([directProduct, categoryProduct]);
  });
});
