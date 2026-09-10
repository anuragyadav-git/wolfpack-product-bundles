import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../shopify.server";
import { AppLogger } from "../../../../lib/logger";
import db from "../../../../db.server";
import { parseConditionValue } from "../../../../lib/parse-condition-value";
import { mapDiscountMethod } from "../../../../utils/discount-mappers";
import { parsePPBBundleVisibility, parsePPBBundleSettings } from "./parsers";
import { normaliseShopifyProductId } from "../../../../services/bundles/bundle-configure-handlers.server";
import { BundleStatus } from "../../../../constants/bundle";
import { ERROR_MESSAGES } from "../../../../constants/errors";
import {
  buildStepCategoryCreateInput,
  materializeCanonicalStepProducts,
} from "../../../../lib/bundle-config/category-persistence";
import { resolveBundleStepEnabled } from "../../../../lib/bundle-config/step-enablement";
import {
  normalizePricingDisplayOptions,
  serializeBoxSelectionFromPricingDisplayOptions,
} from "../../../../lib/pricing-display-options";
import {
  compactBundleForConfigureResponse,
  syncBundleStorefrontNow,
} from "../../../../services/bundles/storefront-sync.server";
import {
  formatStepConditionErrors,
  validateStepConditionFeasibility,
} from "../../../../lib/step-condition-validation";
import {
  configureValidationFailure,
  validateBundleConfigureFormData,
} from "../../../../lib/bundle-config/configure-validation";
import { validatePersistedStepProductVariants } from "../../../../lib/bundle-config/step-product-variant-validation.server";
import {
  getBundleSubscriptionCompatibilityIssues,
  normalizeBundleSubscriptionConfig,
  validateBundleSubscriptionConfig,
} from "../../../../lib/bundle-subscriptions";
import { AddOnDiscountFunctionService } from "../../../../services/addon-discount-function-service.server";
import { EntitlementDeniedError } from "../../../../lib/subscriptions/entitlements";
import { resolveShopEntitlements } from "../../../../services/subscriptions/subscription-service.server";
import { updateBundleWithPublicationGate } from "../../../../services/subscriptions/bundle-entitlement-gate.server";
import { shopUsesAdvancedDesign } from "../../../../services/subscriptions/design-entitlement-state.server";
import { recordSubscriptionEvent } from "../../../../services/subscriptions/subscription-telemetry.server";
import { resolveSpecificLinkOfferSave } from "../../../../lib/specific-link-offer-admin";
import {
  buildOfferPolicyMutation,
  resolveOfferOperationsSave,
} from "../../../../lib/offer-policy-admin";
import { resolveOfferCountryTargetingSave } from "../../../../lib/offer-country-targeting";
import { fetchShopConfiguration } from "../../../../lib/bundle-configure-loader.server";

