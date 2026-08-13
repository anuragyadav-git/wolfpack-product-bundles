import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbSubscriptionsSection() {
  const {
    activeSection,
    DiscountMethod,
    pricingState,
    setShowSubscriptionSetupGuide,
    showSubscriptionSetupGuide,
    subscriptionConfig,
    setSubscriptionConfig,
    SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
    subscriptionFetcher,
    validationErrors,
  } = usePpbConfigureContext();

  if (activeSection !== "subscriptions") return null;

  const validation = subscriptionFetcher.data;
  const groups = validation?.success === true && validation?.isValid === true
    ? (validation.groups ?? []).filter(Boolean)
    : [];
  const subscriptionsBlocked =
    pricingState.discountType === DiscountMethod.BUY_X_GET_Y;
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

  return (
    <div data-tour-target="ppb-subscriptions">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" alignItems="center" gap="small">
            <s-heading>Bundle Subscriptions</s-heading>
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
          <s-paragraph>Allow customers to purchase the bundle as a subscription</s-paragraph>

          {subscriptionsBlocked ? (
            <s-banner tone="warning" heading="Subscriptions unavailable" dismissible={false} hidden={false}>
              Subscriptions cannot be enabled on bundles with Buy X, Get Y discounts. Use a different discount type to enable subscriptions.
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

          <s-stack direction="inline" gap="small" alignItems="center">
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
          </s-stack>

          {groups.length > 0 ? (
            <s-stack direction="block" gap="base">
              <s-stack direction="inline" alignItems="center" justifyContent="space-between" gap="small">
                <s-heading>Subscription Plans</s-heading>
                <s-switch
                  accessibilityLabel="Enable bundle subscriptions"
                  checked={subscriptionConfig.enabled || undefined}
                  disabled={subscriptionsBlocked || undefined}
                  onChange={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    enabled: (event.target as HTMLInputElement).checked,
                  }))}
                />
              </s-stack>

              <s-choice-list
                label="Selling-plan group"
                values={subscriptionConfig.selectedGroup ? [subscriptionConfig.selectedGroup.id] : []}
                onChange={(event) => setGroup(((event.currentTarget as any).values as string[] | undefined)?.[0] ?? "")}
              >
                {groups.map((group: any) => (
                  <s-choice key={group.id} value={group.id}>{group.name}</s-choice>
                ))}
              </s-choice-list>

              {subscriptionConfig.selectedGroup?.plans.map((plan: any) => {
                const checked = subscriptionConfig.selectedPlanIds.includes(plan.id);
                return (
                  <s-box key={plan.id} padding="base" border="base" borderRadius="base">
                    <s-stack direction="block" gap="small">
                      <s-checkbox
                        label={plan.sourceName}
                        checked={checked || undefined}
                        onChange={(event) => setSubscriptionConfig((current: any) => {
                          const isChecked = (event.target as HTMLInputElement).checked;
                          const selectedPlanIds = isChecked
                            ? [...current.selectedPlanIds, plan.id]
                            : current.selectedPlanIds.filter((id: string) => id !== plan.id);
                          return {
                            ...current,
                            selectedPlanIds,
                            planCopy: {
                              ...current.planCopy,
                              ...(isChecked ? { [plan.id]: current.planCopy[plan.id] ?? { displayName: plan.sourceName, discountPill: "", description: "" } } : {}),
                            },
                          };
                        })}
                      />
                      {checked ? (
                        <s-text-field
                          label="Plan display name"
                          value={subscriptionConfig.planCopy[plan.id]?.displayName ?? ""}
                          error={validationErrors[`subscriptions.planCopy.${plan.id}.displayName`]}
                          onInput={(event) => setSubscriptionConfig((current: any) => ({
                            ...current,
                            planCopy: {
                              ...current.planCopy,
                              [plan.id]: { ...current.planCopy[plan.id], displayName: (event.target as HTMLInputElement).value },
                            },
                          }))}
                        />
                      ) : null}
                    </s-stack>
                  </s-box>
                );
              })}

              <s-checkbox
                label="One-time purchase"
                checked={subscriptionConfig.oneTimePurchase.enabled || undefined}
                onChange={(event) => setSubscriptionConfig((current: any) => ({
                  ...current,
                  oneTimePurchase: { ...current.oneTimePurchase, enabled: (event.target as HTMLInputElement).checked },
                }))}
              />
              <s-text-field
                label="Purchase options title"
                value={subscriptionConfig.copy.title}
                error={validationErrors["subscriptions.copy.title"]}
                onInput={(event) => setSubscriptionConfig((current: any) => ({
                  ...current,
                  copy: { ...current.copy, title: (event.target as HTMLInputElement).value },
                }))}
              />
              {subscriptionConfig.oneTimePurchase.enabled ? (
                <s-text-field
                  label="One-time purchase label"
                  value={subscriptionConfig.oneTimePurchase.title}
                  error={validationErrors["subscriptions.oneTimePurchase.title"]}
                  onInput={(event) => setSubscriptionConfig((current: any) => ({
                    ...current,
                    oneTimePurchase: { ...current.oneTimePurchase, title: (event.target as HTMLInputElement).value },
                  }))}
                />
              ) : null}
              <s-choice-list
                label="Default purchase option"
                values={[
                  subscriptionConfig.defaultPurchaseOption.kind === "one_time"
                    ? "one_time"
                    : subscriptionConfig.defaultPurchaseOption.sellingPlanId,
                ]}
                onChange={(event) => {
                  const value = ((event.currentTarget as any).values as string[] | undefined)?.[0];
                  if (!value) return;
                  setSubscriptionConfig((current: any) => ({
                    ...current,
                    defaultPurchaseOption: value === "one_time"
                      ? { kind: "one_time" }
                      : { kind: "selling_plan", sellingPlanId: value },
                  }));
                }}
              >
                {subscriptionConfig.oneTimePurchase.enabled ? <s-choice value="one_time">One-time purchase</s-choice> : null}
                {subscriptionConfig.selectedGroup?.plans
                  .filter((plan: any) => subscriptionConfig.selectedPlanIds.includes(plan.id))
                  .map((plan: any) => <s-choice key={plan.id} value={plan.id}>{plan.sourceName}</s-choice>)}
              </s-choice-list>
              {subscriptionConfig.enabled && Object.keys(validationErrors).some((path) => path.startsWith("subscriptions.")) ? (
                <s-text tone="critical">Fix the subscription fields before saving.</s-text>
              ) : null}
            </s-stack>
          ) : null}
        </s-stack>
      </s-section>
    </div>
  );
}
