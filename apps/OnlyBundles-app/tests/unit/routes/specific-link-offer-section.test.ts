import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { SpecificLinkOfferSection } from '../../../app/routes/app/shared/SpecificLinkOfferSection';

describe('SpecificLinkOfferSection', () => {
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

  it('exposes delivery and delegates generate, copy, and revoke behavior', () => {
    const onGenerate = jest.fn();
    const onEnabledChange = jest.fn();
    const onCopy = jest.fn();
    const onRevoke = jest.fn();

    flushSync(() => {
      root.render(React.createElement(SpecificLinkOfferSection, {
        active: true,
        busy: false,
        generatedLink: 'https://test.myshopify.com/products/bundle?wpb_offer=token',
        state: {
          enabled: false,
          status: 'active',
          expiresAt: null,
          ruleVersion: 1,
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
          countryTargetingEnabled: false,
          countryTargetingMode: 'include',
          countryCodes: [],
        },
        onGenerate,
        onEnabledChange,
        onCopy,
        onRevoke,
      }));
    });

    const generate = container.querySelector('[data-action="generate-specific-link"]');
    const toggle = container.querySelector('[data-action="toggle-specific-link"]');
    const copy = container.querySelector('[data-action="copy-specific-link"]');
    const revoke = container.querySelector('[data-action="revoke-specific-link"]');

    flushSync(() => {
      generate?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      copy?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      revoke?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(toggle).not.toBeNull();
    expect(onCopy).toHaveBeenCalledWith('https://test.myshopify.com/products/bundle?wpb_offer=token');
    expect(onRevoke).toHaveBeenCalledTimes(1);
  });
});
