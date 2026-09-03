describe('design-system runtime copy inventory', () => {
  const source = `
    const FPB_DEFAULTS = {
      nextButtonText: "Next",
      quantityEqualTo: "Add exactly {{conditionQuantity}} products",
    };
    const PPB_DEFAULTS = { footerFinishBtnText: "Done" };
    const DEFAULT_SHARED_CART_LABELS = { bundleContainsLabel: "Items" };
    function buildFpbLanguage(values) {
      return {
        general: {
          nextButtonText: languageField("nextButtonText", "Next Button Text", getField(values, "fpb.general.nextButtonText", FPB_DEFAULTS.nextButtonText)),
        },
        conditions: {
          equalTo: conditionField("Equal to rule message (Quantity)", getField(values, "fpb.conditions.quantity.equalTo", FPB_DEFAULTS.quantityEqualTo)),
        },
      };
    }
    function buildPpbLanguage(values) {
      return {
        footer: {
          footerFinishBtnText: languageField("footerFinishBtnText", "Done Button Text", getField(values, "ppb.footer.footerFinishBtnText", PPB_DEFAULTS.footerFinishBtnText)),
        },
      };
    }
    function buildSharedCartFields(values) {
      return {
        bundleContainsLabel: languageField("bundleContainsLabel", "Bundle Contains Label", getField(values, "shared.cartCheckout.bundleContainsLabel", DEFAULT_SHARED_CART_LABELS.bundleContainsLabel)),
      };
    }
  `;

  it('extracts canonical entries, defaults, and placeholders', () => {
    const { discoverRuntimeCopyFields } = require(
      '../../../design-system/scripts/copy-runtime-inventory.cjs'
    );

    expect(discoverRuntimeCopyFields(source)).toEqual([
      expect.objectContaining({
        id: 'fpb-next-button-text',
        family: 'FPB',
        field_name: 'nextButtonText',
        runtime_path: 'fpb.general.nextButtonText',
        fallback: 'Next',
        allowed_placeholders: [],
      }),
      expect.objectContaining({
        id: 'fpb-equal-to-rule-message-quantity',
        family: 'FPB',
        field_name: 'equal_to_rule_message_quantity',
        fallback: 'Add exactly {{conditionQuantity}} products',
        allowed_placeholders: ['conditionQuantity'],
      }),
      expect.objectContaining({
        id: 'ppb-footer-finish-btn-text',
        family: 'PPB',
        fallback: 'Done',
      }),
      expect.objectContaining({
        id: 'shared-bundle-contains-label',
        family: 'SHARED',
        fallback: 'Items',
      }),
    ]);
  });

  it('rejects duplicate family field IDs', () => {
    const { discoverRuntimeCopyFields } = require(
      '../../../design-system/scripts/copy-runtime-inventory.cjs'
    );
    const duplicate = source.replace(
      'nextButtonText: languageField',
      'duplicate: languageField("nextButtonText", "Duplicate", getField(values, "fpb.general.duplicate", FPB_DEFAULTS.nextButtonText)),\nnextButtonText: languageField',
    );

    expect(() => discoverRuntimeCopyFields(duplicate)).toThrow(
      'duplicate runtime copy field FPB:nextButtonText',
    );
  });
});
