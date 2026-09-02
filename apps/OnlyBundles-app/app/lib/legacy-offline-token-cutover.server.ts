export type LegacyOfflineSessionRow = {
  id: string;
  shop: string;
  isOnline: boolean;
  accessToken: string;
  expires: Date | null;
  refreshToken: string | null;
  refreshTokenExpires: Date | null;
};

export function selectLegacyOfflineSessions(
  sessions: LegacyOfflineSessionRow[],
): LegacyOfflineSessionRow[] {
  return sessions.filter((session) => (
    !session.isOnline
    && !session.expires
    && !session.refreshToken
    && !session.refreshTokenExpires
  ));
}

export class LegacyOfflineTokenCutoverError extends Error {
  constructor(
    public readonly failedShop: string,
    public readonly migratedShops: string[],
    cause: unknown,
  ) {
    super(`Legacy offline-token cutover failed for ${failedShop}`, { cause });
    this.name = "LegacyOfflineTokenCutoverError";
  }
}

export async function runLegacyOfflineTokenCutover<TSession>(
  candidates: LegacyOfflineSessionRow[],
  migrate: (candidate: LegacyOfflineSessionRow) => Promise<TSession>,
  store: (session: TSession) => Promise<void>,
): Promise<{ migratedShops: string[] }> {
  const migratedShops: string[] = [];
  for (const candidate of candidates) {
    try {
      const session = await migrate(candidate);
      await store(session);
      migratedShops.push(candidate.shop);
    } catch (error) {
      throw new LegacyOfflineTokenCutoverError(candidate.shop, migratedShops, error);
    }
  }
  return { migratedShops };
}
