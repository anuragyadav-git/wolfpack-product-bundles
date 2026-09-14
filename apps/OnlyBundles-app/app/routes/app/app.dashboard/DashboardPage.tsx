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
import type { loader } from "./route";
import { DashboardTopCards } from "./DashboardTopCards";
import { DashboardStatusGrid } from "./DashboardStatusGrid";
import { DashboardResourcesCard } from "./DashboardResourcesCard";
import { DashboardDeferredProxyHealthBanner } from "./DashboardDeferredProxyHealthBanner";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import { showAdminTransientErrorToast } from "../../../lib/admin-alert-feedback";
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
import { DashboardBundlesPanel } from "./DashboardBundlesPanel";
import { DashboardActionModals } from "./DashboardActionModals";
import { DashboardHeader } from "./DashboardHeader";
import dashboardStyles from "./dashboard.module.css";
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
  const [renameOperationError, setRenameOperationError] = useState<
    string | null
  >(null);
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
        setRenameOperationError(null);
      }
    } else if (data.error) {
      if (intent === "renameBundle") {
        setRenameError(null);
        setRenameOperationError(t("dashboard.renameModal.errorFailed"));
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
    setRenameOperationError(null);
  }, []);

  const handleCloseRename = useCallback(() => {
    renameModalRef.current?.hideOverlay?.();
    setBundleToRename(null);
    setNewBundleName("");
    setRenameError(null);
    setRenameOperationError(null);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (!bundleToRename) return;
    const trimmed = newBundleName.trim();
    if (!trimmed) {
      setRenameOperationError(null);
      setRenameError(t("dashboard.renameModal.errorEmpty"));
      return;
    }
    if (trimmed.length > 255) {
      setRenameOperationError(null);
      setRenameError(t("dashboard.renameModal.errorTooLong"));
      return;
    }
    setRenameError(null);
    setRenameOperationError(null);
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
      setRenameOperationError(null);
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

  const [activeResource, setActiveResource] = useState<string>(
    "bundle-inspirations"
  );

  const handleSyncCollections = useCallback(() => {
    shopify.toast.show(t("dashboard.header.syncCollections"));
  }, [shopify, t]);

  return (
    <>
      <DashboardActionModals
        appEmbedOpen={appEmbedEnableFlow.open}
        appEmbedPhase={appEmbedEnableFlow.phase}
        appEmbedModalRef={appEmbedModalRef}
        onOpenThemeEditor={handleLaunchAppEmbedThemeEditor}
        onCloseAppEmbed={closeAppEmbedEnableModal}
        onSupport={handleDirectChat}
        renderDeleteModal={renderDeleteModal}
        deleteModalRef={deleteModalRef}
        isSubmitting={fetcher.state === "submitting"}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        renderRenameModal={renderRenameModal}
        renameModalRef={renameModalRef}
        isRenaming={
          fetcher.state === "submitting" &&
          fetcherIntentRef.current === "renameBundle"
        }
        renameError={renameError}
        renameOperationError={renameOperationError}
        bundleName={newBundleName}
        onBundleNameChange={(value) => {
          setNewBundleName(value);
          if (renameError) setRenameError(null);
          if (renameOperationError) setRenameOperationError(null);
        }}
        onConfirmRename={handleConfirmRename}
        onCloseRename={handleCloseRename}
      />

      <div className={dashboardStyles.dashboardPage}>
        <div className={dashboardStyles.dashboardLayout}>
          <DashboardHeader onSyncCollections={handleSyncCollections} />

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

          <DashboardBundlesPanel
            bundles={bundles}
            deletedBundleIds={deletedBundleIds}
            renamedBundleNames={renamedBundleNames}
            editingBundleId={editingBundleId}
            previewingBundleId={previewingBundleId}
            activeActionMenuBundleId={activeActionMenuBundleId}
            onActionMenuRequest={setActiveActionMenuBundleId}
            onEdit={handleEditBundle}
            onRename={handleOpenRename}
            onClone={handleCloneBundle}
            onDelete={handleDeleteBundle}
            onPreview={handlePreviewBundle}
          />

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
