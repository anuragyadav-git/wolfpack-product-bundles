import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbBundleQuantityOptions } from "./DiscountBundleQuantityOptions";
import { FpbDiscountMessagingOptions } from "./DiscountMessagingOptions";
import { FpbProgressBarOptions } from "./DiscountProgressBarOptions";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";

export function FpbDiscountDisplayOptions({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const { displayOptionsInactive } = flow;

  return (
    <s-section>
      <DisabledConfigurationRegion disabled={displayOptionsInactive}>
        <s-stack direction="block" gap="small">
          <s-stack direction="block" gap="small-400">
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              Discount Display Options
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              Choose how discounts are displayed
            </p>
          </s-stack>
          <FpbBundleQuantityOptions flow={flow} />
          <FpbProgressBarOptions flow={flow} />
          <FpbDiscountMessagingOptions flow={flow} />
        </s-stack>
      </DisabledConfigurationRegion>
    </s-section>
  );
}
