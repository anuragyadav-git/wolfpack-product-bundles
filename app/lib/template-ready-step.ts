export function resolveTemplateReadyStep(appEmbedEnabled: boolean) {
  return appEmbedEnabled ? "confirm" : "enableThemeExtension";
}

export function shouldProcessTemplateResponse({
  fetcherState,
  hasRequest,
  submissionStarted,
}: {
  fetcherState: string;
  hasRequest: boolean;
  submissionStarted: boolean;
}) {
  return fetcherState === "idle" && hasRequest && submissionStarted;
}
