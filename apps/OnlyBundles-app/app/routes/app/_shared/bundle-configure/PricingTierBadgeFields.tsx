import { useRef, useState } from "react";
import type { PricingRule } from "../../../../types/pricing";
import type { PricingTierBadge } from "../../../../lib/pricing-tier-badge";
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";
import {
  hidePolarisModal,
  showPolarisModal,
} from "./modal-utils";

const DEFAULT_BADGE: PricingTierBadge = {
  enabled: false,
  text: "",
  shape: "pill",
  visibility: "always",
};

const TIER_BADGE_VARIABLES = [
  {
    variable: "{{saved_percentage}}",
    description: "Discount percentage saved by customer (e.g. 10%). Available for percentage discounts.",
  },
  {
    variable: "{{saved_total}}",
    description: "Total discount amount saved by customer (e.g. $15.00). Available for fixed amount discounts.",
  },
];

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
  const modalRef = useRef<HTMLElement | null>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const handleOpenModal = () => {
    showPolarisModal(modalRef);
  };

  const handleCloseModal = () => {
    hidePolarisModal(modalRef);
  };

  const handleCopy = (variableText: string) => {
    void navigator.clipboard?.writeText(variableText);
    setCopiedVariable(variableText);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  return (
    <s-stack direction="block" gap="small">
      <s-divider />
      <s-stack
        direction="inline"
        gap="base"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-stack direction="block" gap="small-100">
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-heading>{translateAdmin("tooltips.tierBadge.title")}</s-heading>
            <ConfigureHelpPopover tooltipKey="tierBadge" />
          </s-stack>
          <s-text>
            {translateAdmin(
              "adminExtracted.shared.bundleConfigure.pricingtierbadgefields.highlightThisPricingTierOnTheStorefront"
            )}
          </s-text>
        </s-stack>
        <s-switch
          accessibilityLabel={`Enable tier badge for rule ${rule.id}`}
          checked={badge.enabled || undefined}
          onChange={(event) =>
            updateBadge({
              enabled: (event.target as HTMLInputElement).checked,
            })
          }
        />
      </s-stack>

      <s-box>
        <s-stack direction="block" gap="small">
          <s-text-field
            id={`configure-discount-rules-${rule.id}-tierBadge-text`}
            label={translateAdmin("adminAttributes.badgeText")}
            value={badge.text}
            disabled={!badge.enabled || undefined}
            error={validationErrors[`${base}.text`]}
            onInput={(event) =>
              updateBadge({
                text: (event.target as HTMLInputElement).value,
              })
            }
          />
          <div>
            <s-button
              variant="tertiary"
              icon="code"
              disabled={!badge.enabled || undefined}
              onClick={handleOpenModal}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
              )}
            </s-button>
          </div>
        </s-stack>
      </s-box>

      <s-modal
        id={`tier-badge-variables-modal-${rule.id}`}
        ref={modalRef as any}
        heading={translateAdmin("adminAttributes.variables")}
        size="small"
      >
        <s-stack direction="block" gap="base">
          <s-paragraph color="subdued">
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.useTheseVariablesInOnlyBundlesMessagesTheWidgetReplacesThemWithL"
            )}
          </s-paragraph>
          <s-stack direction="block" gap="small">
            {TIER_BADGE_VARIABLES.map(({ variable, description }) => (
              <s-box
                key={variable}
                padding="small"
                background="subdued"
                borderRadius="base"
              >
                <s-stack
                  direction="inline"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="small"
                >
                  <s-stack direction="block" gap="none">
                    <s-text type="strong">{variable}</s-text>
                    <s-text color="subdued">{description}</s-text>
                  </s-stack>
                  <s-button
                    variant="tertiary"
                    icon={copiedVariable === variable ? "check" : "clipboard"}
                    onClick={() => handleCopy(variable)}
                  >
                    {copiedVariable === variable
                      ? translateAdmin("common.actions.copied")
                      : translateAdmin("common.actions.copy")}
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={handleCloseModal}
        >
          {translateAdmin("common.actions.close")}
        </s-button>
      </s-modal>
    </s-stack>
  );
}
