/**
 * Type definitions for Product Page Bundle Configuration.
 *
 * Shared types live in app/types/bundle-configure.ts; this module owns only
 * Product Page Bundle route contracts.
 */

import type { PricingRule } from "../../../types/pricing";
import type { BundleStatus } from "../../../constants/bundle";
import type {
  ActionResponse,
  BundleProductData,
  BundleStep,
} from "../../../types/bundle-configure";
import type { SpecificLinkOfferAdminState } from "../../../lib/specific-link-offer-admin";

export interface BundlePricing {
  id: string;
  enabled: boolean;
  method: string;
  rules: PricingRule[] | string;
  showFooter: boolean;
  messages: any;
}

export interface BundleData {
  id: string;
  name: string;
  description?: string;
  shopId: string;
  shopifyProductId?: string;
  shopifyProductHandle?: string;
  bundleType: string;
  status: BundleStatus;
  templateName?: string;
  loadingGif?: string | null;
  personalizationData?: unknown;
  steps: BundleStep[];
  pricing?: BundlePricing;
  bundleSubscriptionConfig?: unknown;
}

export interface LoaderData {
  bundle: BundleData;
  bundleProduct?: BundleProductData | null;
  shop: string;
  apiKey: string;
  blockHandle: string;
  configureMode?: "create" | "edit";
  showFirstLoadTour?: boolean;
  shopCurrencyCode: string;
  shopLocales: { locale: string; name: string; primary: boolean }[];
  offerDelivery: SpecificLinkOfferAdminState;
  previewToken?: string;
}

export interface BundleProductCardProps {
  bundleProduct: any;
  productImageUrl: string;
  productTitle: string;
  onOpenProduct?: () => void;
  onSync: () => void;
  onSelect: () => void;
}

export interface SaveBundleResponse extends ActionResponse {
  bundle?: BundleData;
}
