import { ProgressCircle } from "./FilePickerIcons";
import type { FilePickerDialogProps } from "./types";
import { formatStoreFileDate, truncateStoreFileText } from "./utils";
import styles from "./FilePickerDialog.module.css";
import { translateAdmin } from "~/i18n/config";

export function FilePickerDialog({
  dialogRef,
  label,
  search,
  setSearch,
  files,
  filteredFiles,
  selectedUrl,
  setSelectedUrl,
  hasNextPage,
  filesLoading,
  isBlocked,
  sizeError,
  uploadStatus,
  uploadError,
  showProgressCircle,
  progressCircleStatus,
  progressLabel,
  progressTone,
  acceptedTypes,
  handleClose,
  handleDropZoneInput,
  handleLoadMore,
  handleSelect,
}: FilePickerDialogProps) {
  return (
    <s-modal
      ref={dialogRef}
      id="store-file-picker-modal"
      heading={label}
      size="large"
    >
      <s-button
        slot="primary-action"
        variant="primary"
        disabled={!selectedUrl || isBlocked || undefined}
        onClick={handleSelect}
      >
        {translateAdmin("createBundle.actions.select")}
      </s-button>
      <s-button slot="secondary-actions" onClick={handleClose}>
        {translateAdmin("dashboard.deleteModal.cancel")}
      </s-button>

      <s-query-container containerName="file-picker">
        <s-stack direction="block" gap="base">
          <s-grid
            gridTemplateColumns="@container (inline-size > 480px) 1fr auto, 1fr"
            gap="small"
            alignItems="end"
          >
            <s-search-field
              label={translateAdmin("adminAttributes.searchFiles")}
              labelAccessibilityVisibility="exclusive"
              placeholder={translateAdmin("adminAttributes.searchFiles2")}
              value={search}
              disabled={isBlocked || undefined}
              onInput={(event) => setSearch(event.currentTarget.value)}
            />
            <s-drop-zone
              accept={acceptedTypes}
              accessibilityLabel={translateAdmin("adminAttributes.uploadImage")}
              label={translateAdmin(
                "adminExtracted.shared.filePicker.filepickerdialog.uploadImage"
              )}
              disabled={isBlocked || undefined}
              error={sizeError ?? undefined}
              onInput={handleDropZoneInput}
            />
          </s-grid>

          {sizeError ? <s-text tone="critical">{sizeError}</s-text> : null}

          {showProgressCircle ? (
            <div className={styles.progressRow}>
              <ProgressCircle status={progressCircleStatus} />
              <s-text tone={progressTone === "success" ? "success" : "neutral"}>
                {progressLabel}
              </s-text>
            </div>
          ) : null}

          {uploadStatus === "error" && uploadError ? (
            <s-box paddingBlockEnd="small-200">
              <s-banner
                heading={translateAdmin("adminAttributes.uploadFailed")}
                tone="critical"
                dismissible={false}
                hidden={false}
              >
                {uploadError}
              </s-banner>
            </s-box>
          ) : null}

          {uploadStatus === "timeout" ? (
            <s-box paddingBlockEnd="small-200">
              <s-banner
                heading={translateAdmin("adminAttributes.uploadProcessing")}
                tone="success"
                dismissible
                hidden={false}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickerdialog.uploadSuccessfulImageMayTakeAMomentToAppearInYourLibraryCloseAnd"
                )}
              </s-banner>
            </s-box>
          ) : null}

          <FileGrid
            files={files}
            filteredFiles={filteredFiles}
            filesLoading={filesLoading}
            search={search}
            selectedUrl={selectedUrl}
            setSelectedUrl={setSelectedUrl}
            isBlocked={isBlocked}
          />

          {hasNextPage && !search ? (
            <div className={styles.loadMore}>
              <s-button
                variant="tertiary"
                onClick={handleLoadMore}
                loading={filesLoading || undefined}
                disabled={isBlocked || undefined}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickerdialog.loadMore"
                )}
              </s-button>
            </div>
          ) : null}
        </s-stack>
      </s-query-container>
    </s-modal>
  );
}

function FileGrid({
  files,
  filteredFiles,
  filesLoading,
  search,
  selectedUrl,
  setSelectedUrl,
  isBlocked,
}: Pick<
  FilePickerDialogProps,
  | "files"
  | "filteredFiles"
  | "filesLoading"
  | "search"
  | "selectedUrl"
  | "setSelectedUrl"
  | "isBlocked"
>) {
  if (filesLoading && files.length === 0) {
    return (
      <div className={styles.loading}>
        <s-spinner
          size="large"
          accessibilityLabel={translateAdmin("adminAttributes.loadingFiles")}
        />
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <s-text color="subdued">
        {search
          ? translateAdmin("adminAttributes.noFilesMatchSearch")
          : translateAdmin("adminAttributes.noImageFilesFound")}
      </s-text>
    );
  }

  return (
    <div className={styles.fileGrid} data-blocked={isBlocked || undefined}>
      {filteredFiles.map((file) => {
        const isSelected = selectedUrl === file.url;
        return (
          <div
            key={file.id}
            className={styles.fileButton}
            data-selected={isSelected || undefined}
          >
            <s-clickable
              onClick={() => setSelectedUrl(file.url)}
              disabled={isBlocked || undefined}
              accessibilityLabel={`${file.filename}${isSelected ? ", selected" : ""}`}
            >
              <div className={styles.fileImage}>
                <s-image
                  src={`${file.url}${file.url.includes("?") ? "&" : "?"}width=160`}
                  alt={file.alt || file.filename}
                  loading="lazy"
                  objectFit="cover"
                  aspectRatio="1/1"
                />
              </div>
              <div className={styles.fileName}>
                <s-text>{truncateStoreFileText(file.filename, 24)}</s-text>
              </div>
              <div className={styles.fileDate}>
                <s-text color="subdued">
                  {formatStoreFileDate(file.createdAt)}
                </s-text>
              </div>
            </s-clickable>
          </div>
        );
      })}
    </div>
  );
}
