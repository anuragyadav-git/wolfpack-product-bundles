/**
 * Pricing Utilities
 *
 * Shared utility functions for pricing and billing calculations.
 * Used by both app.billing.tsx and app.billing_.plans.tsx routes.
 */

/**
 * Progress bar tone types from Polaris
 */
export type ProgressBarTone = "success" | "highlight" | "critical";

/**
 * Badge tone types from Polaris
 */
export type BadgeTone = "success" | "warning" | "critical" | "info";

/**
 * Calculate usage percentage from current count and limit
 *
 * @param currentCount - Current number of bundles
 * @param limit - Maximum bundle limit
 * @returns Percentage value (0-100)
 */
export function calculateUsagePercentage(currentCount: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((currentCount / limit) * 100);
}

/**
 * Get the appropriate progress bar tone based on usage percentage
 *
 * @param percentage - Usage percentage (0-100)
 * @returns Polaris ProgressBar tone
 */
export function getProgressBarTone(percentage: number): ProgressBarTone {
  if (percentage >= 90) return "critical";
  if (percentage >= 70) return "highlight";
  return "success";
}

/**
 * Get the appropriate badge tone based on usage percentage
 *
 * @param percentage - Usage percentage (0-100)
 * @returns Polaris Badge tone
 */
export function getBadgeTone(percentage: number): BadgeTone {
  if (percentage >= 90) return "critical";
  if (percentage >= 70) return "warning";
  return "success";
}

/**
 * Check if user should see upgrade prompt based on usage
 *
 * @param percentage - Usage percentage (0-100)
 * @param isFreePlan - Whether user is on free plan
 * @returns Whether to show upgrade prompt
 */
export function shouldShowUpgradePrompt(percentage: number, isFreePlan: boolean): boolean {
  return isFreePlan && percentage >= 50;
}

/**
 * Get upgrade prompt banner tone based on usage level
 *
 * @param percentage - Usage percentage (0-100)
 * @returns "warning" for high usage, "info" for moderate usage
 */
export function getUpgradePromptTone(percentage: number): "warning" | "info" {
  return percentage >= 80 ? "warning" : "info";
}
