type LiveUpsellWidgetPreviewProps = {
  mode: "block" | "button";
  title: string;
  description?: string;
  buttonText: string;
  imageUrl?: string;
};

export function LiveUpsellWidgetPreview({
  mode,
  title,
  description,
  buttonText,
  imageUrl,
}: LiveUpsellWidgetPreviewProps) {
  return (
    <s-box
      padding="base"
      border="base"
      borderRadius="base"
      background="subdued"
      accessibilityLabel="Live widget preview"
    >
      <s-stack gap="base">
        {imageUrl ? <s-image src={imageUrl} alt="Widget preview image" aspectRatio="1/1" /> : null}
        <s-stack gap="small">
          <s-heading>{title || "Bundle offer"}</s-heading>
          {mode === "block" && description ? <s-paragraph>{description}</s-paragraph> : null}
        </s-stack>
        <s-button variant="primary">{buttonText || "View bundle"}</s-button>
      </s-stack>
    </s-box>
  );
}
