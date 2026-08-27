ALTER TABLE "Session"
RENAME COLUMN "refreshTokenExpiresAt" TO "refreshTokenExpires";

DROP INDEX IF EXISTS "Session_shop_storefrontAccessToken_idx";

ALTER TABLE "Session"
DROP COLUMN "storefrontAccessToken";
