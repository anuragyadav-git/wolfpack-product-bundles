import { useEffect, useMemo, useState } from "react";
import {
  getBundleSubscriptionCompatibilityIssues,
  getDefaultPurchaseOptionFromOneTimeToggle,
  reconcileBundleSubscriptionPlanDiscovery,
  SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
  type BundleSubscriptionConfigV1,
} from "../../../../lib/bundle-subscriptions";
import {
  expandSubscriptionTranslationValues,
  flattenSubscriptionTranslations,
  selectDefaultTranslationLocale,
  type TranslationFieldDefinition,
} from "../../../../lib/bundle-configure-translations";
import { MultiLanguageTextModal } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { DisabledConfigurationRegion } from "./DisabledConfigurationRegion";
import { AdminWarningGroup } from "../../../../components/AdminWarningGroup";

type SubscriptionValidationResponse = {
  success?: boolean;
  isValid?: boolean;
  groups?: BundleSubscriptionConfigV1["selectedGroup"][];
  message?: string | null;
  error?: string;
};

type BundleSubscriptionsSectionProps = {
  activeSection: string;
  bundle: { personalizationData?: unknown };
  pricingState: { discountType?: string | null };
  setShowSubscriptionSetupGuide: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
  showSubscriptionSetupGuide: boolean;
  shopLocales: Array<{ locale: string; name: string; primary: boolean }>;
  stepsState: { steps: Array<{ isFreeGift?: boolean | null }> };
  subscriptionConfig: BundleSubscriptionConfigV1;
  setSubscriptionConfig: (
    updater: (current: BundleSubscriptionConfigV1) => BundleSubscriptionConfigV1
  ) => void;
  subscriptionFetcher: {
    data?: SubscriptionValidationResponse;
    state: string;
    submit: (formData: FormData, options: { method: string }) => void;
  };
  validationErrors: Record<string, string | undefined>;
};

