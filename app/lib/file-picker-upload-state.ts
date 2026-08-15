export function resolveFilePickerInitialOpen(autoOpen: boolean) {
  return autoOpen;
}

export function shouldApplyUploadMutationResult({
  hasCurrentAttempt,
  isSuccess,
  isError,
}: {
  hasCurrentAttempt: boolean;
  isSuccess: boolean;
  isError: boolean;
}) {
  return hasCurrentAttempt && (isSuccess || isError);
}
