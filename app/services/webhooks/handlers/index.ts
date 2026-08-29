/**
 * Webhook Handlers - Re-export all handlers for easy importing
 */

// Product handlers
export {
  handleProductUpdate,
  handleProductDelete,
} from './product.server';

// GDPR handlers
export {
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
} from './gdpr.server';

// Lifecycle handlers
export {
  handleAppUninstalled,
  handleScopesUpdate,
} from './lifecycle.server';
