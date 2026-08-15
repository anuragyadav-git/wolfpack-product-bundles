import { claimFullPageWidgetInitialization } from '../../../app/assets/widgets/full-page/initialization-guard.js';

describe('FullPageWidgetInitialization', () => {
  it('claims an idle container synchronously', () => {
    const container = { dataset: {} as Record<string, string> };

    expect(claimFullPageWidgetInitialization(container)).toBe(true);
    expect(container.dataset.initializing).toBe('true');
  });

  it('rejects a concurrent claim while initialization is in progress', () => {
    const container = {
      dataset: { initializing: 'true' } as Record<string, string>,
    };

    expect(claimFullPageWidgetInitialization(container)).toBe(false);
  });

  it('rejects a claim after initialization completes', () => {
    const container = {
      dataset: { initialized: 'true' } as Record<string, string>,
    };

    expect(claimFullPageWidgetInitialization(container)).toBe(false);
  });

  it('allows retry after a failed initialization releases its claim', () => {
    const container = {
      dataset: { initializing: 'true' } as Record<string, string>,
    };

    delete container.dataset.initializing;

    expect(claimFullPageWidgetInitialization(container)).toBe(true);
  });
});
