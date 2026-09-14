import { json } from "@remix-run/node";
import {
  batchCheckStorefrontVariants,
  validateVariantIdFromShopify,
} from "../variant-existence.server";

type ParsedVariantRef = string | number;

function extractStepProductVariantReference(rawVariant: unknown): ParsedVariantRef | null {
  if (rawVariant === null || rawVariant === undefined) {
    return null;
  }

  if (typeof rawVariant === "string" || typeof rawVariant === "number") {
    return rawVariant;
  }

  if (typeof rawVariant !== "object") {
    return null;
  }

  const candidate = rawVariant as Record<string, unknown>;
  const directReference =
    candidate.variantId ??
    candidate.variantGraphqlId ??
    candidate.id ??
    candidate.variant_gid ??
    candidate.variantGraphql;

  if (typeof directReference === "string" || typeof directReference === "number") {
    return directReference;
  }

  return null;
}
function toStringVariant(rawVariant: unknown): string {
  return String(rawVariant ?? "");
}

export async function validatePersistedStepProductVariants({
  route,
  shopDomain,
  stepsData,
}: {
  route: "fpb-save" | "ppb-save";
  shopDomain: string;
  stepsData: Array<Record<string, unknown>>;
}): Promise<Response | null> {
  const references: Array<{
    numericId: string;
    rawVariantId: ParsedVariantRef;
    stepId: unknown;
    stepIndex: number;
    productIndex: number;
    variantIndex: number;
  }> = [];

  for (let stepIndex = 0; stepIndex < stepsData.length; stepIndex += 1) {
    const step = stepsData[stepIndex];
    const products = Array.isArray(step.StepProduct) ? step.StepProduct : [];

    for (let productIndex = 0; productIndex < products.length; productIndex += 1) {
      const product = products[productIndex] as Record<string, unknown>;
      const variantRefs = Array.isArray(product.variants) ? product.variants : [];

      for (let variantIndex = 0; variantIndex < variantRefs.length; variantIndex += 1) {
        const rawVariantId = extractStepProductVariantReference(variantRefs[variantIndex]);
        if (rawVariantId === null) {
          return json(
            {
              success: false,
              error: `${route} blocked on step ${stepIndex + 1}, product ${productIndex + 1}: empty variant reference at position ${variantIndex + 1}.`,
              context: {
                route,
                stepIndex: stepIndex + 1,
                productIndex: productIndex + 1,
                variantIndex: variantIndex + 1,
                variantId: "",
                reason: "invalid-format",
              },
              fieldErrors: [{
                path: `steps.${String(step.id ?? `step-${stepIndex + 1}`)}.products.${productIndex + 1}.variants.${variantIndex + 1}`,
                message: "Select a valid product variant.",
              }],
            },
            { status: 400 },
          );
        }

        const parsed = await validateVariantIdFromShopify(rawVariantId);

        if (!parsed.isValidFormat) {
          return json(
            {
              success: false,
              error: `${route} blocked on step ${stepIndex + 1}, product ${productIndex + 1}: invalid variant format for "${toStringVariant(rawVariantId)}".`,
              context: {
                route,
                stepIndex: stepIndex + 1,
                productIndex: productIndex + 1,
                variantIndex: variantIndex + 1,
                variantId: toStringVariant(rawVariantId),
                reason: "invalid-format",
              },
              fieldErrors: [{
                path: `steps.${String(step.id ?? `step-${stepIndex + 1}`)}.products.${productIndex + 1}.variants.${variantIndex + 1}`,
                message: "Select a valid product variant.",
              }],
            },
            { status: 400 },
          );
        }

        references.push({
          numericId: parsed.numericId,
          rawVariantId,
          stepId: step.id,
          stepIndex,
          productIndex,
          variantIndex,
        });
      }
    }
  }

  const lookups = await batchCheckStorefrontVariants(
    shopDomain,
    [...new Set(references.map(({ numericId }) => numericId))],
  );
  for (const reference of references) {
    const variantLookup = lookups.get(reference.numericId);
    if (variantLookup?.ok) continue;
    const status = variantLookup?.status ?? 0;
    return json(
      {
        success: false,
        error: `${route} blocked variant in step ${reference.stepIndex + 1}, product ${reference.productIndex + 1}: ${toStringVariant(reference.rawVariantId)} is not available on storefront (${status}).`,
        context: {
          route,
          stepIndex: reference.stepIndex + 1,
          productIndex: reference.productIndex + 1,
          variantIndex: reference.variantIndex + 1,
          variantId: toStringVariant(reference.rawVariantId),
          status,
          reason: variantLookup?.message || "not-found",
        },
        fieldErrors: [{
          path: `steps.${String(reference.stepId ?? `step-${reference.stepIndex + 1}`)}.products.${reference.productIndex + 1}.variants.${reference.variantIndex + 1}`,
          message: "This product variant is not available on the storefront.",
        }],
      },
      { status: 400 },
    );
  }

  return null;
}
