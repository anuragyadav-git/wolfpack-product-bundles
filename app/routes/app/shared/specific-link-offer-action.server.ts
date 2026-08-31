import { json } from '@remix-run/node';
import type { Session } from '@shopify/shopify-api';
import db from '../../../db.server';
import { BundleType } from '../../../constants/bundle';
import { buildFpbStorefrontUrl } from '../../../lib/fpb-storefront-url';
import {
  buildSpecificLinkOfferUrl,
  createSpecificLinkOfferToken,
} from '../../../lib/specific-link-offer-token.server';

const bundleSelect = {
  id: true,
  shopId: true,
  bundleType: true,
  shopifyProductHandle: true,
  publicNumber: true,
  offerPolicy: {
    select: {
      id: true,
      enabled: true,
      ruleVersion: true,
    },
  },
} as const;

function resolveStorefrontDestination(
  shop: string,
  bundle: {
    bundleType: string | null;
    shopifyProductHandle: string | null;
    publicNumber: number | null;
  },
) {
  if (bundle.bundleType === BundleType.PRODUCT_PAGE && bundle.shopifyProductHandle) {
    return `https://${shop}/products/${encodeURIComponent(bundle.shopifyProductHandle)}`;
  }
  if (bundle.bundleType === BundleType.FULL_PAGE && bundle.publicNumber !== null) {
    return buildFpbStorefrontUrl(shop, bundle.publicNumber);
  }
  return null;
}

function parseExpiry(formData: FormData, now: Date) {
  const raw = String(formData.get('expiresAt') ?? '').trim();
  if (!raw) return { expiresAt: null } as const;

  const expiresAt = new Date(raw);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return { error: true } as const;
  }
  return { expiresAt } as const;
}

export async function handleGenerateSpecificLinkOffer(
  session: Session,
  bundleId: string,
  formData: FormData,
  now = new Date(),
) {
  const bundle = await db.bundle.findFirst({
    where: { id: bundleId, shopId: session.shop },
    select: bundleSelect,
  });
  if (!bundle) {
    return json({ success: false, errorCode: 'bundle_not_found' }, { status: 404 });
  }

  const destination = resolveStorefrontDestination(session.shop, bundle);
  const expiry = parseExpiry(formData, now);
  if (!destination || 'error' in expiry) {
    return json({ success: false, errorCode: 'invalid_campaign_link' }, { status: 400 });
  }

  const credential = createSpecificLinkOfferToken();
  const policy = await db.$transaction(async (tx) => {
    const savedPolicy = bundle.offerPolicy
      ? await tx.offerPolicy.update({
        where: { id: bundle.offerPolicy.id },
        data: { ruleVersion: { increment: 1 } },
        select: { id: true, enabled: true, ruleVersion: true },
      })
      : await tx.offerPolicy.create({
        data: {
          bundleId: bundle.id,
          shopId: bundle.shopId,
          enabled: false,
          ruleVersion: 1,
        },
        select: { id: true, enabled: true, ruleVersion: true },
      });

    await tx.offerCondition.upsert({
      where: {
        offerPolicyId_type: {
          offerPolicyId: savedPolicy.id,
          type: 'specific_link',
        },
      },
      create: {
        offerPolicyId: savedPolicy.id,
        type: 'specific_link',
        position: 0,
        tokenHash: credential.tokenHash,
        expiresAt: expiry.expiresAt,
        revokedAt: null,
      },
      update: {
        position: 0,
        tokenHash: credential.tokenHash,
        expiresAt: expiry.expiresAt,
        revokedAt: null,
      },
    });

    return savedPolicy;
  });

  return json({
    success: true,
    campaignLink: buildSpecificLinkOfferUrl({
      destination,
      token: credential.token,
    }),
    enabled: policy.enabled,
    ruleVersion: policy.ruleVersion,
    expiresAt: expiry.expiresAt?.toISOString() ?? null,
    revoked: false,
  });
}

export async function handleRevokeSpecificLinkOffer(
  session: Session,
  bundleId: string,
  now = new Date(),
) {
  const bundle = await db.bundle.findFirst({
    where: { id: bundleId, shopId: session.shop },
    select: { id: true, offerPolicy: { select: { id: true } } },
  });
  if (!bundle) {
    return json({ success: false, errorCode: 'bundle_not_found' }, { status: 404 });
  }

  if (bundle.offerPolicy) {
    await db.$transaction(async (tx) => {
      await tx.offerCondition.updateMany({
        where: {
          offerPolicyId: bundle.offerPolicy!.id,
          type: 'specific_link',
        },
        data: { revokedAt: now },
      });
    });
  }

  return json({ success: true, revoked: true });
}
