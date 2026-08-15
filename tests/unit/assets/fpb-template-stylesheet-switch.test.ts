import { fullPageRuntimeCartSettingsMethods } from '../../../app/assets/widgets/full-page/methods/runtime-cart-settings-methods';

function createClassList() {
  return {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
  };
}

describe('FPB preset stylesheet ownership', () => {
  it('does not ask the widget runtime to load or switch stylesheets during marker updates', () => {
    const ensureFullPageTemplateStylesheet = jest.fn();
    const container = { dataset: {} as Record<string, string>, classList: createClassList() };
    const stepsContainer = { dataset: {} as Record<string, string>, classList: createClassList() };
    const context = {
      container,
      elements: { stepsContainer },
      getFullPageTemplate: () => 'FBP_SIDE_FOOTER',
      getFullPageDesignPreset: () => 'STANDARD',
      resolveFullPageCardCtaMode: () => 'icon',
      ensureFullPageTemplateStylesheet,
    };

    fullPageRuntimeCartSettingsMethods.applyFullPageDesignPresetMarker.call(context);

    expect(ensureFullPageTemplateStylesheet).not.toHaveBeenCalled();
  });
});
