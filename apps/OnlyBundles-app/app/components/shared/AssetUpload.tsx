import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, ComponentRef } from "react";

import { translateAdmin } from "~/i18n/config";
import {
  getUploadStoreFileStatus,
  uploadStoreFile,
} from "../../lib/admin-store-files.client";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif";
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_POLLS = 15;

type UploadStatus =
  | "idle"
  | "uploading"
  | "polling"
  | "success"
  | "timeout"
  | "error";

type DropZoneElement = ComponentRef<"s-drop-zone">;

export interface AssetUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  accept?: string;
  maxUploadBytes?: number;
  maxUploadErrorMessage?: string;
  invalidTypeErrorMessage?: string;
  dropZoneContentMinBlockSize?: ComponentProps<"s-grid">["minBlockSize"];
}

function isAcceptedFileType(fileType: string, accept: string) {
  return accept
    .split(",")
    .map((type) => type.trim())
    .some((type) => {
      if (type === fileType) return true;
      if (!type.endsWith("/*")) return false;
      return fileType.startsWith(`${type.slice(0, -1)}`);
    });
}

function filenameFromUrl(url: string) {
  try {
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] ?? url);
  } catch {
    return url;
  }
}

export function AssetUpload({
  value,
  onChange,
  disabled = false,
  label = translateAdmin("adminAttributes.uploadImage"),
  hint,
  accept = ACCEPTED_TYPES,
  maxUploadBytes = MAX_BYTES,
  maxUploadErrorMessage = translateAdmin("adminDynamic.fileMustBeUnder20Mb"),
  invalidTypeErrorMessage = translateAdmin(
    "adminDynamic.chooseSupportedImageFile",
  ),
  dropZoneContentMinBlockSize,
}: AssetUploadProps) {
  const dropZoneRef = useRef<DropZoneElement | null>(null);
  const pollCountRef = useRef(0);
  const activeAttemptRef = useRef(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [pollTrigger, setPollTrigger] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dropZoneName = `asset-upload-${useId().replace(/:/g, "")}`;
  const isBlocked = status === "uploading" || status === "polling";

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDropRejected = () => {
      setValidationError(invalidTypeErrorMessage);
    };
    dropZone.addEventListener("droprejected", handleDropRejected);
    return () => {
      dropZone.removeEventListener("droprejected", handleDropRejected);
    };
  }, [invalidTypeErrorMessage]);

  useEffect(() => {
    if (status !== "polling" || !pendingFileId) return;
    if (pollCountRef.current >= MAX_POLLS) {
      activeAttemptRef.current = false;
      setPendingFileId(null);
      setStatus("timeout");
      return;
    }

    const timer = setTimeout(async () => {
      pollCountRef.current += 1;
      try {
        const result = await getUploadStoreFileStatus(pendingFileId);
        if (!activeAttemptRef.current) return;
        if (result.fileStatus === "READY" && result.file?.url) {
          activeAttemptRef.current = false;
          setPendingFileId(null);
          setStatus("success");
          onChange(result.file.url);
          return;
        }
        if (result.fileStatus === "FAILED") {
          activeAttemptRef.current = false;
          setPendingFileId(null);
          setStatus("error");
          setUploadError(translateAdmin("adminAttributes.uploadFailed"));
          return;
        }
        setPollTrigger((current) => current + 1);
      } catch (error) {
        activeAttemptRef.current = false;
        setPendingFileId(null);
        setStatus("error");
        setUploadError(
          error instanceof Error
            ? error.message
            : translateAdmin("adminAttributes.uploadFailed"),
        );
      }
    }, 2_000);

    return () => clearTimeout(timer);
  }, [onChange, pendingFileId, pollTrigger, status]);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => setStatus("idle"), 1_500);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      activeAttemptRef.current = false;
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File | undefined) => {
      if (disabled || isBlocked || !file) return;

      setUploadError(null);
      if (!isAcceptedFileType(file.type, accept)) {
        setValidationError(invalidTypeErrorMessage);
        return;
      }
      if (file.size > maxUploadBytes) {
        setValidationError(maxUploadErrorMessage);
        return;
      }

      setValidationError(null);
      setPendingFileId(null);
      pollCountRef.current = 0;
      setPollTrigger(0);
      setStatus("uploading");
      activeAttemptRef.current = true;

      const formData = new FormData();
      formData.append("file", file);
      try {
        const result = await uploadStoreFile(formData);
        if (!activeAttemptRef.current) return;
        if (result.ok && result.fileId) {
          setPendingFileId(result.fileId);
          setStatus("polling");
          return;
        }
        activeAttemptRef.current = false;
        setStatus("error");
        setUploadError(
          result.error ?? translateAdmin("adminAttributes.uploadFailed"),
        );
      } catch (error) {
        activeAttemptRef.current = false;
        setStatus("error");
        setUploadError(
          error instanceof Error
            ? error.message
            : translateAdmin("adminAttributes.uploadFailed"),
        );
      }
    }, [
      accept,
      disabled,
      invalidTypeErrorMessage,
      isBlocked,
      maxUploadBytes,
      maxUploadErrorMessage,
    ],
  );

  const handleInput = useCallback(
    (event: Event) => {
      const dropZone = event.currentTarget as DropZoneElement;
      const file = dropZone.files[0];
      dropZone.value = "";
      void uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <s-stack direction="block" gap="small">
      {value ? (
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-box inlineSize="64px" blockSize="64px">
            <s-image
              src={value}
              alt={filenameFromUrl(value)}
              objectFit="contain"
              aspectRatio="1/1"
              borderWidth="small"
              borderRadius="small"
            />
          </s-box>
          <s-stack direction="block" gap="small-100">
            <s-text color="subdued">{filenameFromUrl(value)}</s-text>
            <s-button
              variant="tertiary"
              tone="critical"
              icon="delete"
              disabled={disabled || isBlocked || undefined}
              onClick={() => onChange(null)}
            >
              {translateAdmin(
                "adminExtracted.shared.filePicker.filepickertrigger.removeImage",
              )}
            </s-button>
          </s-stack>
        </s-stack>
      ) : null}

      <s-drop-zone
        ref={dropZoneRef}
        name={dropZoneName}
        accept={accept}
        label={label}
        accessibilityLabel={label}
        disabled={disabled || isBlocked || undefined}
        error={validationError ?? undefined}
        onInput={handleInput}
      >
        {dropZoneContentMinBlockSize ? (
          <s-grid
            minBlockSize={dropZoneContentMinBlockSize}
            alignItems="center"
            justifyItems="center"
          >
            <s-icon type="upload" size="base" />
          </s-grid>
        ) : (
          <s-icon type="upload" size="base" />
        )}
      </s-drop-zone>

      {hint ? <s-text color="subdued">{hint}</s-text> : null}

      {isBlocked ? (
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-spinner
            size="base"
            accessibilityLabel={
              status === "uploading"
                ? translateAdmin("adminAttributes.uploadingImage")
                : translateAdmin("adminAttributes.uploadProcessing")
            }
          />
          <s-text color="subdued">
            {status === "uploading"
              ? translateAdmin("adminAttributes.uploading")
              : translateAdmin("adminAttributes.uploadProcessing")}
          </s-text>
        </s-stack>
      ) : null}

      {status === "error" && uploadError ? (
        <s-banner
          heading={translateAdmin("adminAttributes.uploadFailed")}
          tone="critical"
          dismissible={false}
          hidden={false}
        >
          <s-paragraph>{uploadError}</s-paragraph>
        </s-banner>
      ) : null}

      {status === "timeout" ? (
        <s-banner
          heading={translateAdmin("adminAttributes.uploadProcessing")}
          tone="info"
          dismissible
          hidden={false}
        />
      ) : null}
    </s-stack>
  );
}
