import {
  getBundleSubscriptionCompatibilityIssues,
  validateBundleSubscriptionConfig,
} from "../bundle-subscriptions";
import {
  parsePricingTierBadge,
  validatePricingTierBadgeForMethod,
} from "../pricing-tier-badge";
import { parseVariantSelectorConfiguration } from "./variant-selector-config";

export type BundleConfigureKind = "fpb" | "ppb";

export interface ConfigureValidationIssue {
  path: string;
  message: string;
  section: string;
  controlId?: string;
  stepId?: string;
  categoryId?: string;
  ruleId?: string;
}

type JsonRecord = Record<string, any>;

function readJson(formData: FormData, key: string, fallback: any): any {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function positiveNumber(value: unknown): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function positiveInteger(value: unknown): boolean {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

function nonNegativeNumber(value: unknown): boolean {
  if (typeof value === "string" && value.trim() === "") return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

function stableId(value: unknown, fallback: string): string {
  const normalized = text(value);
  return normalized || fallback;
}

function issue(
  path: string,
  message: string,
  section: string,
  metadata: Partial<ConfigureValidationIssue> = {},
): ConfigureValidationIssue {
  return {
    path,
    message,
    section,
    controlId: `configure-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    ...metadata,
  };
}

function hasStepResources(step: JsonRecord): boolean {
  if (
    list(step.StepProduct).length > 0 ||
    list(step.products).length > 0 ||
    list(step.collections).length > 0
  ) {
    return true;
  }
  return list(step.StepCategory).some(
    (category) =>
      list(category?.products).length > 0 ||
      list(category?.collections).length > 0,
  );
}

function hasEnabledPersonalization(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const addonProducts = (value as JsonRecord).addonProducts;
  return Boolean(
    addonProducts &&
    typeof addonProducts === "object" &&
    !Array.isArray(addonProducts) &&
    addonProducts.isEnabled === true,
  );
}

function displayTarget(configuration: JsonRecord, fallback: string): string {
  if (configuration?.showOnAllBundleProducts === true) return "all";
  if (list(configuration?.selectedProducts).length > 0 ||
      list(configuration?.showOnSpecificProductPages).length > 0) {
    return "specific_products";
  }
  if (list(configuration?.collectionsSelectedData).length > 0 ||
      list(configuration?.showOnSpecificCollectionPages).length > 0) {
    return "specific_collections";
  }
  return fallback;
}

function validateConditions(
  issues: ConfigureValidationIssue[],
  stepId: string,
  conditions: unknown,
  pathPrefix: string,
  categoryId?: string,
) {
  list(conditions).forEach((condition, conditionIndex) => {
    const ruleId = stableId(condition?.id, `rule-${conditionIndex + 1}`);
    const base = `${pathPrefix}.${ruleId}`;
    if (!text(condition?.type)) {
      issues.push(issue(`${base}.type`, "Select a rule type.", "step_setup", {
        stepId,
        categoryId,
        ruleId,
      }));
    }
    if (!text(condition?.operator ?? condition?.condition)) {
      issues.push(issue(`${base}.operator`, "Select a rule condition.", "step_setup", {
        stepId,
        categoryId,
        ruleId,
      }));
    }
    if (!nonNegativeNumber(condition?.value)) {
      issues.push(issue(`${base}.value`, "Enter a valid non-negative value.", "step_setup", {
        stepId,
        categoryId,
        ruleId,
      }));
    }
  });
}

function validateWidget(
  issues: ConfigureValidationIssue[],
  formData: FormData,
  upsell: JsonRecord,
) {
  const widget = upsell.widgetConfiguration ?? {};
  const enabled = formData.get("upsellWidgetEnabled") === "true" || widget.isEnabled === true;
  if (!enabled) return;

  const mode = text(formData.get("upsellWidgetDisplayMode")) || "button";
  const target = text(formData.get("upsellWidgetDisplayOn")) ||
    displayTarget(widget.displayConfiguration ?? {}, "all");
  if (mode === "block" && !text(widget.title)) {
    issues.push(issue("widget.title", "Enter a widget title.", "bundle_widget"));
  }
  if (!text(widget.buttonText)) {
    issues.push(issue("widget.buttonText", "Enter widget button text.", "bundle_widget"));
  }
  if (
    target === "specific_products" &&
    list(widget.displayConfiguration?.selectedProducts).length === 0 &&
    list(widget.displayConfiguration?.showOnSpecificProductPages).length === 0
  ) {
    issues.push(issue("widget.products", "Add at least one product.", "bundle_widget"));
  }
  if (
    target === "specific_collections" &&
    list(widget.displayConfiguration?.collectionsSelectedData).length === 0 &&
    list(widget.displayConfiguration?.showOnSpecificCollectionPages).length === 0
  ) {
    issues.push(issue("widget.collections", "Add at least one collection.", "bundle_widget"));
  }
}

function validatePpbEmbed(
  issues: ConfigureValidationIssue[],
  formData: FormData,
  upsell: JsonRecord,
) {
  const embed = upsell.upsellConfiguration ?? {};
  if (embed.isEnabled !== true) return;
  const target = text(formData.get("bundleEmbedDisplayOn")) ||
    displayTarget(embed.displayConfiguration ?? {}, "all_products");
  if (!text(embed.title)) {
    issues.push(issue("embed.title", "Enter a bundle embed title.", "bundle_embed"));
  }
  if (
    target === "specific_products" &&
    list(embed.displayConfiguration?.selectedProducts).length === 0 &&
    list(embed.displayConfiguration?.showOnSpecificProductPages).length === 0
  ) {
    issues.push(issue("embed.products", "Add at least one product.", "bundle_embed"));
  }
  if (
    target === "specific_collections" &&
    list(embed.displayConfiguration?.collectionsSelectedData).length === 0 &&
    list(embed.displayConfiguration?.showOnSpecificCollectionPages).length === 0
  ) {
    issues.push(issue("embed.collections", "Add at least one collection.", "bundle_embed"));
  }
}

function validateDiscounts(
  issues: ConfigureValidationIssue[],
  discountData: JsonRecord,
) {
  if (discountData.discountEnabled !== true) return;
  const rules = list(discountData.discountRules);
  if (rules.length === 0) {
    issues.push(issue("discount.rules", "Add at least one discount rule.", "discount_pricing"));
    return;
  }
  rules.forEach((rule, index) => {
    const ruleId = stableId(rule?.id, `rule-${index + 1}`);
    const base = `discount.rules.${ruleId}`;
    if (!positiveNumber(rule?.conditionValue) ||
        (rule?.conditionType === "quantity" && !positiveInteger(rule?.conditionValue))) {
      issues.push(issue(`${base}.conditionValue`, "Enter a valid positive threshold.", "discount_pricing", { ruleId }));
    }
    const method = text(discountData.discountType);
    if (method === "buy_x_get_y") {
      if (!positiveInteger(rule?.customerBuys)) {
        issues.push(issue(`${base}.customerBuys`, "Enter a valid buy quantity.", "discount_pricing", { ruleId }));
      }
      if (!positiveInteger(rule?.customerGets)) {
        issues.push(issue(`${base}.customerGets`, "Enter a valid reward quantity.", "discount_pricing", { ruleId }));
      }
    }
    const discountValue = Number(rule?.discountValue);
    const percentage = method === "percentage_off" ||
      (method === "buy_x_get_y" && rule?.bxyDiscountType !== "fixed_amount");
    if (!Number.isFinite(discountValue) || discountValue <= 0 || (percentage && discountValue > 100)) {
      issues.push(issue(
        `${base}.discountValue`,
        percentage ? "Enter a percentage from 1 to 100." : "Enter a value greater than zero.",
        "discount_pricing",
        { ruleId },
      ));
    }

    if (rule?.tierBadge !== undefined) {
      try {
        const tierBadge = parsePricingTierBadge(rule.tierBadge);
        if (tierBadge) {
          const methodError = validatePricingTierBadgeForMethod(
            tierBadge,
            method,
            rule?.bxyDiscountType,
          );
          if (methodError) {
            issues.push(issue(
              `${base}.tierBadge.text`,
              methodError,
              "discount_pricing",
              { ruleId },
            ));
          }
        }
      } catch (error) {
        const message = (error as Error).message;
        const field = message.includes("shape")
          ? "shape"
          : message.includes("visibility")
            ? "visibility"
            : message.includes("foreground")
              ? "foregroundColor"
              : message.includes("background")
                ? "backgroundColor"
                : "text";
        issues.push(issue(
          `${base}.tierBadge.${field}`,
          message.replace("pricing tier badge: ", ""),
          "discount_pricing",
          { ruleId },
        ));
      }
    }
  });

  if (discountData.discountMessagingEnabled === true) {
    const ruleMessages = discountData.ruleMessages ?? {};
    rules.forEach((rule, index) => {
      const ruleId = stableId(rule?.id, `rule-${index + 1}`);
      if (!text(ruleMessages[ruleId]?.discountText)) {
        issues.push(issue(`discount.messages.${ruleId}`, "Enter discount text.", "discount_pricing", { ruleId }));
      }
    });
    if (!text(discountData.successMessage) &&
        !rules.some((rule, index) => text(ruleMessages[stableId(rule?.id, `rule-${index + 1}`)]?.successMessage))) {
      issues.push(issue("discount.successMessage", "Enter a success message.", "discount_pricing"));
    }
  }

  const display = discountData.pricingDisplayOptions ?? discountData.displayOptions ?? {};
  const quantityOptions = display.bundleQuantityOptions ?? {};
  if (quantityOptions.enabled === true) {
    rules.forEach((rule, index) => {
      const ruleId = stableId(rule?.id, `rule-${index + 1}`);
      if (!text(quantityOptions.optionsByRuleId?.[ruleId]?.label)) {
        issues.push(issue(`discount.quantityOptions.${ruleId}.label`, "Enter an option label.", "discount_pricing", { ruleId }));
      }
    });
  }
  const progress = display.progressBar ?? {};
  if (progress.enabled === true && progress.type === "simple") {
    if (!text(progress.progressText)) {
      issues.push(issue("discount.progress.progressText", "Enter progress text.", "discount_pricing"));
    }
    if (!text(progress.successText)) {
      issues.push(issue("discount.progress.successText", "Enter success text.", "discount_pricing"));
    }
  }
  if (progress.enabled === true && progress.type === "step_based") {
    rules.forEach((rule, index) => {
      const ruleId = stableId(rule?.id, `rule-${index + 1}`);
      const tier = discountData.tierTextByRuleId?.[ruleId] ?? {};
      if (!text(tier.tierText)) {
        issues.push(issue(`discount.tiers.${ruleId}.tierText`, "Enter tier text.", "discount_pricing", { ruleId }));
      }
      if (!text(tier.tierSubtext)) {
        issues.push(issue(`discount.tiers.${ruleId}.tierSubtext`, "Enter tier subtext.", "discount_pricing", { ruleId }));
      }
    });
  }
}

function validateSettings(issues: ConfigureValidationIssue[], formData: FormData) {
  const quantity = readJson(formData, "validateQuantityPerProduct", {});
  if (quantity.isEnabled === true) {
    const raw = formData.get("maxQtyPerProduct");
    const value = typeof raw === "string" ? raw : quantity.allowedQuantity;
    if (!positiveInteger(value)) {
      issues.push(issue("settings.maxQuantity", "Enter a whole number greater than zero.", "bundle_settings"));
    }
  }
  const defaults = readJson(formData, "defaultProductsData", {});
  if (defaults.isDefaultProductsEnabled === true) {
    const products = list(defaults.products);
    if (products.length === 0) {
      issues.push(issue("settings.defaultProducts", "Add at least one default product.", "bundle_settings"));
    }
    products.forEach((product, index) => {
      const productId = stableId(product?.productId ?? product?.id, `product-${index + 1}`);
      if (list(product?.variants).length === 0) {
        issues.push(issue(`settings.defaultProducts.${productId}.variant`, "Select an exact product variant.", "bundle_settings"));
      }
      if (!positiveInteger(product?.requiredQuantity)) {
        issues.push(issue(`settings.defaultProducts.${productId}.quantity`, "Enter a whole number greater than zero.", "bundle_settings"));
      }
    });
  }
}

function validateFpbAddons(issues: ConfigureValidationIssue[], formData: FormData) {
  const draft = readJson(formData, "validationAddonDraft", null) ??
    readJson(formData, "personalizationData", {});
  if (draft?.isPersonalizationEnabled === true) {
    if (!text(draft.personalizeStepText)) {
      issues.push(issue("addons.gifting.stepName", "Enter a gifting step name.", "free_gift_addons"));
    }
    if (!text(draft.personalizePageSubtext)) {
      issues.push(issue("addons.gifting.stepTitle", "Enter a gifting step title.", "free_gift_addons"));
    }
  }
  const addonEnabled = draft?.addonProductsEnabled === true || draft?.addonProducts?.isEnabled === true;
  if (!addonEnabled) return;
  const title = draft?.addonProductsTitle ?? draft?.addonProducts?.title;
  const tiers = list(draft?.addonTiers ?? draft?.addonProducts?.tiers);
  if (!text(title)) {
    issues.push(issue("addons.products.title", "Enter an add-on section title.", "free_gift_addons"));
  }
  if (tiers.length === 0) {
    issues.push(issue("addons.products.tiers", "Add at least one add-on tier.", "free_gift_addons"));
  }
  tiers.forEach((tier, index) => {
    const tierId = stableId(tier?.tierId ?? tier?.id, `tier-${index + 1}`);
    const base = `addons.products.tiers.${tierId}`;
    if (!text(tier?.title)) issues.push(issue(`${base}.title`, "Enter a tier title.", "free_gift_addons"));
    if (list(tier?.selectedAddonProducts).length === 0) {
      issues.push(issue(`${base}.products`, "Add at least one product.", "free_gift_addons"));
    }
    const eligibility = tier?.eligibilityValue ?? tier?.eligibilityCondition?.value;
    if (!positiveNumber(eligibility)) {
      issues.push(issue(`${base}.eligibility`, "Enter an eligibility value greater than zero.", "free_gift_addons"));
    }
    const discount = Number(tier?.discountValue ?? tier?.discount?.value);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      issues.push(issue(`${base}.discount`, "Enter a percentage from 0 to 100.", "free_gift_addons"));
    }
  });
}

export function validateBundleConfigureFormData(
  formData: FormData,
  kind: BundleConfigureKind,
): ConfigureValidationIssue[] {
  const issues: ConfigureValidationIssue[] = [];
  if (!text(formData.get("bundleName"))) {
    issues.push(issue("bundle.name", "Enter a bundle name.", "step_setup"));
  }

  const steps = list(readJson(formData, "stepsData", []));
  if (steps.length === 0) {
    issues.push(issue("steps", "Add at least one bundle step.", "step_setup"));
  }
  const stepConditions = readJson(formData, "stepConditions", {});
  steps.forEach((step, index) => {
    const stepId = stableId(step?.id, `step-${index + 1}`);
    const enabled = index === 0 || step?.enabled !== false;
    if (!enabled) return;
    if (!text(step?.name)) {
      issues.push(issue(`steps.${stepId}.name`, "Enter a step name.", "step_setup", { stepId }));
    }
    if (step?.isFreeGift !== true && !hasStepResources(step)) {
      issues.push(issue(`steps.${stepId}.resources`, "Add at least one product or collection.", "step_setup", { stepId }));
    }
    const categories = list(step?.StepCategory);
    categories.forEach((category, categoryIndex) => {
      const categoryId = stableId(category?.id, `category-${categoryIndex + 1}`);
      const categoryBase = `steps.${stepId}.categories.${categoryId}`;
      if (categories.length > 1 && !text(category?.name)) {
        issues.push(issue(`${categoryBase}.name`, "Enter a category name.", "step_setup", { stepId, categoryId }));
      }
      if (list(category?.products).length === 0 && list(category?.collections).length === 0) {
        issues.push(issue(`${categoryBase}.resources`, "Add at least one product or collection.", "step_setup", { stepId, categoryId }));
      }
      if (kind === "ppb") {
        try {
          parseVariantSelectorConfiguration(category ?? {});
        } catch (error) {
          const message = error instanceof Error ? error.message : "Invalid variant selector configuration";
          const field = message.includes("mode")
            ? "variantSelectorMode"
            : "variantColorMap";
          issues.push(issue(
            `${categoryBase}.${field}`,
            message,
            "step_setup",
            { stepId, categoryId },
          ));
        }
      }
      validateConditions(issues, stepId, category?.conditions, `${categoryBase}.conditions`, categoryId);
    });
    validateConditions(issues, stepId, stepConditions[stepId], `steps.${stepId}.conditions`);

    if (kind === "ppb" && step?.isFreeGift === true) {
      if (!text(step?.addonLabel)) {
        issues.push(issue(`steps.${stepId}.addonLabel`, "Enter an add-on label.", "free_gift_addons", { stepId }));
      }
      if (!text(step?.addonTitle)) {
        issues.push(issue(`steps.${stepId}.addonTitle`, "Enter an add-on title.", "free_gift_addons", { stepId }));
      }
    }
  });

  const discount = readJson(formData, "discountData", {});
  validateDiscounts(issues, discount);
  validateSettings(issues, formData);
  const upsell = readJson(formData, "bundleUpsellConfig", {});
  validateWidget(issues, formData, upsell);
  if (kind === "ppb") validatePpbEmbed(issues, formData, upsell);
  else validateFpbAddons(issues, formData);
  const subscription = readJson(formData, "bundleSubscriptionConfig", null);
  if (subscription?.enabled === true) {
    const subscriptionIssues = [
      ...validateBundleSubscriptionConfig(subscription),
      ...getBundleSubscriptionCompatibilityIssues({
        discountType: discount.discountType,
        steps,
        personalizationEnabled: hasEnabledPersonalization(
          readJson(formData, "personalizationData", null),
        ),
      }),
    ];
    issues.push(...subscriptionIssues.map(({ path, message }: any) =>
      issue(path, message, "subscriptions")));
  }
  return issues;
}

export function getConfigureFieldErrorMap(
  issues: ConfigureValidationIssue[],
): Record<string, string> {
  return Object.fromEntries(issues.map(({ path, message }: any) => [path, message]));
}

export function configureValidationFailure(issues: ConfigureValidationIssue[]) {
  return {
    success: false as const,
    error: "Fix the highlighted fields before saving.",
    fieldErrors: issues.map(({ path, message }: any) => ({ path, message })),
  };
}

export function submitValidBundleConfigureForm(
  formData: FormData,
  kind: BundleConfigureKind,
  submit: (formData: FormData) => void,
): ConfigureValidationIssue[] {
  const issues = validateBundleConfigureFormData(formData, kind);
  if (issues.length === 0) submit(formData);
  return issues;
}
