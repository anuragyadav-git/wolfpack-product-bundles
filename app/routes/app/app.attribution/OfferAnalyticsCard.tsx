import { useTranslation } from "react-i18next";

type OfferAnalyticsModel = {
  selectedOfferPolicyId: string | null;
  options: Array<{
    id: string;
    label: string;
    ruleVersion: number | null;
    eligibilitySource: string | null;
    tierIds: string[];
  }>;
  funnelSnapshot: {
    engaged: number;
    addedToCart: number;
    checkedOut: number;
    revenueCents: number;
  };
};

export function OfferAnalyticsCard({
  model,
  onSelectionChange,
}: {
  model: OfferAnalyticsModel;
  onSelectionChange: (offerPolicyId: string | null) => void;
}) {
  const { t } = useTranslation();
  const selected = model.options.find((option) => (
    option.id === model.selectedOfferPolicyId
  ));
  return (
    <s-section heading={t("analyticsPage.offers.title")}>
      <s-grid
        gridTemplateColumns="@container (inline-size > 700px) minmax(16rem, 28rem) minmax(0, 1fr), 1fr"
        gap="base"
      >
        <s-select
          label={t("analyticsPage.offers.filterLabel")}
          value={model.selectedOfferPolicyId ?? ""}
          onChange={(event: Event) => {
            const value = (event.target as HTMLSelectElement).value;
            onSelectionChange(value || null);
          }}
        >
          <s-option value="">{t("analyticsPage.offers.allOffers")}</s-option>
          {model.options.map((option) => (
            <s-option key={option.id} value={option.id}>{option.label}</s-option>
          ))}
        </s-select>
        {selected ? (
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-badge tone="info">
              {t("analyticsPage.offers.ruleVersion", { version: selected.ruleVersion ?? "—" })}
            </s-badge>
            {selected.eligibilitySource ? (
              <s-badge>{selected.eligibilitySource.replace(/_/g, " ")}</s-badge>
            ) : null}
            {selected.tierIds.length > 0 ? (
              <s-text color="subdued">
                {t("analyticsPage.offers.tierCount", { count: selected.tierIds.length })}
              </s-text>
            ) : null}
          </s-stack>
        ) : null}
      </s-grid>
    </s-section>
  );
}
