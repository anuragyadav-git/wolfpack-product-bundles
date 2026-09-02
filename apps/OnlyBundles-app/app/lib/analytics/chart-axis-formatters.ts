function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return String(Math.round(value));
}

export function formatCompactCountAxisTick(value: number): string {
  return formatCompactNumber(value);
}

export function formatCompactCurrencyAxisTick(cents: number): string {
  return `$${formatCompactNumber(cents / 100)}`;
}

export function formatBundleSplitDateAxisTick(
  dateKey: string,
  rangeDays: number,
): string {
  const date = new Date(`${dateKey}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateKey
  ) {
    return dateKey;
  }

  if (rangeDays <= 30) {
    return String(date.getUTCDate());
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
