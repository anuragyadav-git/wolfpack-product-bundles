import type { ConfigureValidationIssue } from "../../../../lib/bundle-config/configure-validation";

export function ConfigureValidationSummary({
  activeSection,
  issues,
}: {
  activeSection: string;
  issues: ConfigureValidationIssue[];
}) {
  const sectionIssues = issues.filter(
    (validationIssue) => validationIssue.section === activeSection,
  );
  if (sectionIssues.length === 0) return null;

  return (
    <s-box
      border="base"
      borderRadius="base"
      padding="base"
      background="critical-subdued"
    >
      <s-stack direction="block" gap="small">
        <s-text tone="critical">
          Fix the following fields before saving:
        </s-text>
        {sectionIssues.map((validationIssue) => (
          <span
            key={validationIssue.path}
            data-validation-path={validationIssue.path}
            tabIndex={-1}
          >
            <s-text tone="critical">{validationIssue.message}</s-text>
          </span>
        ))}
      </s-stack>
    </s-box>
  );
}
