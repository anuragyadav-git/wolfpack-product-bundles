import { i18n } from '../../../i18n/config';
import type { OfferOperationsAdminState } from '../../../lib/offer-policy-admin';

interface OfferOperationsSectionProps {
  active: boolean;
  state: OfferOperationsAdminState;
  onPriorityChange: (priority: number) => void;
  onStopLowerPriorityChange: (stopLowerPriority: boolean) => void;
  onStartsAtChange: (startsAt: string | null) => void;
  onEndsAtChange: (endsAt: string | null) => void;
}

export function OfferOperationsSection({
  active,
  state,
  onPriorityChange,
  onStopLowerPriorityChange,
  onStartsAtChange,
  onEndsAtChange,
}: OfferOperationsSectionProps) {
  if (!active) return null;

  return (
    <s-section heading={i18n.t('offerOperations.title')}>
      <s-stack direction="block" gap="base">
        <s-paragraph>{i18n.t('offerOperations.description')}</s-paragraph>
        <s-banner tone="info">
          <s-paragraph>{i18n.t('offerOperations.shopifyOwnership')}</s-paragraph>
        </s-banner>
        <s-number-field
          label={i18n.t('offerOperations.priorityLabel')}
          details={i18n.t('offerOperations.priorityDetails')}
          min={1}
          max={9999}
          value={String(state.priority)}
          onInput={(event) => {
            const priority = Number((event.target as HTMLInputElement).value);
            if (Number.isInteger(priority)) onPriorityChange(priority);
          }}
        />
        <s-switch
          label={i18n.t('offerOperations.stopLowerLabel')}
          details={i18n.t('offerOperations.stopLowerDetails')}
          checked={state.stopLowerPriority}
          onChange={(event) => (
            onStopLowerPriorityChange(event.currentTarget.checked === true)
          )}
        />
        <s-divider />
        <s-text-field
          label={i18n.t('offerOperations.startsAtLabel')}
          details={i18n.t('offerOperations.dateDetails')}
          value={state.startsAt ?? ''}
          placeholder={i18n.t('offerOperations.datePlaceholder')}
          onInput={(event) => {
            const value = (event.target as HTMLInputElement).value.trim();
            onStartsAtChange(value || null);
          }}
        />
        <s-text-field
          label={i18n.t('offerOperations.endsAtLabel')}
          details={i18n.t('offerOperations.dateDetails')}
          value={state.endsAt ?? ''}
          placeholder={i18n.t('offerOperations.datePlaceholder')}
          onInput={(event) => {
            const value = (event.target as HTMLInputElement).value.trim();
            onEndsAtChange(value || null);
          }}
        />
      </s-stack>
    </s-section>
  );
}
