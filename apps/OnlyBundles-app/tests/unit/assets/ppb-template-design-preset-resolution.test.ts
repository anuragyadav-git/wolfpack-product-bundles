import { ProductPageConfigLifecycleMethods } from "../../../app/assets/widgets/product-page/methods/config-lifecycle-methods";

describe('PPB template design preset resolution', () => {
function makeContext(selectedBundle: Record<string, unknown>) {
    return {
      ...ProductPageConfigLifecycleMethods,
      selectedBundle,
      _getProductPageTemplateType: () => {
        const templateType = selectedBundle?.bundleDesignTemplate;
        return templateType === 'PDP_INPAGE' || templateType === 'PDP_MODAL'
          ? templateType
          : '';
      },
    } as any;
  }

  it('prefers bundleDesignPresetId over bundleDesignTemplateData.templateId', () => {
    const context = makeContext({
      bundleDesignPresetId: 'GRID',
      bundleDesignTemplateData: { templateId: 'CASCADE' },
      bundleDesignTemplate: 'PDP_INPAGE',
    });

    expect(context._getProductPageDesignPreset()).toBe('GRID');
  });

  it('falls back to bundleDesignTemplateData.templateId for EB-style payloads', () => {
    const context = makeContext({
      bundleDesignTemplateData: { templateId: 'CASCADE' },
      bundleDesignTemplate: 'PDP_INPAGE',
    });

    expect(context._getProductPageDesignPreset()).toBe('LIST');
  });

  it('normalizes EB modal template ids through legacy aliases', () => {
    const context = makeContext({
      bundleDesignTemplateData: { templateId: 'MODAL' },
      bundleDesignTemplate: 'PDP_MODAL',
    });

    const designPreset = context._getProductPageDesignPreset();
    const contract = context._getProductPageTemplateContract();

    expect(designPreset).toBe('HORIZONTAL_SLOTS');
    expect(contract).toEqual(
      expect.objectContaining({
        id: 'HORIZONTAL_SLOTS',
        templateType: 'PDP_MODAL',
      }),
    );
  });

  it('returns null for unresolved template aliases when template family mismatches', () => {
    const context = makeContext({
      bundleDesignTemplateData: { templateId: 'MODAL' },
      bundleDesignTemplate: 'PDP_INPAGE',
    });

    expect(context._getProductPageDesignPreset()).toBeNull();
    expect(context._getProductPageTemplateContract()).toBeNull();
  });

  it('returns null when no usable preset source exists', () => {
    const context = makeContext({
      bundleDesignPresetId: 'UNKNOWN_PRESET',
      bundleDesignTemplateData: { templateId: '' },
      bundleDesignTemplate: 'PDP_INPAGE',
    });

    expect(context._getProductPageDesignPreset()).toBeNull();
    expect(context._getProductPageTemplateContract()).toBeNull();
  });

  it('returns empty template type when template family is not recognized', () => {
    const context = makeContext({
      bundleDesignPresetId: 'GRID',
      bundleDesignTemplate: 'CUSTOM_TEMPLATE',
      bundleDesignTemplateData: { templateId: 'GRID' },
    });

    expect(context._getProductPageTemplateType()).toBe('');
    expect(context._getProductPageDesignPreset()).toBeNull();
    expect(context._getProductPageTemplateContract()).toBeNull();
  });

  it('normalizes lowercase EB alias payload values before contract lookup', () => {
    const context = makeContext({
      bundleDesignTemplateData: { templateId: 'cascade' },
      bundleDesignTemplate: 'PDP_INPAGE',
    });

    expect(context._getProductPageDesignPreset()).toBe('LIST');
  });
});
