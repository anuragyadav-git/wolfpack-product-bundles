import assert from "node:assert/strict";
import test from "node:test";

import { validateReleaseReadiness } from "../src/lib/release-readiness.mjs";

test("release validation reports every missing legal prerequisite", () => {
  assert.deepEqual(validateReleaseReadiness({ privacyApproved: false, termsApproved: false }), {
    ready: false,
    errors: [
      "Privacy Policy has not been approved.",
      "Terms of Service have not been approved.",
    ],
  });
});

test("release validation accepts approved policies without analytics configuration", () => {
  assert.deepEqual(validateReleaseReadiness({ privacyApproved: true, termsApproved: true }), {
    ready: true,
    errors: [],
  });
});
