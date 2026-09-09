/**
 * Shared type definitions for bundle configure pages (FPB + PPB).
 *
 * Route-specific types (BundleData, BundlePricing, LoaderData) live in each
 * route's own types.ts because they carry different fields.
 */

import type { BundleStatus } from "../constants/bundle";

export interface StepProduct {
  id: string;
  productId: string;
  title: string;
}

export interface BundleProductData {
  id: string;
  title?: string;
  handle?: string;
  status?: string;
  onlineStorePreviewUrl?: string;
  onlineStoreUrl?: string;
  featuredImage?: { url: string };
  featuredMedia?: { image?: { url?: string | null } | null } | null;
  media?: {
    nodes?: Array<{ image?: { url?: string | null } | null } | null>;
  } | null;
  images?: { originalSrc: string }[];
}

export interface BundleStep {
  id: string;
  name: string;
  isFreeGift?: boolean | null;
  collections?: any;
  StepProduct?: StepProduct[];
}

export interface BundleStatusSectionProps {
  status: BundleStatus;
  onChange: (status: BundleStatus) => void;
  showHeading?: boolean;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

interface SyncProductResponse extends ActionResponse {
  product?: any;
  metafieldsUpdated?: boolean;
}

interface PagesResponse extends ActionResponse {
  pages?: Array<{
    id: string;
    title: string;
    handle: string;
  }>;
}

interface ThemeTemplatesResponse extends ActionResponse {
  templates?: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
  currentTheme?: {
    id: string;
    name: string;
  };
}

interface WidgetValidationResponse extends ActionResponse {
  widgetInstalled?: boolean;
  bundleConfigured?: boolean;
  recommendedAction?: string;
}
