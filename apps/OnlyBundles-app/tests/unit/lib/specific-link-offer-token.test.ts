import {
  SPECIFIC_LINK_OFFER_QUERY_PARAM,
  buildSpecificLinkOfferUrl,
  createSpecificLinkOfferToken,
  hashSpecificLinkOfferToken,
} from '../../../app/lib/specific-link-offer-token.server';

describe('specific-link offer tokens', () => {
  const input = { token: 'a'.repeat(43) };

  it('creates an opaque random credential and stores only its one-way hash', () => {
    const created = createSpecificLinkOfferToken(input);

    expect(created.token).toBe(input.token);
    expect(created.tokenHash).toBe(hashSpecificLinkOfferToken(created.token));
    expect(created.tokenHash).not.toContain(created.token);
  });

  it('generates a high-entropy URL-safe token by default', () => {
    expect(createSpecificLinkOfferToken().token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('adds the campaign token without dropping query parameters or fragments', () => {
    const url = buildSpecificLinkOfferUrl({
      destination: 'https://shop.example/products/bundle?utm_source=email#offers',
      token: 'identifier.signature',
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get('utm_source')).toBe('email');
    expect(parsed.searchParams.get(SPECIFIC_LINK_OFFER_QUERY_PARAM)).toBe('identifier.signature');
    expect(parsed.hash).toBe('#offers');
  });
});
