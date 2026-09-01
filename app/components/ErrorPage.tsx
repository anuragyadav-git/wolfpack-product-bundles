import { isRouteErrorResponse, useNavigate } from "@remix-run/react";
import { APP_BRAND } from "../lib/app-brand";
import { openSupportChat } from "../lib/support-chat.client";

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
  let detail: string | null = null;

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
      description = "An unexpected error occurred. Please try again or return to the dashboard.";
      hint = "If this keeps happening, contact support.";
    }
  } else if (error instanceof Error) {
    detail = error.message;
  }

  const is4xx = status >= 400 && status < 500;

  return (
    <main className="ob-error-page" aria-labelledby="error-page-title">
      <section className="ob-error-page__panel">
        <div className="ob-error-page__logo">
          <s-image
            src={APP_BRAND.markPath}
            alt={APP_BRAND.name}
            aspectRatio="1/1"
            objectFit="cover"
          />
        </div>

        <div className="ob-error-page__status">
          <s-badge tone={is4xx ? "info" : "critical"}>{status}</s-badge>
        </div>

        <div className="ob-error-page__copy">
          <s-heading id="error-page-title">{title}</s-heading>
          <s-paragraph>{description}</s-paragraph>
          <s-paragraph tone="neutral" color="subdued">{hint}</s-paragraph>
        </div>

        {detail && !is4xx ? (
          <details className="ob-error-page__details">
            <summary>Technical details</summary>
            <pre>{detail}</pre>
          </details>
        ) : null}

        <div className="ob-error-page__actions">
          <s-button variant="primary" onClick={handleGoToDashboard}>
            Go to Dashboard
          </s-button>
          <s-button variant="secondary" onClick={() => openSupportChat()}>
            Contact Support
          </s-button>
        </div>
      </section>
    </main>
  );
}
