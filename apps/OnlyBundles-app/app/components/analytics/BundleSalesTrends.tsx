import type { BundleSalesTrendPoint } from "../../lib/analytics";
import { translateAdmin } from "~/i18n/config";

export interface BundleSalesTrendsProps {
  trend: BundleSalesTrendPoint[];
  formatMoney: (cents: number) => string;
}

function linePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 0);
  return values.map((value, index) => {
    const x = values.length <= 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = max === 0 ? height : height - (value / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function SalesLine({
  title,
  values,
  accessiblePoints,
}: {
  title: string;
  values: number[];
  accessiblePoints: string;
}) {
  const width = 440;
  const height = 136;
  return (
    <article className="wpb-sales-chart-card">
      <h3 className="wpb-sales-chart-title">{title}</h3>
      <svg
        className="wpb-sales-chart"
        viewBox={`0 0 ${width} ${height + 8}`}
        role="img"
        aria-label={`${title}. ${accessiblePoints}`}
      >
        <line className="wpb-sales-chart-axis" x1="0" y1={height} x2={width} y2={height} />
        <polyline
          className="wpb-sales-chart-line"
          points={linePoints(values, width, height)}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {values.map((value, index) => {
          const [x, y] = linePoints(values, width, height).split(" ")[index].split(",");
          return <circle key={`${index}-${value}`} className="wpb-sales-chart-point" cx={x} cy={y} r="3" />;
        })}
      </svg>
    </article>
  );
}

export function BundleSalesTrends({ trend, formatMoney }: BundleSalesTrendsProps) {
  const revenueTitle = translateAdmin("analyticsPage.bundleMetrics.bundleRevenue");
  const ordersTitle = translateAdmin("analyticsPage.bundleMetrics.ordersWithBundles");
  const revenuePoints = trend
    .map((point) => `${point.date}: ${formatMoney(point.bundleRevenue)}`)
    .join(". ");
  const orderPoints = trend
    .map((point) => `${point.date}: ${point.ordersWithBundles.toLocaleString()}`)
    .join(". ");

  return (
    <section className="wpb-card" aria-labelledby="wpb-sales-trends-title">
      <header className="wpb-section-header">
        <h2 id="wpb-sales-trends-title" className="wpb-section-title">
          {translateAdmin("analyticsPage.bundleMetrics.sales")}
        </h2>
      </header>
      <div className="wpb-sales-chart-grid">
        <SalesLine
          title={revenueTitle}
          values={trend.map((point) => point.bundleRevenue)}
          accessiblePoints={revenuePoints}
        />
        <SalesLine
          title={ordersTitle}
          values={trend.map((point) => point.ordersWithBundles)}
          accessiblePoints={orderPoints}
        />
      </div>
    </section>
  );
}
