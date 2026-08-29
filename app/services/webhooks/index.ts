/**
 * Webhook Module - Re-exports for easy importing
 */

// Main processor
export { WebhookProcessor } from './processor.server';

// Types
export type {
  PubSubMessage,
  WebhookProcessResult,
  ProductPayload,
  CustomerDataRequestPayload,
  CustomerRedactPayload,
  ShopRedactPayload,
} from './types';

// Handlers (for testing/direct access)
export {
  handleProductUpdate,
  handleProductDelete,
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
} from './handlers';
