import { calculateFunnelRetention } from "../../lib/analytics/funnel-retention";
import { translateAdmin } from "~/i18n/config";

interface BundleConversionFunnelProps {
  bundleViews: number;
  addedToCart: number;
  orders: number;
  formatCount: (value: number) => string;
}

const VIEWBOX_WIDTH = 960;
const VIEWBOX_HEIGHT = 288;
const BASELINE_Y = 190;
const STAGE_MAX_HEIGHT = 132;
const STAGE_MIN_VISIBLE_HEIGHT = 2;
const STAGE_WIDTH = 176;
const STAGE_X_POSITIONS = [40, 392, 744] as const;
const LABEL_Y = 252;

function getStageHeight(value: number, maxValue: number): number {
  if (maxValue <= 0 || value <= 0) return 0;
  return Math.max(
    STAGE_MIN_VISIBLE_HEIGHT,
    (value / maxValue) * STAGE_MAX_HEIGHT,
  );
}

function getFlowPath(
  sourceX: number,
  targetX: number,
  sourceHeight: number,
  targetHeight: number,
): string {
  const sourceTop = BASELINE_Y - sourceHeight;
  const targetTop = BASELINE_Y - targetHeight;

  return [
    `M ${sourceX} ${sourceTop}`,
    `L ${targetX} ${targetTop}`,
    `L ${targetX} ${BASELINE_Y}`,
    `L ${sourceX} ${BASELINE_Y}`,
    "Z",
  ].join(" ");
}

export function BundleConversionFunnel({
  bundleViews,
  addedToCart,
  orders,
  formatCount,
}: BundleConversionFunnelProps) {
  const conversionLabel = translateAdmin(
    "adminExtracted.components.analytics.funnelhero.conversion",
  );
  const viewsLabel = translateAdmin(
    "adminExtracted.components.analytics.funnelhero.bundleViews",
  );
  const cartLabel = translateAdmin("analyticsPage.offers.addedToCart");
  const ordersLabel = translateAdmin(
    "adminExtracted.components.analytics.topcampaigns.orders",
  );
  const maxValue = Math.max(bundleViews, addedToCart, orders, 0);
  const viewsStage = {
    label: viewsLabel,
    value: bundleViews,
    x: STAGE_X_POSITIONS[0],
    height: getStageHeight(bundleViews, maxValue),
    gradient: "wpb-funnel-stage-views",
  };
  const cartStage = {
    label: cartLabel,
    value: addedToCart,
    x: STAGE_X_POSITIONS[1],
    height: getStageHeight(addedToCart, maxValue),
    gradient: "wpb-funnel-stage-cart",
  };
  const ordersStage = {
    label: ordersLabel,
    value: orders,
    x: STAGE_X_POSITIONS[2],
    height: getStageHeight(orders, maxValue),
    gradient: "wpb-funnel-stage-orders",
  };
  const stages = [viewsStage, cartStage, ordersStage];
  const retention = calculateFunnelRetention(
    bundleViews,
    addedToCart,
    orders,
  );
  const flows = [
    {
      id: "first",
      source: viewsStage,
      target: cartStage,
      conversion: retention.viewToCart,
    },
    {
      id: "second",
      source: cartStage,
      target: ordersStage,
      conversion: retention.cartToOrder,
    },
  ];
  const description = stages
    .map((stage) => `${stage.label}: ${formatCount(stage.value)}`)
    .concat(
      flows.map(
        (flow) =>
          `${conversionLabel}: ${flow.conversion === null ? "—" : `${flow.conversion}%`}`,
      ),
    )
    .join(". ");
  const funnelTitle = translateAdmin(
    "adminExtracted.components.analytics.funnelhero.bundleFunnel",
  );

  return (
    <section className="wpb-card wpb-card--hero" aria-label={funnelTitle}>
      <div className="wpb-conversion-funnel-scroll">
        <svg
          className="wpb-conversion-funnel"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-labelledby="wpb-conversion-funnel-title wpb-conversion-funnel-description"
        >
          <title id="wpb-conversion-funnel-title">{funnelTitle}</title>
          <desc id="wpb-conversion-funnel-description">{description}</desc>
          <defs>
            <linearGradient id="wpb-funnel-stage-views" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--wpb-accent-engagement)" />
              <stop offset="100%" stopColor="var(--wpb-accent-engagement-soft)" />
            </linearGradient>
            <linearGradient id="wpb-funnel-stage-cart" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--wpb-accent-engagement)" stopOpacity="0.82" />
              <stop offset="100%" stopColor="var(--wpb-accent-engagement-soft)" />
            </linearGradient>
            <linearGradient id="wpb-funnel-stage-orders" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--wpb-accent-revenue)" />
              <stop offset="100%" stopColor="var(--wpb-accent-revenue-soft)" />
            </linearGradient>
            <linearGradient id="wpb-funnel-flow-first" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--wpb-accent-engagement)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--wpb-accent-engagement)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wpb-funnel-flow-second" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--wpb-accent-engagement)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--wpb-accent-revenue)" stopOpacity="0.14" />
            </linearGradient>
          </defs>

          {flows.map((flow) => {
            const sourceX = flow.source.x + STAGE_WIDTH;
            const targetX = flow.target.x;
            const conversionText =
              flow.conversion === null ? "—" : `${flow.conversion}%`;
            const conversionX = (sourceX + targetX) / 2;
            const hasVisibleFlow =
              flow.source.height > 0 || flow.target.height > 0;

            return (
              <g
                key={flow.id}
                role="group"
                aria-label={`${conversionLabel}: ${conversionText}`}
              >
                {hasVisibleFlow && (
                  <path
                    d={getFlowPath(
                      sourceX,
                      targetX,
                      flow.source.height,
                      flow.target.height,
                    )}
                    fill={`url(#wpb-funnel-flow-${flow.id})`}
                  />
                )}
                <rect
                  className="wpb-conversion-funnel-badge"
                  x={conversionX - 24}
                  y={BASELINE_Y - 29}
                  width="48"
                  height="21"
                  rx="7"
                />
                <text
                  className="wpb-conversion-funnel-conversion"
                  x={conversionX}
                  y={BASELINE_Y - 14}
                  textAnchor="middle"
                >
                  {conversionText}
                </text>
                <text
                  className="wpb-conversion-funnel-arrow"
                  x={conversionX}
                  y={LABEL_Y}
                  textAnchor="middle"
                  aria-hidden="true"
                >
                  →
                </text>
              </g>
            );
          })}

          {stages.map((stage) => {
            const stageTop = BASELINE_Y - stage.height;
            const valueY = Math.max(32, stageTop - 16);

            return (
              <g
                key={stage.label}
                role="group"
                aria-label={`${stage.label}: ${formatCount(stage.value)}`}
              >
                <text
                  className="wpb-conversion-funnel-value"
                  x={stage.x + STAGE_WIDTH / 2}
                  y={valueY}
                  textAnchor="middle"
                >
                  {formatCount(stage.value)}
                </text>
                {stage.height > 0 && (
                  <rect
                    className="wpb-conversion-funnel-stage"
                    x={stage.x}
                    y={stageTop}
                    width={STAGE_WIDTH}
                    height={stage.height}
                    rx="2"
                    fill={`url(#${stage.gradient})`}
                  />
                )}
                <text
                  className="wpb-conversion-funnel-label"
                  x={stage.x + STAGE_WIDTH / 2}
                  y={LABEL_Y}
                  textAnchor="middle"
                >
                  {stage.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
