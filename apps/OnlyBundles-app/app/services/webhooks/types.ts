/**
 * Type definitions for Webhook Processor
 *
 * Extracted from the main processor file for better organization.
 */

export interface WebhookMessage {
  data: string; // base64 encoded JSON
  attributes: {
    "X-Shopify-Topic": string;
    "X-Shopify-Shop-Domain": string;
    "X-Shopify-Webhook-Id"?: string;
    "X-Shopify-API-Version"?: string;
  };
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
  error?: string;
}
