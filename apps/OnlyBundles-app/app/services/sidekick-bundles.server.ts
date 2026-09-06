import db from "../db.server";
import { BundleStatus, BundleType } from "../constants/bundle";
import { getBundleEditPath } from "../lib/bundle-navigation";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const MAX_QUERY_LENGTH = 255;

const bundleSelect = {
  id: true,
  name: true,
  status: true,
  bundleType: true,
  createdAt: true,
  updatedAt: true,
  shopifyProductId: true,
  pricing: { select: { enabled: true, method: true } },
  _count: { select: { steps: true } },
} as const;

type SelectedBundle = {
  id: string;
  name: string;
  status: string;
  bundleType: string;
  createdAt: Date;
  updatedAt: Date;
  shopifyProductId: string | null;
  pricing: { enabled: boolean; method: string } | null;
  _count: { steps: number };
};

type SidekickRequestBody = {
  operation?: unknown;
  input?: unknown;
};

export class SidekickBundleRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "SidekickBundleRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function serializeBundle(bundle: SelectedBundle) {
  return {
    id: bundle.id,
    name: bundle.name,
    status: bundle.status,
    bundle_type: bundle.bundleType,
    created_at: bundle.createdAt.toISOString(),
    updated_at: bundle.updatedAt.toISOString(),
    step_count: bundle._count.steps,
    discount_enabled: bundle.pricing?.enabled ?? false,
    discount_method: bundle.pricing?.method ?? null,
    shopify_product_id: bundle.shopifyProductId,
    url: `app://${getBundleEditPath(bundle.id, bundle.bundleType).slice(1)}`,
  };
}

function parseSearchInput(value: unknown) {
  if (value === undefined) value = {};
  if (!isRecord(value)) {
    throw new SidekickBundleRequestError(400, "invalid_input");
  }

  let query: string | undefined;
  if (value.query !== undefined) {
    if (typeof value.query !== "string") {
      throw new SidekickBundleRequestError(400, "invalid_query");
    }
    query = value.query.trim();
    if (query.length > MAX_QUERY_LENGTH) {
      throw new SidekickBundleRequestError(400, "invalid_query");
    }
    if (query.length === 0) query = undefined;
  }

  let bundleType: BundleType | undefined;
  if (value.bundle_type !== undefined) {
    if (
      value.bundle_type !== BundleType.FULL_PAGE &&
      value.bundle_type !== BundleType.PRODUCT_PAGE
    ) {
      throw new SidekickBundleRequestError(400, "invalid_bundle_type");
    }
    bundleType = value.bundle_type;
  }

  let status: BundleStatus | undefined;
  if (value.status !== undefined) {
    if (!Object.values(BundleStatus).includes(value.status as BundleStatus)) {
      throw new SidekickBundleRequestError(400, "invalid_status");
    }
    status = value.status as BundleStatus;
  }

  const limit = value.limit ?? DEFAULT_LIMIT;
  if (
    !Number.isInteger(limit) ||
    Number(limit) < 1 ||
    Number(limit) > MAX_LIMIT
  ) {
    throw new SidekickBundleRequestError(400, "invalid_limit");
  }

  return { query, bundleType, status, limit: Number(limit) };
}

async function searchBundles(shop: string, input: unknown) {
  const filters = parseSearchInput(input);
  const bundles = (await db.bundle.findMany({
    where: {
      shopId: shop,
      ...(filters.query
        ? { name: { contains: filters.query, mode: "insensitive" as const } }
        : {}),
      status: filters.status
        ? filters.status
        : {
            in: [
              BundleStatus.ACTIVE,
              BundleStatus.DRAFT,
              BundleStatus.UNLISTED,
            ],
          },
      ...(filters.bundleType ? { bundleType: filters.bundleType } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: filters.limit + 1,
    select: bundleSelect,
  })) as SelectedBundle[];

  return {
    results: bundles.slice(0, filters.limit).map((bundle) =>
      serializeBundle(bundle),
    ),
    has_more: bundles.length > filters.limit,
  };
}

async function getBundleSummary(shop: string, input: unknown) {
  if (!isRecord(input) || typeof input.bundle_id !== "string") {
    throw new SidekickBundleRequestError(400, "invalid_bundle_id");
  }
  const bundleId = input.bundle_id.trim();
  if (!bundleId || bundleId.length > 255) {
    throw new SidekickBundleRequestError(400, "invalid_bundle_id");
  }

  const bundle = (await db.bundle.findFirst({
    where: { id: bundleId, shopId: shop },
    select: bundleSelect,
  })) as SelectedBundle | null;

  if (!bundle) {
    throw new SidekickBundleRequestError(404, "bundle_not_found");
  }

  return { results: [serializeBundle(bundle)] };
}

export async function executeSidekickBundleOperation({
  shop,
  body,
}: {
  shop: string;
  body: SidekickRequestBody;
}) {
  if (!isRecord(body)) {
    throw new SidekickBundleRequestError(400, "invalid_request");
  }

  switch (body.operation) {
    case "search_bundles":
      return searchBundles(shop, body.input);
    case "get_bundle_summary":
      return getBundleSummary(shop, body.input);
    default:
      throw new SidekickBundleRequestError(400, "invalid_operation");
  }
}
