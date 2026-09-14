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

export async function navigateWithSaveBarConfirmation(
  leaveConfirmation: () => Promise<void> | void,
  navigate: () => void,
): Promise<boolean> {
  try {
    await leaveConfirmation();
    navigate();
    return true;
  } catch {
    return false;
  }
}
