import { BundleStatusSection } from "../_shared/bundle-configure/BundleStatusSection";
import type { BundleStatus } from "../../../constants/bundle";

export type PpbBundleStatusCardProps = {
  status: BundleStatus;
  onChange: (status: BundleStatus) => void;
};

export function PpbBundleStatusCard({
  status,
  onChange,
}: PpbBundleStatusCardProps) {

  return (
    <s-section>
      <BundleStatusSection
        status={status}
        onChange={onChange}
      />
    </s-section>
  );
}
