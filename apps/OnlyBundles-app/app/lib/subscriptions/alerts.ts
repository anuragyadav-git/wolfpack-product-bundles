import type { EntitlementFailureCode, EntitlementKey } from "./entitlements";

interface EntitlementAlertCopyKeys {
  heading: string;
  message: string;
}

export interface EntitlementModalContentKeys {
  heading: string;
  description: string;
  primaryAction: string;
  secondaryAction?: string;
}

export function getEntitlementAlertCopyKeys(
  code: EntitlementFailureCode | null | undefined,
): EntitlementAlertCopyKeys {
  if (code === "LIMIT_REACHED") {
    return {
      heading: "common.upgradePrompt.limitReachedTitle",
      message: "common.upgradePrompt.limitReachedBody",
    };
  }
  if (code === "ENTITLEMENT_REQUIRED") {
    return {
      heading: "common.alerts.bundleNotSaved",
      message: "billing.cta.body",
    };
  }
  if (code === "BILLING_UNVERIFIED") {
    return {
      heading: "billing.error.heading",
      message: "billing.error.verificationFailed",
    };
  }
  return {
    heading: "common.alerts.bundleNotSaved",
    message: "common.alerts.operationFailed",
  };
}

export function getEntitlementModalContentKeys(
  failure?: { code?: EntitlementFailureCode; entitlement?: EntitlementKey } | null,
): EntitlementModalContentKeys {
  const code = failure?.code;
  const entitlement = failure?.entitlement;

  if (entitlement === "bundle.public.limit" || (code === "LIMIT_REACHED" && !entitlement)) {
    return {
      heading: "billing.entitlements.publicLimitHeading",
      description: "billing.entitlements.publicLimitDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    };
  }

  if (entitlement === "bundle.template.premium") {
    return {
      heading: "billing.entitlements.premiumTemplateHeading",
      description: "billing.entitlements.premiumTemplateDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    };
  }

  if (entitlement === "design.advanced") {
    return {
      heading: "billing.entitlements.advancedDesignHeading",
      description: "billing.entitlements.advancedDesignDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    };
  }

  if (entitlement === "bundle.steps.limit") {
    return {
      heading: "billing.entitlements.stepsLimitHeading",
      description: "billing.entitlements.stepsLimitDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    };
  }

  return {
    heading: "billing.entitlements.growthRequiredHeading",
    description: "billing.entitlements.growthRequiredDescription",
    primaryAction: "billing.actions.viewPlans",
    secondaryAction: "billing.actions.saveAsDraft",
  };
}
