import { legalStatus } from "../src/data/legal-status.mjs";
import { validateReleaseReadiness } from "../src/lib/release-readiness.mjs";

const result = validateReleaseReadiness({
  ...legalStatus,
});

if (!result.ready) {
  console.error("Website release is blocked:");
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Website release prerequisites are satisfied.");
}
