import { useMemo, useState } from 'react';
import { i18n } from '../../../i18n/config';
import {
  mergeVisibleCountrySelection,
  type OfferCountryTargetingMode,
} from '../../../lib/offer-country-targeting';
import {
  buildShopifyCountryOptions,
} from '../../../lib/shopify-country-options';
import type { SpecificLinkOfferAdminState } from '../../../lib/specific-link-offer-admin';
import { ConfigureHelpPopover } from '../_shared/bundle-configure/ConfigureHelpPopover';

interface CountryTargetingSectionProps {
  active: boolean;
  state: SpecificLinkOfferAdminState;
  onEnabledChange: (enabled: boolean) => void;
  onModeChange: (mode: OfferCountryTargetingMode) => void;
  onCountryCodesChange: (countryCodes: string[]) => void;
}

export function CountryTargetingSection({
  active,
  state,
  onEnabledChange,
  onModeChange,
  onCountryCodesChange,
}: CountryTargetingSectionProps) {
  const [query, setQuery] = useState('');
  const countryOptions = useMemo(
    () => buildShopifyCountryOptions(i18n.language || 'en'),
    [],
  );
  if (!active) return null;

  const normalizedQuery = query.trim().toLocaleLowerCase(i18n.language || 'en');
  const visibleOptions = normalizedQuery
    ? countryOptions
      .filter((option) => option.searchValue.includes(normalizedQuery))
      .slice(0, 30)
    : [];
  const visibleCountryCodes = visibleOptions.map((option) => option.code);
  const labelByCountryCode = new Map<string, string>(
    countryOptions.map((option) => [option.code, option.label]),
  );

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-heading>{i18n.t('countryTargeting.title')}</s-heading>
          <ConfigureHelpPopover tooltipKey="countryTargeting" />
        </s-stack>
        <s-paragraph>{i18n.t('countryTargeting.description')}</s-paragraph>
        <s-banner tone="info">
          <s-paragraph>{i18n.t('countryTargeting.shopifyOwnership')}</s-paragraph>
        </s-banner>
        <s-switch
          label={i18n.t('countryTargeting.enableLabel')}
          details={i18n.t('countryTargeting.enableDetails')}
          checked={state.countryTargetingEnabled}
          onChange={(event) => (
            onEnabledChange(event.currentTarget.checked === true)
          )}
        />
        <s-select
          label={i18n.t('countryTargeting.modeLabel')}
          value={state.countryTargetingMode}
          disabled={!state.countryTargetingEnabled}
          onChange={(event) => (
            onModeChange(event.currentTarget.value as OfferCountryTargetingMode)
          )}
        >
          <s-option value="include">
            {i18n.t('countryTargeting.modeInclude')}
          </s-option>
          <s-option value="exclude">
            {i18n.t('countryTargeting.modeExclude')}
          </s-option>
        </s-select>
        <s-search-field
          label={i18n.t('countryTargeting.searchLabel')}
          placeholder={i18n.t('countryTargeting.searchPlaceholder')}
          value={query}
          disabled={!state.countryTargetingEnabled}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        {state.countryCodes.length > 0 ? (
          <s-stack direction="inline" gap="small">
            {state.countryCodes.map((countryCode) => {
              const countryLabel = labelByCountryCode.get(countryCode) ?? countryCode;
              return (
                <s-clickable-chip
                  key={countryCode}
                  removable
                  accessibilityLabel={i18n.t('countryTargeting.removeCountry', {
                    country: countryLabel,
                  })}
                  onRemove={() => onCountryCodesChange(
                    state.countryCodes.filter((value) => value !== countryCode),
                  )}
                >
                  {countryLabel}
                </s-clickable-chip>
              );
            })}
          </s-stack>
        ) : (
          <s-paragraph>{i18n.t('countryTargeting.noCountries')}</s-paragraph>
        )}
        {visibleOptions.length > 0 && (
          <s-choice-list
            label={i18n.t('countryTargeting.resultsLabel')}
            multiple
            values={state.countryCodes}
            onChange={(event) => onCountryCodesChange(
              mergeVisibleCountrySelection({
                currentCountryCodes: state.countryCodes,
                visibleCountryCodes,
                selectedVisibleCountryCodes: event.currentTarget.values ?? [],
              }),
            )}
          >
            {visibleOptions.map((option) => (
              <s-choice key={option.code} value={option.code}>
                {option.label}
              </s-choice>
            ))}
          </s-choice-list>
        )}
        {normalizedQuery && visibleOptions.length === 0 && (
          <s-paragraph>{i18n.t('countryTargeting.noResults')}</s-paragraph>
        )}
      </s-stack>
    </s-section>
  );
}
