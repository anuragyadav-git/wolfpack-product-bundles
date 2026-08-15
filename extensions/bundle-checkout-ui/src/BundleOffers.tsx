import '@shopify/ui-extensions/preact';
import {h, render} from 'preact';
import {useState} from 'preact/hooks';
import {
  useAppMetafields,
  useApplyCartLinesChange,
  useCartLines,
  useSessionToken,
  useTranslate,
} from '@shopify/ui-extensions/checkout/preact';

import {
  classifyOfferState,
  linesForOffer,
  mutateCheckoutOffer,
  type OfferCartLine,
} from './offer-mutations';

type CheckoutOffer = {
  key: string;
  groupKey: string;
  tierId: string;
  kind: 'addon' | 'gift';
  title: string;
  maxQuantity: number;
  eligibility: {type: 'QUANTITY' | 'AMOUNT'; value: number};
  discount: {type: 'PERCENTAGE'; value: number} | null;
  variants: Array<{id: string; title: string}>;
};

type BundleUiConfig = {
  name?: string;
  checkoutOffers?: CheckoutOffer[];
  pricing?: {
    method?: string;
    rules?: Array<{conditionType?: string}>;
    displayOptions?: {bundleQuantityOptions?: {enabled?: boolean}};
  } | null;
  boxSelection?: {isEnabled?: boolean} | null;
};

type OfferGroup = {
  id: string;
  parentToken: string;
  name: string;
  config: BundleUiConfig;
  offers: CheckoutOffer[];
};

function attributeValue(line: any, key: string) {
  return line?.attributes?.find((attribute: any) => attribute.key === key)?.value;
}

