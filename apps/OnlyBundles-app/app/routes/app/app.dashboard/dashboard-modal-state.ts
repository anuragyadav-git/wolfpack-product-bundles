export function shouldRenderDashboardDeleteModal({
  bundleToDelete,
}: {
  bundleToDelete: string | null;
}) {
  return Boolean(bundleToDelete);
}

export function shouldRenderDashboardPreviewModal({
  isOpen,
}: {
  isOpen: boolean;
}) {
  return isOpen;
}

export function shouldRenderDashboardRenameModal({
  bundleToRename,
}: {
  bundleToRename: unknown | null;
}) {
  return Boolean(bundleToRename);
}
