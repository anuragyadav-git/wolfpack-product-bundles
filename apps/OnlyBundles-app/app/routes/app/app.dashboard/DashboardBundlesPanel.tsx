import { useNavigate } from "@remix-run/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { BundleActionsButtons } from "./BundleActionsButtons";
import {
  buildDashboardTablePage,
  buildDashboardTableRows,
  getDashboardBundlesPerPageChoice,
} from "./dashboard-table-model";
import dashboardStyles from "./dashboard.module.css";

const STATUS_TONE_MAP = {
  active: "success",
  draft: "info",
  unlisted: "warning",
} as const;

type DashboardBundle = {
  id: string;
  name: string;
  status: string;
  bundleType: string;
};

type PolarisSelectElement = ElementRef<"s-select">;

type DashboardBundlesPanelProps<TBundle extends DashboardBundle> = {
  bundles: readonly TBundle[];
  deletedBundleIds: ReadonlySet<string>;
  renamedBundleNames: Record<string, string>;
  editingBundleId: string | null;
  previewingBundleId: string | null;
  activeActionMenuBundleId: string | null;
  onActionMenuRequest: (bundleId: string) => void;
  onEdit: (bundle: TBundle) => void;
  onRename: (bundle: TBundle) => void;
  onClone: (bundleId: string) => void;
  onDelete: (bundleId: string) => void;
  onPreview: (bundle: TBundle) => void;
};

