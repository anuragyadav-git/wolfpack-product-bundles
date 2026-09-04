import { ProductPageProductDataMethods } from '../../../app/assets/widgets/product-page/methods/product-data-methods';

describe('PPB product hydration fallback', () => {
  const createMockWidget = (bundle: any, config: any = {}) => {
    return {
      ...ProductPageProductDataMethods,
      config: {
        storefrontRuntime: null,
        isEmbedSource: false,
        ...config,
      },
      selectedBundle: bundle,
      stepProductData: [],
      extractId(val: any) {
        if (!val) return '';
        const str = String(val);
        const match = str.match(/(\d+)$/);
        return match ? match[1] : str;
      },
      _mergeDirectDefaultProductsIntoStep(_stepIndex: number, products: any[]) {
        return products;
      },
    } as any;
  };

  it('falls back to embedded products from step categories when Storefront API runtime is missing', async () => {
    const bundle = {
      steps: [
        {
          id: 'step-1',
          name: 'Step 1',
          categories: [
            {
              id: 'cat-1',
              title: 'Category 1',
              products: [
                {
                  selectionId: 'gid://shopify/Product/101',
                  title: 'Earrings 1',
                  imageUrl: 'https://example.com/e1.jpg',
                  variants: [
                    {
                      selectionId: 'gid://shopify/ProductVariant/201',
                      title: 'Gold',
                      price: '50.00',
                      available: true,
                    },
                  ],
                },
                {
                  selectionId: 'gid://shopify/Product/102',
                  title: 'Earrings 2',
                  imageUrl: 'https://example.com/e2.jpg',
                  variants: [
                    {
                      selectionId: 'gid://shopify/ProductVariant/202',
                      title: 'Silver',
                      price: '60.00',
                      available: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const widget = createMockWidget(bundle);
    await widget.loadStepProducts(0);

    expect(widget.stepProductData[0]).toHaveLength(2);
    expect(widget.stepProductData[0][0].title).toBe('Earrings 1');
    expect(widget.stepProductData[0][0].id).toBe('101');
    expect(widget.stepProductData[0][0].selectionId).toBe('201');
    expect(widget.stepProductData[0][0].price).toBe(5000);

    expect(widget.stepProductData[0][1].title).toBe('Earrings 2');
    expect(widget.stepProductData[0][1].id).toBe('102');
    expect(widget.stepProductData[0][1].selectionId).toBe('202');
    expect(widget.stepProductData[0][1].price).toBe(6000);
  });

  it('correctly handles displayVariantsAsIndividual with selectionId fallback', async () => {
    const bundle = {
      steps: [
        {
          id: 'step-1',
          name: 'Step 1',
          displayVariantsAsIndividual: true,
          products: [
            {
              selectionId: 'gid://shopify/Product/301',
              title: 'Multi-Variant Ring',
              imageUrl: 'https://example.com/ring.jpg',
              variants: [
                {
                  selectionId: 'gid://shopify/ProductVariant/401',
                  title: 'Size 6',
                  price: '100.00',
                  available: true,
                },
                {
                  selectionId: 'gid://shopify/ProductVariant/402',
                  title: 'Size 7',
                  price: '110.00',
                  available: true,
                },
              ],
            },
          ],
        },
      ],
    };

    const widget = createMockWidget(bundle);
    await widget.loadStepProducts(0);

    expect(widget.stepProductData[0]).toHaveLength(2);
    expect(widget.stepProductData[0][0].title).toBe('Multi-Variant Ring - Size 6');
    expect(widget.stepProductData[0][0].id).toBe('401');
    expect(widget.stepProductData[0][0].parentProductId).toBe('301');

    expect(widget.stepProductData[0][1].title).toBe('Multi-Variant Ring - Size 7');
    expect(widget.stepProductData[0][1].id).toBe('402');
    expect(widget.stepProductData[0][1].parentProductId).toBe('301');
  });
});
