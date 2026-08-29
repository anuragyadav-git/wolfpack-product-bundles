import { json } from "@remix-run/node";
import { timingSafeEqual, createHash } from "node:crypto";
import type { authenticate } from "../shopify.server";
import { AppLogger } from "./logger";

// Admin context type derived from the configured shopify instance
export type ShopifyAdmin = Awaited<ReturnType<typeof authenticate.admin>>["admin"];

// ─── Internal Secret Guard ────────────────────────────────────────────────────
// Use on routes called by internal services (e.g. the Pub/Sub worker).
// Checks Authorization: Bearer <INTERNAL_WEBHOOK_SECRET> with constant-time comparison.
//
// Returns null when authorized (caller may proceed).
// Returns a 401 Response when unauthorized (caller must return it immediately).
//
// Usage:
//   const authError = requireInternalSecret(request);
//   if (authError) return authError;
export function requireInternalSecret(request: Request): Response | null {
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;

  // Fail-closed: if env var is unset or empty, reject all requests.
  if (!secret) {
    AppLogger.warn("[auth-guards] INTERNAL_WEBHOOK_SECRET is not set — rejecting all internal requests (fail-closed)", { component: "auth-guards.server" });
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const prefix = "Bearer ";

  if (!authHeader.startsWith(prefix)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const provided = authHeader.slice(prefix.length);

  // Constant-time comparison via hashing both sides to equal-length buffers.
  // timingSafeEqual requires equal-length inputs; hashing guarantees that
  // regardless of token length, preventing timing side-channel attacks.
  try {
    const a = createHash("sha256").update(provided).digest();
    const b = createHash("sha256").update(secret).digest();
    if (!timingSafeEqual(a, b)) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // Authorized — caller proceeds
}