export function DashboardBundlesPanel<TBundle extends DashboardBundle>({
  bundles,
  deletedBundleIds,
  renamedBundleNames,
  editingBundleId,
  previewingBundleId,
  activeActionMenuBundleId,
  onActionMenuRequest,
  onEdit,
  onRename,
  onClone,
  onDelete,
  onPreview,
}: DashboardBundlesPanelProps<TBundle>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchRef = useRef<any>(null);
  const perPageSelectRef = useRef<PolarisSelectElement | null>(null);
  const statusSelectRef = useRef<PolarisSelectElement | null>(null);
  const typeSelectRef = useRef<PolarisSelectElement | null>(null);
  const [bundleFilter, setBundleFilterState] = useState("");
  const [typeFilter, setTypeFilterState] = useState("all");
  const [statusFilter, setStatusFilterState] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [bundlesPerPage, setBundlesPerPageState] = useState(20);

  const setBundleFilter = useCallback((value: string) => {
    setBundleFilterState(value);
    setCurrentPage(1);
  }, []);
  const setTypeFilter = useCallback((value: string) => {
    setTypeFilterState(value);
    setCurrentPage(1);
  }, []);
  const setStatusFilter = useCallback((value: string) => {
    setStatusFilterState(value);
    setCurrentPage(1);
  }, []);
  const setBundlesPerPage = useCallback((value: number) => {
    setBundlesPerPageState(value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const element = perPageSelectRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      const value = getDashboardBundlesPerPageChoice([
        (event.currentTarget as PolarisSelectElement).value ?? "",
      ]);
      if (value !== null) setBundlesPerPage(value);
    };
    element.addEventListener("change", handler);
    return () => element.removeEventListener("change", handler);
  }, [setBundlesPerPage]);

  useEffect(() => {
    const element = statusSelectRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      const value = (event.currentTarget as PolarisSelectElement).value;
      if (value) setStatusFilter(value);
    };
    element.addEventListener("change", handler);
    return () => element.removeEventListener("change", handler);
  }, [setStatusFilter]);

  useEffect(() => {
    const element = typeSelectRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      const value = (event.currentTarget as PolarisSelectElement).value;
      if (value) setTypeFilter(value);
    };
    element.addEventListener("change", handler);
    return () => element.removeEventListener("change", handler);
  }, [setTypeFilter]);

  useEffect(() => {
    const element = searchRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      setBundleFilter((event.target as HTMLInputElement).value ?? "");
    };
    element.addEventListener("input", handler);
    return () => element.removeEventListener("input", handler);
  }, [setBundleFilter]);

  const displayBundles = useMemo(() => {
    if (Object.keys(renamedBundleNames).length === 0) return bundles;
    return bundles.map((bundle) =>
      renamedBundleNames[bundle.id]
        ? { ...bundle, name: renamedBundleNames[bundle.id] }
        : bundle
    );
  }, [bundles, renamedBundleNames]);

  const { effectivePage, filteredBundles, pagedBundles, totalPages } = useMemo(
    () =>
      buildDashboardTablePage({
        bundles: displayBundles,
        excludedBundleIds: deletedBundleIds,
        bundleFilter,
        typeFilter,
        statusFilter,
        currentPage,
        bundlesPerPage,
      }),
    [
      bundleFilter,
      bundlesPerPage,
      currentPage,
      deletedBundleIds,
      displayBundles,
      statusFilter,
      typeFilter,
    ]
  );
  const rows = buildDashboardTableRows(
    pagedBundles,
    (status): ReactNode => {
      const tone =
        STATUS_TONE_MAP[status as keyof typeof STATUS_TONE_MAP] ?? "info";
      return (
        <s-badge tone={tone}>{t(`dashboard.status.${status}`, status)}</s-badge>
      );
    },
    (bundleType) => t(`dashboard.bundleType.${bundleType}`, bundleType)
  );
  const hasVisibleBundles = bundles.some(
    (bundle) => !deletedBundleIds.has(bundle.id)
  );

  return (
    <div className={dashboardStyles.bundlesQueryContainer}>
      <s-query-container containerName="dashboard-bundles">
        <s-section padding="none">
          <div className={dashboardStyles.bundlesPanel}>
            <div className={dashboardStyles.bundlesToolbar}>
              <div className={dashboardStyles.filterGroup}>
                <s-select
                  ref={statusSelectRef}
                  name="status-filter-list"
                  label={t("dashboard.filters.byStatus")}
                  labelAccessibilityVisibility="exclusive"
                  value={statusFilter}
                >
                  {(["all", "active", "draft", "unlisted"] as const).map(
                    (status) => (
                      <s-option key={status} value={status}>
                        {status === "all"
                          ? t("dashboard.filters.all")
                          : t(`dashboard.status.${status}`)}
                      </s-option>
                    )
                  )}
                </s-select>

                <s-select
                  ref={typeSelectRef}
                  name="type-filter-list"
                  label={t("dashboard.filters.byType")}
                  labelAccessibilityVisibility="exclusive"
                  value={typeFilter}
                >
                  {(["all", "product_page", "full_page"] as const).map(
                    (bundleType) => (
                      <s-option key={bundleType} value={bundleType}>
                        {bundleType === "all"
                          ? t("dashboard.filters.all")
                          : t(`dashboard.bundleType.${bundleType}`)}
                      </s-option>
                    )
                  )}
                </s-select>
              </div>
              <div className={dashboardStyles.searchField}>
                <s-text-field
                  ref={searchRef}
                  label={t("dashboard.search.label")}
                  labelAccessibilityVisibility="exclusive"
                  icon="search"
                  placeholder={t("dashboard.search.placeholder")}
                  value={bundleFilter}
                  autocomplete="off"
                />
              </div>
            </div>

            <div className={dashboardStyles.bundlesTableShell}>
              {!hasVisibleBundles ? (
                <div className={dashboardStyles.emptyBundlesState}>
                  <div className={dashboardStyles.emptyBundlesIcon}>
                    <s-image
                      src="/bundle.avif"
                      alt=""
                      accessibilityRole="presentation"
                      aspectRatio="1/1"
                      objectFit="contain"
                      loading="lazy"
                    />
                  </div>
                  <s-stack direction="block" gap="small" alignItems="center">
                    <s-button
                      variant="primary"
                      onClick={() => navigate("/app/bundles/create")}
                    >
                      {t("dashboard.header.createBundle")}
                    </s-button>
                    <p className={dashboardStyles.emptyBundlesBody}>
                      {t("dashboard.emptyState.body")}
                    </p>
                  </s-stack>
                </div>
              ) : (
                <>
                  <s-table variant="auto">
                    <s-table-header-row>
                      <s-table-header listSlot="primary">
                        {t("dashboard.table.bundleName")}
                      </s-table-header>
                      <s-table-header listSlot="secondary">
                        {t("dashboard.table.status")}
                      </s-table-header>
                      <s-table-header listSlot="labeled">
                        {t("dashboard.table.type")}
                      </s-table-header>
                      <s-table-header listSlot="labeled">
                        {t("dashboard.table.actions")}
                      </s-table-header>
                    </s-table-header-row>
                    <s-table-body>
                      {rows.map((row) => (
                        <s-table-row key={row.id}>
                          <s-table-cell>{row.name}</s-table-cell>
                          <s-table-cell>{row.status}</s-table-cell>
                          <s-table-cell>{row.type}</s-table-cell>
                          <s-table-cell>
                            <BundleActionsButtons
                              bundleId={row.id}
                              bundleType={row.bundle.bundleType}
                              bundle={row.bundle}
                              isEditing={editingBundleId === row.id}
                              onEdit={onEdit}
                              onRename={onRename}
                              onClone={onClone}
                              onDelete={onDelete}
                              onPreview={onPreview}
                              activeActionMenuBundleId={activeActionMenuBundleId}
                              onActionMenuRequest={onActionMenuRequest}
                              isPreviewing={previewingBundleId === row.id}
                            />
                          </s-table-cell>
                        </s-table-row>
                      ))}
                    </s-table-body>
                  </s-table>

                  {filteredBundles.length === 0 && (
                    <div className={dashboardStyles.noFilteredBundles}>
                      {t("dashboard.noResults")}
                    </div>
                  )}

                  {filteredBundles.length > 0 && (
                    <div className={dashboardStyles.paginationBar}>
                      <span className={dashboardStyles.paginationSpacer} />
                      <div className={dashboardStyles.paginationControls}>
                        <s-button
                          variant="tertiary"
                          icon="arrow-left"
                          disabled={effectivePage <= 1 || undefined}
                          onClick={() => setCurrentPage((page) => page - 1)}
                          accessibilityLabel={t("dashboard.pagination.prev")}
                        />
                        <span className={dashboardStyles.paginationPageText}>
                          {t("dashboard.pagination.page", {
                            current: effectivePage,
                            total: totalPages,
                          })}
                        </span>
                        <s-button
                          variant="tertiary"
                          icon="arrow-right"
                          disabled={effectivePage >= totalPages || undefined}
                          onClick={() => setCurrentPage((page) => page + 1)}
                          accessibilityLabel={t("dashboard.pagination.next")}
                        />
                      </div>
                      <div className={dashboardStyles.perPageControls}>
                        <span>{t("dashboard.pagination.perPageLabel")}</span>
                        <div className={dashboardStyles.perPageSelectWrap}>
                          <s-select
                            ref={perPageSelectRef}
                            name="bundles-per-page-list"
                            label={t("dashboard.pagination.perPageLabel")}
                            labelAccessibilityVisibility="exclusive"
                            value={String(bundlesPerPage)}
                          >
                            {([20, 10, 50] as const).map((count) => (
                              <s-option key={count} value={String(count)}>
                                {t(`dashboard.pagination.per${count}`)}
                              </s-option>
                            ))}
                          </s-select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </s-section>
      </s-query-container>
    </div>
  );
}
