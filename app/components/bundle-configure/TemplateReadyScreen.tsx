import { translateAdmin } from "~/i18n/config";
export function TemplateReadyScreen({
  isPreviewLoading,
  onPreview,
}: {
  isPreviewLoading: boolean;
  onPreview: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          minHeight: 72,
          padding: 16,
          borderBottom: "1px solid #d4d4d4",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            color: "#303030",
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          {translateAdmin(
            "adminExtracted.components.bundleConfigure.templatereadyscreen.viewYourBundle"
          )}
        </div>
        <div
          style={{
            color: "#303030",
            fontSize: 13,
            fontWeight: 400,
            lineHeight: "20px",
          }}
        >
          {translateAdmin(
            "adminExtracted.components.bundleConfigure.templatereadyscreen.viewYourBundleWithYourCustomizations"
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(112px, 20.6vh, 158px) 16px 32px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: "min(480px, 100%)",
            minHeight: 224,
            padding: 40,
            border: "1px solid #d4d4d4",
            borderRadius: 12,
            background: "#ebebeb",
            boxShadow: "0 1px 0 rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: "block", color: "#008060" }}
          >
            <path
              d="M20 11.1V12a8 8 0 1 1-4.74-7.31M20 6l-8.75 8.75L8.5 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2
            style={{
              margin: "16px 0 0",
              color: "#303030",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: "32px",
              textAlign: "center",
            }}
          >
            {translateAdmin(
              "adminExtracted.components.bundleConfigure.templatereadyscreen.yourBundleIsReady"
            )}
          </h2>
          <p
            style={{
              margin: "0 0 16px",
              color: "#616161",
              fontSize: 13,
              fontWeight: 400,
              lineHeight: "20px",
              textAlign: "center",
            }}
          >
            {translateAdmin(
              "adminExtracted.components.bundleConfigure.templatereadyscreen.previewItNowWithYourCustomizations"
            )}
          </p>
          <button
            type="button"
            aria-busy={isPreviewLoading}
            disabled={isPreviewLoading}
            onClick={onPreview}
            style={{
              minHeight: 32,
              padding: "6px 12px",
              border: "1px solid #babfc3",
              borderRadius: 8,
              background: "#ffffff",
              boxShadow: "0 1px 0 rgba(0, 0, 0, 0.05)",
              color: "#303030",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: "18px",
              cursor: isPreviewLoading ? "default" : "pointer",
              opacity: isPreviewLoading ? 0.65 : 1,
            }}
          >
            {translateAdmin("settingsDcp.preview.storefront.open")}
          </button>
        </div>
      </div>
    </div>
  );
}
