/**
 * Product-page template registry.
 *
 * Resolution now reads from the shared template-design-system contract and
 * resolves only canonical PPB preset IDs.
 */

'use strict';

import { TemplateDesignSystem } from '../../shared/template-design-system.js';

function getTemplateSystem() {
  return TemplateDesignSystem;
}

function getPpbTemplateContracts() {
  const templateSystem = getTemplateSystem();
  return typeof templateSystem?.ppb?.contracts === 'object'
    ? templateSystem.ppb.contracts
    : {};
}

export const PPB_TEMPLATE_CONFIGS = {
  get GRID() {
    return getPpbTemplateContracts().GRID || null;
  },
  get LIST() {
    return getPpbTemplateContracts().LIST || null;
  },
  get HORIZONTAL_SLOTS() {
    return getPpbTemplateContracts().HORIZONTAL_SLOTS || null;
  },
  get VERTICAL_SLOTS() {
    return getPpbTemplateContracts().VERTICAL_SLOTS || null;
  },
};
