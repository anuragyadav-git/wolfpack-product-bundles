import {
  json,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../../../shopify.server";
import { handleCreateBundle } from "../app.dashboard/handlers/handlers.server";
import { BundleType } from "../../../constants/bundle";
import { parseOnboardingBundleType } from "../../../lib/onboarding-bundle-type";
import { showPolarisModal } from "../_shared/bundle-configure/modal-utils";
import styles from "./create-bundle.module.css";
import {
  ensureShopIdentity,
  recordBusinessEvent,
} from "../../../services/app-events.server";
import { TUTORIAL_LINKS } from "../../../lib/tutorial-links";
import { translateAdmin } from "~/i18n/config";
import {
  initializeSidekickBundleIntentBridge,
  resolveSidekickAppBridge,
  type SidekickBundleDraft,
} from "../../../lib/sidekick-create-bundle";
import { BundleTypeSelectionCard } from "./BundleTypeSelectionCard";

type SidekickAppBridge = {
  tools: typeof shopify.tools;
  intents: {
    request: typeof shopify.intents.request;
    response: NonNullable<typeof shopify.intents.response>;
  };
};

export const links: LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: "/ppb.avif",
    imageSrcSet: "/ppb.avif 320w",
    imageSizes: "320px",
    type: "image/avif",
    fetchpriority: "high",
  } as ReturnType<LinksFunction>[number],
  {
    rel: "preload",
    as: "image",
    href: "/fpb.avif",
    imageSrcSet: "/fpb.avif 320w",
    imageSizes: "320px",
    type: "image/avif",
    fetchpriority: "high",
  } as ReturnType<LinksFunction>[number],
];

export const headers: HeadersFunction = () => ({
  Link: [
    "</ppb.avif>; rel=preload; as=image; type=image/avif; fetchpriority=high",
    "</fpb.avif>; rel=preload; as=image; type=image/avif; fetchpriority=high",
  ].join(", "),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session, redirect } = await authenticate.admin(request);
  const shopifyShopGid = await ensureShopIdentity(admin, session.shop);
  const formData = await request.formData();
  const bundleName = formData.get("bundleName");
  const bundleType = formData.get("bundleType");
  const submissionMode = formData.get("submissionMode");
  const isSidekickSubmission = submissionMode === "sidekick";
  const createFormData = new FormData();
  if (typeof bundleName === "string")
    createFormData.set("bundleName", bundleName);
  if (typeof bundleType === "string")
    createFormData.set("bundleType", bundleType);
  await recordBusinessEvent({
    eventHandle: "bundle_create_started",
    shopDomain: session.shop,
    shopifyShopGid,
    bundleType: typeof bundleType === "string" ? bundleType : null,
    surface: "admin",
    actor: "merchant",
    routeFamily: "create",
    attributes: {
      entry_point: isSidekickSubmission ? "sidekick" : "create_route",
    },
  });
  const result = await handleCreateBundle(admin, session, createFormData);
  const data = (await result.json()) as {
    error?: string;
    bundleId?: string;
    bundleProductId?: string;
    redirectTo?: string;
    showFirstLoadTour?: boolean;
    success?: boolean;
  };
  if (data.success && data.redirectTo) {
    await recordBusinessEvent({
      eventHandle: "bundle_created",
      shopDomain: session.shop,
      shopifyShopGid,
      bundleId: data.bundleId ?? null,
      bundleType: typeof bundleType === "string" ? bundleType : null,
      surface: "admin",
      actor: "merchant",
      routeFamily: "create",
      result: "success",
      attributes: {
        template_id: typeof bundleType === "string" ? bundleType : null,
      },
    });
    if (isSidekickSubmission && data.bundleId && data.bundleProductId) {
      return json({
        success: true,
        bundleId: data.bundleId,
        bundleProductId: data.bundleProductId,
        redirectTo: data.redirectTo,
      });
    }
    if (!data.showFirstLoadTour) {
      return redirect(data.redirectTo);
    }
    const separator = String(data.redirectTo).includes("?") ? "&" : "?";
    return redirect(`${data.redirectTo}${separator}first_load=true`);
  }
  await recordBusinessEvent({
    eventHandle: "bundle_create_failed",
    shopDomain: session.shop,
    shopifyShopGid,
    bundleType: typeof bundleType === "string" ? bundleType : null,
    surface: "admin",
    actor: "merchant",
    routeFamily: "create",
    result: "failure",
    errorCode: "create_failed",
    attributes: {
      error_message_safe: data.error ?? "Bundle creation failed",
    },
  });
  if (isSidekickSubmission) {
    return json(
      { success: false, errorCode: "bundle_create_failed" },
      { status: result.status },
    );
  }
  return json(data, { status: result.status });
};

