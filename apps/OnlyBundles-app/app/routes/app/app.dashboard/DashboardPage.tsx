import { useFetcher, useNavigate, useLoaderData } from "@remix-run/react";
import {
  lazy,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
  useState,
  Suspense,
} from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { OptimisedImage } from "../../../components/OptimisedImage";
import { useDashboardState } from "../../../hooks/useDashboardState";
import {
  buildDashboardCloneFormData,
  getBundleEditPath,
  resolveCloneConfigureRedirect,
} from "../../../lib/bundle-navigation";
import { decideDashboardPreviewAction } from "../../../lib/dashboard-preview-action";
import {
  closePendingDashboardPreview,
  navigatePendingDashboardPreview,
  openPendingDashboardPreview,
} from "../../../lib/dashboard-preview-window";
import { openSupportChat } from "../../../lib/support-chat.client";
import { useEnablePreviewGate } from "../../../hooks/useEnablePreviewGate";
import { useThemeExtensionStatus } from "../../../hooks/useThemeExtensionStatus";
import { openThemeEditorInNewTab } from "../../../lib/theme-editor-navigation.client";
import { getThemeExtensionStatusFromAppBridge } from "../../../lib/app-embed-status-check.client";
import { buildThemeAppEmbedEditorUrl } from "../../../lib/theme-extension-status";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setDashboardBundleFilter,
  setDashboardBundlesPerPage,
  setDashboardCurrentPage,
  setDashboardStatusFilter,
  setDashboardTypeFilter,
} from "../../../store/slices/adminRouteStateSlice";
import type { loader } from "./route";
import { DashboardTopCards } from "./DashboardTopCards";
import { DashboardStatusGrid } from "./DashboardStatusGrid";
import { DashboardResourcesCard } from "./DashboardResourcesCard";
import { DashboardDeferredProxyHealthBanner } from "./DashboardDeferredProxyHealthBanner";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
import { AppEmbedEnableModal } from "./AppEmbedEnableModal";
import {
  checkAppEmbedActivation,
  createAppEmbedReturnCheckCoordinator,
  initialAppEmbedEnableFlow,
  reduceAppEmbedEnableFlow,
  restoreAppEmbedEnableActionFocus,
  shouldCheckAppEmbedOnClose,
} from "./dashboard-app-embed-enable-flow";
import { hidePolarisModal } from "../_shared/bundle-configure/modal-utils";
import {
  shouldRenderDashboardDeleteModal,
  shouldRenderDashboardPreviewModal,
  shouldRenderDashboardRenameModal,
} from "./dashboard-modal-state";
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
const EnablePreviewModal = lazy(() =>
  import("../../../components/EnablePreviewModal").then((module) => ({
    default: module.EnablePreviewModal,
  }))
);
type DashboardPageProps = {
  banners: Promise<{
    proxyHealthy: boolean;
  }>;
};

