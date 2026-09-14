import React from "react";
import { flushSync } from "react-dom";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import { AssetUpload } from "../../../app/components/shared/AssetUpload";
import {
  getUploadStoreFileStatus,
  uploadStoreFile,
} from "../../../app/lib/admin-store-files.client";

jest.mock("../../../app/lib/admin-store-files.client", () => ({
  getUploadStoreFileStatus: jest.fn(),
  uploadStoreFile: jest.fn(),
}));

const mockUploadStoreFile = uploadStoreFile as jest.MockedFunction<
  typeof uploadStoreFile
>;
const mockGetUploadStoreFileStatus =
  getUploadStoreFileStatus as jest.MockedFunction<
    typeof getUploadStoreFileStatus
  >;

describe("AssetUpload", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
    });
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      File: dom.window.File,
      FormData: dom.window.FormData,
      HTMLElement: dom.window.HTMLElement,
      MouseEvent: dom.window.MouseEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mockUploadStoreFile.mockReset();
    mockGetUploadStoreFileStatus.mockReset();
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    jest.useRealTimers();
  });

  function renderUpload(
    props: Partial<React.ComponentProps<typeof AssetUpload>> = {},
  ) {
    const onChange = jest.fn();
    flushSync(() => {
      root.render(
        React.createElement(AssetUpload, {
          value: null,
          onChange,
          label: "Upload banner image",
          accept: "image/png,image/webp",
          ...props,
        }),
      );
    });
    return { onChange };
  }

  it("renders one named native drop zone without a custom clickable surface", () => {
    renderUpload();

    const dropZones = container.querySelectorAll("s-drop-zone");
    expect(dropZones).toHaveLength(1);
    expect(dropZones[0].getAttribute("name")).toMatch(/^asset-upload-/);
    expect(dropZones[0].getAttribute("accept")).toBe("image/png,image/webp");
    expect(dropZones[0].getAttribute("label")).toBe("Upload banner image");
    expect(container.querySelector("s-clickable")).toBeNull();
  });

  it("renders compact media content inside the native drop zone without a duplicate preview", () => {
    renderUpload({
      value: "https://cdn.shopify.com/step.png",
      showValuePreview: false,
      labelAccessibilityVisibility: "exclusive",
      dropZoneContent: React.createElement("s-image", {
        src: "https://cdn.shopify.com/step.png",
        alt: "Step icon",
      }),
    });

    const dropZones = container.querySelectorAll("s-drop-zone");
    expect(dropZones).toHaveLength(1);
    expect(dropZones[0].getAttribute("labelaccessibilityvisibility")).toBe(
      "exclusive",
    );
    expect(dropZones[0].querySelector("s-image")?.getAttribute("src")).toBe(
      "https://cdn.shopify.com/step.png",
    );
    expect(container.querySelector('s-button[icon="delete"]')).toBeNull();
  });

  it("uploads an accepted file and emits its READY Shopify CDN URL", async () => {
    mockUploadStoreFile.mockResolvedValue({
      ok: true,
      fileId: "gid://shopify/MediaImage/1",
    });
    mockGetUploadStoreFileStatus.mockResolvedValue({
      fileStatus: "READY",
      file: {
        id: "gid://shopify/MediaImage/1",
        url: "https://cdn.shopify.com/banner.png",
      },
    });
    const { onChange } = renderUpload();
    const dropZone = container.querySelector("s-drop-zone")!;
    const file = new File(["image"], "banner.png", { type: "image/png" });
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [file],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(2_000);
      await Promise.resolve();
    });

    expect(mockUploadStoreFile).toHaveBeenCalledTimes(1);
    expect(mockGetUploadStoreFileStatus).toHaveBeenCalledWith(
      "gid://shopify/MediaImage/1",
    );
    expect(onChange).toHaveBeenCalledWith(
      "https://cdn.shopify.com/banner.png",
    );
  });

  it("accepts an image through a native image wildcard", async () => {
    mockUploadStoreFile.mockResolvedValue({
      ok: true,
      fileId: "gid://shopify/MediaImage/1",
    });
    renderUpload({ accept: "image/*" });
    const dropZone = container.querySelector("s-drop-zone")!;
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [new File(["image"], "banner.png", { type: "image/png" })],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });

    expect(mockUploadStoreFile).toHaveBeenCalledTimes(1);
  });

  it("rejects an unsupported file without starting an upload", async () => {
    renderUpload({
      invalidTypeErrorMessage: "Choose a PNG or WebP image.",
    });
    const dropZone = container.querySelector("s-drop-zone")!;
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [new File(["text"], "notes.txt", { type: "text/plain" })],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });

    expect(mockUploadStoreFile).not.toHaveBeenCalled();
    expect(dropZone.getAttribute("error")).toBe(
      "Choose a PNG or WebP image.",
    );
  });

  it("surfaces native drop rejections without starting an upload", () => {
    renderUpload({
      invalidTypeErrorMessage: "Choose a PNG or WebP image.",
    });
    const dropZone = container.querySelector("s-drop-zone")!;

    act(() => {
      dropZone.dispatchEvent(new Event("droprejected"));
    });

    expect(mockUploadStoreFile).not.toHaveBeenCalled();
    expect(dropZone.getAttribute("error")).toBe(
      "Choose a PNG or WebP image.",
    );
  });

  it("rejects an oversized file without starting an upload", async () => {
    renderUpload({
      maxUploadBytes: 4,
      maxUploadErrorMessage: "Choose a file smaller than 4 bytes.",
    });
    const dropZone = container.querySelector("s-drop-zone")!;
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [new File(["large"], "banner.png", { type: "image/png" })],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });

    expect(mockUploadStoreFile).not.toHaveBeenCalled();
    expect(dropZone.getAttribute("error")).toBe(
      "Choose a file smaller than 4 bytes.",
    );
  });

  it("disables asset actions while Shopify processes an upload", async () => {
    mockUploadStoreFile.mockResolvedValue({
      ok: true,
      fileId: "gid://shopify/MediaImage/1",
    });
    renderUpload({ value: "https://cdn.shopify.com/current.png" });
    const dropZone = container.querySelector("s-drop-zone")!;
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [new File(["image"], "new.png", { type: "image/png" })],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });

    const remove = Array.from(container.querySelectorAll("s-button")).find(
      (button) => button.textContent?.includes("Remove"),
    );
    expect(dropZone.hasAttribute("disabled")).toBe(true);
    expect(remove?.hasAttribute("disabled")).toBe(true);
  });

  it("recovers after Shopify reports a processing failure", async () => {
    mockUploadStoreFile.mockResolvedValue({
      ok: true,
      fileId: "gid://shopify/MediaImage/1",
    });
    mockGetUploadStoreFileStatus.mockResolvedValue({
      fileStatus: "FAILED",
    });
    const { onChange } = renderUpload();
    const dropZone = container.querySelector("s-drop-zone")!;
    Object.defineProperty(dropZone, "files", {
      configurable: true,
      value: [new File(["image"], "banner.png", { type: "image/png" })],
    });

    await act(async () => {
      dropZone.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(2_000);
      await Promise.resolve();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(dropZone.hasAttribute("disabled")).toBe(false);
    expect(container.querySelector('s-banner[tone="critical"]')).not.toBeNull();
  });

  it("removes a saved asset exactly once", () => {
    const { onChange } = renderUpload({
      value: "https://cdn.shopify.com/banner.png",
    });
    const remove = Array.from(container.querySelectorAll("s-button")).find(
      (button) => button.textContent?.includes("Remove"),
    );

    expect(container.querySelector("s-image")?.getAttribute("src")).toBe(
      "https://cdn.shopify.com/banner.png",
    );
    act(() => remove?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
