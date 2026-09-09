import {
  PpbBundleSettingsControls,
  type PpbBundleSettingsControlsProps,
} from "./PpbBundleSettingsControls";

export type PpbBundleSettingsSectionProps = {
  activeSection: string;
  controls: PpbBundleSettingsControlsProps;
};

export function PpbBundleSettingsSection({
  activeSection,
  controls,
}: PpbBundleSettingsSectionProps) {
  if (activeSection !== "bundle_settings") return null;
  return <PpbBundleSettingsControls {...controls} />;
}
