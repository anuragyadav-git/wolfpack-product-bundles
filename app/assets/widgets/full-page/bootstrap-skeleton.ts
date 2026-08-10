export function transferBootstrapSkeleton(
  marker: Pick<HTMLElement, "querySelector">,
  container: Pick<HTMLElement, "replaceChildren">,
): void {
  const skeleton = marker.querySelector<HTMLElement>("[data-wpb-bootstrap-skeleton]");
  if (!skeleton) {
    throw new Error("FPB bootstrap skeleton is required");
  }

  container.replaceChildren(skeleton);
}

export function removeBootstrapSkeleton(
  container: Pick<HTMLElement, "querySelector">,
): void {
  container.querySelector<HTMLElement>("[data-wpb-bootstrap-skeleton]")?.remove();
}
