import { ProductPageProductDataMethods } from '../../../app/assets/widgets/product-page/methods/product-data-methods';
import { ProductPageDefaultProductMethods } from '../../../app/assets/widgets/product-page/methods/default-product-methods';

describe('PPB fail-closed product hydration', () => {
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

  it('blocks cached category products when Storefront API runtime is missing', async () => {
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
                  productId: 'gid://shopify/Product/101',
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
                  productId: 'gid://shopify/Product/102',
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

    expect(widget.stepProductData[0]).toEqual([]);
    expect(widget._stepFetchFailed[0]).toBe(true);
  });

  it('blocks cached step products when Storefront hydration fails', async () => {
    const bundle = {
      steps: [
        {
          id: 'step-1',
          name: 'Step 1',
          displayVariantsAsIndividual: true,
          products: [
            {
              productId: 'gid://shopify/Product/301',
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

    expect(widget.stepProductData[0]).toEqual([]);
    expect(widget._stepFetchFailed[0]).toBe(true);
  });

  it('does not restore direct default product snapshots when Shopify hydration is unavailable', async () => {
    const widget = {
      ...ProductPageDefaultProductMethods,
      ...ProductPageProductDataMethods,
      config: { storefrontRuntime: null, isEmbedSource: false },
      selectedBundle: {
        steps: [{ id: 'step-1', products: [] }],
        defaultProductsData: {
          isDefaultProductsEnabled: true,
          products: [{
            productId: '501',
            graphqlId: 'gid://shopify/Product/501',
            title: 'Stale title',
            imageUrl: 'https://example.com/stale.jpg',
            requiredQuantity: 2,
            variants: [{
              selectionId: 'gid://shopify/ProductVariant/601',
              variantGraphqlId: 'gid://shopify/ProductVariant/601',
              price: '1.00',
              inventoryQuantity: 99,
              available: true,
            }],
          }],
        },
      },
      extractId(value: unknown) {
        const match = String(value ?? '').match(/(\d+)$/);
        return match?.[1] ?? '';
      },
      normalizeSelectionKey(value: unknown) {
        return this.extractId(value);
      },
      setSelectedQuantity: jest.fn(),
      processProductsForStep: jest.fn(() => []),
    } as any;

    widget.initializeDataStructures();
    widget._initDirectDefaultProducts();
    await widget.loadStepProducts(0);

    expect(widget.directDefaultProducts).toEqual([]);
    expect(widget.stepProductData[0]).toEqual([]);
    expect(widget._stepFetchFailed[0]).toBe(true);
  });

  it('uses live Shopify fields for a hydrated direct default product', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          nodes: [{
            id: 'gid://shopify/Product/501',
            title: 'Live title',
            handle: 'live-title',
            description: 'Live description',
            descriptionHtml: '<p>Live description</p>',
            featuredImage: { url: 'https://example.com/live.jpg' },
            images: { nodes: [{ url: 'https://example.com/live.jpg' }] },
            options: [],
            variants: {
              nodes: [{
                id: 'gid://shopify/ProductVariant/601',
                title: 'Live variant',
                availableForSale: false,
                quantityAvailable: 0,
                currentlyNotInStock: false,
                price: { amount: '42.50', currencyCode: 'CAD' },
                compareAtPrice: null,
                weight: 0,
                weightUnit: 'GRAMS',
                image: { url: 'https://example.com/live-variant.jpg' },
                selectedOptions: [],
              }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          }],
        },
      }),
    } as Response);
    const previousWindow = (globalThis as any).window;
    (globalThis as any).window = { Shopify: { shop: 'wolfpack-store-test-1.myshopify.com' } };

    const widget = {
      ...ProductPageDefaultProductMethods,
      ...ProductPageProductDataMethods,
      config: {
        storefrontRuntime: {
          storefrontAccessToken: 'test-token',
          storefrontApiVersion: '2026-07',
        },
        isEmbedSource: false,
      },
      selectedBundle: {
        steps: [{ id: 'step-1', products: [] }],
        defaultProductsData: {
          isDefaultProductsEnabled: true,
          products: [{
            productId: '501',
            graphqlId: 'gid://shopify/Product/501',
            title: 'Stale title',
            imageUrl: 'https://example.com/stale.jpg',
            requiredQuantity: 2,
            variants: [{
              selectionId: 'gid://shopify/ProductVariant/601',
              variantGraphqlId: 'gid://shopify/ProductVariant/601',
              price: '1.00',
              inventoryQuantity: 99,
              available: true,
            }],
          }],
        },
      },
      container: { dataset: {} },
      extractId(value: unknown) {
        const match = String(value ?? '').match(/(\d+)$/);
        return match?.[1] ?? '';
      },
      normalizeSelectionKey(value: unknown) {
        return this.extractId(value);
      },
      setSelectedQuantity: jest.fn(),
      _getProductPageControls: () => ({ hideOutOfStockProducts: false }),
      isInventoryTrackingOnAddToCartEnabled: () => true,
    } as any;

    try {
      widget.initializeDataStructures();
      widget._initDirectDefaultProducts();
      await widget.loadStepProducts(0);

      expect(widget._stepFetchFailed[0]).toBe(false);
      expect(widget.directDefaultProducts).toHaveLength(1);
      expect(widget.directDefaultProducts[0]).toMatchObject({
        title: 'Live title',
        imageUrl: 'https://example.com/live-variant.jpg',
        price: 4250,
        currencyCode: 'CAD',
        available: false,
        quantityAvailable: 0,
        defaultRequiredQuantity: 2,
      });
    } finally {
      fetchMock.mockRestore();
      (globalThis as any).window = previousWindow;
    }
  });
});
