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
        minHeight: "min(612px, calc(100vh - 180px))",
        flexDirection: "column",
        background: "#f1f1f1",
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
        <s-stack gap="none">
          <s-text type="strong">View your bundle</s-text>
          <s-text>View your bundle with your customizations</s-text>
        </s-stack>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background: "#f1f1f1",
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
          }}
        >
          <s-stack gap="small" alignItems="center">
            <s-icon type="check-circle" tone="success" />
            <s-stack gap="small" alignItems="center">
              <h3
                style={{
                  margin: 0,
                  color: "#303030",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: "32px",
                  textAlign: "center",
                }}
              >
                Your bundle is ready
              </h3>
              <s-text color="subdued">
                Preview it now with your customizations
              </s-text>
            </s-stack>
            <s-button
              variant="secondary"
              loading={isPreviewLoading || undefined}
              disabled={isPreviewLoading || undefined}
              onClick={onPreview}
            >
              Preview bundle
            </s-button>
          </s-stack>
        </div>
      </div>
    </div>
  );
}
