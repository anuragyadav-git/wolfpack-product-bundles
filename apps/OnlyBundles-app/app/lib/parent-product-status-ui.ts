export type ParentProductStatusUi = {
  label: "Active" | "Archived" | "Draft" | "Unlisted" | "Unknown" | null;
  tone: "success" | "warning" | null;
  showUnlistedBanner: boolean;
  isLoading: boolean;
};

export function getParentProductStatusUi(
  status: string | null | undefined,
  isLoading = !status,
): ParentProductStatusUi {
  if (isLoading) {
    return {
      label: null,
      tone: null,
      showUnlistedBanner: false,
      isLoading: true,
    };
  }

  switch (String(status ?? "").toUpperCase()) {
    case "ACTIVE":
      return { label: "Active", tone: "success", showUnlistedBanner: false, isLoading: false };
    case "ARCHIVED":
      return { label: "Archived", tone: "warning", showUnlistedBanner: false, isLoading: false };
    case "DRAFT":
      return { label: "Draft", tone: "warning", showUnlistedBanner: false, isLoading: false };
    case "UNLISTED":
      return { label: "Unlisted", tone: "warning", showUnlistedBanner: true, isLoading: false };
    default:
      return { label: "Unknown", tone: "warning", showUnlistedBanner: false, isLoading: false };
  }
}
