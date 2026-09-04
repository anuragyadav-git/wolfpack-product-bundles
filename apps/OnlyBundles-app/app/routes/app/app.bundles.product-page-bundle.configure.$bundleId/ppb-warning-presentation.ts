import type { AdminWarningItem } from "../../../components/AdminWarningGroup";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";

export function buildPpbCanvasWarnings({
  appEmbedEnabled,
  appEmbedWarning,
  unlistedWarning,
  operationAlert,
}: {
  appEmbedEnabled: boolean;
  appEmbedWarning: AdminWarningItem;
  unlistedWarning: AdminWarningItem | null;
  operationAlert: AdminTaskAlert | null;
}): AdminWarningItem[] {
  const warnings: AdminWarningItem[] = [];

  if (!appEmbedEnabled) warnings.push(appEmbedWarning);
  if (unlistedWarning) warnings.push(unlistedWarning);
  if (operationAlert?.id === "widget-placement") warnings.push(operationAlert);

  return warnings;
}

export function getPpbStandaloneOperationAlert(
  operationAlert: AdminTaskAlert | null,
): AdminTaskAlert | null {
  return operationAlert?.id === "widget-placement" ? null : operationAlert;
}
