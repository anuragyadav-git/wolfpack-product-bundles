interface MoneyValue {
  amount?: string | number | null;
}

export interface BundleRevenueLine {
  bundleId?: string | null;
  properties?: unknown;
  customAttributes?: unknown;
  finalLinePrice?: MoneyValue | null;
  cost?: { totalAmount?: MoneyValue | null } | null;
  discountedTotalSet?: {
    shopMoney?: MoneyValue | null;
  } | null;
  lineComponents?: BundleRevenueLine[] | null;
}

function propertyMap(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.flatMap((property) => {
      if (!property || typeof property !== "object") return [];
      const candidate = property as Record<string, unknown>;
      const key = candidate.key;
      return typeof key === "string" ? [[key, candidate.value]] : [];
    }));
  }
  return value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

function jsonRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function taggedBundleId(line: BundleRevenueLine): string | null {
  if (typeof line.bundleId === "string" && line.bundleId.trim()) {
    return line.bundleId.trim();
  }

  const properties = {
    ...propertyMap(line.customAttributes),
    ...propertyMap(line.properties),
  };
  const direct = jsonRecord(properties._wpb_offer_analytics);
  const display = jsonRecord(properties._bundle_display_properties);
  const analytics = Object.keys(direct).length > 0
    ? direct
    : display.offerAnalytics && typeof display.offerAnalytics === "object"
      ? display.offerAnalytics as Record<string, unknown>
      : {};
  const value = analytics.bundleId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function moneyCents(line: BundleRevenueLine): number | null {
  const raw =
    line.discountedTotalSet?.shopMoney?.amount
    ?? line.finalLinePrice?.amount
    ?? line.cost?.totalAmount?.amount;
  const amount = typeof raw === "number" ? raw : Number.parseFloat(raw ?? "");
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

export function collectBundleLineRevenue(
  lineItems: BundleRevenueLine[],
  matchedBundleIds: string[],
): Record<string, number> {
  const allowed = new Set(matchedBundleIds);
  const totals = Object.fromEntries(matchedBundleIds.map((id) => [id, 0]));

  const addLine = (line: BundleRevenueLine) => {
    const bundleId = taggedBundleId(line);
    const cents = moneyCents(line);
    if (!bundleId || !allowed.has(bundleId) || cents === null) return false;
    totals[bundleId] += cents;
    return true;
  };

  for (const line of lineItems ?? []) {
    if (addLine(line)) continue;
    for (const component of line.lineComponents ?? []) addLine(component);
  }

  return totals;
}
