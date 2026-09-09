import {
  CommonBundleWidgetSection,
  type CommonBundleWidgetSectionProps,
} from "../../_shared/bundle-configure/CommonBundleWidgetSection";
import { getVisibilityResourceId } from "../visibility-helpers";
import { FilePicker } from "../../../../components/shared/FilePicker";

interface BundleWidgetSectionProps {
  activeSection: string;
  widget: Omit<
    CommonBundleWidgetSectionProps,
    "FilePicker" | "getResourceId"
  >;
}

export function BundleWidgetSection({
  activeSection,
  widget,
}: BundleWidgetSectionProps) {
  if (activeSection !== "bundle_widget") return null;

  return (
    <div data-tour-target="fpb-bundle-widget">
      <CommonBundleWidgetSection
        {...widget}
        FilePicker={FilePicker}
        getResourceId={getVisibilityResourceId}
      />
    </div>
  );
}
