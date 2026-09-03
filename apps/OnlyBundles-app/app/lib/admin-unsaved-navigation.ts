export function blockUnsavedAdminNavigation(
  hasUnsavedChanges: boolean,
  irritateSaveBar: () => void,
): boolean {
  if (!hasUnsavedChanges) {
    return false;
  }

  irritateSaveBar();
  return true;
}
