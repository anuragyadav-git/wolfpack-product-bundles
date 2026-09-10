import { getDefaultPurchaseOptionFromOneTimeToggle } from "../../../../lib/bundle-subscriptions";
import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { translateAdmin } from "~/i18n/config";
import { DisabledConfigurationRegion } from "./DisabledConfigurationRegion";
import type { BundleSubscriptionConfigurationProps } from "./bundle-subscription-section.types";

export function BundleSubscriptionConfiguration({
  subscriptionConfig,
  setSubscriptionConfig,
  uniquePlanRows,
  validationErrors,
  shopLocales,
  onOpenTranslations,
}: BundleSubscriptionConfigurationProps) {
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
            <s-stack direction="block" gap="small">
              <s-heading>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.configurations"
                )}
              </s-heading>
              <s-paragraph>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.configureTheSettingsForTheSubscriptionBundle"
                )}
              </s-paragraph>
            </s-stack>
            <s-button
              variant="tertiary"
              tone="neutral"
              icon={getConfigureActionIcon("translate")}
              accessibilityLabel={translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
              disabled={shopLocales.length === 0 || undefined}
              onClick={onOpenTranslations}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </s-grid>

          <s-switch
            label={translateAdmin("adminAttributes.enableRecurringDiscounts")}
            checked={subscriptionConfig.recurringBundleDiscount || undefined}
            onChange={(event) =>
              setSubscriptionConfig((current) => ({
                ...current,
                recurringBundleDiscount: (event.target as HTMLInputElement)
                  .checked,
              }))
            }
          />
          <s-switch
            label={translateAdmin("adminAttributes.oneTimePurchase")}
            checked={subscriptionConfig.oneTimePurchase.enabled || undefined}
            onChange={(event) =>
              setSubscriptionConfig((current) => {
                const enabled = (event.target as HTMLInputElement).checked;
                return {
                  ...current,
                  oneTimePurchase: {
                    ...current.oneTimePurchase,
                    enabled,
                  },
                  defaultPurchaseOption: enabled
                    ? current.defaultPurchaseOption
                    : getDefaultPurchaseOptionFromOneTimeToggle(current, false),
                };
              })
            }
          />
          <DisabledConfigurationRegion
            disabled={!subscriptionConfig.oneTimePurchase.enabled}
          >
            <s-stack direction="block" gap="base">
              <s-text-field
                label={translateAdmin("adminAttributes.oneTimePurchaseLabel")}
                value={subscriptionConfig.oneTimePurchase.title}
                disabled={
                  !subscriptionConfig.oneTimePurchase.enabled || undefined
                }
                error={validationErrors["subscriptions.oneTimePurchase.title"]}
                onInput={(event) =>
                  setSubscriptionConfig((current) => ({
                    ...current,
                    oneTimePurchase: {
                      ...current.oneTimePurchase,
                      title: (event.target as HTMLInputElement).value,
                    },
                  }))
                }
              />
              <s-text-area
                label={translateAdmin(
                  "adminAttributes.oneTimePurchaseDescription"
                )}
                value={subscriptionConfig.oneTimePurchase.description}
                disabled={
                  !subscriptionConfig.oneTimePurchase.enabled || undefined
                }
                onInput={(event) =>
                  setSubscriptionConfig((current) => ({
                    ...current,
                    oneTimePurchase: {
                      ...current.oneTimePurchase,
                      description: (event.target as HTMLTextAreaElement).value,
                    },
                  }))
                }
              />
              <s-checkbox
                label={translateAdmin(
                  "adminAttributes.makeOneTimePurchaseSelectedByDefault"
                )}
                disabled={
                  !subscriptionConfig.oneTimePurchase.enabled || undefined
                }
                checked={
                  subscriptionConfig.defaultPurchaseOption.kind ===
                    "one_time" || undefined
                }
                error={validationErrors["subscriptions.defaultPurchaseOption"]}
                onChange={(event) =>
                  setSubscriptionConfig((current) => ({
                    ...current,
                    defaultPurchaseOption:
                      getDefaultPurchaseOptionFromOneTimeToggle(
                        current,
                        (event.target as HTMLInputElement).checked
                      ),
                  }))
                }
              />
            </s-stack>
          </DisabledConfigurationRegion>
          <s-text-area
            label={translateAdmin("adminAttributes.purchaseOptionsSubtitle")}
            value={subscriptionConfig.copy.subtitle}
            onInput={(event) =>
              setSubscriptionConfig((current) => ({
                ...current,
                copy: {
                  ...current.copy,
                  subtitle: (event.target as HTMLTextAreaElement).value,
                },
              }))
            }
          />
          <s-text-area
            label={translateAdmin("adminAttributes.unavailablePlanMessage")}
            value={subscriptionConfig.copy.unavailableMessage}
            onInput={(event) =>
              setSubscriptionConfig((current) => ({
                ...current,
                copy: {
                  ...current.copy,
                  unavailableMessage: (event.target as HTMLTextAreaElement)
                    .value,
                },
              }))
            }
          />
          <s-checkbox
            label={translateAdmin(
              "adminAttributes.showSubscriptionDiscountOnProductCards"
            )}
            checked={subscriptionConfig.showDiscountOnProductCards || undefined}
            onChange={(event) =>
              setSubscriptionConfig((current) => ({
                ...current,
                showDiscountOnProductCards: (event.target as HTMLInputElement)
                  .checked,
              }))
            }
          />
          {subscriptionConfig.defaultPurchaseOption.kind === "selling_plan" &&
          subscriptionConfig.selectedPlanIds.length > 1 ? (
            <s-choice-list
              label={translateAdmin("adminAttributes.defaultSubscriptionPlan")}
              values={[subscriptionConfig.defaultPurchaseOption.sellingPlanId]}
              error={validationErrors["subscriptions.defaultPurchaseOption"]}
              onChange={(event) => {
                const value = (
                  (event.currentTarget as any).values as string[] | undefined
                )?.[0];
                if (!value) return;
                setSubscriptionConfig((current) => ({
                  ...current,
                  defaultPurchaseOption: {
                    kind: "selling_plan",
                    sellingPlanId: value,
                  },
                }));
              }}
            >
              {uniquePlanRows
                .filter((plan) =>
                  subscriptionConfig.selectedPlanIds.includes(plan.id)
                )
                .map((plan) => (
                  <s-choice key={plan.id} value={plan.id}>
                    {subscriptionConfig.planCopy[plan.id]?.displayName ||
                      plan.sourceName}
                  </s-choice>
                ))}
            </s-choice-list>
          ) : null}

          <s-divider />
          <s-stack direction="block" gap="small">
            <s-heading>
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.bundleDiscountAppliesOn"
              )}
            </s-heading>
            <s-paragraph>
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.applyBundleDiscountsToSubscriptionPurchasesOnlyOneTimePurchasesO"
              )}
            </s-paragraph>
          </s-stack>
          <s-choice-list
            label={translateAdmin(
              "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.bundleDiscountAppliesOn"
            )}
            labelAccessibilityVisibility="exclusive"
            name="bundleDiscountAppliesOn"
            values={[subscriptionConfig.bundleDiscountAppliesOn]}
            onChange={(event) => {
              const selected = (
                event.currentTarget as HTMLElement & { values?: string[] }
              ).values?.[0];
              if (
                selected !== "subscription" &&
                selected !== "one_time" &&
                selected !== "both"
              ) {
                return;
              }
              setSubscriptionConfig((current) => ({
                ...current,
                bundleDiscountAppliesOn: selected,
              }));
            }}
          >
            {(
              [
                [
                  "subscription",
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.onlyOnSubscriptionPurchase",
                ],
                [
                  "one_time",
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.onlyOnOneTimePurchase",
                ],
                [
                  "both",
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.onBoth",
                ],
              ] as const
            ).map(([value, labelKey]) => (
              <s-choice key={value} value={value}>
                {translateAdmin(labelKey)}
              </s-choice>
            ))}
          </s-choice-list>
          {subscriptionConfig.enabled &&
          Object.keys(validationErrors).some((path) =>
            path.startsWith("subscriptions.")
          ) ? (
            <s-text tone="critical">
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.fixTheSubscriptionFieldsBeforeSaving"
              )}
            </s-text>
          ) : null}
        </s-stack>
      </s-section>
    </DisabledConfigurationRegion>
  );
}
