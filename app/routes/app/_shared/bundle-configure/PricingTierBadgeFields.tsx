import type { PricingRule } from "../../../../types/pricing";
import type {
  PricingTierBadge,
  PricingTierBadgeShape,
  PricingTierBadgeVisibility,
} from "../../../../lib/pricing-tier-badge";
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";

const DEFAULT_BADGE: PricingTierBadge = {
  enabled: false,
  text: "",
  shape: "pill",
  visibility: "always",
};

export function PricingTierBadgeFields({
  rule,
  onChange,
  validationErrors = {},
}: {
  rule: PricingRule;
  onChange: (updates: Partial<PricingRule>) => void;
  validationErrors?: Record<string, string | undefined>;
}) {
  const badge = rule.tierBadge ?? DEFAULT_BADGE;
  const base = `discount.rules.${rule.id}.tierBadge`;
  const updateBadge = (updates: Partial<PricingTierBadge>) => {
    onChange({ tierBadge: { ...badge, ...updates } });
  };

  return (
    <s-stack direction="block" gap="small">
      <s-divider />
      <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
        <s-stack direction="block" gap="small-100">
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-heading>Tier badge</s-heading>
            <ConfigureHelpPopover tooltipKey="tierBadge" />
          </s-stack>
          <s-text>Highlight this pricing tier on the storefront.</s-text>
        </s-stack>
        <s-switch
          accessibilityLabel={`Enable tier badge for rule ${rule.id}`}
          checked={badge.enabled || undefined}
          onChange={(event) => updateBadge({
            enabled: (event.target as HTMLInputElement).checked,
          })}
        />
      </s-stack>

      <s-box>
        <s-stack direction="block" gap="small">
          <s-text-field
            id={`configure-discount-rules-${rule.id}-tierBadge-text`}
            label="Badge text"
            value={badge.text}
            disabled={!badge.enabled || undefined}
            error={validationErrors[`${base}.text`]}
            onInput={(event) => updateBadge({
              text: (event.target as HTMLInputElement).value,
            })}
          />
          <s-text>Available variables: {"{{saved_percentage}}"}, {"{{saved_total}}"}.</s-text>
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(10rem, 1fr))" gap="small">
            <s-select
              label="Shape"
              value={badge.shape}
              disabled={!badge.enabled || undefined}
              error={validationErrors[`${base}.shape`]}
              onChange={(event) => updateBadge({
                shape: (event.target as HTMLSelectElement).value as PricingTierBadgeShape,
              })}
            >
              <s-option value="pill">Pill</s-option>
              <s-option value="folded">Folded</s-option>
              <s-option value="banner_rounded">Banner rounded</s-option>
            </s-select>
            <s-select
              label="Visibility"
              value={badge.visibility}
              disabled={!badge.enabled || undefined}
              error={validationErrors[`${base}.visibility`]}
              onChange={(event) => updateBadge({
                visibility: (event.target as HTMLSelectElement).value as PricingTierBadgeVisibility,
              })}
            >
              <s-option value="always">Always</s-option>
              <s-option value="selected">Selected tier only</s-option>
            </s-select>
          </s-grid>
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(10rem, 1fr))" gap="small">
            <s-text-field
              label="Text color"
              value={badge.foregroundColor ?? ""}
              placeholder="#ffffff"
              disabled={!badge.enabled || undefined}
              error={validationErrors[`${base}.foregroundColor`]}
              onInput={(event) => updateBadge({
                foregroundColor: (event.target as HTMLInputElement).value,
              })}
            />
            <s-text-field
              label="Background color"
              value={badge.backgroundColor ?? ""}
              placeholder="#1f2937"
              disabled={!badge.enabled || undefined}
              error={validationErrors[`${base}.backgroundColor`]}
              onInput={(event) => updateBadge({
                backgroundColor: (event.target as HTMLInputElement).value,
              })}
            />
          </s-grid>
        </s-stack>
      </s-box>
    </s-stack>
  );
}
