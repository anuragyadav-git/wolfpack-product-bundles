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
): string | null {
  if (!response) return null;

  const message = response.message?.trim();
  if (!message) return null;
  if (response.success) {
    shopify.toast.show(message);
    return null;
  }

  return message;
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
