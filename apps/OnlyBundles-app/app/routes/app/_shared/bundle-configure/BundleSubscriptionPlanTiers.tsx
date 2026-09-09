import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { translateAdmin } from "~/i18n/config";
import { DisabledConfigurationRegion } from "./DisabledConfigurationRegion";
import type { BundleSubscriptionPlanTiersProps } from "./bundle-subscription-section.types";

export function BundleSubscriptionPlanTiers({
  subscriptionConfig,
  setSubscriptionConfig,
  subscriptionFetcher,
  subscriptionsBlocked,
  uniquePlanRows,
  validationErrors,
}: BundleSubscriptionPlanTiersProps) {
  if (!subscriptionConfig.selectedGroup) return null;

  return (
    <DisabledConfigurationRegion disabled={!subscriptionConfig.enabled}>
      <s-section>
        <s-stack direction="block" gap="base">
          <s-grid
            gridTemplateColumns="minmax(0, 1fr) auto"
            gap="base"
            alignItems="center"
          >
            <s-heading>
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.planTiers"
              )}
            </s-heading>
            <s-button
              variant="secondary"
              icon={getConfigureActionIcon("refresh")}
              loading={subscriptionFetcher.state === "submitting" || undefined}
              disabled={
                subscriptionFetcher.state !== "idle" ||
                subscriptionsBlocked ||
                undefined
              }
              onClick={() => {
                const formData = new FormData();
                formData.append("intent", "validateSellingPlanGroups");
                subscriptionFetcher.submit(formData, { method: "post" });
              }}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.refreshPlan"
              )}
            </s-button>
          </s-grid>

          {uniquePlanRows.map((plan) => {
            const planCopy = subscriptionConfig.planCopy[plan.id] ?? {
              displayName: plan.sourceName,
              discountPill: "",
              description: "",
            };
            return (
              <s-box
                key={plan.id}
                padding="base"
                background="subdued"
                borderRadius="base"
              >
                <s-stack direction="block" gap="base">
                  <s-grid
                    gridTemplateColumns="minmax(0, 1fr) minmax(7.5rem, 0.45fr)"
                    gap="base"
                  >
                    <s-text-field
                      label={translateAdmin(
                        "adminAttributes.planNameInDropdown"
                      )}
                      value={planCopy.displayName}
                      error={
                        validationErrors[
                          `subscriptions.planCopy.${plan.id}.displayName`
                        ]
                      }
                      onInput={(event) =>
                        setSubscriptionConfig((current) => ({
                          ...current,
                          planCopy: {
                            ...current.planCopy,
                            [plan.id]: {
                              ...current.planCopy[plan.id],
                              displayName: (event.target as HTMLInputElement)
                                .value,
                            },
                          },
                        }))
                      }
                    />
                    <s-text-field
                      label={translateAdmin("adminAttributes.discountPill")}
                      value={planCopy.discountPill}
                      onInput={(event) =>
                        setSubscriptionConfig((current) => ({
                          ...current,
                          planCopy: {
                            ...current.planCopy,
                            [plan.id]: {
                              ...current.planCopy[plan.id],
                              discountPill: (event.target as HTMLInputElement)
                                .value,
                            },
                          },
                        }))
                      }
                    />
                  </s-grid>
                  <s-divider />
                  <s-text-area
                    label={translateAdmin(
                      "adminAttributes.subscriptionOptionDescription"
                    )}
                    value={planCopy.description}
                    onInput={(event) =>
                      setSubscriptionConfig((current) => ({
                        ...current,
                        planCopy: {
                          ...current.planCopy,
                          [plan.id]: {
                            ...current.planCopy[plan.id],
                            description: (event.target as HTMLTextAreaElement)
                              .value,
                          },
                        },
                      }))
                    }
                  />
                </s-stack>
              </s-box>
            );
          })}
        </s-stack>
      </s-section>
    </DisabledConfigurationRegion>
  );
}
