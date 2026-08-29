import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/ProductDetailsConfigurationExtension.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-details.configuration.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/ProductVariantDetailsConfigurationExtension.tsx' {
  const shopify: import('@shopify/ui-extensions/admin.product-variant-details.configuration.render').Api;
  const globalThis: { shopify: typeof shopify };
}
