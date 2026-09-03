import { ProductPageConfigLifecycleMethods } from '../../../app/assets/widgets/product-page/methods/config-lifecycle-methods';

describe('PPB template markers and preset resolution', () => {
  const getDefaultBody = () => ({
    setAttribute: jest.fn(),
  });

  let originalDocument: any;
  let originalBody: any;

  beforeEach(() => {
    originalDocument = (global as any).document;
    originalBody = getDefaultBody();
    (global as any).document = { body: originalBody };
  });

  afterEach(() => {
    (global as any).document = originalDocument;
  });

  it('marks canonical template identifiers on container and steps container', () => {
    const attributes: Record<string, string> = {};
    const setAttribute = jest.fn((name: string, value: string) => {
      attributes[name] = value;
    });
    const container = {
      dataset: {},
      style: {},
      classList: {
        toggle: jest.fn(),
      },
      setAttribute,
      setAttributeCalls: attributes,
    } as any;

    const stepsContainer = {
      dataset: {},
      classList: {
        toggle: jest.fn(),
      },
    } as any;

    const context = {
      ...ProductPageConfigLifecycleMethods,
      container,
      elements: {
        stepsContainer,
      },
      selectedBundle: {
        bundleDesignTemplate: 'PDP_INPAGE',
        bundleDesignTemplateData: {
          templateId: 'CASCADE',
        },
      },
      _getProductPageTemplateType: () => 'PDP_INPAGE',
      _getProductPageTemplateContract: () => ({
        templateType: 'PDP_INPAGE',
        id: 'LIST',
        slots: { orientation: 'horizontal' },
      }),
      ensureProductPageTemplateStylesheet: jest.fn(),
    } as any;

    context._markProductPageTemplate();

    expect(container.dataset.ppbTemplateType).toBe('PDP_INPAGE');
    expect(container.dataset.ppbDesignPreset).toBe('LIST');
    expect(container.dataset.ppbTemplateId).toBe('LIST');
    expect(stepsContainer.dataset.ppbTemplateType).toBe('PDP_INPAGE');
    expect(stepsContainer.dataset.ppbDesignPreset).toBe('LIST');
    expect(stepsContainer.dataset.ppbTemplateId).toBe('LIST');
    expect(attributes).toMatchObject({
      'template-id': 'LIST',
      'template-type': 'PDP_INPAGE',
    });
  });

  it('marks modal slot orientation on both container and steps container', () => {
    const bodySetAttribute = originalBody.setAttribute as jest.Mock;
    let bodyTemplateId = '';
    let bodyTemplateType = '';

    bodySetAttribute.mockImplementation((name: string, value: string) => {
      if (name === 'wpbmix-template-id') {
        bodyTemplateId = value;
      }
      if (name === 'wpbmix-template-type') {
        bodyTemplateType = value;
      }
      return undefined as any;
    });

    const container = {
      dataset: {},
      style: {},
      classList: {
        toggle: jest.fn(),
      },
      setAttribute: jest.fn(),
    } as any;

    const stepsContainer = {
      dataset: {},
      classList: {
        toggle: jest.fn(),
      },
    } as any;

    const context = {
      ...ProductPageConfigLifecycleMethods,
      container,
      elements: {
        stepsContainer,
      },
      selectedBundle: {
        bundleDesignTemplate: 'PDP_MODAL',
        bundleDesignTemplateData: {
          templateId: 'SIMPLIFIED',
        },
      },
      _getProductPageTemplateType: () => 'PDP_MODAL',
      _getProductPageTemplateContract: () => ({
        templateType: 'PDP_MODAL',
        id: 'VERTICAL_SLOTS',
        slots: { orientation: 'vertical' },
      }),
      ensureProductPageTemplateStylesheet: jest.fn(),
    } as any;

    context._markProductPageTemplate();

    expect(container.dataset.ppbTemplateId).toBe('VERTICAL_SLOTS');
    expect(container.dataset.ppbSlotOrientation).toBe('vertical');
    expect(stepsContainer.dataset.ppbTemplateId).toBe('VERTICAL_SLOTS');
    expect(stepsContainer.dataset.ppbSlotOrientation).toBe('vertical');
    expect(container.dataset.ppbDesignPreset).toBe('VERTICAL_SLOTS');
    expect(bodyTemplateId).toBe('VERTICAL_SLOTS');
    expect(bodyTemplateType).toBe('PDP_MODAL');
    expect(bodySetAttribute).toHaveBeenCalledWith('wpbmix-template-id', 'VERTICAL_SLOTS');
    expect(bodySetAttribute).toHaveBeenCalledWith('wpbmix-template-type', 'PDP_MODAL');
  });

  it('supports EB template aliases when resolving presets', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      selectedBundle: {
        bundleDesignTemplate: 'PDP_INPAGE',
        bundleDesignTemplateData: {
          templateId: 'COGNIVE',
        },
      },
      _getProductPageTemplateType: () => 'PDP_INPAGE',
      container: {
        dataset: {},
        classList: {
          toggle: jest.fn(),
        },
      },
      elements: {
        stepsContainer: {
          dataset: {},
          classList: {
            toggle: jest.fn(),
          },
        },
      },
      ensureProductPageTemplateStylesheet: jest.fn(),
    } as any;

    expect(context._getProductPageDesignPreset()).toBe('GRID');
    const contract = context._getProductPageTemplateContract();
    expect(contract?.id).toBe('GRID');
  });

  it('does not infer List/Grid path when contract cannot be resolved', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      selectedBundle: {
        bundleDesignTemplate: 'CUSTOM_TEMPLATE',
        bundleDesignTemplateData: {
          templateId: 'MODAL',
        },
      },
      _getProductPageTemplateType: () => '',
      _getProductPageTemplateContract: () => null,
      _getProductPageDesignPreset: () => null,
      container: { dataset: {} },
      elements: {
        stepsContainer: {
          dataset: {},
          classList: { toggle: jest.fn() },
        },
      },
      _isProductPageGridTemplate: () => false,
      _isProductPageCascadeTemplate: () => false,
      ensureProductPageTemplateStylesheet: jest.fn(),
    } as any;

    expect(context._isProductPageInpageTemplate()).toBe(false);
    expect(context._isProductPageModalSlotTemplate?.()).toBeUndefined();
    expect(context._isProductPageGridTemplate()).toBe(false);
    expect(context._isProductPageCascadeTemplate()).toBe(false);
  });

  it('loads the modal stylesheet when the payload has no template contract', async () => {
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalHtmlLinkElement = (global as any).HTMLLinkElement;
    const appendedLinks: any[] = [];

    class FakeLink {
      rel = '';
      href = '';
      dataset: Record<string, string> = {};
      sheet = null;
      private listeners: Record<string, () => void> = {};

      addEventListener(name: string, listener: () => void) {
        this.listeners[name] = listener;
      }

      dispatch(name: string) {
        this.listeners[name]?.();
      }
    }

    (global as any).HTMLLinkElement = FakeLink;
    (global as any).window = {
      __WOLFPACK_PPB_TEMPLATE_CSS_URLS__: {
        HORIZONTAL_SLOTS: '/assets/modal.css',
      },
    };
    (global as any).document = {
      querySelectorAll: () => [],
      createElement: () => new FakeLink(),
      head: {
        appendChild(link: FakeLink) {
          appendedLinks.push(link);
        },
      },
    };

    try {
      const context = {
        ...ProductPageConfigLifecycleMethods,
        _getProductPageTemplateContract: () => null,
      } as any;
      const stylesheetReady = context.ensureProductPageTemplateStylesheet('', null);

      expect(appendedLinks).toHaveLength(1);
      expect(appendedLinks[0]).toMatchObject({
        rel: 'stylesheet',
        href: '/assets/modal.css',
        dataset: { wpbPpbTemplateCss: 'HORIZONTAL_SLOTS' },
      });

      appendedLinks[0].dispatch('load');
      await stylesheetReady;
    } finally {
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).HTMLLinkElement = originalHtmlLinkElement;
    }
  });

  it('retries the modal stylesheet after template asset URLs become available', async () => {
    jest.useFakeTimers();
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalHtmlLinkElement = (global as any).HTMLLinkElement;
    const appendedLinks: any[] = [];

    class FakeLink {
      rel = '';
      href = '';
      dataset: Record<string, string> = {};
      sheet = null;
      private listeners: Record<string, () => void> = {};

      addEventListener(name: string, listener: () => void) {
        this.listeners[name] = listener;
      }
    }

    (global as any).HTMLLinkElement = FakeLink;
    (global as any).window = {};
    (global as any).document = {
      querySelectorAll: () => [],
      createElement: () => new FakeLink(),
      head: {
        appendChild(link: FakeLink) {
          appendedLinks.push(link);
        },
      },
    };

    try {
      const context = {
        ...ProductPageConfigLifecycleMethods,
        _getProductPageTemplateContract: () => null,
      } as any;

      await context.ensureProductPageTemplateStylesheet('', null);
      expect(appendedLinks).toHaveLength(0);

      (global as any).window.__WOLFPACK_PPB_TEMPLATE_CSS_URLS__ = {
        HORIZONTAL_SLOTS: '/assets/modal.css',
      };
      await jest.advanceTimersByTimeAsync(100);

      expect(appendedLinks).toHaveLength(1);
      expect(appendedLinks[0]).toMatchObject({
        href: '/assets/modal.css',
        dataset: { wpbPpbTemplateCss: 'HORIZONTAL_SLOTS' },
      });
    } finally {
      jest.useRealTimers();
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).HTMLLinkElement = originalHtmlLinkElement;
    }
  });

  it('removes slot orientation markers for in-page templates', () => {
    const bodySetAttribute = jest.fn();
    const body = { setAttribute: bodySetAttribute };
    const originalDocument = (global as any).document;
    (global as any).document = { body };

    const container = {
      dataset: { ppbSlotOrientation: 'vertical' },
      style: {},
      classList: {
        toggle: jest.fn(),
      },
      setAttribute: jest.fn(),
    } as any;

    const stepsContainer = {
      dataset: { ppbSlotOrientation: 'horizontal' },
      classList: {
        toggle: jest.fn(),
      },
    } as any;

    const context = {
      ...ProductPageConfigLifecycleMethods,
      container,
      elements: {
        stepsContainer,
      },
      selectedBundle: {
        bundleDesignTemplate: 'PDP_INPAGE',
        bundleDesignTemplateData: {
          templateId: 'CASCADE',
        },
      },
      _getProductPageTemplateType: () => 'PDP_INPAGE',
      _getProductPageTemplateContract: () => ({
        templateType: 'PDP_INPAGE',
        id: 'LIST',
      }),
      ensureProductPageTemplateStylesheet: jest.fn(),
    } as any;

    context._markProductPageTemplate();

    expect(container.dataset.ppbSlotOrientation).toBeUndefined();
    expect(stepsContainer.dataset.ppbSlotOrientation).toBeUndefined();
    expect(container.dataset.ppbTemplateType).toBe('PDP_INPAGE');
    expect(stepsContainer.dataset.ppbTemplateType).toBe('PDP_INPAGE');
    expect(bodySetAttribute).toHaveBeenCalledWith('wpbmix-template-id', 'LIST');
    expect(bodySetAttribute).toHaveBeenCalledWith('wpbmix-template-type', 'PDP_INPAGE');

    (global as any).document = originalDocument;
  });
});
