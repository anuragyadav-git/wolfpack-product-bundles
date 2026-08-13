/**
 * Full-page template registry.
 *
 * Resolution reads from the shared template-design-system contract.
 */

import { TemplateDesignSystem } from '../../shared/template-design-system.js';

function getTemplateSystem() {
  return TemplateDesignSystem;
}

function getFpbTemplateContracts() {
  const templateSystem = getTemplateSystem();
  return typeof templateSystem?.fpb?.contracts === 'object'
    ? templateSystem.fpb.contracts
    : {};
}

export const FPB_TEMPLATE_CONFIGS = {
  get STANDARD() {
    return getFpbTemplateContracts().STANDARD || null;
  },
  get CLASSIC() {
    return getFpbTemplateContracts().CLASSIC || null;
  },
  get COMPACT() {
    return getFpbTemplateContracts().COMPACT || null;
  },
  get HORIZONTAL() {
    return getFpbTemplateContracts().HORIZONTAL || null;
  },
};
