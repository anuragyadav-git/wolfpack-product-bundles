export function transferBootstrapLoadingScreen(
  marker: Pick<HTMLElement, "querySelector">,
  container: Pick<HTMLElement, "replaceChildren" | "setAttribute">,
): void {
  const loadingScreen = marker.querySelector<HTMLElement>("[data-wpb-loading-screen]");
  if (!loadingScreen) {
    throw new Error("FPB bootstrap loading screen is required");
  }

  container.replaceChildren(loadingScreen);
  container.setAttribute("aria-busy", "true");
}

export function removeBootstrapLoadingScreen(
  container: Pick<HTMLElement, "querySelector" | "setAttribute">,
): void {
  container.querySelector<HTMLElement>("[data-wpb-loading-screen]")?.remove();
  container.setAttribute("aria-busy", "false");
}
