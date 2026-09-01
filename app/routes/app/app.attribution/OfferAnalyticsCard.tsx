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
  const revenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(model.funnelSnapshot.revenueCents / 100);

  return (
    <s-section heading={t("analyticsPage.offers.title")}>
      <s-stack direction="block" gap="base">
        <s-text color="subdued">{t("analyticsPage.offers.description")}</s-text>
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
        <s-grid
          gridTemplateColumns="repeat(auto-fit, minmax(12rem, 1fr))"
          gap="base"
        >
          {[
            [t("analyticsPage.offers.engaged"), model.funnelSnapshot.engaged.toLocaleString()],
            [t("analyticsPage.offers.addedToCart"), model.funnelSnapshot.addedToCart.toLocaleString()],
            [t("analyticsPage.offers.checkedOut"), model.funnelSnapshot.checkedOut.toLocaleString()],
            [t("analyticsPage.offers.revenue"), revenue],
          ].map(([label, value]) => (
            <s-box key={label} padding="base" border="base" borderRadius="base">
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">{label}</s-text>
                <s-heading>{value}</s-heading>
              </s-stack>
            </s-box>
          ))}
        </s-grid>
      </s-stack>
    </s-section>
  );
}
