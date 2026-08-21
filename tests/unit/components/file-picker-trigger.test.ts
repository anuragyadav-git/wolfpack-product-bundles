import React from "react";

import { FilePickerTrigger } from "../../../app/components/shared/file-picker/FilePickerTrigger";

jest.mock("@shopify/polaris", () => ({
  BlockStack: "BlockStack",
  Button: "Button",
  InlineStack: "InlineStack",
  Spinner: "Spinner",
  Text: "Text",
}));

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    value: null,
    currentFilename: null,
    label: "Choose banner image",
    uploadLabel: "Upload image",
    triggerIcon: "desktop" as const,
    uploadButtonAction: "upload" as const,
    fitPreviewToTrigger: false,
    previewActionsMenuId: "file-picker-actions",
    triggerIsUploading: false,
    uploadStatus: "idle" as const,
    handleOpen: jest.fn(),
    handleRemove: jest.fn(),
    handleTriggerUpload: jest.fn(),
    ...overrides,
  };
}

function getEmptyTriggerChildren(props: ReturnType<typeof makeProps>) {
  const trigger = FilePickerTrigger(props as any);
  const content = React.Children.toArray(
    trigger.props.children
  )[0] as React.ReactElement;
  return React.Children.toArray(content.props.children) as React.ReactElement[];
}

function findElementByType(
  node: React.ReactNode,
  type: string
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (child.type === type) return child;
    const nested = findElementByType(child.props.children, type);
    if (nested) return nested;
  }
  return null;
}

describe("FilePickerTrigger", () => {
  it("opens the asset picker when the upload button uses picker mode", () => {
    const props = makeProps({ uploadButtonAction: "openPicker" });
    const children = getEmptyTriggerChildren(props);
    const uploadButton = children.at(-1)!;

    uploadButton.props.onClick({ stopPropagation: jest.fn() });

    expect(props.handleOpen).toHaveBeenCalledTimes(1);
    expect(props.handleTriggerUpload).not.toHaveBeenCalled();
  });

  it("uses the mobile device icon for mobile banner pickers", () => {
    const props = makeProps({ triggerIcon: "mobile" });
    const children = getEmptyTriggerChildren(props);
    const icon = children[0];

    expect((icon.type as Function).name).toBe("MobileIcon");
  });

  it("keeps a loading GIF drop zone clickable without a nested upload button", () => {
    const props = makeProps({
      hint: "Click to upload a loading GIF",
      showUploadButton: false,
    });
    const trigger = FilePickerTrigger(props as any);

    expect(trigger.props.role).toBe("button");
    expect(findElementByType(trigger, "s-button")).toBeNull();
    expect(JSON.stringify(trigger)).toContain("Click to upload a loading GIF");
  });

  it("exposes change and remove through the banner preview overflow menu", () => {
    const props = makeProps({
      value: "https://cdn.example.test/banner.png",
      currentFilename: "banner.png",
      fitPreviewToTrigger: true,
      previewActionsMenuId: "banner-actions",
    });
    const trigger = FilePickerTrigger(props as any);
    const menu = findElementByType(trigger, "s-menu");

    expect(menu).not.toBeNull();
    const actions = React.Children.toArray(
      menu!.props.children
    ) as React.ReactElement[];
    actions[0].props.onClick();
    actions[1].props.onClick();

    expect(props.handleOpen).toHaveBeenCalledTimes(1);
    expect(props.handleRemove).toHaveBeenCalledTimes(1);
  });

  it("prevents empty trigger interaction while disabled", () => {
    const props = makeProps({ disabled: true });
    const trigger = FilePickerTrigger(props as any);
    const uploadButton = findElementByType(trigger, "s-button");

    expect(trigger.props.tabIndex).toBe(-1);
    expect(trigger.props["aria-disabled"]).toBe(true);
    expect(trigger.props.onClick).toBeUndefined();
    expect(uploadButton?.props.disabled).toBe(true);
  });

  it("disables change and remove actions while preserving a selected image", () => {
    const props = makeProps({
      disabled: true,
      value: "https://cdn.example.test/banner.png",
      currentFilename: "banner.png",
      fitPreviewToTrigger: true,
    });
    const trigger = FilePickerTrigger(props as any);
    const menu = findElementByType(trigger, "s-menu");
    const actions = React.Children.toArray(
      menu!.props.children
    ) as React.ReactElement[];

    expect(trigger.props.children).toBeDefined();
    expect(actions[0].props.disabled).toBe(true);
    expect(actions[1].props.disabled).toBe(true);
  });
});
