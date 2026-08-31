import { json, type LoaderFunctionArgs } from '@remix-run/node';
import db from '../../db.server';
import { AppLogger } from '../../lib/logger';
import {
  resolveSpecificLinkOfferEligibility,
} from '../../lib/specific-link-offer-eligibility.server';
import { SPECIFIC_LINK_OFFER_QUERY_PARAM } from '../../lib/specific-link-offer-token.server';
import { authenticate } from '../../shopify.server';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store',
};

// auth: public storefront request verified by Shopify app-proxy authentication.
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.public.appProxy(request);
    if (!session) throw new Response('Unauthorized', { status: 401 });

    const url = new URL(request.url);
    const bundleId = url.searchParams.get('bundleId')?.trim();
    if (!bundleId) {
      return json(
        { eligible: false, reasonCode: 'bundle_id_required' },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const bundle = await db.bundle.findFirst({
      where: {
        id: bundleId,
        shopId: session.shop,
        status: { in: ['active', 'unlisted'] },
      },
      select: {
        id: true,
        shopId: true,
        offerPolicy: {
          select: {
            id: true,
            specificLinkRequired: true,
            startsAt: true,
            endsAt: true,
            ruleVersion: true,
            conditions: {
              select: {
                type: true,
                tokenHash: true,
                expiresAt: true,
                revokedAt: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return json(
        { eligible: false, reasonCode: 'bundle_not_found' },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const decision = resolveSpecificLinkOfferEligibility({
      policy: bundle.offerPolicy,
      token: url.searchParams.get(SPECIFIC_LINK_OFFER_QUERY_PARAM),
    });

    if (bundle.offerPolicy) {
      try {
        await db.bundleAnalytics.create({
          data: {
            bundleId: bundle.id,
            shopId: session.shop,
            event: 'offer_eligibility_decision',
            metadata: {
              eligibilitySource: bundle.offerPolicy.specificLinkRequired
                ? 'specific_link'
                : 'schedule',
              reasonCode: decision.reasonCode,
              ruleVersion: bundle.offerPolicy.ruleVersion,
            },
          },
        });
      } catch (error) {
        AppLogger.warn('Unable to record offer eligibility decision', {
          component: 'api.offer-eligibility',
          operation: 'record_decision',
          shop: session.shop,
          bundleId: bundle.id,
          reasonCode: decision.reasonCode,
        });
      }
    }

    return json(decision, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof Response) throw error;

    AppLogger.error('Unable to resolve offer eligibility', {
      component: 'api.offer-eligibility',
      operation: 'loader',
    }, error);
    return json(
      { eligible: false, reasonCode: 'server_error' },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
