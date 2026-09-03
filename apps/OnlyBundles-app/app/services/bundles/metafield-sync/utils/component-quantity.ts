export function normalizeShopifyComponentQuantity(value: unknown): number {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}
