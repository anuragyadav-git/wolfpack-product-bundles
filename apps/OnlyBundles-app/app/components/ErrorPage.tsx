import { isRouteErrorResponse, useNavigate } from "@remix-run/react";
import { APP_BRAND } from "../lib/app-brand";
import { openSupportChat } from "../lib/support-chat.client";
import { translateAdmin } from "~/i18n/config";

interface ErrorPageProps {
  error: unknown;
}

// ---------------------------------------------------------------------------
// Status-specific copy
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  number,
  { title: string; description: string; hint: string }
> = {
  400: {
    title: "Bad Request",
    description:
      "The request couldn't be understood. Please check the URL and try again.",
    hint: "If this keeps happening, try clearing your browser cache.",
  },
  401: {
    title: "Not Authenticated",
    description: "You need to be signed in to access this page.",
    hint: "Try refreshing the page to re-authenticate with Shopify.",
  },
  403: {
    title: "Access Denied",
    description: "You don't have permission to view this page.",
    hint: "Contact your store owner if you believe this is a mistake.",
  },
  404: {
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist or may have been moved.",
    hint: "Check the URL for typos, or head back to the dashboard.",
  },
  422: {
    title: "Invalid Request",
    description: "The server couldn't process your request as submitted.",
    hint: "Try again with different parameters.",
  },
  429: {
    title: "Too Many Requests",
    description:
      "You've sent too many requests in a short period. Please slow down.",
    hint: "Wait a few seconds and try again.",
  },
};

const FALLBACK_5XX = {
  title: "Unexpected Error",
  description: "Something went wrong on our end. Our team has been notified.",
  hint: "Try refreshing the page or returning to the dashboard.",
};

export function ErrorPage({ error }: ErrorPageProps) {
  const navigate = useNavigate();
  const handleGoToDashboard = () => {
    navigate("/app/dashboard", { replace: true });
  };
  let status = 500;
  let title = FALLBACK_5XX.title;
  let description = FALLBACK_5XX.description;
  let hint = FALLBACK_5XX.hint;

  if (isRouteErrorResponse(error)) {
    const routeError = error as { status: number };
    status = routeError.status;
    const cfg = STATUS_CONFIG[status];
    if (cfg) {
      title = cfg.title;
      description = cfg.description;
      hint = cfg.hint;
    } else if (status >= 400 && status < 500) {
      title = "Something Went Wrong";
      description =
        "An unexpected error occurred. Please try again or return to the dashboard.";
      hint = "If this keeps happening, contact support.";
    }
  }

  const is4xx = status >= 400 && status < 500;

  return (
    <s-grid
      minBlockSize="100%"
      alignItems="center"
      justifyItems="center"
      padding="large-400"
    >
      <s-box inlineSize="100%" maxInlineSize="576px">
        <s-section accessibilityLabel={`${status} ${title}`}>
          <s-grid
            gap="large-300"
            justifyItems="center"
            padding="large-400"
          >
            <s-box
              inlineSize="96px"
              blockSize="96px"
              overflow="hidden"
              borderRadius="large-200"
            >
              <s-image
                src={APP_BRAND.markPath}
                alt={APP_BRAND.name}
                aspectRatio="1/1"
                objectFit="cover"
                inlineSize="fill"
              />
            </s-box>

            <s-badge tone={is4xx ? "info" : "critical"}>{status}</s-badge>

            <s-grid justifyItems="center" maxInlineSize="448px" gap="base">
              <s-stack direction="block" gap="small-200" alignItems="center">
                <s-heading>{title}</s-heading>
                <s-paragraph>{description}</s-paragraph>
                <s-paragraph tone="neutral" color="subdued">
                  {hint}
                </s-paragraph>
              </s-stack>

              <s-button-group gap="base">
                <s-button
                  slot="primary-action"
                  variant="primary"
                  onClick={handleGoToDashboard}
                >
                  {translateAdmin(
                    "adminExtracted.components.errorpage.goToDashboard"
                  )}
                </s-button>
                <s-button
                  slot="secondary-actions"
                  variant="secondary"
                  onClick={() => openSupportChat()}
                >
                  {translateAdmin("billing.actions.contactSupport")}
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
      </s-box>
    </s-grid>
  );
}
