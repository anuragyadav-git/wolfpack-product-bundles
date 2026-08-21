/**
 * Full-page bundle preset resolution.
 *
 * Pure helpers used by the FPB widget to derive the data attributes that
 * drive preset-scoped CSS rules in bundle-widget-full-page.css. The CSS
 * rules key on `data-fpb-design-preset` and `data-fpb-template`; this
 * module turns the bundle config into those attribute values.
 *
 * Exported as a single `FullPagePreset` object so that:
 *  - The widget bundle (IIFE) can access it as a local variable in scope
 *  - Node.js test environments can require() it via module.exports
 */

'use strict';

import { TemplateDesignSystem } from './template-design-system.js';

const FullPagePreset = (function () {
  function getTemplateSystem() {
    return TemplateDesignSystem;
  }

  function getFpbTemplateIds() {
    const templateSystem = getTemplateSystem();
    return (typeof templateSystem?.fpb?.templateIds === 'object'
      && Array.isArray(templateSystem.fpb.templateIds))
      ? templateSystem.fpb.templateIds
      : [];
  }

  function normalizePreset(rawValue: string, fallback = '') {
    const trimmed = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : '';
    if (!trimmed) return fallback;
    if (getFpbTemplateIds().includes(trimmed)) return trimmed;
    const templateSystem = getTemplateSystem();
    if (typeof templateSystem?.fpb?.resolvePresetId === 'function') {
      return templateSystem.fpb.resolvePresetId(rawValue, fallback);
    }
    return fallback;
  }

  function getPresetContract(rawValue: any) {
    const templateSystem = getTemplateSystem();
    if (!templateSystem?.fpb?.resolveContract) return null;
    return templateSystem.fpb.resolveContract(rawValue) || null;
  }

  /**
   * Normalize a raw preset id to one of the four supported values.
   */
  function resolvePresetAttr(bundle: any) {
    const raw = (bundle && bundle.bundleDesignPresetId) || '';
    if (typeof raw !== 'string') return '';
    return normalizePreset(raw, '');
  }

  function resolveTemplateAttr(bundle: any) {
    const raw = bundle && bundle.bundleDesignTemplate;
    if (typeof raw !== 'string' || raw.trim() === '') return '';
    return raw.trim().toUpperCase();
  }

  function isSupportedPreset(rawValue: string) {
    return normalizePreset(rawValue, '') !== '';
  }

  /**
   * Apply the preset + template data attributes to the widget container.
   * Safe to call repeatedly (idempotent).
   */
  function markContainer(container: any, bundle: any) {
    if (!container || !container.dataset) return;
    const preset = resolvePresetAttr(bundle);
    const template = resolveTemplateAttr(bundle);

    if (preset) {
      container.dataset.fpbDesignPreset = preset;
    } else {
      delete container.dataset.fpbDesignPreset;
    }

    if (template) {
      container.dataset.fpbTemplate = template;
    } else {
      delete container.dataset.fpbTemplate;
    }
  }

  function shouldUseReferenceStepBarTimeline({ layout, presetId }: any = {}) {
    const normalizedLayout = typeof layout === 'string' ? layout.trim().toLowerCase() : '';
    if (normalizedLayout !== 'footer_side') return false;

    const preset = resolvePresetAttr({ bundleDesignPresetId: presetId });
    return isSupportedPreset(preset);
  }

  return {
    resolvePresetAttr,
    resolveTemplateAttr,
    markContainer,
    shouldUseReferenceStepBarTimeline,
    isSupportedPreset,
    getPresetContract,
  };
}());

export { FullPagePreset };
