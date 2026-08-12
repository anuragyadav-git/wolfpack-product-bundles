import type { KeyboardEvent, MouseEvent } from "react";
import { MobileIcon, MonitorIcon } from "./FilePickerIcons";
import { truncateStoreFileText } from "./utils";

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
  uploadStatus: "idle" | "uploading" | "polling" | "success" | "timeout" | "error";
  handleOpen: () => void;
  handleRemove: () => void;
  handleTriggerUpload: (event: MouseEvent) => void;
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
            height: "180px",
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fafbfb",
            boxSizing: "border-box",
          }}
        >
          <img
            src={value}
            alt={currentFilename ?? "Background image"}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
            }}
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
              accessibilityLabel="Banner image actions"
            />
            <s-menu id={previewActionsMenuId} accessibilityLabel="Banner image actions">
              <s-button icon="edit" onClick={handleOpen}>
                Change image
              </s-button>
              <s-button icon="delete" tone="critical" onClick={handleRemove}>
                Remove image
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
          <img
            src={value}
            alt={currentFilename ?? "Background image"}
            style={{
              width: "52px",
              height: "52px",
              objectFit: "cover",
              borderRadius: "4px",
              flexShrink: 0,
              border: "1px solid #e1e3e5",
            }}
          />
          <s-stack direction="block" gap="small-100">
            <s-text color="subdued">
              {truncateStoreFileText(currentFilename ?? value, 24)}
            </s-text>
            <s-stack direction="inline" gap="small">
              <s-button variant="tertiary" onClick={handleOpen}>
                Change
              </s-button>
              <s-button variant="tertiary" tone="critical" icon="delete" onClick={handleRemove}>
                Remove
              </s-button>
            </s-stack>
          </s-stack>
        </s-stack>
      </div>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") handleOpen();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={!triggerIsUploading ? handleOpen : undefined}
      onKeyDown={!triggerIsUploading ? handleKeyDown : undefined}
      style={{
        width: "100%",
        border: "2px dashed #c9cccf",
        borderRadius: "8px",
        padding: "28px 16px",
        background: "#fafbfb",
        cursor: triggerIsUploading ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        textAlign: "center",
        boxSizing: "border-box",
        height: fitPreviewToTrigger ? "180px" : undefined,
      }}
    >
      {triggerIsUploading ? (
        <>
          <s-spinner size="small" accessibilityLabel="Uploading image" />
          <s-text color="subdued">
            {uploadStatus === "uploading" ? "Uploading…" : "Processing…"}
          </s-text>
        </>
      ) : (
        <>
          {triggerIcon === "mobile" ? <MobileIcon /> : <MonitorIcon />}
          <s-text type="strong">
            {label}
          </s-text>
          {hint && (
            <s-text color="subdued">
              {hint}
            </s-text>
          )}
          {showUploadButton ? (
            <s-button
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                if (uploadButtonAction === "openPicker") {
                  handleOpen();
                  return;
                }
                handleTriggerUpload(event);
              }}
            >
              {uploadLabel}
            </s-button>
          ) : null}
        </>
      )}
    </div>
  );
}
