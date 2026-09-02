export function validateReleaseReadiness({ privacyApproved, termsApproved }) {
  const errors = [];
  if (!privacyApproved) errors.push("Privacy Policy has not been approved.");
  if (!termsApproved) errors.push("Terms of Service have not been approved.");
  return { ready: errors.length === 0, errors };
}