export function DashboardPage({ banners }: DashboardPageProps) {
  const { bundles, shop, apiKey, appUrl } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { t } = useTranslation();
  const [taskAlert, setTaskAlert] = useState<AdminTaskAlert | null>(null);

  const dashboardState = useDashboardState();
  const themeExtensionStatus = useThemeExtensionStatus();
  const { bundleToDelete, openDeleteModal, closeDeleteModal } = dashboardState;

  const deleteModalRef = useRef<any>(null);
  const appEmbedModalRef = useRef<any>(null);
  const appEmbedEnableActionRef = useRef<any>(null);
  const searchRef = useRef<any>(null);
  const perPageButtonRef = useRef<any>(null);
  const perPageChoiceListRef = useRef<any>(null);
  const statusChoiceListRef = useRef<any>(null);
  const typeChoiceListRef = useRef<any>(null);
  const statusPopoverRef = useRef<any>(null);
  const typePopoverRef = useRef<any>(null);
  const fetcherIntentRef = useRef<string | null>(null);
  const pendingDeleteBundleIdRef = useRef<string | null>(null);
  const pendingPreviewWindowRef = useRef<Window | null>(null);
  const [previewingBundleId, setPreviewingBundleId] = useState<string | null>(
    null
  );
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [activeActionMenuBundleId, setActiveActionMenuBundleId] = useState<
    string | null
  >(null);
  const [deletedBundleIds, setDeletedBundleIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [bundleToRename, setBundleToRename] = useState<any | null>(null);
  const [newBundleName, setNewBundleName] = useState<string>("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renamedBundleNames, setRenamedBundleNames] = useState<
    Record<string, string>
  >({});
  const renameModalRef = useRef<any>(null);
  const [currentThemeEditorUrl, setCurrentThemeEditorUrl] = useState<
    string | null
  >(null);
  const [currentAppEmbedEnabled, setCurrentAppEmbedEnabled] = useState<
    boolean | null
  >(null);
  const [appEmbedEnableFlow, dispatchAppEmbedEnableFlow] = useReducer(
    reduceAppEmbedEnableFlow,
    initialAppEmbedEnableFlow
  );
  const closingAppEmbedModalRef = useRef(false);

  const refreshAppEmbedFromBridge = useCallback(async () => {
    try {
      const status = await getThemeExtensionStatusFromAppBridge(shopify);
      setCurrentAppEmbedEnabled(status.appEmbedEnabled);
    } catch {
      setCurrentAppEmbedEnabled((current) => current ?? false);
    }
  }, [shopify]);

  useEffect(() => {
    setCurrentThemeEditorUrl(
      buildThemeAppEmbedEditorUrl(shop, apiKey, "bundle-app-embed")
    );
    setCurrentAppEmbedEnabled(null);
    void refreshAppEmbedFromBridge();
  }, [apiKey, refreshAppEmbedFromBridge, shop]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    const intent = fetcherIntentRef.current;
    if (!intent) return;
    const data = fetcher.data as Record<string, unknown>;
    const cloneRedirect = resolveCloneConfigureRedirect(data);
    if (data.success) {
      if (intent === "createFpbPreview") {
        const previewUrl =
          typeof data.shareablePreviewUrl === "string"
            ? data.shareablePreviewUrl
            : "";
        if (previewUrl) {
          const pendingWindow = pendingPreviewWindowRef.current;
          pendingPreviewWindowRef.current = null;
          if (!navigatePendingDashboardPreview(pendingWindow, previewUrl)) {
            window.open(previewUrl, "_blank", "noopener,noreferrer");
          }
          setTaskAlert(null);
          shopify.toast.show(t("common.success.previewOpened"));
        } else {
          closePendingDashboardPreview(pendingPreviewWindowRef.current);
          pendingPreviewWindowRef.current = null;
          showAdminTransientErrorToast(
            shopify,
            t("common.alerts.previewUnavailable")
          );
        }
      } else if (intent === "cloneBundle" && cloneRedirect) {
        setTaskAlert(null);
        shopify.toast.show(t("dashboard.actions.cloneSuccess"));
        navigate(cloneRedirect);
      } else if (intent === "deleteBundle") {
        const deletedBundleId = pendingDeleteBundleIdRef.current;
        if (deletedBundleId) {
          setDeletedBundleIds((current) =>
            new Set(current).add(deletedBundleId)
          );
        }
        setTaskAlert(null);
        shopify.toast.show(t("dashboard.actions.deleteSuccess"));
      } else if (intent === "renameBundle") {
        const renamedId =
          typeof data.bundleId === "string"
            ? data.bundleId
            : bundleToRename?.id;
        const renamedName =
          typeof data.bundleName === "string"
            ? data.bundleName
            : newBundleName.trim();
        if (renamedId) {
          setRenamedBundleNames((current) => ({
            ...current,
            [renamedId]: renamedName,
          }));
        }
        setTaskAlert(null);
        shopify.toast.show(t("dashboard.actions.renameSuccess"));
        renameModalRef.current?.hideOverlay?.();
        setBundleToRename(null);
        setNewBundleName("");
        setRenameError(null);
      }
    } else if (data.error) {
      if (intent === "renameBundle") {
        setRenameError(
          typeof data.error === "string"
            ? data.error
            : t("dashboard.renameModal.errorFailed")
        );
        fetcherIntentRef.current = null;
        return;
      }
      if (intent === "createFpbPreview") {
        closePendingDashboardPreview(pendingPreviewWindowRef.current);
        pendingPreviewWindowRef.current = null;
      }
      showAdminTransientErrorToast(shopify, t("common.alerts.actionFailed"));
    }
    if (intent === "createFpbPreview") {
      setPreviewingBundleId(null);
    }
    if (intent === "deleteBundle") {
      pendingDeleteBundleIdRef.current = null;
    }
    fetcherIntentRef.current = null;
  }, [fetcher.state, fetcher.data, navigate, shopify, t, bundleToRename, newBundleName]);

  const handleDirectChat = () => {
    openSupportChat();
  };

  const handleEditBundle = useCallback(
    (bundle: (typeof bundles)[number]) => {
      setEditingBundleId(bundle.id);
      const editPath = getBundleEditPath(bundle.id, bundle.bundleType);
      window.requestAnimationFrame(() => navigate(editPath));
    },
    [navigate]
  );

  const handleCloneBundle = useCallback(
    (bundleId: string) => {
      fetcherIntentRef.current = "cloneBundle";
      fetcher.submit(buildDashboardCloneFormData(bundleId), { method: "post" });
    },
    [fetcher]
  );

  const handleDeleteBundle = useCallback(
    (bundleId: string) => {
      openDeleteModal(bundleId);
    },
    [openDeleteModal]
  );

  const handleConfirmDelete = useCallback(() => {
    if (bundleToDelete) {
      fetcherIntentRef.current = "deleteBundle";
      pendingDeleteBundleIdRef.current = bundleToDelete;
      const formData = new FormData();
      formData.append("intent", "deleteBundle");
      formData.append("bundleId", bundleToDelete);
      fetcher.submit(formData, { method: "post" });
      closeDeleteModal();
      deleteModalRef.current?.hideOverlay?.();
    }
  }, [bundleToDelete, fetcher, closeDeleteModal]);

  const handleCancelDelete = useCallback(() => {
    closeDeleteModal();
    deleteModalRef.current?.hideOverlay?.();
  }, [closeDeleteModal]);

  const handleOpenRename = useCallback((bundle: any) => {
    setBundleToRename(bundle);
    setNewBundleName(bundle.name || "");
    setRenameError(null);
  }, []);

  const handleCloseRename = useCallback(() => {
    renameModalRef.current?.hideOverlay?.();
    setBundleToRename(null);
    setNewBundleName("");
    setRenameError(null);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (!bundleToRename) return;
    const trimmed = newBundleName.trim();
    if (!trimmed) {
      setRenameError(t("dashboard.renameModal.errorEmpty"));
      return;
    }
    if (trimmed.length > 255) {
      setRenameError(t("dashboard.renameModal.errorTooLong"));
      return;
    }
    setRenameError(null);
    fetcherIntentRef.current = "renameBundle";
    const formData = new FormData();
    formData.append("intent", "renameBundle");
    formData.append("bundleId", bundleToRename.id);
    formData.append("bundleName", trimmed);
    fetcher.submit(formData, { method: "post" });
  }, [bundleToRename, newBundleName, fetcher, t]);

  useEffect(() => {
    const modal = renameModalRef.current;
    if (!modal) return;
    const handler = () => {
      setBundleToRename(null);
      setNewBundleName("");
      setRenameError(null);
    };
    modal.addEventListener("hide", handler);
    modal.addEventListener("afterhide", handler);
    return () => {
      modal.removeEventListener("hide", handler);
      modal.removeEventListener("afterhide", handler);
    };
  }, [bundleToRename]);

  useEffect(() => {
    if (!bundleToRename) return;
    renameModalRef.current?.showOverlay?.();
  }, [bundleToRename]);

  useEffect(() => {
    const modal = deleteModalRef.current;
    if (!modal) return;
    const handler = () => closeDeleteModal();
    modal.addEventListener("hide", handler);
    modal.addEventListener("afterhide", handler);
    return () => {
      modal.removeEventListener("hide", handler);
      modal.removeEventListener("afterhide", handler);
    };
  }, [closeDeleteModal]);

  useEffect(() => {
    if (!bundleToDelete) return;
    deleteModalRef.current?.showOverlay?.();
  }, [bundleToDelete]);

  const appEmbedEnabled = currentAppEmbedEnabled ?? false;

  const enablePreviewGate = useEnablePreviewGate({
    appEmbedEnabled,
    themeEditorUrl: currentThemeEditorUrl,
    refreshStatus: themeExtensionStatus.refresh,
    onSilentBlock: () =>
      setTaskAlert({
        id: "theme-editor",
        heading: "Theme editor unavailable",
        message: t("dashboard.actions.themeEditorUnavailable"),
      }),
  });

  const checkAppEmbedForEnableFlow = useCallback(async () => {
    dispatchAppEmbedEnableFlow({ type: "check_started" });
    const result = await checkAppEmbedActivation(() =>
      getThemeExtensionStatusFromAppBridge(shopify)
    );
    setCurrentAppEmbedEnabled(result.appEmbedEnabled);
    dispatchAppEmbedEnableFlow({
      type: result.phase === "success" ? "check_succeeded" : "check_failed",
    });
    return result;
  }, [shopify]);

  const appEmbedReturnCheck = useMemo(
    () => createAppEmbedReturnCheckCoordinator(checkAppEmbedForEnableFlow),
    [checkAppEmbedForEnableFlow]
  );

  const handleOpenAppEmbedEnableModal = useCallback(() => {
    dispatchAppEmbedEnableFlow({ type: "open" });
  }, []);

  const handleLaunchAppEmbedThemeEditor = useCallback(() => {
    if (!currentThemeEditorUrl) return;
    appEmbedReturnCheck.arm();
    dispatchAppEmbedEnableFlow({ type: "theme_editor_opened" });
    openThemeEditorInNewTab(currentThemeEditorUrl);
  }, [appEmbedReturnCheck, currentThemeEditorUrl]);

  const closeAppEmbedEnableModal = useCallback(() => {
    if (closingAppEmbedModalRef.current) return;
    closingAppEmbedModalRef.current = true;
    if (shouldCheckAppEmbedOnClose(appEmbedEnableFlow)) {
      void appEmbedReturnCheck.checkNow();
    }
    hidePolarisModal(appEmbedModalRef);
    dispatchAppEmbedEnableFlow({ type: "close" });
    restoreAppEmbedEnableActionFocus(
      appEmbedEnableActionRef.current,
      (restoreFocus) => {
        closingAppEmbedModalRef.current = false;
        window.requestAnimationFrame(restoreFocus);
      }
    );
  }, [appEmbedEnableFlow, appEmbedReturnCheck]);

  useEffect(() => {
    if (!appEmbedEnableFlow.open || !appEmbedEnableFlow.visitedThemeEditor)
      return;
    const checkOnReturn = () => {
      void appEmbedReturnCheck.requestOnReturn();
    };
    const checkOnVisibleReturn = () => {
      if (document.visibilityState === "visible") checkOnReturn();
    };

    window.addEventListener("focus", checkOnReturn);
    document.addEventListener("visibilitychange", checkOnVisibleReturn);
    return () => {
      window.removeEventListener("focus", checkOnReturn);
      document.removeEventListener("visibilitychange", checkOnVisibleReturn);
    };
  }, [
    appEmbedEnableFlow.open,
    appEmbedEnableFlow.visitedThemeEditor,
    appEmbedReturnCheck,
  ]);

  const renderDeleteModal = shouldRenderDashboardDeleteModal({
    bundleToDelete,
  });
  const renderRenameModal = shouldRenderDashboardRenameModal({
    bundleToRename,
  });
  const renderPreviewModal = shouldRenderDashboardPreviewModal({
    isOpen: enablePreviewGate.modalProps.open,
  });

  const recordDashboardPreview = useCallback(
    (bundleId: string, bundleLink: string) => {
      const formData = new FormData();
      formData.append("intent", "recordBundlePreview");
      formData.append("bundleId", bundleId);
      formData.append("bundleLink", bundleLink);
      formData.append("routeFamily", "dashboard");
      void fetch(window.location.href, {
        method: "POST",
        body: formData,
      }).catch(() => {});
    },
    []
  );

  const handlePreviewBundle = useCallback(
    (bundle: (typeof bundles)[number]) => {
      const stopPreviewLoadingSoon = () => {
        window.setTimeout(() => setPreviewingBundleId(null), 500);
      };
      const executePreviewAction = () => {
        setPreviewingBundleId(bundle.id);
        const action = decideDashboardPreviewAction({
          bundleType: bundle.bundleType as "full_page" | "product_page",
          bundleId: bundle.id,
          shopifyProductHandle: bundle.shopifyProductHandle,
          shop,
          appEmbedEnabled,
          bundleStatus: bundle.status,
          previewToken: (bundle as any).previewToken ?? null,
        });

        if (action.kind === "error") {
          setTaskAlert({
            id: "bundle-preview",
            heading: t("common.alerts.previewUnavailable"),
            message: action.message,
          });
          stopPreviewLoadingSoon();
          return;
        }

        if (action.kind === "create_fpb_preview") {
          closePendingDashboardPreview(pendingPreviewWindowRef.current);
          pendingPreviewWindowRef.current = openPendingDashboardPreview();
          const formData = new FormData();
          formData.append("intent", "createFpbPreview");
          formData.append("bundleId", bundle.id);
          fetcherIntentRef.current = "createFpbPreview";
          fetcher.submit(formData, { method: "post" });
          return;
        }

        window.open(action.url, "_blank", "noopener,noreferrer");
        recordDashboardPreview(bundle.id, action.url);
        stopPreviewLoadingSoon();
      };

      if (bundle.bundleType === "full_page") {
        void enablePreviewGate.requestPreview(executePreviewAction);
        return;
      }

      executePreviewAction();
    },
    [
      appEmbedEnabled,
      enablePreviewGate,
      fetcher,
      recordDashboardPreview,
      shop,
      t,
    ]
  );

  const getStatusDisplay = (status: string) => {
    const tone =
      STATUS_TONE_MAP[status as keyof typeof STATUS_TONE_MAP] ?? "info";
    return (
      <s-badge tone={tone}>{t(`dashboard.status.${status}`, status)}</s-badge>
    );
  };

  const getBundleTypeDisplay = (bundleType: string) => {
    return t(`dashboard.bundleType.${bundleType}`, bundleType);
  };

  const dispatch = useAppDispatch();
  const {
    bundleFilter,
    typeFilter,
    statusFilter,
    currentPage,
    bundlesPerPage,
  } = useAppSelector((state) => state.adminRouteState.dashboard);
  const setBundleFilter = useCallback(
    (value: string) => {
      dispatch(setDashboardBundleFilter(value));
    },
    [dispatch]
  );
  const setTypeFilter = useCallback(
    (value: string) => {
      dispatch(setDashboardTypeFilter(value));
    },
    [dispatch]
  );
  const setStatusFilter = useCallback(
    (value: string) => {
      dispatch(setDashboardStatusFilter(value));
    },
    [dispatch]
  );
  const setBundlesPerPage = useCallback(
    (value: number) => {
      dispatch(setDashboardBundlesPerPage(value));
    },
    [dispatch]
  );
  const setCurrentPage = useCallback(
    (value: number | ((currentPage: number) => number)) => {
      const nextPage = typeof value === "function" ? value(currentPage) : value;
      dispatch(setDashboardCurrentPage(nextPage));
    },
    [currentPage, dispatch]
  );
  const [activeResource, setActiveResource] = useState<string>(
    "bundle-inspirations"
  );
  useEffect(() => {
    const el = perPageChoiceListRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const value = getDashboardBundlesPerPageChoice(
        (e.currentTarget as any).values ?? []
      );
      if (value === null) return;
      setBundlesPerPage(value);
      window.setTimeout(() => perPageButtonRef.current?.click?.(), 0);
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [setBundlesPerPage]);

  useEffect(() => {
    const el = statusChoiceListRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const values = (e.currentTarget as any).values;
      if (Array.isArray(values) && values.length > 0) {
        setStatusFilter(values[0]);
        statusPopoverRef.current?.hideOverlay?.();
      }
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [setStatusFilter]);

  useEffect(() => {
    const el = typeChoiceListRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const values = (e.currentTarget as any).values;
      if (Array.isArray(values) && values.length > 0) {
        setTypeFilter(values[0]);
        typePopoverRef.current?.hideOverlay?.();
      }
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [setTypeFilter]);

  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setBundleFilter((e.target as HTMLInputElement).value ?? "");
    };
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [setBundleFilter]);

  const handleSyncCollections = useCallback(() => {
    shopify.toast.show(t("dashboard.header.syncCollections"));
  }, [shopify, t]);

  const displayBundles = useMemo(() => {
    if (Object.keys(renamedBundleNames).length === 0) return bundles;
    return bundles.map((b) =>
      renamedBundleNames[b.id] ? { ...b, name: renamedBundleNames[b.id] } : b
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
  const dashboardTableRows = buildDashboardTableRows(
    pagedBundles,
    getStatusDisplay,
    getBundleTypeDisplay
  );

  return (
    <>
      {appEmbedEnableFlow.open && (
        <AppEmbedEnableModal
          modalRef={appEmbedModalRef}
          phase={appEmbedEnableFlow.phase}
          onOpenThemeEditor={handleLaunchAppEmbedThemeEditor}
          onCancel={closeAppEmbedEnableModal}
          onDone={closeAppEmbedEnableModal}
          onSupport={handleDirectChat}
        />
      )}
      {renderDeleteModal && (
        <s-modal
          ref={deleteModalRef}
          id="delete-bundle-modal"
          heading={t("dashboard.deleteModal.heading")}
        >
          <s-button
            slot="primary-action"
            variant="primary"
            tone="critical"
            loading={fetcher.state === "submitting" || undefined}
            onClick={handleConfirmDelete}
          >
            {t("dashboard.deleteModal.delete")}
          </s-button>
          <s-button slot="secondary-actions" onClick={handleCancelDelete}>
            {t("dashboard.deleteModal.cancel")}
          </s-button>
          <s-text color="subdued">{t("dashboard.deleteModal.body")}</s-text>
        </s-modal>
      )}
      {renderRenameModal && (
        <s-modal
          ref={renameModalRef}
          id="rename-bundle-modal"
          heading={t("dashboard.renameModal.heading")}
          size="small"
        >
          <s-button
            slot="primary-action"
            variant="primary"
            loading={
              fetcher.state === "submitting" &&
              fetcherIntentRef.current === "renameBundle"
                ? true
                : undefined
            }
            onClick={handleConfirmRename}
          >
            {t("dashboard.renameModal.save")}
          </s-button>
          <s-button slot="secondary-actions" onClick={handleCloseRename}>
            {t("dashboard.renameModal.cancel")}
          </s-button>
          <s-stack direction="block" gap="base">
            {renameError && (
              <s-banner tone="critical" dismissible={false}>
                {renameError}
              </s-banner>
            )}
            <s-text-field
              label={t("dashboard.renameModal.nameLabel")}
              value={newBundleName}
              error={renameError || undefined}
              autocomplete="off"
              onInput={(e: Event) => {
                setNewBundleName((e.target as HTMLInputElement).value ?? "");
                if (renameError) setRenameError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmRename();
                }
              }}
            />
          </s-stack>
        </s-modal>
      )}

      <div className={dashboardStyles.dashboardPage}>
        <div className={dashboardStyles.dashboardLayout}>
          {/* Header */}
          <div className={dashboardStyles.dashboardHeader}>
            <div className={dashboardStyles.dashboardTitleBlock}>
              <h1 className={dashboardStyles.dashboardTitle}>
                {t("dashboard.title")}
              </h1>
              <p className={dashboardStyles.dashboardSubtitle}>
                {t("dashboard.subtitle")}
              </p>
            </div>
            <div className={dashboardStyles.dashboardActions}>
              <s-button
                icon="refresh"
                accessibilityLabel={t("dashboard.header.syncCollections")}
                onClick={handleSyncCollections}
              >
                <span className={dashboardStyles.dashboardActionLabel}>
                  {t("dashboard.header.syncCollections")}
                </span>
              </s-button>
              <s-button
                icon="plus"
                variant="primary"
                accessibilityLabel={t("dashboard.header.createBundle")}
                onClick={() => navigate("/app/bundles/create")}
              >
                <span className={dashboardStyles.dashboardActionLabel}>
                  {t("dashboard.header.createBundle")}
                </span>
              </s-button>
            </div>
          </div>

          <AdminTaskAlertBanner
            alert={taskAlert}
            onDismiss={() => setTaskAlert(null)}
          />
          <DashboardStatusGrid
            resources={themeExtensionStatus.resources}
            error={themeExtensionStatus.error}
            themeEditorUrl={currentThemeEditorUrl}
            appEmbedEnabled={appEmbedEnabled}
            appEmbedStatusLoading={currentAppEmbedEnabled === null}
            onOpenThemeEditor={handleOpenAppEmbedEnableModal}
            enableActionRef={appEmbedEnableActionRef}
          />
          <DashboardDeferredProxyHealthBanner
            appUrl={appUrl}
            banners={banners}
            shop={shop}
          />

          {/* Bundles panel */}
          <div className={dashboardStyles.bundlesQueryContainer}>
            <s-query-container containerName="dashboard-bundles">
              <s-section padding="none">
                <div className={dashboardStyles.bundlesPanel}>
                  <div className={dashboardStyles.bundlesToolbar}>
                    <div className={dashboardStyles.filterGroup}>
                      {/* Status filter pill */}
                      <s-button
                        id="status-filter-btn"
                        commandFor="status-filter-popover"
                        variant="secondary"
                      >
                        {String(
                          statusFilter === "all"
                            ? t("dashboard.filters.status")
                            : t(
                                `dashboard.status.${statusFilter}`,
                                statusFilter
                              )
                        )}{" "}
                        {"▾"}
                      </s-button>
                      <s-popover
                        ref={statusPopoverRef}
                        id="status-filter-popover"
                      >
                        <s-box padding="base">
                          <s-choice-list
                            ref={statusChoiceListRef}
                            name="status-filter-list"
                            label={t("dashboard.filters.byStatus")}
                            labelAccessibilityVisibility="exclusive"
                          >
                            <s-choice
                              value="all"
                              selected={statusFilter === "all" || undefined}
                            >
                              {t("dashboard.filters.all")}
                            </s-choice>
                            <s-choice
                              value="active"
                              selected={statusFilter === "active" || undefined}
                            >
                              {t("dashboard.status.active")}
                            </s-choice>
                            <s-choice
                              value="draft"
                              selected={statusFilter === "draft" || undefined}
                            >
                              {t("dashboard.status.draft")}
                            </s-choice>
                            <s-choice
                              value="unlisted"
                              selected={
                                statusFilter === "unlisted" || undefined
                              }
                            >
                              {t("dashboard.status.unlisted")}
                            </s-choice>
                          </s-choice-list>
                        </s-box>
                      </s-popover>

                      {/* Bundle type filter pill */}
                      <s-button
                        id="type-filter-btn"
                        commandFor="type-filter-popover"
                        variant="secondary"
                      >
                        {typeFilter === "all"
                          ? t("dashboard.filters.bundleType")
                          : getBundleTypeDisplay(typeFilter)}{" "}
                        {"▾"}
                      </s-button>
                      <s-popover ref={typePopoverRef} id="type-filter-popover">
                        <s-box padding="base">
                          <s-choice-list
                            ref={typeChoiceListRef}
                            name="type-filter-list"
                            label={t("dashboard.filters.byType")}
                            labelAccessibilityVisibility="exclusive"
                          >
                            <s-choice
                              value="all"
                              selected={typeFilter === "all" || undefined}
                            >
                              {t("dashboard.filters.all")}
                            </s-choice>
                            <s-choice
                              value="product_page"
                              selected={
                                typeFilter === "product_page" || undefined
                              }
                            >
                              {t("dashboard.bundleType.product_page")}
                            </s-choice>
                            <s-choice
                              value="full_page"
                              selected={typeFilter === "full_page" || undefined}
                            >
                              {t("dashboard.bundleType.full_page")}
                            </s-choice>
                          </s-choice-list>
                        </s-box>
                      </s-popover>
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
                    {!bundles.some(
                      (bundle) => !deletedBundleIds.has(bundle.id)
                    ) ? (
                      <div className={dashboardStyles.emptyBundlesState}>
                        <div className={dashboardStyles.emptyBundlesIcon}>
                          <OptimisedImage
                            src="/bundle.avif"
                            alt=""
                            className={dashboardStyles.emptyBundlesImg}
                            width={120}
                            height={120}
                            loading="lazy"
                          />
                        </div>
                        <s-stack
                          direction="block"
                          gap="small"
                          alignItems="center"
                        >
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
                            {dashboardTableRows.map((row) => (
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
                                    onEdit={handleEditBundle}
                                    onRename={handleOpenRename}
                                    onClone={handleCloneBundle}
                                    onDelete={handleDeleteBundle}
                                    onPreview={handlePreviewBundle}
                                    activeActionMenuBundleId={
                                      activeActionMenuBundleId
                                    }
                                    onActionMenuRequest={
                                      setActiveActionMenuBundleId
                                    }
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
                            <span
                              className={dashboardStyles.paginationSpacer}
                            />
                            <div className={dashboardStyles.paginationControls}>
                              <span className={dashboardStyles.paginationArrow}>
                                <s-button
                                  variant="tertiary"
                                  disabled={effectivePage <= 1 || undefined}
                                  onClick={() => setCurrentPage((p) => p - 1)}
                                  accessibilityLabel={t(
                                    "dashboard.pagination.prev"
                                  )}
                                >
                                  ‹
                                </s-button>
                              </span>
                              <span
                                className={dashboardStyles.paginationPageText}
                              >
                                {t("dashboard.pagination.page", {
                                  current: effectivePage,
                                  total: totalPages,
                                })}
                              </span>
                              <span className={dashboardStyles.paginationArrow}>
                                <s-button
                                  variant="tertiary"
                                  disabled={
                                    effectivePage >= totalPages || undefined
                                  }
                                  onClick={() => setCurrentPage((p) => p + 1)}
                                  accessibilityLabel={t(
                                    "dashboard.pagination.next"
                                  )}
                                >
                                  ›
                                </s-button>
                              </span>
                            </div>
                            <div className={dashboardStyles.perPageControls}>
                              <span>
                                {t("dashboard.pagination.perPageLabel")}
                              </span>
                              <div
                                className={dashboardStyles.perPageSelectWrap}
                              >
                                <s-button
                                  ref={perPageButtonRef}
                                  id="bundles-per-page-button"
                                  commandFor="bundles-per-page-popover"
                                  variant="secondary"
                                >
                                  {bundlesPerPage} {"▾"}
                                </s-button>
                                <s-popover id="bundles-per-page-popover">
                                  <s-box padding="base">
                                    <s-choice-list
                                      ref={perPageChoiceListRef}
                                      name="bundles-per-page-list"
                                      label={t(
                                        "dashboard.pagination.perPageLabel"
                                      )}
                                      labelAccessibilityVisibility="exclusive"
                                    >
                                      <s-choice
                                        value="10"
                                        selected={
                                          bundlesPerPage === 10 || undefined
                                        }
                                      >
                                        {t("dashboard.pagination.per10")}
                                      </s-choice>
                                      <s-choice
                                        value="20"
                                        selected={
                                          bundlesPerPage === 20 || undefined
                                        }
                                      >
                                        {t("dashboard.pagination.per20")}
                                      </s-choice>
                                      <s-choice
                                        value="50"
                                        selected={
                                          bundlesPerPage === 50 || undefined
                                        }
                                      >
                                        {t("dashboard.pagination.per50")}
                                      </s-choice>
                                    </s-choice-list>
                                  </s-box>
                                </s-popover>
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

          <DashboardTopCards handleDirectChat={handleDirectChat} />

          <DashboardResourcesCard
            activeResource={activeResource}
            setActiveResource={setActiveResource}
            handleDirectChat={handleDirectChat}
          />
        </div>
      </div>

      {renderPreviewModal && (
        <Suspense fallback={null}>
          <EnablePreviewModal {...enablePreviewGate.modalProps} />
        </Suspense>
      )}
    </>
  );
}
