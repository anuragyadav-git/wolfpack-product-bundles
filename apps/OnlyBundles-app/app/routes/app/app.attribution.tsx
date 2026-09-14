/**
 * Analytics — UTM Attribution Dashboard
 *
 * Bundle performance, conversion, sales, and UTM attribution reporting.
 */

export { action } from "./app.attribution/action.server";
export {
  loader,
  type AttributionDashboardData,
} from "./app.attribution/loader.server";
export { default } from "./app.attribution/AttributionRouteShell";
