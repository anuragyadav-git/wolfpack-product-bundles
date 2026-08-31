import { createHash, randomBytes } from 'node:crypto';

export const SPECIFIC_LINK_OFFER_QUERY_PARAM = 'wpb_offer';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function hashSpecificLinkOfferToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSpecificLinkOfferToken(input: {
  token?: string;
} = {}) {
  const token = input.token ?? randomBytes(32).toString('base64url');
  if (!TOKEN_PATTERN.test(token)) {
    throw new Error('Specific-link offer credential is invalid');
  }

  return {
    token,
    tokenHash: hashSpecificLinkOfferToken(token),
  };
}

export function buildSpecificLinkOfferUrl(input: {
  destination: string;
  token: string;
}) {
  const url = new URL(input.destination);
  url.searchParams.set(SPECIFIC_LINK_OFFER_QUERY_PARAM, input.token);
  return url.toString();
}
