type SettingsSaveResponse = {
  success: boolean;
  message?: string;
} | null | undefined;

type SettingsToastApi = {
  toast: {
    show: (message: string, options?: { duration?: number; isError?: boolean }) => void;
  };
};

export function showSettingsSaveFeedback(
  shopify: SettingsToastApi,
  response: SettingsSaveResponse,
) {
  if (!response) return;

  const message = response.message?.trim();
  if (!message) return;
  if (response.success) {
    shopify.toast.show(message);
    return;
  }

  shopify.toast.show(message, { duration: 5000, isError: true });
}

export function createLanguageSettingsSnapshot(
  languageMode: "SINGLE" | "MULTIPLE",
  localeFieldValues: Record<string, Record<string, string>>,
) {
  return {
    languageMode,
    localeFieldValues: Object.fromEntries(
      Object.entries(localeFieldValues).map(([locale, values]) => [
        locale,
        { ...values },
      ]),
    ),
  };
}
