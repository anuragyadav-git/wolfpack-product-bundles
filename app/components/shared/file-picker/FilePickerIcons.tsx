export function MonitorIcon() {
  return (
    <svg
      width="28"
      height="23"
      viewBox="0 0 28 23"
      fill="none"
      stroke="#8c9196"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="26" height="16" rx="2" />
      <path d="M9 22h10M14 17v5" />
    </svg>
  );
}

export function MobileIcon() {
  return (
    <svg
      width="18"
      height="28"
      viewBox="0 0 18 28"
      fill="none"
      stroke="#8c9196"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="16" height="26" rx="3" />
      <path d="M7 4h4M8 24h2" />
    </svg>
  );
}

export function ProgressCircle({ status }: { status: "spinning" | "success" }) {
  if (status === "success") {
    return <s-icon type="check" tone="success" size="base" />;
  }

  return <s-spinner size="base" accessibilityLabel="Uploading" />;
}
