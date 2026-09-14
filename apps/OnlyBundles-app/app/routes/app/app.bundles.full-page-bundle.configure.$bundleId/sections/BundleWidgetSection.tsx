import {
  CommonBundleWidgetSection,
  type CommonBundleWidgetSectionProps,
} from "../../_shared/bundle-configure/CommonBundleWidgetSection";
import { getVisibilityResourceId } from "../visibility-helpers";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

interface BundleWidgetSectionProps {
  activeSection: string;
  widget: Omit<
    CommonBundleWidgetSectionProps,
    "AssetUpload" | "getResourceId"
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
        AssetUpload={AssetUpload}
        getResourceId={getVisibilityResourceId}
      />
    </div>
  );
}
