import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBundleSubscriptionCompatibilityIssues,
  getDefaultPurchaseOptionFromOneTimeToggle,
  reconcileBundleSubscriptionPlanDiscovery,
  SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
  type BundleSubscriptionConfigV1,
  type LocalizedSubscriptionCopy,
} from "../../../../lib/bundle-subscriptions";

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
    setShowSubscriptionSetupGuide: (value: boolean | ((current: boolean) => boolean)) => void;
    showSubscriptionSetupGuide: boolean;
    shopLocales: Array<{ locale: string; name: string; primary: boolean }>;
    stepsState: { steps: Array<{ isFreeGift?: boolean | null }> };
    subscriptionConfig: BundleSubscriptionConfigV1;
    setSubscriptionConfig: (updater: (current: BundleSubscriptionConfigV1) => BundleSubscriptionConfigV1) => void;
    subscriptionFetcher: {
      data?: SubscriptionValidationResponse;
      state: string;
      submit: (formData: FormData, options: { method: string }) => void;
    };
    validationErrors: Record<string, string | undefined>;
};

export function BundleSubscriptionsSection(props: BundleSubscriptionsSectionProps) {
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
  const translationsModalRef = useRef<UIModalElement | null>(null);
  const [activeLocale, setActiveLocale] = useState(
    shopLocales.find((locale: { primary: boolean }) => locale.primary)?.locale
      ?? shopLocales[0]?.locale
      ?? "",
  );
  const discoveredGroups = subscriptionFetcher.data?.success === true
    && subscriptionFetcher.data?.isValid === true
    ? (subscriptionFetcher.data.groups ?? []).filter(Boolean)
    : [];

  useEffect(() => {
    if (discoveredGroups.length === 0) return;
    setSubscriptionConfig((current) => reconcileBundleSubscriptionPlanDiscovery(
      current,
      discoveredGroups,
    ));
  }, [subscriptionFetcher.data]);

  const compatibilityIssues = useMemo(
    () => getBundleSubscriptionCompatibilityIssues({
      discountType: pricingState.discountType,
      steps: stepsState.steps,
      personalizationEnabled: Boolean(bundle.personalizationData),
    }),
    [bundle.personalizationData, pricingState.discountType, stepsState.steps],
  );

  if (activeSection !== "subscriptions") return null;

  const validation = subscriptionFetcher.data;
  const groups = discoveredGroups.length > 0
    ? discoveredGroups
    : subscriptionConfig.selectedGroup
      ? [subscriptionConfig.selectedGroup]
      : [];
  const subscriptionsBlocked = compatibilityIssues.length > 0;
  const validationMessage = validation?.success === false
    ? validation.error
    : validation?.isValid === false
      ? (validation.message ?? SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE)
      : null;
  const setGroup = (groupId: string) => {
    const selectedGroup = groups.find((group: any) => group?.id === groupId) ?? null;
    setSubscriptionConfig((current: any) => ({
      ...current,
      selectedGroup,
      selectedPlanIds: [],
      defaultPurchaseOption: { kind: "one_time" },
      planCopy: {},
    }));
  };
  const updateTranslation = (
    key: keyof LocalizedSubscriptionCopy,
    value: string,
  ) => {
    if (!activeLocale) return;
    setSubscriptionConfig((current: any) => ({
      ...current,
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...(current.translations[activeLocale] ?? {}),
          [key]: value,
        },
      },
    }));
  };
  const updateLocalizedPlanCopy = (
    planId: string,
    key: "displayName" | "discountPill" | "description",
    value: string,
  ) => {
    if (!activeLocale) return;
    setSubscriptionConfig((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...(current.translations[activeLocale] ?? {}),
          planCopy: {
            ...(current.translations[activeLocale]?.planCopy ?? {}),
            [planId]: {
              ...(current.translations[activeLocale]?.planCopy?.[planId] ?? {}),
              [key]: value,
            },
          },
        },
      },
    }));
  };
  const localizedCopy = activeLocale
    ? subscriptionConfig.translations[activeLocale] ?? {}
    : {};

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
                    disabled={(subscriptionsBlocked && !subscriptionConfig.enabled) || groups.length === 0 || undefined}
                    onChange={(event) => setSubscriptionConfig((current: any) => ({
                      ...current,
                      enabled: (event.target as HTMLInputElement).checked,
                    }))}
                  />
                  <s-press-button
                    variant="tertiary"
                    tone="neutral"
                    icon="play"
                    accessibilityLabel="How to setup?"
                    pressed={showSubscriptionSetupGuide}
                    onClick={() => setShowSubscriptionSetupGuide((visible: boolean) => !visible)}
                  >
                    How to setup?
                  </s-press-button>
                </s-stack>
                {shopLocales.length > 0 ? (
                  <s-button
                    variant="tertiary"
                    icon="globe"
                    disabled={!subscriptionConfig.selectedGroup || undefined}
                    onClick={() => translationsModalRef.current?.showOverlay?.()}
                  >
                    Multi Language
                  </s-button>
                ) : null}
              </s-grid>

              {subscriptionsBlocked ? (
                <s-banner tone="warning" heading="Subscriptions unavailable" dismissible={false} hidden={false}>
                  {compatibilityIssues.map((issue) => issue.message).join(" ")}
                </s-banner>
              ) : null}
              {showSubscriptionSetupGuide ? (
                <s-banner tone="info" heading="Subscription setup guide" dismissible={false} hidden={false}>
                  Configure every bundle product and selectable variant in one selling-plan group in your subscription app, then return here and get the shared plans.
                </s-banner>
              ) : null}
              {validationMessage ? (
                <s-banner tone="warning" heading="Action required" dismissible={false} hidden={false}>
                  {validationMessage}
                </s-banner>
              ) : null}

              {groups.length > 0 ? (
                <s-box padding="base" border="base" borderRadius="base">
                  <s-grid
                    gridTemplateColumns="minmax(0, 1fr) auto"
                    gap="base"
                    alignItems="center"
                  >
                    {groups.length > 1 ? (
                      <s-choice-list
                        label="Subscription plan"
                        values={subscriptionConfig.selectedGroup ? [subscriptionConfig.selectedGroup.id] : []}
                        error={validationErrors["subscriptions.selectedGroup"]}
                        onChange={(event) => setGroup(((event.currentTarget as any).values as string[] | undefined)?.[0] ?? "")}
                      >
                        {groups.map((group: any) => (
                          <s-choice key={group.id} value={group.id}>{group.name}</s-choice>
                        ))}
                      </s-choice-list>
                    ) : (
                      <s-text type="strong">{subscriptionConfig.selectedGroup?.name ?? groups[0]?.name}</s-text>
                    )}
                    <s-button
                      variant="secondary"
                      loading={subscriptionFetcher.state === "submitting" || undefined}
                      disabled={subscriptionFetcher.state !== "idle" || subscriptionsBlocked || undefined}
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("intent", "validateSellingPlanGroups");
                        subscriptionFetcher.submit(formData, { method: "post" });
                      }}
                    >
                      Change Plan
                    </s-button>
                  </s-grid>
                </s-box>
              ) : (
                <s-button
                  variant="primary"
                  loading={subscriptionFetcher.state === "submitting" || undefined}
                  disabled={subscriptionFetcher.state !== "idle" || subscriptionsBlocked || undefined}
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
                <s-text-field
                  label="Subscription Title"
                  value={subscriptionConfig.copy.title}
                  error={validationErrors["subscriptions.copy.title"]}
                  onInput={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    copy: { ...current.copy, title: (event.target as HTMLInputElement).value },
                  }))}
                />
              ) : null}
            </s-stack>
          </s-section>

          {subscriptionConfig.selectedGroup ? (
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
                    loading={subscriptionFetcher.state === "submitting" || undefined}
                    disabled={subscriptionFetcher.state !== "idle" || subscriptionsBlocked || undefined}
                    onClick={() => {
                      const formData = new FormData();
                      formData.append("intent", "validateSellingPlanGroups");
                      subscriptionFetcher.submit(formData, { method: "post" });
                    }}
                  >
                    Refresh Plan
                  </s-button>
                </s-grid>

                {subscriptionConfig.selectedGroup.plans.map((plan: any) => {
                  const checked = subscriptionConfig.selectedPlanIds.includes(plan.id);
                  const planCopy = subscriptionConfig.planCopy[plan.id] ?? {
                    displayName: plan.sourceName,
                    discountPill: "",
                    description: "",
                  };
                  return (
                    <s-box key={plan.id} padding="base" background="subdued" borderRadius="base">
                      <s-stack direction="block" gap="base">
                        <s-checkbox
                          label={plan.sourceName}
                          checked={checked || undefined}
                          onChange={(event) => setSubscriptionConfig((current: any) => {
                            const isChecked = (event.target as HTMLInputElement).checked;
                            const selectedPlanIds = isChecked
                              ? Array.from(new Set([...current.selectedPlanIds, plan.id]))
                              : current.selectedPlanIds.filter((id: string) => id !== plan.id);
                            const defaultPurchaseOption = !current.oneTimePurchase.enabled
                              || (current.defaultPurchaseOption.kind === "selling_plan"
                                && !selectedPlanIds.includes(current.defaultPurchaseOption.sellingPlanId))
                              ? getDefaultPurchaseOptionFromOneTimeToggle({
                                  ...current,
                                  selectedPlanIds,
                                }, false)
                              : current.defaultPurchaseOption;
                            return {
                              ...current,
                              selectedPlanIds,
                              defaultPurchaseOption,
                              planCopy: {
                                ...current.planCopy,
                                ...(isChecked ? { [plan.id]: current.planCopy[plan.id] ?? planCopy } : {}),
                              },
                            };
                          })}
                        />
                        {Array.isArray(plan.options) && plan.options.length > 0 ? (
                          <s-paragraph>{plan.options.join(" · ")}</s-paragraph>
                        ) : null}
                        {checked ? (
                          <>
                            <s-grid
                              gridTemplateColumns="minmax(0, 1fr) minmax(7.5rem, 0.45fr)"
                              gap="base"
                            >
                              <s-text-field
                                label="Plan Name in Dropdown"
                                value={planCopy.displayName}
                                error={validationErrors[`subscriptions.planCopy.${plan.id}.displayName`]}
                                onInput={(event) => setSubscriptionConfig((current: any) => ({
                                  ...current,
                                  planCopy: {
                                    ...current.planCopy,
                                    [plan.id]: { ...current.planCopy[plan.id], displayName: (event.target as HTMLInputElement).value },
                                  },
                                }))}
                              />
                              <s-text-field
                                label="Discount Pill"
                                value={planCopy.discountPill}
                                onInput={(event) => setSubscriptionConfig((current: any) => ({
                                  ...current,
                                  planCopy: {
                                    ...current.planCopy,
                                    [plan.id]: { ...current.planCopy[plan.id], discountPill: (event.target as HTMLInputElement).value },
                                  },
                                }))}
                              />
                            </s-grid>
                            <s-divider />
                            <s-text-area
                              label="Subscription Option Description"
                              value={planCopy.description}
                              onInput={(event) => setSubscriptionConfig((current: any) => ({
                                ...current,
                                planCopy: {
                                  ...current.planCopy,
                                  [plan.id]: { ...current.planCopy[plan.id], description: (event.target as HTMLTextAreaElement).value },
                                },
                              }))}
                            />
                          </>
                        ) : null}
                      </s-stack>
                    </s-box>
                  );
                })}
              </s-stack>
            </s-section>
          ) : null}

          {subscriptionConfig.selectedGroup ? (
            <s-section>
              <s-stack direction="block" gap="base">
                <s-stack direction="block" gap="small">
                  <s-heading>Configurations</s-heading>
                  <s-paragraph>Configure the settings for the subscription bundle</s-paragraph>
                </s-stack>

                <s-switch
                  label="Enable Recurring Discounts"
                  checked={subscriptionConfig.recurringBundleDiscount || undefined}
                  onChange={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    recurringBundleDiscount: (event.target as HTMLInputElement).checked,
                  }))}
                />
                <s-switch
                  label="One-Time Purchase"
                  checked={subscriptionConfig.oneTimePurchase.enabled || undefined}
                  onChange={(event) => setSubscriptionConfig((current: any) => {
                    const enabled = (event.target as HTMLInputElement).checked;
                    return {
                      ...current,
                      oneTimePurchase: { ...current.oneTimePurchase, enabled },
                      defaultPurchaseOption: enabled
                        ? current.defaultPurchaseOption
                        : getDefaultPurchaseOptionFromOneTimeToggle(current, false),
                    };
                  })}
                />
                {subscriptionConfig.oneTimePurchase.enabled ? (
                  <>
                    <s-text-field
                      label="One-time purchase label"
                      value={subscriptionConfig.oneTimePurchase.title}
                      error={validationErrors["subscriptions.oneTimePurchase.title"]}
                      onInput={(event) => setSubscriptionConfig((current: any) => ({
                        ...current,
                        oneTimePurchase: { ...current.oneTimePurchase, title: (event.target as HTMLInputElement).value },
                      }))}
                    />
                    <s-checkbox
                      label="Make one-time purchase selected by default"
                      checked={subscriptionConfig.defaultPurchaseOption.kind === "one_time" || undefined}
                      error={validationErrors["subscriptions.defaultPurchaseOption"]}
                      onChange={(event) => setSubscriptionConfig((current) => ({
                        ...current,
                        defaultPurchaseOption: getDefaultPurchaseOptionFromOneTimeToggle(
                          current,
                          (event.target as HTMLInputElement).checked,
                        ),
                      }))}
                    />
                  </>
                ) : null}
                {subscriptionConfig.defaultPurchaseOption.kind === "selling_plan"
                  && subscriptionConfig.selectedPlanIds.length > 1 ? (
                    <s-choice-list
                      label="Default subscription plan"
                      values={[subscriptionConfig.defaultPurchaseOption.sellingPlanId]}
                      error={validationErrors["subscriptions.defaultPurchaseOption"]}
                      onChange={(event) => {
                        const value = ((event.currentTarget as any).values as string[] | undefined)?.[0];
                        if (!value) return;
                        setSubscriptionConfig((current) => ({
                          ...current,
                          defaultPurchaseOption: { kind: "selling_plan", sellingPlanId: value },
                        }));
                      }}
                    >
                      {subscriptionConfig.selectedGroup.plans
                        .filter((plan: any) => subscriptionConfig.selectedPlanIds.includes(plan.id))
                        .map((plan: any) => (
                          <s-choice key={plan.id} value={plan.id}>
                            {subscriptionConfig.planCopy[plan.id]?.displayName || plan.sourceName}
                          </s-choice>
                        ))}
                    </s-choice-list>
                  ) : null}

                <s-divider />
                <s-stack direction="block" gap="small">
                  <s-heading>Bundle discount applies on</s-heading>
                  <s-paragraph>Apply bundle discounts to subscription purchases only, one-time purchases only, or both.</s-paragraph>
                </s-stack>
                <s-choice-list
                  label="Bundle discount applies on"
                  labelAccessibilityVisibility="exclusive"
                  values={[subscriptionConfig.bundleDiscountAppliesOn]}
                  onChange={(event) => {
                    const value = ((event.currentTarget as any).values as string[] | undefined)?.[0];
                    if (!value) return;
                    setSubscriptionConfig((current: any) => ({
                      ...current,
                      bundleDiscountAppliesOn: value,
                    }));
                  }}
                >
                  <s-choice value="subscription">Only on subscription purchase</s-choice>
                  <s-choice value="one_time">Only on one-time purchase</s-choice>
                  <s-choice value="both">On both</s-choice>
                </s-choice-list>

                <s-divider />
                <s-heading>Storefront display</s-heading>
                {subscriptionConfig.oneTimePurchase.enabled ? (
                  <s-text-area
                    label="One-time purchase description"
                    value={subscriptionConfig.oneTimePurchase.description}
                    onInput={(event) => setSubscriptionConfig((current: any) => ({
                      ...current,
                      oneTimePurchase: { ...current.oneTimePurchase, description: (event.target as HTMLTextAreaElement).value },
                    }))}
                  />
                ) : null}
                <s-text-area
                  label="Purchase options subtitle"
                  value={subscriptionConfig.copy.subtitle}
                  onInput={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    copy: { ...current.copy, subtitle: (event.target as HTMLTextAreaElement).value },
                  }))}
                />
                <s-text-area
                  label="Unavailable-plan message"
                  value={subscriptionConfig.copy.unavailableMessage}
                  onInput={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    copy: { ...current.copy, unavailableMessage: (event.target as HTMLTextAreaElement).value },
                  }))}
                />
                <s-checkbox
                  label="Show subscription discount on product cards"
                  checked={subscriptionConfig.showDiscountOnProductCards || undefined}
                  onChange={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    showDiscountOnProductCards: (event.target as HTMLInputElement).checked,
                  }))}
                />
                {subscriptionConfig.enabled && Object.keys(validationErrors).some((path) => path.startsWith("subscriptions.")) ? (
                  <s-text tone="critical">Fix the subscription fields before saving.</s-text>
                ) : null}
              </s-stack>
            </s-section>
          ) : null}
        </s-stack>
      </s-query-container>

      <s-modal
        id="bundle-subscription-language-modal"
        ref={translationsModalRef}
        heading="Subscription languages"
      >
        <s-stack direction="block" gap="base">
          <s-select
            label="Language"
            value={activeLocale}
            onChange={(event) => setActiveLocale((event.target as HTMLSelectElement).value)}
          >
            {shopLocales.map((locale: { locale: string; name: string; primary: boolean }) => (
              <s-option key={locale.locale} value={locale.locale}>
                {locale.name}{locale.primary ? " (default)" : ""}
              </s-option>
            ))}
          </s-select>
          <s-text-field
            label="Purchase options title"
            value={localizedCopy.title ?? ""}
            onInput={(event) => updateTranslation("title", (event.target as HTMLInputElement).value)}
          />
          <s-text-field
            label="One-time purchase label"
            value={localizedCopy.oneTimePurchaseTitle ?? ""}
            onInput={(event) => updateTranslation("oneTimePurchaseTitle", (event.target as HTMLInputElement).value)}
          />
          {subscriptionConfig.selectedGroup?.plans
            .filter((plan) => subscriptionConfig.selectedPlanIds.includes(plan.id))
            .map((plan) => {
              const localizedPlan = localizedCopy.planCopy?.[plan.id] ?? {};
              return (
                <s-box key={plan.id} padding="base" border="base" borderRadius="base">
                  <s-stack direction="block" gap="small">
                    <s-heading>{plan.sourceName}</s-heading>
                    <s-text-field
                      label="Plan name in dropdown"
                      value={localizedPlan.displayName ?? ""}
                      onInput={(event) => updateLocalizedPlanCopy(plan.id, "displayName", (event.target as HTMLInputElement).value)}
                    />
                    <s-text-field
                      label="Discount pill"
                      value={localizedPlan.discountPill ?? ""}
                      onInput={(event) => updateLocalizedPlanCopy(plan.id, "discountPill", (event.target as HTMLInputElement).value)}
                    />
                    <s-text-area
                      label="Subscription option description"
                      value={localizedPlan.description ?? ""}
                      onInput={(event) => updateLocalizedPlanCopy(plan.id, "description", (event.target as HTMLTextAreaElement).value)}
                    />
                  </s-stack>
                </s-box>
              );
            })}
          <s-text-area
            label="Purchase options subtitle"
            value={localizedCopy.subtitle ?? ""}
            onInput={(event) => updateTranslation("subtitle", (event.target as HTMLTextAreaElement).value)}
          />
          <s-text-area
            label="Unavailable-plan message"
            value={localizedCopy.unavailableMessage ?? ""}
            onInput={(event) => updateTranslation("unavailableMessage", (event.target as HTMLTextAreaElement).value)}
          />
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          commandFor="bundle-subscription-language-modal"
          command="--hide"
        >
          Done
        </s-button>
      </s-modal>
    </div>
  );
}
