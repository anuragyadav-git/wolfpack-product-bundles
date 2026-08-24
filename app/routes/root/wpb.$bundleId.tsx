import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../../db.server";
import { AppLogger } from "../../lib/logger";
import { authenticate } from "../../shopify.server";
import { BundleStatus } from "../../constants/bundle";
import { formatBundleForWidget } from "../../lib/bundle-formatter.server";
import { verifyBundlePreviewToken } from "../../lib/bundle-preview-token.server";
import { parseFpbPublicNumber } from "../../lib/fpb-storefront-url";
import {
  renderFpbLoadingScreen,
  resolveFpbLoadingScreenSettings,
} from "../../lib/fpb-loading-screen";

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const { session } = await authenticate.public.appProxy(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  const shopDomain = session.shop;
  const bundleId = params.bundleId;

  if (!bundleId) {
    AppLogger.warn("FPB proxy page missing bundle ID", {
      component: "wpb.proxy",
      shop: shopDomain,
      status: 400,
      failureCategory: "missing_bundle_id",
      renderDurationMs: Date.now() - startedAt,
    });
    return new Response("Bundle ID is required", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const publicNumber = parseFpbPublicNumber(bundleId);
  if (publicNumber === null) {
    AppLogger.info("FPB proxy page rejected invalid public number", {
      component: "wpb.proxy",
      shop: shopDomain,
      publicPath: bundleId,
      status: 404,
      failureCategory: "invalid_public_number",
      renderDurationMs: Date.now() - startedAt,
    });
    return new Response("Bundle not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const [bundle, designSettings] = await Promise.all([
    db.bundle.findFirst({
      where: {
        publicNumber,
        shopId: shopDomain,
        bundleType: "full_page",
      },
      include: {
        steps: {
          include: {
            StepProduct: { orderBy: { position: "asc" } },
            StepCategory: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
        pricing: true,
      },
    }),
    db.designSettings.findUnique({
      where: {
        shopId_bundleType: {
          shopId: shopDomain,
          bundleType: "full_page",
        },
      },
      select: { generalSettings: true },
    }),
  ]);

  if (!bundle) {
    AppLogger.info("FPB proxy page not found", {
      component: "wpb.proxy",
      shop: shopDomain,
      publicNumber,
      status: 404,
      failureCategory: "not_found",
      renderDurationMs: Date.now() - startedAt,
    });
    return new Response("Bundle not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const isPublic = bundle.status === BundleStatus.ACTIVE
    || bundle.status === BundleStatus.UNLISTED;
  const hasValidDraftPreview = bundle.status === BundleStatus.DRAFT
    && verifyBundlePreviewToken({
      token: url.searchParams.get("wpb_preview"),
      shop: shopDomain,
      bundleId: bundle.id,
    });

  if (!isPublic && !hasValidDraftPreview) {
    AppLogger.info("FPB proxy page hidden by status", {
      component: "wpb.proxy",
      shop: shopDomain,
      bundleId: bundle.id,
      publicNumber,
      status: 404,
      failureCategory: "status_not_public",
      renderDurationMs: Date.now() - startedAt,
    });
    return new Response("Bundle not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const formattedBundle = formatBundleForWidget(bundle);
  const templateTypeAttr = formattedBundle.bundleDesignTemplate
    ? ` data-fpb-template-type="${escapeHtmlAttribute(formattedBundle.bundleDesignTemplate)}"`
    : "";
  const designPresetAttr = formattedBundle.bundleDesignPresetId
    ? ` data-fpb-design-preset="${escapeHtmlAttribute(formattedBundle.bundleDesignPresetId)}"`
    : "";
  const config = escapeHtmlAttribute(JSON.stringify(formattedBundle));
  const loadingScreen = resolveFpbLoadingScreenSettings(designSettings?.generalSettings);
  const loadingScreenMarkup = renderFpbLoadingScreen(loadingScreen);
  const loadingGifAttr = loadingScreen.gifUrl
    ? ` data-fpb-loading-gif="${escapeHtmlAttribute(loadingScreen.gifUrl)}"`
    : "";
  const liquid = `<div data-wpb-full-page-bundle data-bundle-id="${escapeHtmlAttribute(bundle.id)}" data-bundle-type="full_page" data-bundle-config-source="app_proxy" data-shop="${escapeHtmlAttribute(shopDomain)}" data-fpb-loading-background="${escapeHtmlAttribute(loadingScreen.backgroundColor)}"${loadingGifAttr}${templateTypeAttr}${designPresetAttr} data-bundle-config='${config}' hidden>${loadingScreenMarkup}</div>`;

  AppLogger.info("FPB proxy page rendered", {
    component: "wpb.proxy",
    shop: shopDomain,
    bundleId: bundle.id,
    publicNumber,
    status: 200,
    renderDurationMs: Date.now() - startedAt,
  });

  return new Response(liquid, {
    status: 200,
    headers: {
      "Content-Type": "application/liquid; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
