/**
 * Unit tests for FullPagePreset.
 *
 * Issue: feedback-jun26-3 (phase 3c — wire preset attribute on FPB container)
 */
export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FullPagePreset } = require('../../../app/assets/widgets/shared/full-page-preset.js');

describe('FullPagePreset.resolvePresetAttr', () => {
  it('returns an empty preset when bundle has no preset fields', () => {
    expect(FullPagePreset.resolvePresetAttr({})).toBe('');
    expect(FullPagePreset.resolvePresetAttr(null)).toBe('');
    expect(FullPagePreset.resolvePresetAttr(undefined)).toBe('');
  });

  it('keeps STANDARD as the canonical Standard preset', () => {
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'STANDARD' })).toBe('STANDARD');
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'standard' })).toBe('STANDARD');
  });

  it('does not coerce unsupported legacy aliases', () => {
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'DEFAULT' })).toBe('');
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'DEFAULT_FBP' })).toBe('');
  });

  it('passes through CLASSIC / COMPACT / HORIZONTAL', () => {
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'CLASSIC' })).toBe('CLASSIC');
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'COMPACT' })).toBe('COMPACT');
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'HORIZONTAL' })).toBe('HORIZONTAL');
  });

  it('uppercases lowercase preset values', () => {
    expect(FullPagePreset.resolvePresetAttr({ bundleDesignPresetId: 'horizontal' })).toBe('HORIZONTAL');
  });

  it('does not coerce unrelated fields', () => {
    expect(FullPagePreset.resolvePresetAttr({ foo: 'CLASSIC' })).toBe('');
  });
});

describe('FullPagePreset.resolveTemplateAttr', () => {
  it('returns empty template when missing', () => {
    expect(FullPagePreset.resolveTemplateAttr({})).toBe('');
    expect(FullPagePreset.resolveTemplateAttr(null)).toBe('');
  });

  it('uppercases and trims the template value', () => {
    expect(FullPagePreset.resolveTemplateAttr({ bundleDesignTemplate: '  fbp_side_footer ' })).toBe('FBP_SIDE_FOOTER');
  });
});

describe('FullPagePreset.markContainer', () => {
  function makeContainer() {
    return { dataset: {} as Record<string, string> };
  }

  it('writes both data attributes on the container', () => {
    const container = makeContainer();
    FullPagePreset.markContainer(container, { bundleDesignPresetId: 'HORIZONTAL', bundleDesignTemplate: 'FBP_SIDE_FOOTER' });
    expect(container.dataset.fpbDesignPreset).toBe('HORIZONTAL');
    expect(container.dataset.fpbTemplate).toBe('FBP_SIDE_FOOTER');
  });

  it('does not write preset/template attributes when bundle is empty', () => {
    const container = makeContainer();
    FullPagePreset.markContainer(container, {});
    expect(container.dataset.fpbDesignPreset).toBeUndefined();
    expect(container.dataset.fpbTemplate).toBeUndefined();
  });

  it('clears stale template/preset attributes when resolved values disappear', () => {
    const container = makeContainer();
    FullPagePreset.markContainer(container, {
      bundleDesignPresetId: 'HORIZONTAL',
      bundleDesignTemplate: 'FBP_SIDE_FOOTER',
    });
    expect(container.dataset.fpbDesignPreset).toBe('HORIZONTAL');
    expect(container.dataset.fpbTemplate).toBe('FBP_SIDE_FOOTER');

    FullPagePreset.markContainer(container, {});
    expect(container.dataset.fpbDesignPreset).toBeUndefined();
    expect(container.dataset.fpbTemplate).toBeUndefined();
  });

  it('does nothing when container is null or has no dataset', () => {
    // Should not throw
    expect(() => FullPagePreset.markContainer(null, {})).not.toThrow();
    expect(() => FullPagePreset.markContainer({} as any, {})).not.toThrow();
  });

  it('is idempotent — second call rewrites the same values', () => {
    const container = makeContainer();
    FullPagePreset.markContainer(container, { bundleDesignPresetId: 'CLASSIC' });
    FullPagePreset.markContainer(container, { bundleDesignPresetId: 'CLASSIC' });
    expect(container.dataset.fpbDesignPreset).toBe('CLASSIC');
  });
});

describe('FullPagePreset.shouldUseReferenceStepBarTimeline', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'enables the reference step bar for FPB footer-side preset %s',
    (presetId) => {
      expect(FullPagePreset.shouldUseReferenceStepBarTimeline({
        layout: 'footer_side',
        presetId,
      })).toBe(true);
    },
  );

  it('does not enable the reference step bar for unsupported legacy aliases', () => {
    expect(FullPagePreset.shouldUseReferenceStepBarTimeline({
      layout: 'footer_side',
      presetId: 'DEFAULT',
    })).toBe(false);
  });

  it('does not enable the reference step bar outside the footer-side FPB layout', () => {
    expect(FullPagePreset.shouldUseReferenceStepBarTimeline({
      layout: 'footer_bottom',
      presetId: 'STANDARD',
    })).toBe(false);
  });
});
