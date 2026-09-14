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
import { ConfigureHelpPopover } from "./ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";
import { TUTORIAL_LINKS } from "../../../../lib/tutorial-links";
import { BundleSubscriptionPlanTiers } from "./BundleSubscriptionPlanTiers";
import { BundleSubscriptionConfiguration } from "./BundleSubscriptionConfiguration";
import type { BundleSubscriptionsSectionProps } from "./bundle-subscription-section.types";

type BundleSubscriptionGroup = NonNullable<
  BundleSubscriptionConfigV1["selectedGroup"]
>;

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
    selectDefaultTranslationLocale(shopLocales)
  );
  const discoveredGroups: BundleSubscriptionGroup[] =
    subscriptionFetcher.data?.success === true &&
    subscriptionFetcher.data?.isValid === true
      ? (subscriptionFetcher.data.groups ?? []).filter(
          (group): group is BundleSubscriptionGroup => Boolean(group)
        )
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
          subscriptionConfig.selectedGroup.plans
            .filter((plan) => plan.id.length > 0)
            .map((plan) => [plan.id, plan])
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
      ? [
          {
            id: "subscription-compatibility",
            heading: "Subscriptions unavailable",
            message: compatibilityIssues
              .map((issue) => issue.message)
              .join(" "),
          },
        ]
      : []),
    ...(validationMessage
      ? [
          {
            id: "subscription-validation",
            heading: "Action required",
            message: validationMessage,
          },
        ]
      : []),
  ];
  const setGroup = (groupId: string) => {
    const selectedGroup = groups.find((group) => group.id === groupId) ?? null;
    setSubscriptionConfig((current) => {
      const selectedPlanIds = Array.from(
        new Set((selectedGroup?.plans ?? []).map((plan) => plan.id))
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
          fallback:
            subscriptionConfig.planCopy[plan.id]?.displayName ??
            plan.sourceName,
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
                  <s-heading>
                    {translateAdmin("tooltips.bundleSubscriptions.title")}
                  </s-heading>
                  <ConfigureHelpPopover tooltipKey="bundleSubscriptions" />
                  <s-switch
                    accessibilityLabel={translateAdmin(
                      "adminAttributes.enableBundleSubscriptions"
                    )}
                    checked={subscriptionConfig.enabled || undefined}
                    disabled={
                      (subscriptionsBlocked && !subscriptionConfig.enabled) ||
                      groups.length === 0 ||
                      undefined
                    }
                    onChange={(event) =>
                      setSubscriptionConfig((current) => ({
                        ...current,
                        enabled: (event.target as HTMLInputElement).checked,
                      }))
                    }
                  />
                  <s-press-button
                    variant="tertiary"
                    tone="neutral"
                    icon="play"
                    accessibilityLabel={translateAdmin(
                      "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
                    )}
                    pressed={showSubscriptionSetupGuide}
                    onClick={() =>
                      setShowSubscriptionSetupGuide(
                        (visible: boolean) => !visible
                      )
                    }
                  >
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
                    )}
                  </s-press-button>
                </s-stack>
              </s-grid>

              <AdminWarningGroup warnings={subscriptionWarnings} />
              {showSubscriptionSetupGuide ? (
                <s-box padding="base" background="subdued" borderRadius="base">
                  <s-heading>
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.subscriptionSetupGuide"
                    )}
                  </s-heading>
                  <s-paragraph>
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.configureEveryBundleProductAndSelectableVariantInOneSellingPlanG"
                    )}
                  </s-paragraph>
                  <s-link href={TUTORIAL_LINKS.subscriptions} target="_blank">
                    {translateAdmin("common.actions.learnMore")}
                  </s-link>
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
                          label={translateAdmin(
                            "adminAttributes.subscriptionPlan"
                          )}
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
                          {groups.map((group) => (
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
                        {translateAdmin(
                          "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.changePlan"
                        )}
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
                  {translateAdmin(
                    "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.getSubscriptionPlans"
                  )}
                </s-button>
              )}

              {subscriptionConfig.selectedGroup ? (
                <DisabledConfigurationRegion
                  disabled={!subscriptionConfig.enabled}
                >
                  <s-text-field
                    label={translateAdmin("adminAttributes.subscriptionTitle")}
                    value={subscriptionConfig.copy.title}
                    disabled={!subscriptionConfig.enabled || undefined}
                    error={validationErrors["subscriptions.copy.title"]}
                    onInput={(event) =>
                      setSubscriptionConfig((current) => ({
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

          <BundleSubscriptionPlanTiers
            subscriptionConfig={subscriptionConfig}
            setSubscriptionConfig={setSubscriptionConfig}
            subscriptionFetcher={subscriptionFetcher}
            subscriptionsBlocked={subscriptionsBlocked}
            uniquePlanRows={uniquePlanRows}
            validationErrors={validationErrors}
          />
          <BundleSubscriptionConfiguration
            subscriptionConfig={subscriptionConfig}
            setSubscriptionConfig={setSubscriptionConfig}
            uniquePlanRows={uniquePlanRows}
            validationErrors={validationErrors}
            shopLocales={shopLocales}
            onOpenTranslations={() => setTranslationModalOpen(true)}
          />
        </s-stack>
      </s-query-container>

      <MultiLanguageTextModal
        id="bundle-subscription-language-modal"
        open={translationModalOpen}
        title={translateAdmin("adminAttributes.subscriptionLanguages")}
        locales={shopLocales}
        activeLocale={activeTranslationLocale}
        fields={translationFields}
        valuesByLocale={flattenSubscriptionTranslations(
          subscriptionConfig.translations
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
