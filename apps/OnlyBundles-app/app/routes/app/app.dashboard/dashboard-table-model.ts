export interface DashboardTableRow<TBundle, TStatusDisplay, TTypeDisplay> {
  id: string;
  bundle: TBundle;
  name: string;
  status: TStatusDisplay;
  type: TTypeDisplay;
}

const DASHBOARD_BUNDLES_PER_PAGE_CHOICES = new Set([10, 20, 50]);

export function getDashboardBundlesPerPageChoice(
  values: readonly string[],
): number | null {
  if (values.length !== 1) return null;
  const value = Number(values[0]);
  return DASHBOARD_BUNDLES_PER_PAGE_CHOICES.has(value) ? value : null;
}

export function buildDashboardTableRows<
  TBundle extends {
    id: string;
    name: string;
    status: string;
    bundleType: string;
  },
  TStatusDisplay,
  TTypeDisplay,
>(
  bundles: TBundle[],
  getStatusDisplay: (status: string) => TStatusDisplay,
  getBundleTypeDisplay: (bundleType: string) => TTypeDisplay,
): DashboardTableRow<TBundle, TStatusDisplay, TTypeDisplay>[] {
  return bundles.map((bundle) => ({
    id: bundle.id,
    bundle,
    name: bundle.name,
    status: getStatusDisplay(bundle.status),
    type: getBundleTypeDisplay(bundle.bundleType),
  }));
}

export function buildDashboardTablePage<
  TBundle extends {
    id: string;
    name: string;
    status: string;
    bundleType: string;
  },
>({
  bundles,
  excludedBundleIds = new Set<string>(),
  bundleFilter,
  typeFilter,
  statusFilter,
  currentPage,
  bundlesPerPage,
}: {
  bundles: readonly TBundle[];
  excludedBundleIds?: ReadonlySet<string>;
  bundleFilter: string;
  typeFilter: string;
  statusFilter: string;
  currentPage: number;
  bundlesPerPage: number;
}) {
  const normalizedFilter = bundleFilter.trim().toLocaleLowerCase();
  const filteredBundles = bundles
    .filter((bundle) => !excludedBundleIds.has(bundle.id))
    .filter((bundle) => typeFilter === "all" || bundle.bundleType === typeFilter)
    .filter((bundle) => statusFilter === "all" || bundle.status === statusFilter)
    .filter(
      (bundle) =>
        !normalizedFilter ||
        bundle.name.toLocaleLowerCase().includes(normalizedFilter),
    );
  const safeBundlesPerPage = Math.max(1, bundlesPerPage);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBundles.length / safeBundlesPerPage),
  );
  const effectivePage = Math.max(1, Math.min(currentPage, totalPages));
  const pageStart = (effectivePage - 1) * safeBundlesPerPage;

  return {
    effectivePage,
    filteredBundles,
    pagedBundles: filteredBundles.slice(
      pageStart,
      pageStart + safeBundlesPerPage,
    ),
    totalPages,
  };
}
