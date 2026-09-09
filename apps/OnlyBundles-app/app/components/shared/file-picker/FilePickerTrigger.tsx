import { MobileIcon, MonitorIcon } from "./FilePickerIcons";
import { truncateStoreFileText } from "./utils";
import { translateAdmin } from "~/i18n/config";

type FilePickerTriggerProps = {
  value: string | null;
  currentFilename: string | null;
  label: string;
  hint?: string;
  uploadLabel: string;
  showUploadButton?: boolean;
  triggerIcon: "desktop" | "mobile";
  uploadButtonAction: "upload" | "openPicker";
  fitPreviewToTrigger: boolean;
  previewActionsMenuId: string;
  triggerIsUploading: boolean;
  uploadStatus:
    | "idle"
    | "uploading"
    | "polling"
    | "success"
    | "timeout"
    | "error";
  disabled?: boolean;
  handleOpen: () => void;
  handleRemove: () => void;
  handleTriggerUpload: (event: { stopPropagation: () => void }) => void;
};

export function FilePickerTrigger({
  value,
  currentFilename,
  label,
  hint,
  uploadLabel,
  showUploadButton = true,
  triggerIcon,
  uploadButtonAction,
  fitPreviewToTrigger,
  previewActionsMenuId,
  triggerIsUploading,
  uploadStatus,
  disabled = false,
  handleOpen,
  handleRemove,
  handleTriggerUpload,
}: FilePickerTriggerProps) {
  if (value) {
    if (fitPreviewToTrigger) {
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "var(--wpb-file-picker-trigger-height, 180px)",
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fafbfb",
            boxSizing: "border-box",
          }}
        >
          <s-image
            src={value}
            alt={currentFilename ?? "Background image"}
            objectFit="contain"
          />
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
            }}
          >
            <s-button
              commandFor={previewActionsMenuId}
              icon="menu-horizontal"
              variant="secondary"
              accessibilityLabel={translateAdmin(
                "adminAttributes.bannerImageActions"
              )}
              disabled={disabled || undefined}
            />
            <s-menu
              id={previewActionsMenuId}
              accessibilityLabel={translateAdmin(
                "adminAttributes.bannerImageActions"
              )}
            >
              <s-button
                icon="edit"
                disabled={disabled || undefined}
                onClick={handleOpen}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.changeImage"
                )}
              </s-button>
              <s-button
                icon="delete"
                tone="critical"
                disabled={disabled || undefined}
                onClick={handleRemove}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.removeImage"
                )}
              </s-button>
            </s-menu>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          border: "1px solid #c9cccf",
          borderRadius: "8px",
          padding: "10px",
          background: "#fafbfb",
        }}
      >
        <s-stack direction="inline" gap="small" alignItems="start">
          <s-box inlineSize="52px" blockSize="52px">
            <s-image
              src={value}
              alt={currentFilename ?? "Background image"}
              objectFit="cover"
              aspectRatio="1/1"
              borderWidth="small"
              borderRadius="small"
            />
          </s-box>
          <s-stack direction="block" gap="small-100">
            <s-text color="subdued">
              {truncateStoreFileText(currentFilename ?? value, 24)}
            </s-text>
            <s-stack direction="inline" gap="small">
              <s-button
                variant="tertiary"
                disabled={disabled || undefined}
                onClick={handleOpen}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.change"
                )}
              </s-button>
              <s-button
                variant="tertiary"
                tone="critical"
                icon="delete"
                disabled={disabled || undefined}
                onClick={handleRemove}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.remove"
                )}
              </s-button>
            </s-stack>
          </s-stack>
        </s-stack>
      </div>
    );
  }

  const surfaceStyle = {
    width: "100%",
    border: "2px dashed #c9cccf",
    borderRadius: "8px",
    padding: "var(--wpb-file-picker-trigger-padding, 28px 16px)",
    background: "#fafbfb",
    cursor: disabled || triggerIsUploading ? "default" : "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
    height: fitPreviewToTrigger
      ? "var(--wpb-file-picker-trigger-height, 180px)"
      : undefined,
  };
  const triggerContent = triggerIsUploading ? (
    <>
      <s-spinner
        size="base"
        accessibilityLabel={translateAdmin("adminAttributes.uploadingImage")}
      />
      <s-text color="subdued">
        {uploadStatus === "uploading" ? "Uploading…" : "Processing…"}
      </s-text>
    </>
  ) : (
    <>
      {triggerIcon === "mobile" ? <MobileIcon /> : <MonitorIcon />}
      <s-text type="strong">{label}</s-text>
      {hint && <s-text color="subdued">{hint}</s-text>}
    </>
  );
  const clickableSurface = (
    <s-clickable
      accessibilityLabel={label}
      disabled={disabled || triggerIsUploading || undefined}
      onClick={!disabled && !triggerIsUploading ? handleOpen : undefined}
    >
      <div style={showUploadButton ? undefined : surfaceStyle}>{triggerContent}</div>
    </s-clickable>
  );

  if (!showUploadButton || triggerIsUploading) return clickableSurface;

  return (
    <div style={surfaceStyle}>
      {clickableSurface}
      <s-button
        variant="secondary"
        disabled={disabled || undefined}
        onClick={(event) => {
          if (uploadButtonAction === "openPicker") {
            handleOpen();
            return;
          }
          handleTriggerUpload(event);
        }}
      >
        {uploadLabel}
      </s-button>
    </div>
  );
}
