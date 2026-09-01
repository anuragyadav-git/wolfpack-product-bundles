import { i18n } from '../../../i18n/config';
import type { SpecificLinkOfferAdminState } from '../../../lib/specific-link-offer-admin';
import { ConfigureHelpPopover } from '../_shared/bundle-configure/ConfigureHelpPopover';

interface SpecificLinkOfferSectionProps {
  active: boolean;
  busy: boolean;
  generatedLink: string | null;
  state: SpecificLinkOfferAdminState;
  onEnabledChange: (enabled: boolean) => void;
  onGenerate: () => void;
  onCopy: (link: string) => void;
  onRevoke: () => void;
}

const statusTone = {
  not_generated: 'neutral',
  active: 'success',
  revoked: 'critical',
  expired: 'warning',
} as const;

export function SpecificLinkOfferSection({
  active,
  busy,
  generatedLink,
  state,
  onEnabledChange,
  onGenerate,
  onCopy,
  onRevoke,
}: SpecificLinkOfferSectionProps) {
  if (!active) return null;

  const canEnable = state.status === 'active' || state.enabled;
  const canRevoke = state.status === 'active';
  const generateLabel = state.status === 'not_generated'
    ? i18n.t('specificLinkOffer.generate')
    : i18n.t('specificLinkOffer.regenerate');

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-heading>{i18n.t('specificLinkOffer.title')}</s-heading>
          <ConfigureHelpPopover tooltipKey="specificLinkAccess" />
        </s-stack>
        <s-paragraph>{i18n.t('specificLinkOffer.description')}</s-paragraph>
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-text>{i18n.t('specificLinkOffer.statusLabel')}</s-text>
          <s-badge tone={statusTone[state.status]}>
            {i18n.t(`specificLinkOffer.status.${state.status}`)}
          </s-badge>
        </s-stack>
        <s-switch
          data-action="toggle-specific-link"
          label={i18n.t('specificLinkOffer.enableLabel')}
          details={i18n.t('specificLinkOffer.enableDetails')}
          checked={state.enabled}
          disabled={busy || !canEnable}
          onChange={(event) => onEnabledChange(event.currentTarget.checked === true)}
        />
        <s-stack direction="inline" gap="base">
          <s-button
            data-action="generate-specific-link"
            variant="primary"
            loading={busy}
            onClick={onGenerate}
          >
            {generateLabel}
          </s-button>
          {canRevoke ? (
            <s-button
              data-action="revoke-specific-link"
              variant="secondary"
              tone="critical"
              disabled={busy}
              onClick={onRevoke}
            >
              {i18n.t('specificLinkOffer.revoke')}
            </s-button>
          ) : null}
        </s-stack>
        {generatedLink ? (
          <s-box padding="base" background="subdued" borderRadius="base">
            <s-stack direction="block" gap="small">
              <s-text>{generatedLink}</s-text>
              <s-button
                data-action="copy-specific-link"
                variant="tertiary"
                onClick={() => onCopy(generatedLink)}
              >
                {i18n.t('specificLinkOffer.copy')}
              </s-button>
              <s-paragraph>
                {i18n.t('specificLinkOffer.oneTimeNotice')}
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : null}
      </s-stack>
    </s-section>
  );
}
