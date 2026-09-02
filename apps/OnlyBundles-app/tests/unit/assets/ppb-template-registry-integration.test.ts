// eslint-disable-next-line @typescript-eslint/no-require-imports
const { gridTemplateMethods } = require('../../../app/assets/widgets/product-page/templates/grid-template.ts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { modalSlotTemplateMethods } = require('../../../app/assets/widgets/product-page/templates/modal-slot-template.ts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TemplateDesignSystem } = require('../../../app/assets/widgets/shared/template-design-system.ts');

export {};

describe('PPB template registry integration', () => {
  it('uses the registry resolver for grid template detection', () => {
    class ProductPageWidget {
      _getProductPageTemplateType() {
        return 'PDP_INPAGE';
      }

      _getProductPageDesignPreset() {
        return 'GRID';
      }

      _getProductPageTemplateContract() {
        return TemplateDesignSystem.resolvePpbTemplate({ templateType: 'PDP_INPAGE', designPreset: 'GRID' });
      }
    }

    Object.assign(ProductPageWidget.prototype, gridTemplateMethods);
    const widget = new ProductPageWidget() as any;

    expect(widget._isProductPageGridTemplate()).toBe(true);
  });

  it('uses the registry resolver for modal vertical slot detection', () => {
    let templatePreset = 'VERTICAL_SLOTS';

    class ProductPageWidget {
      _getProductPageTemplateType() {
        return 'PDP_MODAL';
      }

      _getProductPageDesignPreset() {
        return templatePreset;
      }

      _getProductPageTemplateContract() {
        return TemplateDesignSystem.resolvePpbTemplate({ templateType: 'PDP_MODAL', designPreset: templatePreset });
      }
    }

    Object.assign(ProductPageWidget.prototype, modalSlotTemplateMethods);
    const widget = new ProductPageWidget() as any;

    expect(widget._isProductPageModalSlotTemplate()).toBe(true);
    expect(widget._usesVerticalModalSlotLayout()).toBe(true);

    templatePreset = 'HORIZONTAL_SLOTS';
    expect(widget._usesVerticalModalSlotLayout()).toBe(false);
  });

  it('wires Cascade/List detection to the template contract', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('node:fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('node:path');
    const source = fs.readFileSync(path.join(process.cwd(), 'app/assets/widgets/product-page/templates/cascade-template.ts'), 'utf8');

    expect(source).toContain('_getProductPageTemplateContract');
    expect(source).not.toContain('attachProductPageTemplateMethods');
    expect(source).toContain("this._getProductPageTemplateContract?.()?.id === 'LIST'");
  });
});
