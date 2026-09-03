/**
 * Lazy wrappers around the analytics components that depend on recharts.
 *
 * BundleMetricChart touches recharts directly. Lazy-loading it keeps
 * `vendor-charts` off the critical
 * path for the rest of the admin and defers its parse cost on /app/attribution
 * until after the shell paints.
 *
 * Other analytics components (FunnelHero, BundlePerformanceMatrix,
 * LiveActivityFeed, TopCampaigns) don't import recharts and stay eager —
 * deferring them would add roundtrips with no chunk-isolation payoff.
 *
 * Issue: docs/issues-prod/admin-lcp-phase5-recharts-lazy-1.md
 */

import { lazy } from "react";

export const LazyBundleMetricChart = lazy(() =>
  import("./BundleMetricChart").then((m) => ({ default: m.BundleMetricChart })),
);
