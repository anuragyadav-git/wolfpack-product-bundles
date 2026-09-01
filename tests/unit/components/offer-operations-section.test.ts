import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OfferOperationsSection } from '../../../app/routes/app/shared/OfferOperationsSection';

const handlers = {
  onPriorityChange: jest.fn(),
  onStopLowerPriorityChange: jest.fn(),
  onScheduleModeChange: jest.fn(),
  onStartsAtChange: jest.fn(),
  onEndsAtChange: jest.fn(),
  onRecurrenceFrequencyChange: jest.fn(),
  onRecurrenceAnchorDateChange: jest.fn(),
  onRecurrenceWindowStartChange: jest.fn(),
  onRecurrenceWindowEndChange: jest.fn(),
  onRecurrenceTerminationChange: jest.fn(),
  onRecurrenceEndsOnChange: jest.fn(),
  onRecurrenceRunCountChange: jest.fn(),
};

const state = {
  priority: 100,
  stopLowerPriority: false,
  scheduleMode: 'always' as const,
  startsAt: null,
  endsAt: null,
  recurrenceFrequency: 'weekly' as const,
  recurrenceTimezone: 'America/New_York',
  recurrenceAnchorDate: null,
  recurrenceWindowStart: '09:00',
  recurrenceWindowEnd: '17:00',
  recurrenceTermination: 'never' as const,
  recurrenceEndsOn: null,
  recurrenceRunCount: null,
};

describe('OfferOperationsSection', () => {
  it('does not render outside the visibility section', () => {
    expect(renderToStaticMarkup(React.createElement(OfferOperationsSection, {
      active: false,
      state,
      ...handlers,
    }))).toBe('');
  });

  it('renders saved priority, stop policy, and schedule bounds', () => {
    const html = renderToStaticMarkup(React.createElement(OfferOperationsSection, {
      active: true,
      state: {
        ...state,
        priority: 10,
        stopLowerPriority: true,
        scheduleMode: 'one_time',
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
    expect(html).toContain('<s-banner tone="info" dismissible="true"');
  });

  it('renders recurrence controls only for recurring mode', () => {
    const html = renderToStaticMarkup(React.createElement(OfferOperationsSection, {
      active: true,
      state: {
        ...state,
        scheduleMode: 'recurring',
        recurrenceAnchorDate: '2026-09-06',
      },
      ...handlers,
    }));

    expect(html).toContain('America/New_York');
    expect(html).toContain('2026-09-06');
    expect(html).toContain('Monthly');
    expect(html).not.toContain('Enter an ISO 8601 instant');
    expect(html.match(/<s-banner tone="info" dismissible="true"/g)).toHaveLength(2);
  });
});
