import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { exportOfferPolicyCsv } from '../../services/offer-policy-csv.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const csv = await exportOfferPolicyCsv(session.shop);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="offer-policies-v2.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
