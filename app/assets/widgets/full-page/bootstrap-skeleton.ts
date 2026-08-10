export function transferBootstrapSkeleton(
  marker: Pick<HTMLElement, "querySelector">,
  container: Pick<HTMLElement, "replaceChildren" | "setAttribute">,
): void {
  const skeleton = marker.querySelector<HTMLElement>("[data-wpb-bootstrap-skeleton]");
  if (!skeleton) {
    throw new Error("FPB bootstrap skeleton is required");
  }

  container.replaceChildren(skeleton);
  container.setAttribute("aria-busy", "true");
}

export function removeBootstrapSkeleton(
  container: Pick<HTMLElement, "querySelector" | "setAttribute">,
): void {
  container.querySelector<HTMLElement>("[data-wpb-bootstrap-skeleton]")?.remove();
  container.setAttribute("aria-busy", "false");
}