function parseConfig(value: string): BundleUiConfig | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function decodeParentMetrics(token: string, parentLine: any) {
  try {
    const [payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    const quantity = Array.isArray(decoded?.components)
      ? decoded.components.reduce((sum: number, line: any) => sum + Number(line?.quantity || 0), 0)
      : 0;
    return {
      quantity,
      amount: Number(attributeValue(parentLine, '_bundle_total_retail_cents') || 0) / 100,
    };
  } catch {
    return {quantity: 0, amount: 0};
  }
}

function activeOffers(offers: CheckoutOffer[], metrics: {quantity: number; amount: number}) {
  const byGroup = new Map<string, CheckoutOffer[]>();
  offers.forEach((offer) => {
    const group = byGroup.get(offer.groupKey) ?? [];
    group.push(offer);
    byGroup.set(offer.groupKey, group);
  });
  return [...byGroup.values()].flatMap((group) => {
    const eligible = group
      .filter((offer) => (offer.eligibility.type === 'AMOUNT' ? metrics.amount : metrics.quantity) >= offer.eligibility.value)
      .sort((a, b) => a.eligibility.value - b.eligibility.value);
    return eligible.length > 0 ? [eligible[eligible.length - 1]] : [];
  });
}

export function buildOfferGroups(lines: any[], appMetafields: any[]): OfferGroup[] {
  const configs = new Map<string, BundleUiConfig>();
  appMetafields
    .filter((entry) => entry?.target?.type === 'variant' && entry?.metafield?.key === 'bundle_ui_config')
    .forEach((entry) => {
      const config = parseConfig(entry.metafield.value);
      if (config) configs.set(entry.target.id, config);
    });

  return lines.flatMap((line) => {
    if (attributeValue(line, '_is_bundle_parent') !== 'true') return [];
    const id = attributeValue(line, '_wolfpackProductBundle:OfferId');
    const parentToken = attributeValue(line, '_wolfpack_bundle_runtime');
    const config = configs.get(line?.merchandise?.id);
    if (!id || !parentToken || !config || !Array.isArray(config.checkoutOffers)) return [];
    return [{
      id,
      parentToken,
      name: attributeValue(line, '_bundle_name') || config.name || '',
      config,
      offers: activeOffers(config.checkoutOffers, decodeParentMetrics(parentToken, line)),
    }];
  });
}

export function getReadOnlyStatusKeys(config: BundleUiConfig) {
  const method = String(config.pricing?.method ?? '').toLowerCase();
  const statuses: string[] = [];
  if (method === 'buy_x_get_y') statuses.push('buyXGetYStatus');
  if (method !== 'buy_x_get_y' && (config.pricing?.rules?.length ?? 0) > 1) {
    statuses.push('volumeStatus');
  }
  if (config.boxSelection?.isEnabled === true || config.pricing?.displayOptions?.bundleQuantityOptions?.enabled === true) {
    statuses.push('bundleQuantityOptionsStatus');
  }
  return statuses;
}

export function isOfferControlPending(
  pendingKey: string | null,
  groupId: string,
  offerKey: string,
) {
  return pendingKey === `${groupId}:${offerKey}`;
}

function BundleOffersExtension() {
  const lines = useCartLines() as unknown as OfferCartLine[];
  const appMetafields = useAppMetafields();
  const applyCartLinesChange = useApplyCartLinesChange();
  const sessionToken = useSessionToken();
  const translate = useTranslate();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groups = buildOfferGroups(lines, appMetafields);
  const serverUrl = appMetafields.find(
    (entry) => entry?.target?.type === 'shop' && entry?.metafield?.key === 'serverUrl',
  )?.metafield?.value?.replace(/\/$/, '');

  if (!serverUrl || groups.every((group) => group.offers.length === 0)) return null;

  const changeOffer = async (
    group: OfferGroup,
    offer: CheckoutOffer,
    selectedVariantId: string | null,
    quantity: number,
  ) => {
    setPendingKey(`${group.id}:${offer.key}`);
    setError(null);
    try {
      await mutateCheckoutOffer({
        offer,
        selectedVariantId,
        requestedQuantity: quantity,
        getLines: () => shopify.lines.value as unknown as OfferCartLine[],
        applyCartLinesChange: (change) => applyCartLinesChange(change),
        requestToken: async ({offerKey, variantId, quantity: requestedQuantity}) => {
          const authorization = await sessionToken.get();
          const response = await fetch(`${serverUrl}/api/checkout-bundle-offer-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authorization}`,
            },
            body: JSON.stringify({
              parentToken: group.parentToken,
              offerKey,
              selectedVariantId: variantId,
              quantity: requestedQuantity,
            }),
          });
          const body = await response.json().catch(() => null);
          if (!response.ok || !body?.token || !Array.isArray(body?.attributes)) {
            throw new Error(body?.error || String(translate('offerUpdateFailed')));
          }
          return {attributes: body.attributes};
        },
      });
    } catch {
      setError(String(translate('offerUpdateFailed')));
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <s-details>
      <s-summary slot="summary">{translate('bundleAndSave')}</s-summary>
      <s-stack direction="block" gap="base">
        {groups.map((group) => (
          <s-section key={group.id} heading={group.name || translate('bundleOffers')}>
            <s-stack direction="block" gap="small-300">
              {group.offers.map((offer) => {
                const offerLines = linesForOffer(lines, offer.key);
                const state = classifyOfferState(offerLines, offer.maxQuantity);
                const currentLine = offerLines[0];
                const selectedVariantId = currentLine?.merchandise.id ?? '';
                const quantity = currentLine?.quantity ?? 1;
                const pending = isOfferControlPending(pendingKey, group.id, offer.key);

                if (state.readOnly) {
                  return (
                    <s-banner key={offer.key} tone="info" heading={offer.title}>
                      {translate(state.reason === 'over-limit' ? 'offerOverLimitReadOnly' : 'offerMultipleVariantsReadOnly')}
                    </s-banner>
                  );
                }

                const selector = offer.kind === 'gift' && offer.variants.length === 1
                  ? (
                      <s-checkbox
                        label={offer.title}
                        checked={Boolean(selectedVariantId)}
                        disabled={pending}
                        onChange={(event) => {
                          const checked = (event.currentTarget as HTMLInputElement).checked;
                          void changeOffer(group, offer, checked ? offer.variants[0].id : null, checked ? 1 : 0);
                        }}
                      />
                    )
                  : (
                      <s-select
                        label={offer.title}
                        value={selectedVariantId}
                        disabled={pending}
                        onChange={(event) => {
                          const value = (event.currentTarget as HTMLSelectElement).value;
                          const replacementQuantity = currentLine ? quantity : 1;
                          void changeOffer(group, offer, value || null, value ? replacementQuantity : 0);
                        }}
                      >
                        <s-option value="">{translate('noAddon')}</s-option>
                        {offer.variants.map((variant) => (
                          <s-option key={variant.id} value={variant.id}>{variant.title}</s-option>
                        ))}
                      </s-select>
                    );

                return (
                  <s-stack key={offer.key} direction="block" gap="small-200">
                    {selector}
                    {selectedVariantId && offer.maxQuantity > 1 && (
                      <s-number-field
                        label={translate('quantity')}
                        min={1}
                        max={offer.maxQuantity}
                        step={1}
                        value={String(quantity)}
                        disabled={pending}
                        onChange={(event) => {
                          const nextQuantity = Number((event.currentTarget as HTMLInputElement).value);
                          void changeOffer(group, offer, selectedVariantId, nextQuantity);
                        }}
                      />
                    )}
                  </s-stack>
                );
              })}
              {getReadOnlyStatusKeys(group.config).map((status) => (
                <s-text key={status} color="subdued">{translate(status)}</s-text>
              ))}
            </s-stack>
          </s-section>
        ))}
        {error && <s-banner tone="critical">{error}</s-banner>}
      </s-stack>
    </s-details>
  );
}

export default function extension() {
  render(h(BundleOffersExtension, {}), document.body);
}
