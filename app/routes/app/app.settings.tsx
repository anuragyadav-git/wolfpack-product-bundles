import {
  defer,
  json,
  type ActionFunctionArgs,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { lazy, Suspense, useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { BundleType } from "../../constants/bundle";
import { prisma } from "../../db.server";
import { requireAdminSession } from "../../lib/auth-guards.server";
import { SETTINGS_CONTROLS_BUNDLE_TYPES, buildSettingsControlsRuntime } from "../../lib/settings-controls-runtime";
import { SETTINGS_DESIGN_BUNDLE_TYPES, buildSettingsDesignRuntime } from "../../lib/settings-design-runtime";
import { parseSettingsDesignPayload } from "../../lib/settings-design-contract";
import { SETTINGS_LANGUAGE_BUNDLE_TYPES, buildSettingsLanguageRuntime } from "../../lib/settings-language-runtime";
import { CartTransformService } from "../../services/cart-transform-service.server";
import { buildFpbStorefrontUrl } from "../../lib/fpb-storefront-url";
import { navigateBackOrFallback } from "../../lib/navigation";
import { ReduxProvider } from "../../store/ReduxProvider";
import {
  SettingsLandingShell,
  SettingsWorkspaceError,
  type SettingsWorkspaceView,
} from "./app.settings/SettingsLandingShell";
import {
  AdminRouteLoadingBar,
  waitForAdminRouteLoadingBar,
} from "../../components/AdminRouteLoadingBar";
import settingsLandingStyles from "./app.settings/SettingsLandingShell.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: settingsLandingStyles },
];

const loadSettingsWorkspace = async () => {
  const module = await import("./app.settings/SettingsRoute");
  return { default: module.SettingsRoute };
};

const SettingsWorkspace = lazy(loadSettingsWorkspace);

export function waitForSettingsRouteReady<TSettings, TPreviewBundles>(
  settingsPage: Promise<TSettings>,
  previewBundles: Promise<TPreviewBundles>,
  loadingBar: Promise<void> = waitForAdminRouteLoadingBar(),
) {
  return Promise.all([settingsPage, previewBundles, loadingBar]);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await requireAdminSession(request);
  const settingsPage = prisma.designSettings.findUnique({
      where: { shopId_bundleType: { shopId: session.shop, bundleType: "product_page" } },
      select: {
        generalSettings: true,
      },
    }).then((settings) => {
      const generalSettings = settings?.generalSettings && typeof settings.generalSettings === "object"
        ? settings.generalSettings as Record<string, unknown>
        : {};
      return generalSettings.settingsPage && typeof generalSettings.settingsPage === "object"
        ? generalSettings.settingsPage as Record<string, unknown>
        : null;
    });
  const previewBundles = prisma.bundle.findMany({
      where: {
        shopId: session.shop,
        OR: [
          { bundleType: BundleType.FULL_PAGE },
          { shopifyProductHandle: { not: null } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        bundleType: true,
        shopifyProductHandle: true,
      },
    }).then((bundles) => bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      type: bundle.bundleType === "full_page" ? "Landing Page" : "Product Page",
      viewUrl: bundle.bundleType === "full_page"
        ? buildFpbStorefrontUrl(session.shop, bundle.id)
        : bundle.shopifyProductHandle
          ? `https://${session.shop}/products/${bundle.shopifyProductHandle}`
          : null,
    })));
  return defer({
    settingsPage,
    previewBundles,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await requireAdminSession(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const payloadValue = String(formData.get("payload") ?? "{}");
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(payloadValue) as Record<string, unknown>;
  } catch {
    return json({ success: false, message: "Invalid Settings payload" }, { status: 400 });
  }

  if (
    intent !== "saveSettingsDesign"
    && intent !== "saveSettingsLanguage"
    && intent !== "saveSettingsControls"
  ) {
    return json({ success: false, message: "Unsupported Settings action" }, { status: 400 });
  }

  if (intent === "saveSettingsDesign") {
    let savedState;
    try {
      savedState = parseSettingsDesignPayload(payload);
    } catch (error) {
      return json({
        success: false,
        intent,
        message: error instanceof Error ? error.message : "Invalid Settings Design payload",
      }, { status: 400 });
    }

    const currentRows = await prisma.designSettings.findMany({
      where: {
        shopId: session.shop,
        bundleType: { in: [...SETTINGS_DESIGN_BUNDLE_TYPES] },
      },
    });
    const currentByBundleType = new Map(currentRows.map((row) => [row.bundleType, row]));
    const writes = SETTINGS_DESIGN_BUNDLE_TYPES.map((bundleType) => {
      const currentForBundleType = currentByBundleType.get(bundleType);
      const currentBundleGeneralSettings = currentForBundleType?.generalSettings && typeof currentForBundleType.generalSettings === "object"
        ? currentForBundleType.generalSettings as Record<string, unknown>
        : {};
      const currentPageCustomization = currentBundleGeneralSettings.pageCustomization
        && typeof currentBundleGeneralSettings.pageCustomization === "object"
        ? currentBundleGeneralSettings.pageCustomization as Record<string, unknown>
        : {};
      const designRuntime = buildSettingsDesignRuntime(savedState, currentPageCustomization);
      const nextBundleSettingsPage = {
        ...(currentBundleGeneralSettings.settingsPage && typeof currentBundleGeneralSettings.settingsPage === "object"
          ? currentBundleGeneralSettings.settingsPage as Record<string, unknown>
          : {}),
        design: savedState,
      };
      const nextBundleGeneralSettings = {
        ...currentBundleGeneralSettings,
        ...(designRuntime.designSettings.generalSettings as Record<string, unknown>),
        settingsPage: nextBundleSettingsPage,
      };
      const updateData = {
        ...designRuntime.designSettings,
        generalSettings: nextBundleGeneralSettings as Prisma.InputJsonValue,
      } as Prisma.DesignSettingsUncheckedUpdateInput;

      return prisma.designSettings.upsert({
        where: { shopId_bundleType: { shopId: session.shop, bundleType } },
        create: {
          shopId: session.shop,
          bundleType,
          ...updateData,
        } as Prisma.DesignSettingsUncheckedCreateInput,
        update: updateData,
      });
    });

    await prisma.$transaction(writes);
    return json({
      success: true,
      intent,
      message: "Settings saved successfully",
      savedState,
    });
  }

  const current = await prisma.designSettings.findUnique({
    where: { shopId_bundleType: { shopId: session.shop, bundleType: "product_page" } },
  });
  if (intent === "saveSettingsLanguage") {
    const languageRuntime = buildSettingsLanguageRuntime(payload);

    await Promise.all(SETTINGS_LANGUAGE_BUNDLE_TYPES.map(async (bundleType) => {
      const currentForBundleType = bundleType === BundleType.PRODUCT_PAGE
        ? current
        : await prisma.designSettings.findUnique({
          where: { shopId_bundleType: { shopId: session.shop, bundleType } },
        });
      const currentBundleGeneralSettings = currentForBundleType?.generalSettings && typeof currentForBundleType.generalSettings === "object"
        ? currentForBundleType.generalSettings as Record<string, unknown>
        : {};
      const nextBundleSettingsPage = {
        ...(currentBundleGeneralSettings.settingsPage && typeof currentBundleGeneralSettings.settingsPage === "object"
          ? currentBundleGeneralSettings.settingsPage as Record<string, unknown>
          : {}),
        language: payload,
      };
      const nextBundleGeneralSettings = {
        ...currentBundleGeneralSettings,
        settingsLanguage: languageRuntime.settingsLanguage,
        settingsPage: nextBundleSettingsPage,
      };
      const updateData = {
        buttonAddToCartText: languageRuntime.buttonAddToCartText,
        generalSettings: nextBundleGeneralSettings as Prisma.InputJsonValue,
      } as Prisma.DesignSettingsUncheckedUpdateInput;

      await prisma.designSettings.upsert({
        where: { shopId_bundleType: { shopId: session.shop, bundleType } },
        create: {
          shopId: session.shop,
          bundleType,
          ...updateData,
        } as Prisma.DesignSettingsUncheckedCreateInput,
        update: updateData,
      });
    }));

    return json({ success: true, message: "Settings saved successfully" });
  }

  if (intent === "saveSettingsControls") {
    const controlsRuntime = buildSettingsControlsRuntime(payload);

    await Promise.all(SETTINGS_CONTROLS_BUNDLE_TYPES.map(async (bundleType) => {
      const currentForBundleType = bundleType === BundleType.PRODUCT_PAGE
        ? current
        : await prisma.designSettings.findUnique({
          where: { shopId_bundleType: { shopId: session.shop, bundleType } },
        });
      const currentBundleGeneralSettings = currentForBundleType?.generalSettings && typeof currentForBundleType.generalSettings === "object"
        ? currentForBundleType.generalSettings as Record<string, unknown>
        : {};
      const nextBundleSettingsPage = {
        ...(currentBundleGeneralSettings.settingsPage && typeof currentBundleGeneralSettings.settingsPage === "object"
          ? currentBundleGeneralSettings.settingsPage as Record<string, unknown>
          : {}),
        controls: payload,
      };
      const nextBundleGeneralSettings = {
        ...currentBundleGeneralSettings,
        settingsControls: controlsRuntime.settingsControls,
        settingsPage: nextBundleSettingsPage,
      };
      const updateData = {
        customCss: bundleType === BundleType.FULL_PAGE
          ? controlsRuntime.fullPageCustomCss
          : controlsRuntime.productPageCustomCss,
        bundleCartLineMessaging: controlsRuntime.bundleCartLineMessaging as Prisma.InputJsonValue,
        generalSettings: nextBundleGeneralSettings as Prisma.InputJsonValue,
      } as Prisma.DesignSettingsUncheckedUpdateInput;

      await prisma.designSettings.upsert({
        where: { shopId_bundleType: { shopId: session.shop, bundleType } },
        create: {
          shopId: session.shop,
          bundleType,
          ...updateData,
        } as Prisma.DesignSettingsUncheckedCreateInput,
        update: updateData,
      });
    }));

    const syncResult = await CartTransformService.syncCartLineMessagingSettings(
      admin,
      session.shop,
      controlsRuntime.bundleCartLineMessaging,
    );
    if (!syncResult.success) {
      return json({
        success: false,
        intent,
        message: syncResult.error
          ? `Settings saved, but cart transform messaging sync failed: ${syncResult.error}`
          : "Settings saved, but cart transform messaging sync failed",
      }, { status: 500 });
    }
  }

  return json({
    success: true,
    intent,
    message: "Settings saved successfully",
  });
}

export default function SettingsRouteDefault() {
  const { settingsPage, previewBundles } = useLoaderData<typeof loader>();
  const [workspaceView, setWorkspaceView] = useState<SettingsWorkspaceView | null>(null);
  const routeData = useMemo(
    () => waitForSettingsRouteReady(settingsPage, previewBundles),
    [previewBundles, settingsPage],
  );
  const workspaceData = useMemo(
    () => workspaceView
      ? Promise.all([settingsPage, previewBundles, waitForAdminRouteLoadingBar()])
      : null,
    [previewBundles, settingsPage, workspaceView],
  );
  const navigate = useNavigate();

  return (
    <Suspense fallback={<AdminRouteLoadingBar label="Loading Settings" />}>
      <Await
        resolve={routeData}
        errorElement={<SettingsWorkspaceError onExit={() => setWorkspaceView(null)} />}
      >
        {([resolvedSettingsPage, resolvedPreviewBundles]) => {
          if (!workspaceView) {
            return (
              <>
                <ui-title-bar title="Settings">
                  <button
                    variant="breadcrumb"
                    onClick={() =>
                      navigateBackOrFallback(navigate, "/app/dashboard", {
                        replaceFallback: true,
                      })
                  }
                  >
                    Dashboard
                  </button>
                </ui-title-bar>
                <SettingsLandingShell
                  onBack={() =>
                    navigateBackOrFallback(navigate, "/app/dashboard", {
                      replaceFallback: true,
                    })
                  }
                  onSelect={(view) => {
                    if (view === "controls") {
                      navigate("/app/additional-configurations");
                      return;
                    }
                    setWorkspaceView(view);
                  }}
                  onIntent={() => {
                    void loadSettingsWorkspace();
                  }}
                />
              </>
            );
          }

          return (
            <Suspense fallback={<AdminRouteLoadingBar label="Loading Settings" />}>
              <Await resolve={workspaceData as NonNullable<typeof workspaceData>}>
                {() => (
                  <ReduxProvider>
                    <SettingsWorkspace
                      initialView={workspaceView}
                      onExit={() => setWorkspaceView(null)}
                      settingsPage={resolvedSettingsPage}
                      previewBundles={resolvedPreviewBundles}
                    />
                  </ReduxProvider>
                )}
              </Await>
            </Suspense>
          );
        }}
      </Await>
    </Suspense>
  );
}
