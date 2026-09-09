import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FilePickerDialog } from "../../../app/components/shared/file-picker/FilePickerDialog";
import type { FilePickerDialogProps } from "../../../app/components/shared/file-picker/types";
import { changeAdminI18nLanguage } from "../../../app/i18n/config";

function makeProps(search: string): FilePickerDialogProps {
  return {
    dialogRef: { current: null },
    label: "Choose image",
    search,
    setSearch: jest.fn(),
    files: [],
    filteredFiles: [],
    selectedUrl: null,
    setSelectedUrl: jest.fn(),
    hasNextPage: false,
    filesLoading: false,
    isBlocked: false,
    sizeError: null,
    uploadStatus: "idle" as const,
    uploadError: null,
    showProgressCircle: false,
    progressCircleStatus: "spinning",
    progressLabel: "",
    progressTone: "subdued",
    acceptedTypes: "image/*",
    handleClose: jest.fn(),
    handleDropZoneInput: jest.fn(),
    handleLoadMore: jest.fn(),
    handleSelect: jest.fn(),
  };
}

describe("FilePickerDialog empty results", () => {
  afterEach(async () => {
    await changeAdminI18nLanguage("en");
  });

  it("renders the localized empty-library message without a search", async () => {
    await changeAdminI18nLanguage("de");
    const view = renderToStaticMarkup(
      React.createElement(FilePickerDialog, makeProps("")),
    );

    expect(view).toContain(
      "In Ihrem Shop wurden keine Bilddateien gefunden.",
    );
  });

  it("renders the localized no-match message for a search", async () => {
    await changeAdminI18nLanguage("de");
    const view = renderToStaticMarkup(
      React.createElement(FilePickerDialog, makeProps("banner")),
    );

    expect(view).toContain(
      "Keine Dateien entsprechen Ihrer Suche.",
    );
  });
});
