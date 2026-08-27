import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { BundleMetricTrendPoint } from "../../lib/analytics";
import {
  formatBundleSplitDateAxisTick,
  formatCompactCurrencyAxisTick,
} from "../../lib/analytics/chart-axis-formatters";

type BundleMetricKey = "revenueCents" | "views" | "orders" | "conversionRate" | "aovCents";
type ChoiceListElement = HTMLElement & { values?: string[] };

const METRICS: Array<{ key: BundleMetricKey; label: string }> = [
  { key: "revenueCents", label: "Bundle Revenue" },
  { key: "views", label: "Bundle Views" },
  { key: "orders", label: "Bundle Orders" },
  { key: "conversionRate", label: "Conversion" },
  { key: "aovCents", label: "AOV" },
];

export interface BundleMetricChartProps {
  trend: BundleMetricTrendPoint[];
  rangeDays: number;
  formatRevenue: (cents: number) => string;
}

export function BundleMetricChart({ trend, rangeDays, formatRevenue }: BundleMetricChartProps) {
  const [metric, setMetric] = useState<BundleMetricKey>("revenueCents");
  const choiceListRef = useRef<any>(null);
  const metricTriggerRef = useRef<any>(null);
  const selected = METRICS.find(option => option.key === metric) ?? METRICS[0];
  const currencyMetric = metric === "revenueCents" || metric === "aovCents";

  useEffect(() => {
    const choiceList = choiceListRef.current;
    if (!choiceList) return;
    const handleChange = (event: Event) => {
      const values = (event.currentTarget as ChoiceListElement).values;
      const nextMetric = values?.[0] as BundleMetricKey | undefined;
      if (!nextMetric || !METRICS.some(option => option.key === nextMetric)) return;
      setMetric(nextMetric);
      metricTriggerRef.current?.click();
    };
    choiceList.addEventListener("change", handleChange);
    return () => choiceList.removeEventListener("change", handleChange);
  }, []);

  const formatValue = (value: number) => {
    if (currencyMetric) return formatRevenue(value);
    if (metric === "conversionRate") return `${value.toFixed(2)}%`;
    return value.toLocaleString();
  };

  return (
    <section className="wpb-card" aria-labelledby="wpb-bundle-metric-chart-title">
      <header className="wpb-section-header wpb-section-header--metric-chart">
        <div>
          <h2 id="wpb-bundle-metric-chart-title" className="wpb-section-title">Bundle Split</h2>
          <p className="wpb-section-hint">Performance across the selected date range</p>
        </div>
        <div className="wpb-metric-selector">
          <s-button ref={metricTriggerRef} commandFor="bundle-metric-popover" variant="secondary">
            {selected.label} ▾
          </s-button>
          <s-popover id="bundle-metric-popover">
            <s-box padding="base">
              <s-choice-list
                ref={choiceListRef}
                name="bundle-metric"
                label="Graph metric"
                labelAccessibilityVisibility="exclusive"
              >
                {METRICS.map(option => (
                  <s-choice key={option.key} value={option.key} selected={option.key === metric || undefined}>
                    {option.label}
                  </s-choice>
                ))}
              </s-choice-list>
            </s-box>
          </s-popover>
        </div>
      </header>

      <div className="wpb-metric-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="wpb-bundle-metric-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--wpb-accent-engagement)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--wpb-accent-engagement)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--wpb-line)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--wpb-ink-500)", fontSize: 11 }}
              tickFormatter={(date: string) => formatBundleSplitDateAxisTick(date, rangeDays)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--wpb-ink-500)", fontSize: 11 }}
              tickFormatter={(value: number) => currencyMetric ? formatCompactCurrencyAxisTick(value) : metric === "conversionRate" ? `${value}%` : value.toLocaleString()}
              width={56}
            />
            <Tooltip
              labelFormatter={(date) => formatBundleSplitDateAxisTick(String(date), rangeDays)}
              labelStyle={{ font: "var(--wpb-micro)", color: "var(--wpb-ink-700)" }}
              contentStyle={{
                border: "1px solid var(--wpb-line)",
                borderRadius: 8,
                background: "var(--wpb-ink-100)",
                font: "var(--wpb-micro)",
              }}
              formatter={(value: ValueType | undefined) => [formatValue(Number(value ?? 0)), selected.label]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              name={selected.label}
              stroke="var(--wpb-accent-engagement)"
              strokeWidth={2}
              fill="url(#wpb-bundle-metric-gradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