export default function CreateBundleEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const sidekickFetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isSubmitting =
    navigation.state === "submitting" ||
    sidekickFetcher.state === "submitting";

  const [bundleType, setBundleType] = useState<string | null>(() =>
    searchParams.has("bundleType")
      ? parseOnboardingBundleType(searchParams.get("bundleType"))
      : null
  );
  const [bundleTypeError, setBundleTypeError] = useState<string | null>(null);
  const [bundleNameError, setBundleNameError] = useState<string | null>(null);

  const bundleNameRef = useRef<any>(null);
  const nameModalRef = useRef<any>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const sidekickSubmissionPendingRef = useRef(false);
  const [bundleName, setBundleName] = useState("");
  const [isSidekickIntent, setIsSidekickIntent] = useState(false);

  const getSidekick = useCallback((): SidekickAppBridge | null => {
    if (typeof shopify === "undefined" || !shopify.intents.response) {
      return null;
    }
    return resolveSidekickAppBridge({
      shopify: {
        tools: shopify.tools,
        intents: {
          request: shopify.intents.request,
          response: shopify.intents.response,
        },
      },
    });
  }, []);

  const applySidekickDraft = useCallback((draft: SidekickBundleDraft) => {
    setIsSidekickIntent(true);
    if (draft.bundleType) {
      setBundleType(draft.bundleType);
      setBundleTypeError(null);
    }
    if (draft.title) {
      setBundleName(draft.title);
      setBundleNameError(null);
    }
    if (draft.bundleType && draft.title) {
      showPolarisModal(nameModalRef);
    }
  }, []);

  useEffect(() => {
    const sidekick = getSidekick();
    if (!sidekick) return;

    return initializeSidekickBundleIntentBridge({
        tools: sidekick.tools,
        request: sidekick.intents.request,
        applyDraft: applySidekickDraft,
        onInvalidIntent: () => {
          setIsSidekickIntent(true);
          void sidekick.intents.response.error(
            t("common.alerts.operationFailed"),
          );
        },
      });
  }, [applySidekickDraft, getSidekick, t]);

  useEffect(() => {
    const el = bundleNameRef.current;
    if (!el) return;
    const handler = (e: Event) =>
      setBundleName((e.target as HTMLInputElement).value ?? "");
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

  const operationError =
    actionData && "error" in actionData
      ? t("common.alerts.operationFailed")
      : sidekickFetcher.data && "errorCode" in sidekickFetcher.data
        ? t("common.alerts.operationFailed")
        : null;

  useEffect(() => {
    if (!sidekickSubmissionPendingRef.current || !sidekickFetcher.data) return;
    sidekickSubmissionPendingRef.current = false;
    const sidekick = getSidekick();
    if (!sidekick) return;

    if (
      "success" in sidekickFetcher.data &&
      sidekickFetcher.data.success === true &&
      "bundleProductId" in sidekickFetcher.data &&
      typeof sidekickFetcher.data.bundleProductId === "string"
    ) {
      void sidekick.intents.response.ok({
        id: sidekickFetcher.data.bundleProductId,
      });
      return;
    }

    void sidekick.intents.response.error(t("common.alerts.operationFailed"));
  }, [getSidekick, sidekickFetcher.data, t]);

  useEffect(() => {
    if (operationError) showPolarisModal(nameModalRef);
  }, [operationError]);

  const handleBackToDashboard = useCallback(() => {
    if (isSidekickIntent) {
      const sidekick = getSidekick();
      if (sidekick) void sidekick.intents.response.closed();
      return;
    }
    navigate("/app/dashboard", { replace: true });
  }, [getSidekick, isSidekickIntent, navigate]);

  const handleSelectBundleType = useCallback((type: string) => {
    setBundleType(type);
    setBundleTypeError(null);
  }, []);

  const handleBundleNameInput = useCallback((e: Event) => {
    setBundleName((e.target as HTMLInputElement).value ?? "");
  }, []);

  const handleContinue = useCallback(() => {
    if (!bundleType) {
      setBundleTypeError(t("createBundle.validation.required"));
      return;
    }
    showPolarisModal(nameModalRef);
  }, [bundleType, t]);

  const handleSaveName = useCallback(() => {
    const name = bundleName.trim();
    if (!name) {
      setBundleNameError(t("createBundle.validation.required"));
      bundleNameRef.current?.focus?.();
      return;
    }
    if (name.length < 3) {
      setBundleNameError(t("createBundle.validation.minLength"));
      bundleNameRef.current?.focus?.();
      return;
    }
    setBundleNameError(null);
    if (isSidekickIntent && bundleType) {
      const formData = new FormData();
      formData.set("bundleName", name);
      formData.set("bundleType", bundleType);
      formData.set("submissionMode", "sidekick");
      sidekickSubmissionPendingRef.current = true;
      sidekickFetcher.submit(formData, { method: "post" });
      return;
    }
    submitButtonRef.current?.click();
  }, [bundleName, bundleType, isSidekickIntent, sidekickFetcher, t]);

  return (
    <>
      <ui-title-bar title={t("createBundle.title")}>
        <button variant="breadcrumb" onClick={handleBackToDashboard}>
          {t("createBundle.dashboard")}
        </button>
      </ui-title-bar>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <s-button
              variant="tertiary"
              icon="arrow-left"
              accessibilityLabel={t("createBundle.dashboard")}
              onClick={handleBackToDashboard}
            />
            <h1 className={styles.pageTitle}>{t("createBundle.heading")}</h1>
          </div>
          <s-button
            variant="secondary"
            href={TUTORIAL_LINKS.createBundle}
            target="_blank"
          >
            {t("createBundle.help")}
          </s-button>
        </div>

        <div className={styles.formContent}>
          <div className={styles.formSection}>
            <s-query-container containerName="create-bundle-entry">
              <s-grid
                gap="base"
                gridTemplateColumns="@container create-bundle-entry (inline-size > 600px) 1fr 1fr, 1fr"
              >
                <BundleTypeSelectionCard
                  description={t(
                    "createBundle.bundleType.productPage.description",
                  )}
                  selected={bundleType === BundleType.PRODUCT_PAGE}
                  selectedLabel={t("createBundle.actions.selected")}
                  selectLabel={t("createBundle.actions.select")}
                  thumbnail="product-page"
                  title={t("createBundle.bundleType.productPage.title")}
                  onSelect={() =>
                    handleSelectBundleType(BundleType.PRODUCT_PAGE)
                  }
                />
                <BundleTypeSelectionCard
                  description={t(
                    "createBundle.bundleType.fullPage.description",
                  )}
                  selected={bundleType === BundleType.FULL_PAGE}
                  selectedLabel={t("createBundle.actions.selected")}
                  selectLabel={t("createBundle.actions.select")}
                  thumbnail="full-page"
                  title={t("createBundle.bundleType.fullPage.title")}
                  onSelect={() => handleSelectBundleType(BundleType.FULL_PAGE)}
                />
              </s-grid>
            </s-query-container>
            {bundleTypeError ? (
              <s-text tone="critical">{bundleTypeError}</s-text>
            ) : null}
          </div>
        </div>

        <s-modal
          ref={nameModalRef}
          id="create-bundle-name-modal"
          heading={
            bundleType === BundleType.FULL_PAGE
              ? t("createBundle.bundleType.fullPage.title")
              : t("createBundle.bundleType.productPage.title")
          }
        >
          <Form method="post" className={styles.modalForm}>
            {operationError ? (
              <s-banner
                tone="critical"
                heading={operationError}
                dismissible={false}
              />
            ) : null}
            <s-text-field
              ref={bundleNameRef}
              label={t("createBundle.fields.name")}
              name="bundleName"
              value={bundleName}
              placeholder={t("createBundle.fields.namePlaceholder")}
              autocomplete="off"
              onInput={handleBundleNameInput}
              onChange={handleBundleNameInput}
              error={bundleNameError ?? undefined}
            />
            {bundleType && (
              <input type="hidden" name="bundleType" value={bundleType} />
            )}
            <button
              ref={submitButtonRef}
              type="submit"
              style={{ display: "none" }}
              aria-hidden="true"
            />
            <div className={styles.modalActions}>
              <s-button
                variant="primary"
                loading={isSubmitting || undefined}
                onClick={handleSaveName}
              >
                {translateAdmin("dashboard.language.save")}
              </s-button>
            </div>
          </Form>
        </s-modal>

        <div className={styles.wizardFooter}>
          <s-button
            variant="primary"
            disabled={!bundleType || undefined}
            onClick={handleContinue}
          >
            {t("createBundle.actions.next")}
          </s-button>
        </div>
      </div>
    </>
  );
}
