import { Await, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { Suspense, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  parseAdditionalConfigurationsNavigation,
  serializeAdditionalConfigurationsNavigation,
} from "../../lib/additional-configurations-navigation";
import {
  SettingsWorkspaceError,
} from "./app.settings/SettingsLandingShell";
import { SettingsRoute } from "./app.settings/SettingsRoute";
import { loader as settingsLoader } from "./app.settings";
import { AdminSectionLoadingState } from "../../components/AdminSectionLoadingState";

export { action, loader } from "./app.settings";

export default function AdditionalConfigurationsRoute() {
  const { settingsPage, previewBundles } = useLoaderData<typeof settingsLoader>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNavigation = useMemo(
    () => parseAdditionalConfigurationsNavigation(searchParams),
    [searchParams],
  );
  const workspaceData = useMemo(
    () => Promise.all([settingsPage, previewBundles]),
    [previewBundles, settingsPage],
  );
  const handleNavigationChange = useCallback((navigation: {
    layout: string;
    tab: string;
    group: string;
  }) => {
    setSearchParams(
      serializeAdditionalConfigurationsNavigation(navigation),
      { replace: true },
    );
  }, [setSearchParams]);

  return (
    <Suspense fallback={(
      <>
        <ui-title-bar title="Additional Configurations">
          <button variant="breadcrumb" onClick={() => navigate("/app/settings")}>Settings</button>
        </ui-title-bar>
        <AdminSectionLoadingState label={t("common.loading.workspace")} />
      </>
    )}>
      <Await
        resolve={workspaceData}
        errorElement={<SettingsWorkspaceError onExit={() => navigate("/app/settings")} />}
      >
        {([resolvedSettingsPage, resolvedPreviewBundles]: any) => (
          <SettingsRoute
            initialView="controls"
            initialControlNavigation={initialNavigation}
            onControlNavigationChange={handleNavigationChange}
            onExit={() => navigate("/app/settings")}
            settingsPage={resolvedSettingsPage}
            previewBundles={resolvedPreviewBundles}
          />
        )}
      </Await>
    </Suspense>
  );
}
