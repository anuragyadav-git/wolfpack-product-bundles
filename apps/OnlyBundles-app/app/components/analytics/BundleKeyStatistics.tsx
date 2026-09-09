import type { BundleCommerceSummary } from "../../lib/analytics/bundle-commerce-metrics";
import { translateAdmin } from "~/i18n/config";

interface BundleKeyStatisticsProps {
  summary: BundleCommerceSummary;
  formatMoney: (cents: number) => string;
}

export function BundleKeyStatistics({
  summary,
  formatMoney,
}: BundleKeyStatisticsProps) {
  const metrics = [
    {
      label: translateAdmin("analyticsPage.bundleMetrics.totalOrderRevenue"),
      value: formatMoney(summary.totalOrderRevenue),
      definition: translateAdmin("analyticsPage.bundleMetrics.totalOrderRevenueDefinition"),
    },
    {
      label: translateAdmin("analyticsPage.bundleMetrics.totalBundleRevenue"),
      value: formatMoney(summary.totalBundleRevenue),
      definition: translateAdmin("analyticsPage.bundleMetrics.totalBundleRevenueDefinition"),
    },
    {
      label: translateAdmin("analyticsPage.bundleMetrics.ordersWithBundles"),
      value: summary.ordersWithBundles.toLocaleString(),
      definition: translateAdmin("analyticsPage.bundleMetrics.ordersWithBundlesDefinition"),
    },
    {
      label: translateAdmin("analyticsPage.bundleMetrics.averageOrderValue"),
      value: summary.averageOrderValue === null
        ? formatMoney(0)
        : formatMoney(summary.averageOrderValue),
      definition: translateAdmin("analyticsPage.bundleMetrics.averageOrderValueDefinition"),
    },
    {
      label: translateAdmin("analyticsPage.bundleMetrics.addToCartValue"),
      value: summary.addToCartValue === null
        ? formatMoney(0)
        : formatMoney(summary.addToCartValue),
      definition: translateAdmin("analyticsPage.bundleMetrics.addToCartValueDefinition"),
    },
    {
      label: translateAdmin("analyticsPage.bundleMetrics.totalBundlesPurchased"),
      value: summary.totalBundlesPurchased.toLocaleString(),
      definition: translateAdmin("analyticsPage.bundleMetrics.totalBundlesPurchasedDefinition"),
    },
  ];

  return (
    <section className="wpb-card" aria-labelledby="wpb-key-statistics-title">
      <header className="wpb-section-header">
        <h2 id="wpb-key-statistics-title" className="wpb-section-title">
          {translateAdmin("analyticsPage.bundleMetrics.keyStatistics")}
        </h2>
      </header>
      <div className="wpb-key-statistics-grid">
        {metrics.map((metric) => (
          <article className="wpb-key-statistic" key={metric.label}>
            <span className="wpb-label">{metric.label}</span>
            <strong className="wpb-numeric">{metric.value}</strong>
            <p className="wpb-section-hint">{metric.definition}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
