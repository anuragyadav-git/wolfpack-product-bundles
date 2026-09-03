import { ProductPageProductDataMethods } from '../widgets/product-page/methods/product-data-methods.js';
import { fetchPpbStorefrontProducts } from '../widgets/product-page/storefront-client.js';
import { normalizePpbSelectionKey } from '../widgets/shared/ppb-condition-selections.js';

function toProductGid(value: unknown) {
  const raw = String(value || '');
  if (/^gid:\/\/shopify\/Product\/\d+$/.test(raw)) return raw;
  const id = normalizePpbSelectionKey(raw);
  return /^\d+$/.test(id) ? `gid://shopify/Product/${id}` : '';
}

function collectStepProductIds(step: any) {
  const ids = new Set<string>();
  const addProduct = (product: any) => {
    const gid = toProductGid(product?.productId || product?.graphqlId || product?.id);
    if (gid) ids.add(gid);
  };
  (Array.isArray(step?.products) ? step.products : []).forEach(addProduct);
  (Array.isArray(step?.categories) ? step.categories : []).forEach((category: any) => {
    (Array.isArray(category?.products) ? category.products : []).forEach(addProduct);
  });
  return [...ids];
}

function resolveProductPageControls(runtime: any) {
  return runtime?.controls?.activeControls
    || runtime?.controls?.settingsControls?.productPage
    || null;
}

export async function hydrateSdkState(state: any, {
  runtime,
  shop,
  country = null,
  fetchImpl = fetch,
}: any) {
  if (!runtime?.storefrontAccessToken || !runtime?.storefrontApiVersion) {
    throw new Error('Missing Shopify Storefront runtime');
  }

  const hydratedSteps = [];
  const stepProductData = [];
  for (const sourceStep of state.steps) {
    const step = { ...sourceStep };
    const productIds = collectStepProductIds(step);
    const products = productIds.length > 0
      ? await fetchPpbStorefrontProducts({
        shop,
        apiVersion: runtime.storefrontApiVersion,
        accessToken: runtime.storefrontAccessToken,
        productIds,
        country,
        fetchImpl,
      })
      : [];
    const returnedIds = new Set(products.map((product: any) => String(product.id)));
    if (productIds.some((productId) => !returnedIds.has(productId))) {
      throw new Error('Shopify did not return all configured products');
    }
    const normalizedProducts = ProductPageProductDataMethods.processProductsForStep.call({
      extractId: normalizePpbSelectionKey,
      _getProductPageControls: () => resolveProductPageControls(runtime),
    }, products, step);
    step.products = normalizedProducts;
    hydratedSteps.push(step);
    stepProductData.push(normalizedProducts);
  }

  state.steps = hydratedSteps;
  state.stepProductData = stepProductData;
  state.bundleData = { ...state.bundleData, steps: hydratedSteps };
  state.isReady = true;
}
