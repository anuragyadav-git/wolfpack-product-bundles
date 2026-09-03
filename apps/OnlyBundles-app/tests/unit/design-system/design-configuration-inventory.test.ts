describe('design-system Design configuration inventory', () => {
  const source = `
    export const DESIGN_CONFIGURATION = [
      {
        title: "Brand Colors",
        fields: [
          { label: "Primary Color", value: "#000000", kind: "color", description: "Primary actions" },
          { label: "Font Weight", value: "Bold", kind: "select", options: ["Regular", "Bold"] },
          { label: "Bundle Loading GIF", value: "Default spinner", kind: "loadingSpinner" },
        ],
      },
    ];
    export const EXPERT_COLOR_CONTROLS = {
      General: [
        { key: "expert.general.toastBg", label: "Toast Background", value: "#ffffff", kind: "color" },
      ],
    };
  `;

  it('extracts base, contextual color, and disabled fields without an Expert mode', () => {
    const { discoverDesignConfigurationFields } = require(
      '../../../design-system/scripts/design-configuration-inventory.cjs'
    );

    expect(discoverDesignConfigurationFields(source)).toEqual([
      expect.objectContaining({
        id: 'design-primary-color',
        field_name: 'Primary Color',
        admin_label: 'Primary Color',
        type: 'color',
        default: '#000000',
        merchant_editable: true,
      }),
      expect.objectContaining({
        id: 'design-font-weight',
        allowed_values: ['Regular', 'Bold'],
      }),
      expect.objectContaining({
        id: 'design-bundle-loading-gif',
        merchant_editable: false,
        status: 'DESIGN_ONLY',
      }),
      expect.objectContaining({
        id: 'design-expert-general-toast-bg',
        field_name: 'expert.general.toastBg',
        dependencies: [],
        visibility_condition: 'visible component owns this color role',
      }),
    ]);
    expect(discoverDesignConfigurationFields(source)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'design-expert-controls-enabled' }),
    ]));
  });

  it('rejects duplicate field keys', () => {
    const { discoverDesignConfigurationFields } = require(
      '../../../design-system/scripts/design-configuration-inventory.cjs'
    );
    const duplicate = source.replace(
      '{ label: "Primary Color",',
      '{ key: "expert.general.toastBg", label: "Primary Color",',
    );

    expect(() => discoverDesignConfigurationFields(duplicate)).toThrow(
      'duplicate Design configuration key expert.general.toastBg',
    );
  });
});
