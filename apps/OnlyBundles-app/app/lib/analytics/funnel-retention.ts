export function calculateFunnelRetention(
  bundleViews: number,
  addedToCart: number,
  orders: number,
): { viewToCart: number | null; cartToOrder: number | null } {
  return {
    viewToCart:
      bundleViews > 0 ? Math.round((addedToCart / bundleViews) * 100) : null,
    cartToOrder:
      addedToCart > 0 ? Math.round((orders / addedToCart) * 100) : null,
  };
}
