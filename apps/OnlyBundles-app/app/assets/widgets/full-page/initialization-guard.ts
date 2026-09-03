export function claimFullPageWidgetInitialization(container: HTMLElement) {
  const dataset = container?.dataset;

  if (!dataset || dataset.initialized || dataset.initializing) {
    return false;
  }

  dataset.initializing = 'true';
  return true;
}
