export function AdminSectionLoadingState({ label }: { label: string }) {
  return (
    <s-box padding="large">
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-spinner size="base" accessibilityLabel={label} />
        <s-text>{label}</s-text>
      </s-stack>
    </s-box>
  );
}
