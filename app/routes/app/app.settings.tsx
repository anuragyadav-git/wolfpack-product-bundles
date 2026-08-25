import {
  defer,
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Await, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { lazy, Suspense, useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { BundleType } from "../../constants/bundle";
import { prisma } from "../../db.server";
import { authenticate } from "../../shopify.server";
import {
  SETTINGS_CONTROLS_BUNDLE_TYPES,
  SETTINGS_CONTROLS_SCHEMA_VERSION,
  buildSettingsControlsFormValues,
  buildSettingsControlsRuntime,
  type SettingsControlsRuntime,
} from "../../lib/settings-controls-runtime";
import { SETTINGS_DESIGN_BUNDLE_TYPES, buildSettingsDesignRuntime } from "../../lib/settings-design-runtime";
import { parseSettingsDesignPayload } from "../../lib/settings-design-contract";
import { isShopBrandColors } from "../../lib/shop-brand-colors";
import { syncThemeColors } from "../../services/theme-colors.server";
import {
  SETTINGS_LANGUAGE_BUNDLE_TYPES,
  buildSettingsLanguageFormState,
  buildSettingsLanguageRuntime,
} from "../../lib/settings-language-runtime";
import { CartTransformService } from "../../services/cart-transform-service.server";
import { syncPpbStorefrontRuntime } from "../../services/ppb-storefront-runtime.server";
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
  const { admin, session } = await authenticate.admin(request);
  const shopBrandColors = syncThemeColors(session.shop);
  const settingsPage = Promise.all([shopBrandColors, prisma.designSettings.findUnique({
      where: { shopId_bundleType: { shopId: session.shop, bundleType: "product_page" } },
      select: {
        generalSettings: true,
      },
    })]).then(([resolvedShopBrandColors, settings]) => {
      const generalSettings = settings?.generalSettings && typeof settings.generalSettings === "object"
        ? settings.generalSettings as Record<string, unknown>
        : {};
      const settingsPage = generalSettings.settingsPage && typeof generalSettings.settingsPage === "object"
        ? generalSettings.settingsPage as Record<string, unknown>
        : {};
      const storedControls = generalSettings.settingsControls && typeof generalSettings.settingsControls === "object"
        ? generalSettings.settingsControls as Partial<SettingsControlsRuntime>
        : null;
      const runtime = storedControls?.schemaVersion === SETTINGS_CONTROLS_SCHEMA_VERSION
        ? storedControls as SettingsControlsRuntime
        : buildSettingsControlsRuntime({}).settingsControls;
      return {
        ...settingsPage,
        language: buildSettingsLanguageFormState(generalSettings.settingsLanguage),
        controls: buildSettingsControlsFormValues(runtime),
        shopBrandColors: resolvedShopBrandColors,
      };
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
        publicNumber: true,
        name: true,
        bundleType: true,
        shopifyProductHandle: true,
      },
    }).then((bundles) => bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      type: bundle.bundleType === "full_page" ? "Landing Page" : "Product Page",
      viewUrl: bundle.bundleType === "full_page"
        ? bundle.publicNumber === null
          ? null
          : buildFpbStorefrontUrl(session.shop, bundle.publicNumber)
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
  const { admin, session } = await authenticate.admin(request);
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
    } catch (error: any) {
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
      const shopBrandColors = isShopBrandColors(currentForBundleType?.themeColors)
        ? currentForBundleType.themeColors
        : null;
      const designRuntime = buildSettingsDesignRuntime(savedState, currentPageCustomization, shopBrandColors);
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
    try {
      await syncPpbStorefrontRuntime(admin, session.shop);
    } catch (error: any) {
      return json({
        success: false,
        intent,
        message: `Settings saved, but PPB storefront runtime sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }, { status: 500 });
    }
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
    const currentRows = await prisma.designSettings.findMany({
      where: {
        shopId: session.shop,
        bundleType: { in: [...SETTINGS_LANGUAGE_BUNDLE_TYPES] },
      },
    });
    const currentByBundleType = new Map(currentRows.map((row) => [row.bundleType, row]));
    const writes = SETTINGS_LANGUAGE_BUNDLE_TYPES.map((bundleType) => {
      const currentForBundleType = currentByBundleType.get(bundleType)
        ?? (bundleType === BundleType.PRODUCT_PAGE ? current : null);
      const currentBundleGeneralSettings = currentForBundleType?.generalSettings && typeof currentForBundleType.generalSettings === "object"
        ? currentForBundleType.generalSettings as Record<string, unknown>
        : {};
      const nextBundleSettingsPage = {
        ...(currentBundleGeneralSettings.settingsPage && typeof currentBundleGeneralSettings.settingsPage === "object"
          ? currentBundleGeneralSettings.settingsPage as Record<string, unknown>
          : {}),
      };
      delete nextBundleSettingsPage.language;
      const nextBundleGeneralSettings = {
        ...currentBundleGeneralSettings,
        settingsLanguage: languageRuntime.settingsLanguage,
        settingsPage: nextBundleSettingsPage,
      };
      const updateData = {
        buttonAddToCartText: languageRuntime.buttonAddToCartText,
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
    try {
      await syncPpbStorefrontRuntime(admin, session.shop);
    } catch (error: any) {
      return json({
        success: false,
        intent,
        message: `Settings saved, but PPB storefront runtime sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }, { status: 500 });
    }

    return json({ success: true, intent, message: "Settings saved successfully", savedState: payload });
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
      const currentSettingsPage = currentBundleGeneralSettings.settingsPage && typeof currentBundleGeneralSettings.settingsPage === "object"
        ? currentBundleGeneralSettings.settingsPage as Record<string, unknown>
        : {};
      const settingsPageWithoutControls = Object.fromEntries(
        Object.entries(currentSettingsPage).filter(([key]: any) => key !== "controls"),
      );
      const nextBundleGeneralSettings = {
        ...currentBundleGeneralSettings,
        settingsControls: controlsRuntime.settingsControls,
        settingsPage: settingsPageWithoutControls,
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
    try {
      await syncPpbStorefrontRuntime(admin, session.shop);
    } catch (error: any) {
      return json({
        success: false,
        intent,
        message: `Settings saved, but PPB storefront runtime sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
  const navigation = useNavigation();
  const isControlsNavigationPending = navigation.state !== "idle"
    && navigation.location?.pathname === "/app/additional-configurations";

  return (
    <Suspense fallback={<AdminRouteLoadingBar label="Loading Settings" />}>
      <Await
        resolve={routeData}
        errorElement={<SettingsWorkspaceError onExit={() => setWorkspaceView(null)} />}
      >
        {([resolvedSettingsPage, resolvedPreviewBundles]: any) => {
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
                  isLoadingControls={isControlsNavigationPending}
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