export function BundleSubscriptionsSection(
  props: BundleSubscriptionsSectionProps
) {
  const {
    activeSection,
    bundle,
    pricingState,
    setShowSubscriptionSetupGuide,
    showSubscriptionSetupGuide,
    shopLocales,
    stepsState,
    subscriptionConfig,
    setSubscriptionConfig,
    subscriptionFetcher,
    validationErrors,
  } = props;
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [activeTranslationLocale, setActiveTranslationLocale] = useState(
    selectDefaultTranslationLocale(shopLocales),
  );
  const discoveredGroups =
    subscriptionFetcher.data?.success === true &&
    subscriptionFetcher.data?.isValid === true
      ? (subscriptionFetcher.data.groups ?? []).filter(Boolean)
      : [];

  useEffect(() => {
    if (discoveredGroups.length === 0) return;
    setSubscriptionConfig((current) =>
      reconcileBundleSubscriptionPlanDiscovery(current, discoveredGroups)
    );
  }, [subscriptionFetcher.data]);

  const compatibilityIssues = useMemo(
    () =>
      getBundleSubscriptionCompatibilityIssues({
        discountType: pricingState.discountType,
        steps: stepsState.steps,
        personalizationEnabled: Boolean(bundle.personalizationData),
      }),
    [bundle.personalizationData, pricingState.discountType, stepsState.steps]
  );

  if (activeSection !== "subscriptions") return null;

  const validation = subscriptionFetcher.data;
  const groups =
    discoveredGroups.length > 0
      ? discoveredGroups
      : subscriptionConfig.selectedGroup
      ? [subscriptionConfig.selectedGroup]
      : [];
  const subscriptionsBlocked = compatibilityIssues.length > 0;
  const uniquePlanRows = subscriptionConfig.selectedGroup
    ? Array.from(
        new Map(
          (subscriptionConfig.selectedGroup.plans ?? [])
            .filter(
              (plan: any) => typeof plan?.id === "string" && plan.id.length > 0
            )
            .map((plan: any) => [plan.id, plan])
        ).values()
      )
    : [];
  const validationMessage =
    validation?.success === false
      ? validation.error
      : validation?.isValid === false
      ? validation.message ?? SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE
      : null;
  const subscriptionWarnings = [
    ...(subscriptionsBlocked
      ? [{
          id: "subscription-compatibility",
          heading: "Subscriptions unavailable",
          message: compatibilityIssues.map((issue) => issue.message).join(" "),
        }]
      : []),
    ...(validationMessage
      ? [{
          id: "subscription-validation",
          heading: "Action required",
          message: validationMessage,
        }]
      : []),
  ];
  const setGroup = (groupId: string) => {
    const selectedGroup =
      groups.find((group: any) => group?.id === groupId) ?? null;
    setSubscriptionConfig((current: any) => {
      const selectedPlanIds = Array.from(
        new Set(
          (selectedGroup?.plans ?? [])
            .map((plan: any) => plan?.id)
            .filter((id: any) => typeof id === "string" && id.length > 0)
        )
      );
      return {
        ...current,
        selectedGroup,
        selectedPlanIds,
        defaultPurchaseOption: getDefaultPurchaseOptionFromOneTimeToggle(
          {
            ...current,
            selectedPlanIds,
          },
          current.oneTimePurchase.enabled
        ),
        planCopy: {},
      };
    });
  };
  const translationFields: TranslationFieldDefinition[] = [
    {
      key: "title",
      label: "Purchase options title",
      fallback: subscriptionConfig.copy.title,
      headingBefore: "Plan tier copy",
    },
    {
      key: "oneTimePurchaseTitle",
      label: "One-time purchase label",
      fallback: subscriptionConfig.oneTimePurchase.title,
    },
    ...uniquePlanRows
      .filter((plan) => subscriptionConfig.selectedPlanIds.includes(plan.id))
      .flatMap((plan) => [
        {
          key: `plan:${plan.id}:displayName`,
          label: `${plan.sourceName}: plan name in dropdown`,
          fallback: subscriptionConfig.planCopy[plan.id]?.displayName ?? plan.sourceName,
          headingBefore: plan.sourceName,
        },
        {
          key: `plan:${plan.id}:discountPill`,
          label: `${plan.sourceName}: discount pill`,
          fallback: subscriptionConfig.planCopy[plan.id]?.discountPill ?? "",
        },
        {
          key: `plan:${plan.id}:description`,
          label: `${plan.sourceName}: subscription option description`,
          fallback: subscriptionConfig.planCopy[plan.id]?.description ?? "",
          multiline: true,
        },
      ]),
    {
      key: "subtitle",
      label: "Purchase options subtitle",
      fallback: subscriptionConfig.copy.subtitle,
      multiline: true,
      headingBefore: "Storefront display",
    },
    {
      key: "unavailableMessage",
      label: "Unavailable-plan message",
      fallback: subscriptionConfig.copy.unavailableMessage,
      multiline: true,
    },
  ];

  return (
    <div data-tour-target="bundle-subscriptions">
      <s-query-container containerName="bundle-subscriptions">
        <s-stack direction="block" gap="base">
          <s-section>
            <s-stack direction="block" gap="base">
              <s-grid
                gridTemplateColumns="minmax(0, 1fr) auto"
                gap="base"
                alignItems="center"
              >
                <s-stack direction="inline" alignItems="center" gap="small">
                  <s-heading>Bundle Subscriptions</s-heading>
                  <s-switch
                    accessibilityLabel="Enable bundle subscriptions"
                    checked={subscriptionConfig.enabled || undefined}
                    disabled={
                      (subscriptionsBlocked && !subscriptionConfig.enabled) ||
                      groups.length === 0 ||
                      undefined
                    }
                    onChange={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        enabled: (event.target as HTMLInputElement).checked,
                      }))
                    }
                  />
                  <s-press-button
                    variant="tertiary"
                    tone="neutral"
                    icon="play"
                    accessibilityLabel="How to setup?"
                    pressed={showSubscriptionSetupGuide}
                    onClick={() =>
                      setShowSubscriptionSetupGuide(
                        (visible: boolean) => !visible
                      )
                    }
                  >
                    How to setup?
                  </s-press-button>
                </s-stack>
              </s-grid>

              <AdminWarningGroup warnings={subscriptionWarnings} />
              {showSubscriptionSetupGuide ? (
                <s-box padding="base" background="subdued" borderRadius="base">
                  <s-heading>Subscription setup guide</s-heading>
                  <s-paragraph>
                    Configure every bundle product and selectable variant in one
                    selling-plan group in your subscription app, then return here
                    and get the shared plans.
                  </s-paragraph>
                </s-box>
              ) : null}
              {groups.length > 0 ? (
                <DisabledConfigurationRegion
                  disabled={!subscriptionConfig.enabled}
                >
                  <s-box padding="base" border="base" borderRadius="base">
                    <s-grid
                      gridTemplateColumns="minmax(0, 1fr) auto"
                      gap="base"
                      alignItems="center"
                    >
                      {groups.length > 1 ? (
                        <s-choice-list
                          label="Subscription plan"
                          values={
                            subscriptionConfig.selectedGroup
                              ? [subscriptionConfig.selectedGroup.id]
                              : []
                          }
                          error={
                            validationErrors["subscriptions.selectedGroup"]
                          }
                          onChange={(event) =>
                            setGroup(
                              (
                                (event.currentTarget as any).values as
                                  | string[]
                                  | undefined
                              )?.[0] ?? ""
                            )
                          }
                        >
                          {groups.map((group: any) => (
                            <s-choice key={group.id} value={group.id}>
                              {group.name}
                            </s-choice>
                          ))}
                        </s-choice-list>
                      ) : (
                        <s-text type="strong">
                          {subscriptionConfig.selectedGroup?.name ??
                            groups[0]?.name}
                        </s-text>
                      )}
                      <s-button
                        variant="secondary"
                        icon={getConfigureActionIcon("replace")}
                        loading={
                          subscriptionFetcher.state === "submitting" ||
                          undefined
                        }
                        disabled={
                          subscriptionFetcher.state !== "idle" ||
                          subscriptionsBlocked ||
                          undefined
                        }
                        onClick={() => {
                          const formData = new FormData();
                          formData.append(
                            "intent",
                            "validateSellingPlanGroups"
                          );
                          subscriptionFetcher.submit(formData, {
                            method: "post",
                          });
                        }}
                      >
                        Change Plan
                      </s-button>
                    </s-grid>
                  </s-box>
                </DisabledConfigurationRegion>
              ) : (
                <s-button
                  variant="primary"
                  icon={getConfigureActionIcon("subscription-plan")}
                  loading={
                    subscriptionFetcher.state === "submitting" || undefined
                  }
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
                  Get Subscription Plans
                </s-button>
              )}

              {subscriptionConfig.selectedGroup ? (
                <DisabledConfigurationRegion
                  disabled={!subscriptionConfig.enabled}
                >
                  <s-text-field
                    label="Subscription Title"
                    value={subscriptionConfig.copy.title}
                    disabled={!subscriptionConfig.enabled || undefined}
                    error={validationErrors["subscriptions.copy.title"]}
                    onInput={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        copy: {
                          ...current.copy,
                          title: (event.target as HTMLInputElement).value,
                        },
                      }))
                    }
                  />
                </DisabledConfigurationRegion>
              ) : null}
            </s-stack>
          </s-section>

          {subscriptionConfig.selectedGroup ? (
            <DisabledConfigurationRegion disabled={!subscriptionConfig.enabled}>
              <s-section>
                <s-stack direction="block" gap="base">
                  <s-grid
                    gridTemplateColumns="minmax(0, 1fr) auto"
                    gap="base"
                    alignItems="center"
                  >
                    <s-heading>Plan Tiers</s-heading>
                    <s-button
                      variant="secondary"
                      icon={getConfigureActionIcon("refresh")}
                      loading={
                        subscriptionFetcher.state === "submitting" || undefined
                      }
                      disabled={
                        subscriptionFetcher.state !== "idle" ||
                        subscriptionsBlocked ||
                        undefined
                      }
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("intent", "validateSellingPlanGroups");
                        subscriptionFetcher.submit(formData, {
                          method: "post",
                        });
                      }}
                    >
                      Refresh Plan
                    </s-button>
                  </s-grid>

                  {uniquePlanRows.map((plan: any) => {
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
                              label="Plan Name in Dropdown"
                              value={planCopy.displayName}
                              error={
                                validationErrors[
                                  `subscriptions.planCopy.${plan.id}.displayName`
                                ]
                              }
                              onInput={(event) =>
                                setSubscriptionConfig((current: any) => ({
                                  ...current,
                                  planCopy: {
                                    ...current.planCopy,
                                    [plan.id]: {
                                      ...current.planCopy[plan.id],
                                      displayName: (
                                        event.target as HTMLInputElement
                                      ).value,
                                    },
                                  },
                                }))
                              }
                            />
                            <s-text-field
                              label="Discount Pill"
                              value={planCopy.discountPill}
                              onInput={(event) =>
                                setSubscriptionConfig((current: any) => ({
                                  ...current,
                                  planCopy: {
                                    ...current.planCopy,
                                    [plan.id]: {
                                      ...current.planCopy[plan.id],
                                      discountPill: (
                                        event.target as HTMLInputElement
                                      ).value,
                                    },
                                  },
                                }))
                              }
                            />
                          </s-grid>
                          <s-divider />
                          <s-text-area
                            label="Subscription Option Description"
                            value={planCopy.description}
                            onInput={(event) =>
                              setSubscriptionConfig((current: any) => ({
                                ...current,
                                planCopy: {
                                  ...current.planCopy,
                                  [plan.id]: {
                                    ...current.planCopy[plan.id],
                                    description: (
                                      event.target as HTMLTextAreaElement
                                    ).value,
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
          ) : null}

          {subscriptionConfig.selectedGroup ? (
            <DisabledConfigurationRegion disabled={!subscriptionConfig.enabled}>
              <s-section>
                <s-stack direction="block" gap="base">
                  <s-grid
                    gridTemplateColumns="minmax(0, 1fr) auto"
                    gap="base"
                    alignItems="center"
                  >
                    <s-stack direction="block" gap="small">
                      <s-heading>Configurations</s-heading>
                      <s-paragraph>
                        Configure the settings for the subscription bundle
                      </s-paragraph>
                    </s-stack>
                    <s-button
                      variant="tertiary"
                      tone="neutral"
                      icon={getConfigureActionIcon("translate")}
                      disabled={
                        shopLocales.length === 0 ||
                        !subscriptionConfig.selectedGroup ||
                        undefined
                      }
                      onClick={() => setTranslationModalOpen(true)}
                    >
                      Multi Language
                    </s-button>
                  </s-grid>

                  <s-switch
                    label="Enable Recurring Discounts"
                    checked={
                      subscriptionConfig.recurringBundleDiscount || undefined
                    }
                    onChange={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        recurringBundleDiscount: (
                          event.target as HTMLInputElement
                        ).checked,
                      }))
                    }
                  />
                  <s-switch
                    label="One-Time Purchase"
                    checked={
                      subscriptionConfig.oneTimePurchase.enabled || undefined
                    }
                    onChange={(event) =>
                      setSubscriptionConfig((current: any) => {
                        const enabled = (event.target as HTMLInputElement)
                          .checked;
                        return {
                          ...current,
                          oneTimePurchase: {
                            ...current.oneTimePurchase,
                            enabled,
                          },
                          defaultPurchaseOption: enabled
                            ? current.defaultPurchaseOption
                            : getDefaultPurchaseOptionFromOneTimeToggle(
                                current,
                                false
                              ),
                        };
                      })
                    }
                  />
                  <DisabledConfigurationRegion
                    disabled={!subscriptionConfig.oneTimePurchase.enabled}
                  >
                    <s-stack direction="block" gap="base">
                      <s-text-field
                        label="One-time purchase label"
                        value={subscriptionConfig.oneTimePurchase.title}
                        disabled={
                          !subscriptionConfig.oneTimePurchase.enabled ||
                          undefined
                        }
                        error={
                          validationErrors[
                            "subscriptions.oneTimePurchase.title"
                          ]
                        }
                        onInput={(event) =>
                          setSubscriptionConfig((current: any) => ({
                            ...current,
                            oneTimePurchase: {
                              ...current.oneTimePurchase,
                              title: (event.target as HTMLInputElement).value,
                            },
                          }))
                        }
                      />
                      <s-text-area
                        label="One-time purchase description"
                        value={subscriptionConfig.oneTimePurchase.description}
                        disabled={
                          !subscriptionConfig.oneTimePurchase.enabled ||
                          undefined
                        }
                        onInput={(event) =>
                          setSubscriptionConfig((current: any) => ({
                            ...current,
                            oneTimePurchase: {
                              ...current.oneTimePurchase,
                              description: (event.target as HTMLTextAreaElement)
                                .value,
                            },
                          }))
                        }
                      />
                      <s-checkbox
                        label="Make one-time purchase selected by default"
                        disabled={
                          !subscriptionConfig.oneTimePurchase.enabled ||
                          undefined
                        }
                        checked={
                          subscriptionConfig.defaultPurchaseOption.kind ===
                            "one_time" || undefined
                        }
                        error={
                          validationErrors[
                            "subscriptions.defaultPurchaseOption"
                          ]
                        }
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
                    label="Purchase options subtitle"
                    value={subscriptionConfig.copy.subtitle}
                    onInput={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        copy: {
                          ...current.copy,
                          subtitle: (event.target as HTMLTextAreaElement).value,
                        },
                      }))
                    }
                  />
                  <s-text-area
                    label="Unavailable-plan message"
                    value={subscriptionConfig.copy.unavailableMessage}
                    onInput={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        copy: {
                          ...current.copy,
                          unavailableMessage: (
                            event.target as HTMLTextAreaElement
                          ).value,
                        },
                      }))
                    }
                  />
                  <s-checkbox
                    label="Show subscription discount on product cards"
                    checked={
                      subscriptionConfig.showDiscountOnProductCards || undefined
                    }
                    onChange={(event) =>
                      setSubscriptionConfig((current: any) => ({
                        ...current,
                        showDiscountOnProductCards: (
                          event.target as HTMLInputElement
                        ).checked,
                      }))
                    }
                  />
                  {subscriptionConfig.defaultPurchaseOption.kind ===
                    "selling_plan" &&
                  subscriptionConfig.selectedPlanIds.length > 1 ? (
                    <s-choice-list
                      label="Default subscription plan"
                      values={[
                        subscriptionConfig.defaultPurchaseOption.sellingPlanId,
                      ]}
                      error={
                        validationErrors["subscriptions.defaultPurchaseOption"]
                      }
                      onChange={(event) => {
                        const value = (
                          (event.currentTarget as any).values as
                            | string[]
                            | undefined
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
                        .filter((plan: any) =>
                          subscriptionConfig.selectedPlanIds.includes(plan.id)
                        )
                        .map((plan: any) => (
                          <s-choice key={plan.id} value={plan.id}>
                            {subscriptionConfig.planCopy[plan.id]
                              ?.displayName || plan.sourceName}
                          </s-choice>
                        ))}
                    </s-choice-list>
                  ) : null}

                  <s-divider />
                  <s-stack direction="block" gap="small">
                    <s-heading>Bundle discount applies on</s-heading>
                    <s-paragraph>
                      Apply bundle discounts to subscription purchases only,
                      one-time purchases only, or both.
                    </s-paragraph>
                  </s-stack>
                  <s-grid
                    gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                    gap="base"
                  >
                    <s-choice-list
                      label="Only on subscription purchase"
                      labelAccessibilityVisibility="exclusive"
                      values={
                        subscriptionConfig.bundleDiscountAppliesOn ===
                        "subscription"
                          ? ["subscription"]
                          : []
                      }
                      onChange={(event) => {
                        const value = (
                          (event.currentTarget as any).values as
                            | string[]
                            | undefined
                        )?.[0];
                        if (!value) return;
                        setSubscriptionConfig((current: any) => ({
                          ...current,
                          bundleDiscountAppliesOn: value,
                        }));
                      }}
                    >
                      <s-choice value="subscription">
                        Only on subscription purchase
                      </s-choice>
                    </s-choice-list>
                    <s-choice-list
                      label="Only on one-time purchase"
                      labelAccessibilityVisibility="exclusive"
                      values={
                        subscriptionConfig.bundleDiscountAppliesOn ===
                        "one_time"
                          ? ["one_time"]
                          : []
                      }
                      onChange={(event) => {
                        const value = (
                          (event.currentTarget as any).values as
                            | string[]
                            | undefined
                        )?.[0];
                        if (!value) return;
                        setSubscriptionConfig((current: any) => ({
                          ...current,
                          bundleDiscountAppliesOn: value,
                        }));
                      }}
                    >
                      <s-choice value="one_time">
                        Only on one-time purchase
                      </s-choice>
                    </s-choice-list>
                    <s-choice-list
                      label="On both"
                      labelAccessibilityVisibility="exclusive"
                      values={
                        subscriptionConfig.bundleDiscountAppliesOn === "both"
                          ? ["both"]
                          : []
                      }
                      onChange={(event) => {
                        const value = (
                          (event.currentTarget as any).values as
                            | string[]
                            | undefined
                        )?.[0];
                        if (!value) return;
                        setSubscriptionConfig((current: any) => ({
                          ...current,
                          bundleDiscountAppliesOn: value,
                        }));
                      }}
                    >
                      <s-choice value="both">On both</s-choice>
                    </s-choice-list>
                  </s-grid>
                  {subscriptionConfig.enabled &&
                  Object.keys(validationErrors).some((path) =>
                    path.startsWith("subscriptions.")
                  ) ? (
                    <s-text tone="critical">
                      Fix the subscription fields before saving.
                    </s-text>
                  ) : null}
                </s-stack>
              </s-section>
            </DisabledConfigurationRegion>
          ) : null}
        </s-stack>
      </s-query-container>

      <MultiLanguageTextModal
        id="bundle-subscription-language-modal"
        open={translationModalOpen}
        title="Subscription languages"
        locales={shopLocales}
        activeLocale={activeTranslationLocale}
        fields={translationFields}
        valuesByLocale={flattenSubscriptionTranslations(
          subscriptionConfig.translations,
        )}
        onActiveLocaleChange={setActiveTranslationLocale}
        onSave={(valuesByLocale) =>
          setSubscriptionConfig((current) => ({
            ...current,
            translations: expandSubscriptionTranslationValues(valuesByLocale),
          }))
        }
        onClose={() => setTranslationModalOpen(false)}
      />
    </div>
  );
}
