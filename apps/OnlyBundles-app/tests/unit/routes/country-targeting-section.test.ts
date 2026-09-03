import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { CountryTargetingSection } from '../../../app/routes/app/shared/CountryTargetingSection';
import type { SpecificLinkOfferAdminState } from '../../../app/lib/specific-link-offer-admin';

const state: SpecificLinkOfferAdminState = {
  enabled: false,
  status: 'not_generated',
  expiresAt: null,
  ruleVersion: null,
  priority: 100,
  stopLowerPriority: false,
  scheduleMode: 'always',
  startsAt: null,
  endsAt: null,
  recurrenceFrequency: null,
  recurrenceTimezone: 'UTC',
  recurrenceAnchorDate: null,
  recurrenceWindowStart: null,
  recurrenceWindowEnd: null,
  recurrenceTermination: 'never',
  recurrenceEndsOn: null,
  recurrenceRunCount: null,
  countryTargetingEnabled: true,
  countryTargetingMode: 'include',
  countryCodes: ['IN'],
};

describe('CountryTargetingSection', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
  });

  it('does not expose targeting controls outside the active visibility section', () => {
    flushSync(() => {
      root.render(React.createElement(CountryTargetingSection, {
        active: false,
        state,
        onEnabledChange: jest.fn(),
        onModeChange: jest.fn(),
        onCountryCodesChange: jest.fn(),
      }));
    });

    expect(container.querySelector('s-section')).toBeNull();
  });

  it('exposes the persisted targeting state in the active visibility section', () => {
    flushSync(() => {
      root.render(React.createElement(CountryTargetingSection, {
        active: true,
        state,
        onEnabledChange: jest.fn(),
        onModeChange: jest.fn(),
        onCountryCodesChange: jest.fn(),
      }));
    });

    const toggle = container.querySelector('s-switch');
    const mode = container.querySelector('s-select');
    const selectedCountry = container.querySelector('s-clickable-chip');
    const ownershipBanner = container.querySelector('s-banner[tone="info"]');

    expect(toggle?.hasAttribute('checked')).toBe(true);
    expect(mode?.getAttribute('value')).toBe('include');
    expect(selectedCountry?.textContent).toBe('India');
    expect(ownershipBanner?.hasAttribute('dismissible')).toBe(true);
  });
});
