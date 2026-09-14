import {
  CommonConfigureSidebar,
  type CommonConfigureSidebarAdapter,
} from "../_shared/bundle-configure/CommonConfigureSidebar";
import {
  bundleSetupItems,
  bundleVisibilityChildItems,
  stepSetupChildItems,
} from "./configure-constants";
import { VisibilityBadge } from "./SmallComponents";

type ConfigureSidebarProps = Omit<
  CommonConfigureSidebarAdapter,
  | "bundleSetupItems"
  | "bundleVisibilityChildItems"
  | "stepSetupChildItems"
  | "VisibilityBadge"
>;

export function ConfigureSidebar(props: ConfigureSidebarProps) {
  return (
    <CommonConfigureSidebar
      adapter={{
        ...props,
        bundleSetupItems,
        bundleVisibilityChildItems,
        stepSetupChildItems,
        VisibilityBadge,
      }}
    />
  );
}
