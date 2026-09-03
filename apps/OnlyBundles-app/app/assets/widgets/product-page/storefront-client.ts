const PRODUCT_BATCH_SIZE = 50;

export function resolvePpbStorefrontEndpoint(shop: string, apiVersion: string) {
  const domain = String(shop || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9.-]*\.myshopify\.com$/.test(domain)) {
    throw new Error("Invalid Shopify shop domain");
  }
  if (!/^\d{4}-\d{2}$/.test(String(apiVersion))) throw new Error("Invalid Storefront API version");
  return `https://${domain}/api/${apiVersion}/graphql.json`;
}

async function requestStorefront({ endpoint, accessToken, query, variables, fetchImpl }: any) {
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length) {
    throw new Error(`Storefront API request failed (${response.status || 200})`);
  }
  return payload?.data;
}

const PRODUCT_QUERY = `
  query PpbProducts($ids: [ID!]!, $country: CountryCode) @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on Product {
        id title handle description descriptionHtml featuredImage { url }
        images(first: 50) { nodes { url } }
        options {
          id name
          optionValues {
            id name
            swatch {
              color
              image { ... on MediaImage { image { url altText } } }
            }
          }
        }
        variants(first: 250) {
          nodes {
            id title availableForSale quantityAvailable currentlyNotInStock
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            weight weightUnit image { url }
            selectedOptions { name value }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  }
`;

const VARIANTS_QUERY = `
  query PpbProductVariants($id: ID!, $cursor: String, $country: CountryCode) @inContext(country: $country) {
    product(id: $id) {
      variants(first: 250, after: $cursor) {
        nodes {
          id title availableForSale quantityAvailable currentlyNotInStock
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          weight weightUnit image { url }
          selectedOptions { name value }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

function mapVariant(variant: any) {
  const selectedOptions = (variant?.selectedOptions ?? []).map((option: any) => ({
    name: option.name,
    value: option.value,
  }));
  const selected = Object.fromEntries(selectedOptions.map((option: any) => [option.name, option.value]));
  return {
    id: variant.id,
    title: variant.title,
    price: variant.price?.amount ?? "0",
    compareAtPrice: variant.compareAtPrice?.amount ?? null,
    available: variant.availableForSale === true,
    quantityAvailable: typeof variant.quantityAvailable === "number" ? variant.quantityAvailable : null,
    currentlyNotInStock: variant.currentlyNotInStock === true,
    weight: variant.weight ?? 0,
    weightUnit: variant.weightUnit ?? "GRAMS",
    option1: selected[Object.keys(selected)[0]] ?? null,
    option2: selected[Object.keys(selected)[1]] ?? null,
    option3: selected[Object.keys(selected)[2]] ?? null,
    selectedOptions,
    image: variant.image ? { src: variant.image.url } : null,
  };
}

function mapProductOptions(options: any[] = []) {
  return options.map((option: any) => ({
    id: option.id,
    name: option.name,
    optionValues: (option.optionValues ?? []).map((optionValue: any) => ({
      id: optionValue.id,
      name: optionValue.name,
      swatch: optionValue.swatch ? {
        color: optionValue.swatch.color ?? null,
        image: optionValue.swatch.image?.image ? {
          src: optionValue.swatch.image.image.url,
          altText: optionValue.swatch.image.image.altText ?? null,
        } : null,
      } : null,
    })),
  }));
}

function mapProduct(product: any) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description ?? "",
    descriptionHtml: product.descriptionHtml ?? "",
    imageUrl: product.featuredImage?.url ?? "",
    images: (product.images?.nodes ?? []).map((image: any) => ({ src: image.url })),
    options: mapProductOptions(product.options),
    variants: (product.variants?.nodes ?? []).map(mapVariant),
  };
}

export async function fetchPpbStorefrontProducts({
  shop,
  apiVersion,
  accessToken,
  productIds,
  country = null,
  fetchImpl = fetch,
}: any) {
  const endpoint = resolvePpbStorefrontEndpoint(shop, apiVersion);
  const ids = [...new Set((productIds ?? []).filter((id: any) => /^gid:\/\/shopify\/Product\/\d+$/.test(String(id))))];
  const products: any[] = [];
  for (let index = 0; index < ids.length; index += PRODUCT_BATCH_SIZE) {
    const data = await requestStorefront({
      endpoint,
      accessToken,
      query: PRODUCT_QUERY,
      variables: { ids: ids.slice(index, index + PRODUCT_BATCH_SIZE), country: country || null },
      fetchImpl,
    });
    for (const product of (data?.nodes ?? []).filter(Boolean)) {
      const mapped = mapProduct(product);
      let pageInfo = product.variants?.pageInfo;
      while (pageInfo?.hasNextPage && pageInfo.endCursor) {
        const variantData = await requestStorefront({
          endpoint,
          accessToken,
          query: VARIANTS_QUERY,
          variables: { id: product.id, cursor: pageInfo.endCursor, country: country || null },
          fetchImpl,
        });
        const variants = variantData?.product?.variants;
        mapped.variants.push(...(variants?.nodes ?? []).map(mapVariant));
        pageInfo = variants?.pageInfo;
      }
      products.push(mapped);
    }
  }
  return products;
}

export async function setPpbBundleDetailsCartMetafield({
  shop,
  apiVersion,
  accessToken,
  cartToken,
  bundleDetailsKey,
  displayProperties,
  fetchImpl = fetch,
}: any) {
  const endpoint = resolvePpbStorefrontEndpoint(shop, apiVersion);
  const token = String(cartToken || '').trim();
  if (!token) return false;
  const cartId = token.startsWith('gid://shopify/Cart/') ? token : `gid://shopify/Cart/${token}`;
  const existingData = await requestStorefront({
    endpoint,
    accessToken,
    query: `query PpbBundleDetails($cartId: ID!) {
      cart(id: $cartId) { metafields(identifiers: [{ key: "bundle_details" }]) { value } }
    }`,
    variables: { cartId },
    fetchImpl,
  });
  let details: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(existingData?.cart?.metafields?.[0]?.value ?? '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) details = parsed;
  } catch {
    details = {};
  }
  details[bundleDetailsKey] = { displayProperties };
  const data = await requestStorefront({
    endpoint,
    accessToken,
    query: `
      mutation SetPpbBundleDetails($metafields: [CartMetafieldsSetInput!]!) {
        cartMetafieldsSet(metafields: $metafields) {
          metafields { key value }
          userErrors { field message }
        }
      }
    `,
    variables: { metafields: [{
      ownerId: cartId,
      key: 'bundle_details',
      type: 'json',
      value: JSON.stringify(details),
    }] },
    fetchImpl,
  });
  const errors = data?.cartMetafieldsSet?.userErrors ?? [];
  if (errors.length > 0) throw new Error(`Cart metafield update failed: ${errors[0].message}`);
  return true;
}
