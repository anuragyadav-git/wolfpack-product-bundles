import { translateAdmin } from "~/i18n/config";
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
      accessibilityLabel={translateAdmin("adminAttributes.liveWidgetPreview")}
    >
      <s-stack gap="base">
        {imageUrl ? <s-image src={imageUrl} alt="" aspectRatio="1/1" /> : null}
        <s-stack gap="small">
          {title ? <s-heading>{title}</s-heading> : null}
          {mode === "block" && description ? (
            <s-paragraph>{description}</s-paragraph>
          ) : null}
        </s-stack>
        {buttonText ? (
          <s-button variant="primary">{buttonText}</s-button>
        ) : null}
      </s-stack>
    </s-box>
  );
}
