import { translateAdmin } from "~/i18n/config";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { FilePickerDialog } from "./file-picker/FilePickerDialog";
import { FilePickerTrigger } from "./file-picker/FilePickerTrigger";
import type { FilePickerProps, UploadStatus } from "./file-picker/types";
import type { StoreFile } from "../../routes/app/app.store-files";
import {
  ACCEPTED_TYPES,
  MAX_BYTES,
  MAX_POLLS,
  filenameFromUrl,
  isAcceptedFileType,
} from "./file-picker/utils";
import {
  resolveFilePickerInitialOpen,
} from "../../lib/file-picker-upload-state";
import {
  getUploadStoreFileStatus,
  listStoreFiles,
  uploadStoreFile,
} from "../../lib/admin-store-files.client";
import {
  hidePolarisModal,
  showPolarisModal,
  useModalHideListener,
} from "../../routes/app/_shared/bundle-configure/modal-utils";

export function FilePicker({
  value,
  onChange,
  disabled = false,
  label = "Choose background image",
  hint,
  uploadLabel = "Upload image",
  showUploadButton = true,
  triggerIcon = "desktop",
  uploadButtonAction = "upload",
  fitPreviewToTrigger = false,
  maxUploadBytes = MAX_BYTES,
  maxUploadErrorMessage = "File must be under 20 MB.",
  acceptedTypes = ACCEPTED_TYPES,
  invalidTypeErrorMessage = "Choose a supported image file.",
  autoOpen = false,
  onClose,
}: FilePickerProps) {
  const [open, setOpen] = useState(() =>
    resolveFilePickerInitialOpen(autoOpen && !disabled)
  );
  const previewActionsMenuId = `file-picker-preview-actions-${useId().replace(
    /:/g,
    ""
  )}`;
  const dialogRef = useRef<any>(null);
  const [files, setFiles] = useState<StoreFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [pollTrigger, setPollTrigger] = useState(0);
  const [uploadFromTrigger, setUploadFromTrigger] = useState(false);
  const pollCountRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCurrentUploadAttemptRef = useRef(false);

  const isBlocked = uploadStatus === "uploading" || uploadStatus === "polling";

  const loadStoreFiles = useCallback(async (args: {
    cursor?: string | null;
    query?: string | null;
  } = {}) => {
    setFilesLoading(true);
    try {
      const result = await listStoreFiles(args);
      setFiles((prev) => {
        const existingIds = new Set(prev.map((file) => file.id));
        const unique = result.files.filter((file) => !existingIds.has(file.id));
        return [...prev, ...unique];
      });
      setHasNextPage(result.pageInfo.hasNextPage);
      setCursor(result.pageInfo.endCursor ?? null);
    } catch {
      setHasNextPage(false);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (disabled && open) setOpen(false);
  }, [disabled, open]);

  useEffect(() => {
    if (open && files.length === 0) {
      void loadStoreFiles();
    }
  }, [files.length, loadStoreFiles, open]);

  useEffect(() => {
    if (uploadStatus !== "polling" || !pendingFileId) return;
    if (pollCountRef.current >= MAX_POLLS) {
      setUploadStatus("timeout");
      setPendingFileId(null);
      setUploadFromTrigger(false);
      return;
    }

    const timer = setTimeout(async () => {
      pollCountRef.current += 1;
      try {
        const result = await getUploadStoreFileStatus(pendingFileId);
        if (!hasCurrentUploadAttemptRef.current) return;
        if (result.fileStatus === "READY" && result.file) {
          if (uploadFromTrigger) {
            onChange(result.file.url);
            setUploadFromTrigger(false);
          } else {
            setFiles((prev) => {
              const existingIds = new Set(prev.map((file) => file.id));
              if (existingIds.has(result.file!.id)) return prev;
              return [result.file!, ...prev];
            });
            setSelectedUrl(result.file.url);
          }
          setUploadStatus("success");
          setPendingFileId(null);
          hasCurrentUploadAttemptRef.current = false;
          return;
        }
        if (result.fileStatus === "FAILED") {
          setUploadStatus("error");
          setUploadError("Upload processing failed. Please try again.");
          setPendingFileId(null);
          setUploadFromTrigger(false);
          hasCurrentUploadAttemptRef.current = false;
          return;
        }
        setPollTrigger((current) => current + 1);
      } catch {
        setUploadStatus("error");
        setUploadError("Upload processing failed. Please try again.");
        setPendingFileId(null);
        setUploadFromTrigger(false);
        hasCurrentUploadAttemptRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onChange, pendingFileId, pollTrigger, uploadFromTrigger, uploadStatus]);

  useEffect(() => {
    if (uploadStatus !== "success") return;
    const timer = setTimeout(() => setUploadStatus("idle"), 1500);
    return () => clearTimeout(timer);
  }, [uploadStatus]);

  const resetUploadState = useCallback(() => {
    hasCurrentUploadAttemptRef.current = false;
    setUploadStatus("idle");
    setUploadError(null);
    setSizeError(null);
    setPendingFileId(null);
    setUploadFromTrigger(false);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedUrl(null);
    setSearch("");
    resetUploadState();
    onClose?.();
  }, [resetUploadState, onClose]);

  useModalHideListener(dialogRef, handleClose);

  useEffect(() => {
    if (open) {
      showPolarisModal(dialogRef);
      return;
    }
    hidePolarisModal(dialogRef);
  }, [open]);

  const handleOpen = useCallback(() => {
    if (disabled || isBlocked) return;
    setOpen(true);
    setSelectedUrl(null);
    setSearch("");
    resetUploadState();
  }, [disabled, isBlocked, resetUploadState]);

  const handleSelect = useCallback(() => {
    if (disabled) return;
    if (selectedUrl) onChange(selectedUrl);
    setOpen(false);
    setSelectedUrl(null);
    setSearch("");
    resetUploadState();
  }, [disabled, selectedUrl, onChange, resetUploadState]);

  const handleRemove = useCallback(() => {
    if (disabled) return;
    onChange(null);
  }, [disabled, onChange]);

  const handleLoadMore = useCallback(() => {
    if (cursor) {
      void loadStoreFiles({ cursor });
    }
  }, [cursor, loadStoreFiles]);

  const handleTriggerUpload = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      if (disabled || isBlocked) return;
      setUploadFromTrigger(true);
      setSizeError(null);
      setUploadError(null);
      fileInputRef.current?.click();
    },
    [disabled, isBlocked]
  );

  const uploadFile = useCallback(
    async (file: File | undefined) => {
      if (disabled) return;
      if (!file) {
        setUploadFromTrigger(false);
        return;
      }

      if (!isAcceptedFileType(file.type, acceptedTypes)) {
        setSizeError(invalidTypeErrorMessage);
        setUploadFromTrigger(false);
        return;
      }

      if (file.size > maxUploadBytes) {
        setSizeError(maxUploadErrorMessage);
        setUploadFromTrigger(false);
        return;
      }

      setSizeError(null);
      setPendingFileId(null);
      pollCountRef.current = 0;
      setPollTrigger(0);
      setUploadStatus("uploading");
      hasCurrentUploadAttemptRef.current = true;

      const form = new FormData();
      form.append("file", file);
      try {
        const result = await uploadStoreFile(form);
        if (!hasCurrentUploadAttemptRef.current) return;
        if (result.ok && result.fileId) {
          setPendingFileId(result.fileId);
          pollCountRef.current = 0;
          setPollTrigger(0);
          setUploadStatus("polling");
          return;
        }
        setUploadStatus("error");
        setUploadError(result.error ?? "Upload failed. Please try again.");
        setUploadFromTrigger(false);
        hasCurrentUploadAttemptRef.current = false;
      } catch (error) {
        setUploadStatus("error");
        setUploadError(
          error instanceof Error ? error.message : "Upload failed. Please try again.",
        );
        setUploadFromTrigger(false);
        hasCurrentUploadAttemptRef.current = false;
      }
    },
    [
      acceptedTypes,
      disabled,
      invalidTypeErrorMessage,
      maxUploadBytes,
      maxUploadErrorMessage,
    ]
  );

  const handleFileInputChange = useCallback(
    (input: HTMLInputElement) => {
      const file = input.files?.[0];
      if (fileInputRef.current) fileInputRef.current.value = "";
      void uploadFile(file);
    },
    [uploadFile],
  );

  const handleDropZoneInput = useCallback((event: Event) => {
    const input = event.currentTarget as HTMLElement & { files?: FileList };
    void uploadFile(input.files?.[0]);
  }, [uploadFile]);

  const filteredFiles = search
    ? files.filter((file) =>
        file.filename.toLowerCase().includes(search.toLowerCase())
      )
    : files;
  const currentFilename = value ? filenameFromUrl(value) : null;
  const showProgressCircle =
    uploadStatus === "uploading" ||
    uploadStatus === "polling" ||
    uploadStatus === "success";
  const progressCircleStatus: "spinning" | "success" =
    uploadStatus === "success" ? "success" : "spinning";
  const progressLabel =
    uploadStatus === "uploading"
      ? "Uploading…"
      : uploadStatus === "polling"
      ? "Processing…"
      : "Upload complete!";
  const progressTone: "subdued" | "success" =
    uploadStatus === "success" ? "success" : "subdued";
  const triggerIsUploading = uploadFromTrigger && isBlocked;

  return (
    <s-stack direction="block" gap="small">
      {!autoOpen && (
        <FilePickerTrigger
          value={value}
          currentFilename={currentFilename}
          label={label}
          hint={hint}
          uploadLabel={uploadLabel}
          showUploadButton={showUploadButton}
          triggerIcon={triggerIcon}
          uploadButtonAction={uploadButtonAction}
          fitPreviewToTrigger={fitPreviewToTrigger}
          previewActionsMenuId={previewActionsMenuId}
          triggerIsUploading={triggerIsUploading}
          uploadStatus={uploadStatus}
          disabled={disabled}
          handleOpen={handleOpen}
          handleRemove={handleRemove}
          handleTriggerUpload={handleTriggerUpload}
        />
      )}

      {!open && sizeError && <s-text tone="critical">{sizeError}</s-text>}
      {!open && uploadStatus === "error" && uploadError && (
        <s-box paddingBlockEnd="small-200">
          <s-banner
            heading={translateAdmin("adminAttributes.uploadFailed")}
            tone="critical"
            dismissible={false}
            hidden={false}
          >
            <s-paragraph>{uploadError}</s-paragraph>
          </s-banner>
        </s-box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        disabled={disabled}
        accept={acceptedTypes}
        style={{ display: "none" }}
        onChange={(event) => handleFileInputChange(event.currentTarget)}
      />

      <FilePickerDialog
        dialogRef={dialogRef}
        label={label}
        search={search}
        setSearch={setSearch}
        files={files}
        filteredFiles={filteredFiles}
        selectedUrl={selectedUrl}
        setSelectedUrl={setSelectedUrl}
        hasNextPage={hasNextPage}
        filesLoading={filesLoading}
        isBlocked={isBlocked}
        sizeError={sizeError}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        showProgressCircle={showProgressCircle}
        progressCircleStatus={progressCircleStatus}
        progressLabel={progressLabel}
        progressTone={progressTone}
        acceptedTypes={acceptedTypes}
        handleClose={handleClose}
        handleDropZoneInput={handleDropZoneInput}
        handleLoadMore={handleLoadMore}
        handleSelect={handleSelect}
      />
    </s-stack>
  );
}