export async function handleSaveBundle(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  formData: FormData,
) {
  const endTimer = AppLogger.startTimer("Bundle save process", {
    component: "bundle-config",
    operation: "save",
    bundleId,
    shopId: session.shop,
  });

  AppLogger.info("Starting enhanced bundle save process", {
    component: "bundle-config",
    operation: "save",
    bundleId,
    shopId: session.shop,
  });

  try {
    const configureValidationIssues = validateBundleConfigureFormData(
      formData,
      "ppb",
    );
    if (configureValidationIssues.length > 0) {
      return json(configureValidationFailure(configureValidationIssues), {
        status: 400,
      });
    }

    const bundleName = formData.get("bundleName") as string;
    const bundleDescription = formData.get("bundleDescription") as string;
    const bundleStatus = formData.get("bundleStatus") as string;
    const templateName = (formData.get("templateName") as string) || null;
    if (!Object.values(BundleStatus).includes(bundleStatus as BundleStatus)) {
      return json(
        { success: false, error: "Invalid bundle status" },
        { status: 400 },
      );
    }

    const showProductPrices = formData.get("showProductPrices") !== "false";
    const cartRedirectToCheckout =
      formData.get("cartRedirectToCheckout") === "true";
    const allowQuantityChanges =
      formData.get("allowQuantityChanges") !== "false";
    const sdkMode = formData.get("sdkMode") === "true";
    const textOverridesRaw = formData.get("textOverrides") as string | null;
    const textOverridesByLocaleRaw = formData.get("textOverridesByLocale") as
      | string
      | null;
    const textOverrides = textOverridesRaw
      ? JSON.parse(textOverridesRaw)
      : null;
    const textOverridesByLocale = textOverridesByLocaleRaw
      ? JSON.parse(textOverridesByLocaleRaw)
      : null;
    const stepsData = JSON.parse(formData.get("stepsData") as string);
    for (const step of stepsData) {
      step.StepProduct = materializeCanonicalStepProducts(step);
    }
    const discountData = JSON.parse(formData.get("discountData") as string);
    const stepConditionsData: Record<string, any[]> = formData.get("stepConditions")
      ? JSON.parse(formData.get("stepConditions") as string)
      : {};
    const bundleProductData = formData.get("bundleProduct")
      ? JSON.parse(formData.get("bundleProduct") as string)
      : null;
    const subscriptionConfigRaw = formData.get("bundleSubscriptionConfig");
    const subscriptionConfig =
      typeof subscriptionConfigRaw === "string"
        ? normalizeBundleSubscriptionConfig(JSON.parse(subscriptionConfigRaw))
        : null;
    if (subscriptionConfig?.enabled) {
      const subscriptionIssues = [
        ...validateBundleSubscriptionConfig(subscriptionConfig),
        ...getBundleSubscriptionCompatibilityIssues({
          discountType: discountData.discountType,
          steps: stepsData,
        }),
      ];
      if (subscriptionIssues.length > 0) {
        return json(
          {
            success: false,
            error: "Fix the subscription configuration before saving.",
            fieldErrors: subscriptionIssues,
          },
          { status: 400 },
        );
      }
    }

    AppLogger.debug("Parsed form data:", {
      bundleName,
      bundleDescription,
      bundleStatus,
      stepsCount: stepsData.length,
      discountEnabled: discountData.discountEnabled,
      discountType: discountData.discountType,
      hasConditions: Object.keys(stepConditionsData).length > 0,
      hasBundleProduct: !!bundleProductData,
    });

    AppLogger.debug(
      "[DEBUG] Step Conditions Data from form:",
      stepConditionsData,
    );
    AppLogger.debug(
      "[DEBUG] Bundle Product Data from form:",
      bundleProductData,
    );

    // DEBUG: Log all product IDs being submitted
    AppLogger.debug("[DEBUG] Steps data received from form:");
    stepsData.forEach((step: any, idx: number) => {
      AppLogger.debug(
        `  Step ${idx + 1}: "${step.name}" (step.id: ${step.id})`,
      );
      if (step.StepProduct && Array.isArray(step.StepProduct)) {
        step.StepProduct.forEach((product: any, pidx: number) => {
          AppLogger.debug(
            `    Product ${pidx + 1}: "${product.title}" → product.id: ${product.id}`,
          );
        });
      }
    });

    // VALIDATION + NORMALISATION: Validate and normalise the canonical product
    // membership after current direct and category selections are materialized.
    const stepValidationErrors = [];
    for (const step of stepsData) {
      if (Array.isArray(step.StepProduct)) {
        for (const product of step.StepProduct) {
          product.id = normaliseShopifyProductId(product.id, {
            title: product.title || product.name || "unknown",
            stepName: step.name,
          });
        }
      }

      const stepConditions = stepConditionsData[step.id] || [];
      const firstCondition = stepConditions.length > 0 ? stepConditions[0] : null;
      const secondCondition = stepConditions.length > 1 ? stepConditions[1] : null;
      stepValidationErrors.push(
        ...validateStepConditionFeasibility({
          stepId: step.id,
          stepName: step.name,
          conditionType: firstCondition?.type || null,
          conditionOperator: firstCondition?.operator || null,
          conditionValue: parseConditionValue(firstCondition?.value),
          conditionOperator2: secondCondition?.operator || null,
          conditionValue2: parseConditionValue(secondCondition?.value),
        }),
      );
    }

    if (stepValidationErrors.length > 0) {
      return json(
        {
          success: false,
          error: formatStepConditionErrors(stepValidationErrors),
          fieldErrors: stepValidationErrors.map((validationError) => ({
            path: `steps.${validationError.stepId}.conditions`,
            message: validationError.message,
          })),
        },
        { status: 400 },
      );
    }

    const variantValidationResponse =
      await validatePersistedStepProductVariants({
        route: "ppb-save",
        shopDomain: session.shop,
        stepsData,
      });
    if (variantValidationResponse) {
      return variantValidationResponse;
    }

    AppLogger.debug("[VALIDATION] All product IDs are valid Shopify GIDs");

    const normalizedPricingDisplayOptions = normalizePricingDisplayOptions({
      rules: discountData.discountRules || [],
      displayOptions: discountData.displayOptions || null,
      showProgressBar:
        discountData.displayOptions?.progressBar?.enabled === true,
      method: discountData.discountType,
    });
    const parsedBundleSettings = parsePPBBundleSettings(formData);
    const quantityValidationEnabled =
      parsedBundleSettings.validateQuantityPerProduct?.isEnabled === true;
    const directBoxSelection =
      discountData.discountEnabled === true &&
      discountData.discountType !== "buy_x_get_y"
        ? serializeBoxSelectionFromPricingDisplayOptions(
            normalizedPricingDisplayOptions,
          )
        : null;
    const boxSelection = directBoxSelection
      ? {
          ...directBoxSelection,
          validateBoxSelectionQuantity: quantityValidationEnabled,
        }
      : null;
    const pricingMessages = {
      showDiscountDisplay: true,
      showDiscountMessaging: discountData.discountMessagingEnabled || false,
      ruleMessages: discountData.ruleMessages || {},
      successMessage: discountData.successMessage ?? null,
      successMessageByLocale: discountData.successMessageByLocale ?? null,
      tierTextByRuleId: discountData.tierTextByRuleId ?? null,
      tierTextByLocaleByRuleId: discountData.tierTextByLocaleByRuleId ?? null,
    };

    const finalStatus = bundleStatus as BundleStatus;

    // Get existing bundle to preserve shopifyProductId/Handle if not provided
    const existingBundle = await db.bundle.findUnique({
      where: { id: bundleId, shopId: session.shop },
      select: {
        shopifyProductId: true,
        shopifyProductHandle: true,
        personalizationData: true,
        bundleDesignTemplate: true,
        bundleDesignPresetId: true,
        offerPolicy: {
          select: {
            specificLinkRequired: true,
            priority: true,
            stopLowerPriority: true,
            scheduleMode: true,
            startsAt: true,
            endsAt: true,
            recurrenceFrequency: true,
            recurrenceTimezone: true,
            recurrenceAnchorDate: true,
            recurrenceWindowStartMinute: true,
            recurrenceWindowEndMinute: true,
            recurrenceTermination: true,
            recurrenceEndsOn: true,
            recurrenceRunCount: true,
            countryTargetingEnabled: true,
            countryTargetingMode: true,
            countryCodes: true,
            ruleVersion: true,
            conditions: {
              where: { type: "specific_link" },
              orderBy: { position: "asc" },
              take: 1,
              select: { expiresAt: true, revokedAt: true },
            },
          },
        },
      },
    });
    const specificLinkOfferSave = resolveSpecificLinkOfferSave(
      formData.get("specificLinkOfferEnabled"),
      existingBundle?.offerPolicy ?? null,
    );
    if ("issue" in specificLinkOfferSave) {
      return json({
        success: false,
        error: specificLinkOfferSave.issue.message,
        fieldErrors: [specificLinkOfferSave.issue],
      }, { status: 400 });
    }
    const rawOfferOperations = {
      priority: formData.get("offerPriority"),
      stopLowerPriority: formData.get("offerStopLowerPriority"),
      scheduleMode: formData.get("offerScheduleMode"),
      startsAt: formData.get("offerStartsAt"),
      endsAt: formData.get("offerEndsAt"),
      recurrenceFrequency: formData.get("offerRecurrenceFrequency"),
      recurrenceAnchorDate: formData.get("offerRecurrenceAnchorDate"),
      recurrenceWindowStart: formData.get("offerRecurrenceWindowStart"),
      recurrenceWindowEnd: formData.get("offerRecurrenceWindowEnd"),
      recurrenceTermination: formData.get("offerRecurrenceTermination"),
      recurrenceEndsOn: formData.get("offerRecurrenceEndsOn"),
      recurrenceRunCount: formData.get("offerRecurrenceRunCount"),
    };
    const offerOperationsWereSubmitted = Object.values(rawOfferOperations)
      .some((value) => value !== null);
    const shopIanaTimezone = offerOperationsWereSubmitted
      ? (await fetchShopConfiguration(admin)).shopIanaTimezone
      : '';
    const offerOperationsSave = resolveOfferOperationsSave(
      rawOfferOperations,
      existingBundle?.offerPolicy ?? null,
      shopIanaTimezone,
    );
    if ("issue" in offerOperationsSave) {
      return json({
        success: false,
        error: offerOperationsSave.issue.message,
        fieldErrors: [offerOperationsSave.issue],
      }, { status: 400 });
    }
    const countryTargetingSave = resolveOfferCountryTargetingSave({
      enabled: formData.get("countryTargetingEnabled"),
      mode: formData.get("countryTargetingMode"),
      countryCodes: formData.getAll("countryCodes"),
    }, existingBundle?.offerPolicy ?? null);
    if ("issue" in countryTargetingSave) {
      return json({
        success: false,
        error: countryTargetingSave.issue.message,
        fieldErrors: [countryTargetingSave.issue],
      }, { status: 400 });
    }
    const specificLinkUpdate = specificLinkOfferSave.updateData.offerPolicy
      ? {
          specificLinkRequired:
            specificLinkOfferSave.updateData.offerPolicy.update.specificLinkRequired,
        }
      : null;
    const offerPolicyMutation = buildOfferPolicyMutation({
      shopId: session.shop,
      policyExists: existingBundle?.offerPolicy != null,
      specificLinkUpdate,
      operations: offerOperationsSave,
      countryTargeting: countryTargetingSave,
    });
    const offerPolicyChanged = offerPolicyMutation.offerPolicy !== undefined;
    if (subscriptionConfig?.enabled && existingBundle?.personalizationData) {
      return json(
        {
          success: false,
          error: "Fix the subscription configuration before saving.",
          fieldErrors: [{
            path: "subscriptions.enabled",
            message: "Subscriptions are unavailable while personalization is enabled.",
          }],
        },
        { status: 400 },
      );
    }

    const isPublicMutation = finalStatus === BundleStatus.ACTIVE
      || finalStatus === BundleStatus.UNLISTED;
    const entitlementContext = isPublicMutation
      ? await resolveShopEntitlements({
          shopDomain: session.shop,
          forceRefresh: true,
        })
      : null;
    const enabledStepCount = stepsData.reduce(
      (count: number, step: any, index: number) =>
        count + (resolveBundleStepEnabled(index, step.enabled) ? 1 : 0),
      0,
    );
    const usesAdvancedDesign = entitlementContext
      ? await shopUsesAdvancedDesign(session.shop)
      : false;

    // Update bundle in database
    AppLogger.debug("[BUNDLE_CONFIG] Updating bundle in database");
    const updatedBundle = await updateBundleWithPublicationGate<any>({
      database: db,
      shopDomain: session.shop,
      bundleId,
      candidate: {
        bundleType: "PRODUCT_PAGE",
        status: finalStatus.toUpperCase() as "ACTIVE" | "UNLISTED" | "DRAFT" | "ARCHIVED",
        enabledStepCount,
        designTemplate: existingBundle?.bundleDesignTemplate,
        designPresetId: existingBundle?.bundleDesignPresetId,
        usesAdvancedDesign,
        usesBundleSubscriptions: subscriptionConfig?.enabled === true,
        usesCustomCode: false,
      },
      entitlements: entitlementContext?.entitlements ?? null,
      data: {
        name: bundleName,
        description: bundleDescription,
        status: finalStatus,
        // Preserve existing shopifyProductId/Handle if not provided in form
        shopifyProductId:
          bundleProductData?.id || existingBundle?.shopifyProductId || null,
        shopifyProductHandle:
          bundleProductData?.handle ||
          existingBundle?.shopifyProductHandle ||
          null,
        templateName: templateName,
        showProductPrices,
        cartRedirectToCheckout,
        allowQuantityChanges,
        sdkMode,
        textOverrides,
        textOverridesByLocale,
        ...offerPolicyMutation,
        ...(subscriptionConfig ? { bundleSubscriptionConfig: subscriptionConfig } : {}),
        ...parsePPBBundleVisibility(formData),
        ...parsedBundleSettings,
        boxSelection,
        // Update steps if provided
        ...(stepsData && {
          steps: {
            deleteMany: {},
            create: stepsData.map((step: any, index: number) => {
              // Get conditions for this step from stepConditionsData
              const stepConditions = stepConditionsData[step.id] || [];
              const firstCondition =
                stepConditions.length > 0 ? stepConditions[0] : null;
              const secondCondition =
                stepConditions.length > 1 ? stepConditions[1] : null;
              AppLogger.debug(
                `[DEBUG] Step ${step.id} conditions:`,
                stepConditions,
              );
              AppLogger.debug(
                `[DEBUG] Step ${step.id} first condition:`,
                firstCondition,
              );
              AppLogger.debug(
                `[DEBUG] Will save to DB - conditionType: ${firstCondition?.type || null}, conditionOperator: ${firstCondition?.operator || null}, conditionValue: ${firstCondition?.value ? parseInt(firstCondition.value) || null : null}`,
              );

              return {
                name: step.name,
                pageTitle: step.pageTitle ?? null,
                multiLangData: step.multiLangData ?? null,
                position: index + 1, // Map stepNumber to position field
                products: step.products || [],
                collections: step.collections || [],
                displayVariantsAsIndividual:
                  step.displayVariantsAsIndividualProducts || false,
                minQuantity: step.minQuantity,
                maxQuantity: step.maxQuantity,
                enabled: resolveBundleStepEnabled(index, step.enabled),
                // Free gift / add-on step fields
                isFreeGift: step.isFreeGift === true,
                freeGiftName: step.freeGiftName || null,
                addonLabel: step.addonLabel ?? null,
                addonTitle: step.addonTitle ?? null,
                addonAddText: step.addonAddText ?? null,
                addonReplaceText: step.addonReplaceText ?? null,
                addonIconUrl: step.addonIconUrl ?? null,
                addonDisplayFree: step.addonDisplayFree === true,
                addonTiers: Array.isArray(step.addonTiers)
                  ? step.addonTiers
                  : [],
                addonUnlockAfterCompletion:
                  step.addonUnlockAfterCompletion !== false,
                isDefault: step.isDefault === true,
                defaultVariantId: step.defaultVariantId || null,
                // Apply condition data if available
                conditionType: firstCondition?.type || null,
                conditionOperator: firstCondition?.operator || null,
                conditionValue: parseConditionValue(firstCondition?.value),
                conditionOperator2: secondCondition?.operator || null,
                conditionValue2: parseConditionValue(secondCondition?.value),
                filters: Array.isArray(step.filters) ? step.filters : null,
                imageUrl: step.imageUrl ?? null,
                timelineIconUrl: step.stepImage ?? null,
                // Create StepProduct records for selected products
                StepProduct: {
                  create: (step.StepProduct || []).map(
                    (product: any, productIndex: number) => {
                      // IDs already validated and normalised at the boundary above
                      return {
                        productId: product.id,
                        title:
                          product.title || product.name || "Unnamed Product",
                        imageUrl:
                          product.imageUrl ||
                          product.images?.[0]?.originalSrc ||
                          product.images?.[0]?.url ||
                          product.image?.url ||
                          null,
                        variants: product.variants || null,
                        minQuantity: product.minQuantity,
                        maxQuantity: product.maxQuantity,
                        position: productIndex + 1,
                      };
                    },
                  ),
                },
                // Create StepCategory records for merchant-defined categories
                StepCategory: {
                  create: Array.isArray(step.StepCategory)
                    ? step.StepCategory.map(
                        (cat: Record<string, unknown>, catIndex: number) =>
                          buildStepCategoryCreateInput(cat, catIndex),
                      )
                    : [],
                },
              };
            }),
          },
        }),
        // Update pricing if provided
        ...(discountData && {
          pricing: {
            upsert: {
              create: {
                enabled: discountData.discountEnabled,
                method: mapDiscountMethod(discountData.discountType),
                rules: discountData.discountRules || [],
                showFooter: discountData.showFooter !== false,
                displayOptions: discountData.displayOptions ?? null,
                messages: pricingMessages,
                ruleMessagesByLocale: discountData.ruleMessagesByLocale ?? null,
              },
              update: {
                enabled: discountData.discountEnabled,
                method: mapDiscountMethod(discountData.discountType),
                rules: discountData.discountRules || [],
                showFooter: discountData.showFooter !== false,
                displayOptions: discountData.displayOptions ?? null,
                messages: pricingMessages,
                ruleMessagesByLocale: discountData.ruleMessagesByLocale ?? null,
              },
            },
          },
        }),
      },
      include: {
        steps: {
          include: {
            StepProduct: true,
            StepCategory: { orderBy: { sortOrder: "asc" } },
          },
        },
        pricing: true,
      },
    });

    if (
      finalStatus === BundleStatus.ACTIVE
      || finalStatus === BundleStatus.UNLISTED
      || (offerPolicyChanged
        && Boolean(bundleProductData?.id || existingBundle?.shopifyProductId))
    ) {
      await syncBundleStorefrontNow({
        admin,
        shopDomain: session.shop,
        bundleId,
        bundleType: "product_page",
        reason: "save",
      });
    }
    if (subscriptionConfig?.enabled) {
      const activation =
        await AddOnDiscountFunctionService.completeSubscriptionInitialSetup(
          admin,
          session.shop,
        );
      if (!activation.success) {
        AppLogger.warn("Subscription initial-order discount setup failed during bundle save", {
          component: "bundle-config",
          operation: "save",
          bundleId,
          shopId: session.shop,
        }, { error: activation.error });
      }
      if (subscriptionConfig.recurringBundleDiscount) {
        const recurringActivation =
          await AddOnDiscountFunctionService.completeSubscriptionRecurringSetup(
            admin,
            session.shop,
          );
        if (!recurringActivation.success) {
          AppLogger.warn("Subscription recurring discount setup failed during bundle save", {
            component: "bundle-config",
            operation: "save",
            bundleId,
            shopId: session.shop,
          }, { error: recurringActivation.error });
        }
      }
    }

    return json({
      success: true,
      statusCode: 200,
      bundle: compactBundleForConfigureResponse(updatedBundle),
      message: "Updated Successfully!",
    });
  } catch (error: any) {
    if (error instanceof EntitlementDeniedError) {
      await recordSubscriptionEvent({
        eventHandle: "entitlement_publish_blocked",
        shopDomain: session.shop,
        planCode: null,
        billingInterval: "NONE",
        featureKey: error.entitlement,
        gateLocation: "ppb_save",
        bundleId,
        bundleType: "PRODUCT_PAGE",
        action: "publish",
        result: "blocked",
        errorCode: error.code,
      });
      return json({
        success: false,
        error: error.code,
        entitlementFailure: error.toJSON(),
      }, { status: error.status });
    }
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.FAILED_TO_SAVE_CONFIGURATION;
    AppLogger.error(
      "[BUNDLE_CONFIG] Error saving bundle:",
      { component: "handlers.server", bundleId },
      error,
    );
    return json({ success: false, error: message }, { status: 500 });
  }
}
