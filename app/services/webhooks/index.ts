/**
 * Webhook Module - Re-exports for easy importing
 */

// Main processor
export { WebhookProcessor } from './processor.server';

// Types
export type {
  WebhookMessage,
  WebhookProcessResult,
  ProductPayload,
  CustomerDataRequestPayload,
  CustomerRedactPayload,
  ShopRedactPayload,
} from './types';

// Handlers (for testing/direct access)
export {
  handleProductDelete,
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
} from './handlers';
