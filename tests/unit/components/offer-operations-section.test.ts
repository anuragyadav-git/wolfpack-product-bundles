import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OfferOperationsSection } from '../../../app/routes/app/shared/OfferOperationsSection';

const handlers = {
  onPriorityChange: jest.fn(),
  onStopLowerPriorityChange: jest.fn(),
  onStartsAtChange: jest.fn(),
  onEndsAtChange: jest.fn(),
};

describe('OfferOperationsSection', () => {
  it('does not render outside the visibility section', () => {
    expect(renderToStaticMarkup(React.createElement(OfferOperationsSection, {
      active: false,
      state: { priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null },
      ...handlers,
    }))).toBe('');
  });

  it('renders saved priority, stop policy, and schedule bounds', () => {
    const html = renderToStaticMarkup(React.createElement(OfferOperationsSection, {
      active: true,
      state: {
        priority: 10,
        stopLowerPriority: true,
        startsAt: '2026-09-01T10:00:00.000Z',
        endsAt: '2026-09-02T10:00:00.000Z',
      },
      ...handlers,
    }));

    expect(html).toContain('value="10"');
    expect(html).toContain('checked="true"');
    expect(html).toContain('2026-09-01T10:00:00.000Z');
    expect(html).toContain('2026-09-02T10:00:00.000Z');
    expect(html).toContain('Shopify controls checkout discount dates and combinations');
  });
});
