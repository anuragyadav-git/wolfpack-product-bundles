import type { AdminWarningItem } from "../../../components/AdminWarningGroup";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";

type ActionableAdminWarningItem = AdminWarningItem & {
  actionLabel: string;
  onAction: () => void;
};

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

export function getPpbStandaloneUnlistedWarning(
  warnings: AdminWarningItem[],
): ActionableAdminWarningItem | null {
  const warning = warnings[0];
  if (
    warnings.length !== 1 ||
    warning.id !== "unlisted-bundle" ||
    !warning.actionLabel ||
    !warning.onAction
  ) {
    return null;
  }

  return {
    ...warning,
    actionLabel: warning.actionLabel,
    onAction: warning.onAction,
  };
}
