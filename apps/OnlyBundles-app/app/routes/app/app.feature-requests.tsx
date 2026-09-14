import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../../shopify.server";
import { getCannyPublicConfig } from "../../services/canny.server";
import { CannyFeedback } from "../../components/canny/CannyFeedback";
import { AdminPageBackTitle, AdminPageTitleBar } from "../../components/AdminPageNavigation";
import { navigateBackOrFallback } from "../../lib/navigation";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return json({ canny: getCannyPublicConfig() }, { headers: { "Cache-Control": "no-store" } });
}

export default function FeatureRequestsRoute() {
  const { canny } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onBack = () => navigateBackOrFallback(navigate, "/app/dashboard", { replaceFallback: true });
  return (
    <>
      <AdminPageTitleBar title={t("nav.featureRequests")} breadcrumbLabel={t("nav.dashboard")} onBack={onBack} />
      <s-page>
        <AdminPageBackTitle title={t("nav.featureRequests")} backLabel={t("nav.dashboard")} onBack={onBack} />
        <s-section>
          <s-paragraph>{t("canny.feedbackIntro")}</s-paragraph>
          <CannyFeedback config={canny} />
        </s-section>
      </s-page>
    </>
  );
}
