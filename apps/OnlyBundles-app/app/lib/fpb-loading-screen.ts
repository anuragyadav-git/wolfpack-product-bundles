export type FpbLoadingScreenSettings = {
  gifUrl: string | null;
  backgroundColor: string;
};

export const DEFAULT_FPB_LOADING_SCREEN: FpbLoadingScreenSettings = Object.freeze({
  gifUrl: null,
  backgroundColor: "#ffffff",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isCssColor(value: string): boolean {
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|transparent)$/i.test(value);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function resolveFpbLoadingScreenSettings(generalSettings: unknown): FpbLoadingScreenSettings {
  const loadingScreen = isRecord(generalSettings) && isRecord(generalSettings.loadingScreen)
    ? generalSettings.loadingScreen
    : {};
  const gifUrl = typeof loadingScreen.gifUrl === "string" && isHttpsUrl(loadingScreen.gifUrl)
    ? loadingScreen.gifUrl
    : null;
  const backgroundColor = typeof loadingScreen.backgroundColor === "string"
    && isCssColor(loadingScreen.backgroundColor)
    ? loadingScreen.backgroundColor
    : DEFAULT_FPB_LOADING_SCREEN.backgroundColor;

  return { gifUrl, backgroundColor };
}

export function renderFpbLoadingScreen(settings: FpbLoadingScreenSettings): string {
  const backgroundColor = escapeHtmlAttribute(settings.backgroundColor);
  const media = settings.gifUrl
    ? `<img data-wpb-loading-gif src="${escapeHtmlAttribute(settings.gifUrl)}" alt="">`
    : '<span data-wpb-loading-spinner aria-hidden="true"></span>';

  return `<div data-wpb-loading-screen role="status" aria-label="Loading bundle" style="--wpb-loading-screen-bg:${backgroundColor}">${media}</div>`;
}
