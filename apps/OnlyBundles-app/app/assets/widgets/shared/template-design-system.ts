/**
 * Shared template design-system contract used by both FPB and PPB.
 *
 * This file is intentionally shared by the shared component bundle. The build
 * pipeline concatenates shared modules before family widgets, so the contract is
 * available globally at runtime.
 */

'use strict';

const TemplateDesignSystem = (function () {
  const FPB_PRESET_CONTRACTS: any = {
    STANDARD: {
      id: 'STANDARD',
      presetId: 'STANDARD',
      aliases: ['STANDARD'],
      family: 'FPB',
      productCard: {
        mode: 'grid',
        columns: {
          desktop: 3,
          mobile: 2,
        },
        ctaMode: 'icon',
      },
      summary: {
        mode: 'rows',
        emptyState: 'skeletonRows',
      },
      discountProgress: {
        mode: 'stepped',
        placement: ['sidebar', 'mobileTray'],
      },
      timeline: {
        mode: 'standard',
      },
      mobileSummary: {
        compactFooter: true,
        showAdditionalOfferStatus: true,
      },
    },
    CLASSIC: {
      id: 'CLASSIC',
      presetId: 'CLASSIC',
      aliases: ['CLASSIC'],
      family: 'FPB',
      productCard: {
        mode: 'grid',
        columns: {
          desktop: 4,
          mobile: 2,
        },
        ctaMode: 'iconOrText',
      },
      summary: {
        mode: 'slots',
        emptyState: 'slotGrid',
      },
      discountProgress: {
        mode: 'stepped',
        placement: ['sidebar', 'mobileTray'],
      },
      timeline: {
        mode: 'standard',
      },
      mobileSummary: {
        compactFooter: true,
        showAdditionalOfferStatus: true,
      },
    },
    COMPACT: {
      id: 'COMPACT',
      presetId: 'COMPACT',
      aliases: ['COMPACT'],
      family: 'FPB',
      productCard: {
        mode: 'compact',
        columns: {
          desktop: 3,
          mobile: 2,
        },
        ctaMode: 'iconOrText',
      },
      summary: {
        mode: 'compactSlots',
        emptyState: 'slotGrid',
      },
      discountProgress: {
        mode: 'stepped',
        placement: ['sidebar', 'mobileTray'],
      },
      timeline: {
        mode: 'compact',
      },
      mobileSummary: {
        compactFooter: true,
        showAdditionalOfferStatus: false,
      },
    },
    HORIZONTAL: {
      id: 'HORIZONTAL',
      presetId: 'HORIZONTAL',
      aliases: ['HORIZONTAL'],
      family: 'FPB',
      productCard: {
        mode: 'row',
        columns: {
          desktop: 1,
          mobile: 1,
        },
        ctaMode: 'iconOrText',
      },
      summary: {
        mode: 'rows',
        emptyState: 'skeletonRows',
      },
      discountProgress: {
        mode: 'stepped',
        placement: ['sidebar', 'mobileTray'],
      },
      timeline: {
        mode: 'horizontal',
      },
      mobileSummary: {
        compactFooter: true,
        showAdditionalOfferStatus: false,
      },
    },
  };

  const PPB_TEMPLATE_CONTRACTS: any = {
    GRID: {
      id: 'GRID',
      templateType: 'PDP_INPAGE',
      aliases: ['GRID', 'COGNIVE'],
      family: 'PPB',
      productCard: {
        mode: 'grid',
      },
      summary: {
        mode: 'drawer',
      },
      discountProgress: {
        mode: 'simple',
        placement: ['footer', 'drawer'],
      },
    },
    LIST: {
      id: 'LIST',
      templateType: 'PDP_INPAGE',
      aliases: ['LIST', 'CASCADE'],
      family: 'PPB',
      productCard: {
        mode: 'row',
      },
      summary: {
        mode: 'drawerRows',
      },
      discountProgress: {
        mode: 'simple',
        placement: ['footer', 'drawer'],
      },
    },
    HORIZONTAL_SLOTS: {
      id: 'HORIZONTAL_SLOTS',
      templateType: 'PDP_MODAL',
      aliases: ['HORIZONTAL_SLOTS', 'MODAL'],
      family: 'PPB',
      slots: {
        orientation: 'horizontal',
      },
      summary: {
        mode: 'slots',
      },
      discountProgress: {
        mode: 'simple',
        placement: ['bottomSheet', 'modal'],
      },
    },
    VERTICAL_SLOTS: {
      id: 'VERTICAL_SLOTS',
      templateType: 'PDP_MODAL',
      aliases: ['VERTICAL_SLOTS', 'SIMPLIFIED'],
      family: 'PPB',
      slots: {
        orientation: 'vertical',
      },
      summary: {
        mode: 'verticalSlots',
      },
      discountProgress: {
        mode: 'simple',
        placement: ['bottomSheet', 'modal'],
      },
    },
  };

  const FPB_PRESET_IDS = Object.keys(FPB_PRESET_CONTRACTS);
  const PPB_TEMPLATE_IDS = Object.keys(PPB_TEMPLATE_CONTRACTS);

  const FPB_PRESET_REGISTRY_BY_ALIAS = (() => {
    const map: any = {};
    FPB_PRESET_IDS.forEach((presetId) => {
      const contract = FPB_PRESET_CONTRACTS[presetId];
      map[presetId] = contract;
      contract.aliases.forEach((alias: string|number) => {
        map[alias] = contract;
      });
    });
    return map;
  })();

  const PPB_TEMPLATE_REGISTRY_BY_ALIAS = (() => {
    const map: any = {};
    PPB_TEMPLATE_IDS.forEach((templateId) => {
      const contract = PPB_TEMPLATE_CONTRACTS[templateId];
      map[templateId] = contract;
      contract.aliases.forEach((alias: string|number) => {
        map[alias] = contract;
      });
    });
    return map;
  })();

  function normalizeFpbPresetId(rawValue: string, fallback = '') {
    if (typeof rawValue !== 'string' || rawValue.trim() === '') return fallback;
    const upper = rawValue.trim().toUpperCase();
    return FPB_PRESET_IDS.includes(upper) ? upper : fallback;
  }

  function isSupportedFpbPreset(rawValue: string) {
    if (typeof rawValue !== 'string') return false;
    return FPB_PRESET_IDS.includes(rawValue.trim().toUpperCase());
  }

  function getFpbPresetContract(rawValue: any) {
    const presetId = normalizeFpbPresetId(rawValue);
    return FPB_PRESET_CONTRACTS[presetId] || null;
  }

  function getPpbTemplateContractByAlias(rawValue: string) {
    if (typeof rawValue !== 'string' || rawValue.trim() === '') return null;
    return PPB_TEMPLATE_REGISTRY_BY_ALIAS[rawValue.trim().toUpperCase()] || null;
  }

  function resolvePpbTemplate({
    templateType = '',
    designPreset = '',
  }: any = {}) {
    const normalizedTemplateType = typeof templateType === 'string' ? templateType.trim().toUpperCase() : '';
    const resolvedContract = getPpbTemplateContractByAlias(designPreset);
    if (!normalizedTemplateType || !resolvedContract) {
      return null;
    }

    if (normalizedTemplateType === 'PDP_INPAGE') {
      return resolvedContract.templateType === 'PDP_INPAGE' ? resolvedContract : null;
    }

    if (normalizedTemplateType === 'PDP_MODAL') {
      return resolvedContract.templateType === 'PDP_MODAL' ? resolvedContract : null;
    }

    return null;
  }

  function toContractSummary() {
    return {
      fpb: {
        presetIds: FPB_PRESET_IDS.slice(),
        presetsWithMobileSummary: FPB_PRESET_IDS.slice(),
        presetsSupportingAdditionalOfferStatus: ['STANDARD', 'CLASSIC'],
      },
      ppb: {
        templateIds: PPB_TEMPLATE_IDS.slice(),
        templateTypes: ['PDP_INPAGE', 'PDP_MODAL'],
      },
    };
  }

  return {
    fpb: {
      templateIds: FPB_PRESET_IDS,
      contracts: FPB_PRESET_CONTRACTS,
      isSupportedPreset: isSupportedFpbPreset,
      resolvePresetId: normalizeFpbPresetId,
      resolveContract: getFpbPresetContract,
      allPresetContracts: FPB_PRESET_CONTRACTS,
    },
    ppb: {
      templateIds: PPB_TEMPLATE_IDS,
      contracts: PPB_TEMPLATE_CONTRACTS,
      resolveContract: getPpbTemplateContractByAlias,
      resolveByRuntimeContext: resolvePpbTemplate,
    },
    resolvePpbTemplate,
    toContractSummary,
    getSummary() {
      return toContractSummary();
    },
  };
}());

export { TemplateDesignSystem };
