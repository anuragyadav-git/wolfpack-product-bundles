/**
 * Type definitions for Full Page Bundle Configuration.
 *
 * Shared types live in app/types/bundle-configure.ts; this module owns only
 * Full Page Bundle route contracts.
 */

import type { PricingRule } from "../../../types/pricing";
import type { BundleStatus } from "../../../constants/bundle";
import type {
  ActionResponse,
  BundleStep,
} from "../../../types/bundle-configure";
import type { SpecificLinkOfferAdminState } from "../../../lib/specific-link-offer-admin";

export interface BundlePricing {
  id: string;
  enabled: boolean;
  method: string;
  rules: PricingRule[] | string;
  showFooter: boolean;
  showProgressBar: boolean;
  messages: any;
}

export interface BundleData {
  id: string;
  publicNumber: number | null;
  name: string;
  description?: string;
  shopId: string;
  shopifyProductId?: string;
  shopifyProductHandle?: string;
  bundleType: string;
  status: BundleStatus;
  templateName?: string;
  promoBannerBgImage?: string | null;
  loadingGif?: string | null;
  steps: BundleStep[];
  pricing?: BundlePricing;
  bundleSubscriptionConfig?: unknown;
  personalizationData?: unknown;
  showStepTimeline?: boolean | null;
}

export interface LoaderData {
  bundle: BundleData;
  bundleProduct?: any;
  availableBundles: { id: string; name: string }[];
  shop: string;
  apiKey: string;
  storefrontProxyRoot: string;
  blockHandle: string;
  configureMode?: "create" | "edit";
  showFirstLoadTour?: boolean;
  shopCurrencyCode: string;
  shopLocales: { locale: string; name: string; primary: boolean }[];
  offerDelivery: SpecificLinkOfferAdminState;
}

export interface SaveBundleResponse extends ActionResponse {
  bundle?: BundleData;
}
