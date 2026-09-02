/**
 * Product deletion webhook handler.
 */

import db from "../../../db.server";
import { AppLogger } from "../../../lib/logger";
import type { WebhookProcessResult } from "../types";
import { BundleStatus } from "../../../constants/bundle";

/**
 * Handle product delete webhook
 * Removes deleted products from bundles and archives bundles with no products left
 */
export async function handleProductDelete(
  shopDomain: string,
  payload: any
): Promise<WebhookProcessResult> {
  try {
    // SAFETY: Validate payload has required fields
    if (!payload.id) {
      return {
        success: false,
        message: "Missing product ID in webhook payload",
        error: "payload.id is required"
      };
    }

    const productId = `gid://shopify/Product/${payload.id}`;

    AppLogger.info("Processing product delete", {
      component: "webhook-processor",
      operation: "handleProductDelete"
    }, { shop: shopDomain, productId });

    // Find all steps using this product
    const stepsWithProduct = await db.stepProduct.findMany({
      where: {
        productId,
        step: {
          bundle: {
            shopId: shopDomain,
          },
        },
      },
      include: {
        step: true
      }
    });

    if (stepsWithProduct.length === 0) {
      return {
        success: true,
        message: "Product not used in any bundles"
      };
    }

    // Delete all StepProduct entries for this product
    await db.stepProduct.deleteMany({
      where: {
        productId,
        step: {
          bundle: {
            shopId: shopDomain,
          },
        },
      }
    });

    AppLogger.info("Deleted product from bundle steps", {
      component: "webhook-processor",
      operation: "handleProductDelete"
    }, { shop: shopDomain, productId, deletedCount: stepsWithProduct.length });

    // Get unique step IDs
    const stepIds = [...new Set(stepsWithProduct.map(sp => sp.stepId))];

    // Find steps that now have no products
    const emptySteps = await db.bundleStep.findMany({
      where: {
        id: {
          in: stepIds
        }
      },
      include: {
        StepProduct: true,
        bundle: true
      }
    });

    const emptyStepIds = emptySteps
      .filter(step => step.StepProduct.length === 0)
      .map(step => step.id);

    if (emptyStepIds.length > 0) {
      // Find bundles that have empty steps
      const bundlesWithEmptySteps = await db.bundle.findMany({
        where: {
          steps: {
            some: {
              id: {
                in: emptyStepIds
              }
            }
          },
          status: BundleStatus.ACTIVE
        },
        select: {
          id: true
        }
      });

      if (bundlesWithEmptySteps.length > 0) {
        // Archive bundles with empty steps
        await db.bundle.updateMany({
          where: {
            id: {
              in: bundlesWithEmptySteps.map(b => b.id)
            }
          },
          data: {
            status: "archived"
          }
        });

        AppLogger.warn("Archived bundles with empty steps after product deletion", {
          component: "webhook-processor",
          operation: "handleProductDelete"
        }, {
          shop: shopDomain,
          productId,
          archivedBundles: bundlesWithEmptySteps.length
        });

        return {
          success: true,
          message: `Product deleted, archived ${bundlesWithEmptySteps.length} bundles with empty steps`
        };
      }
    }

    return {
      success: true,
      message: "Product deleted from bundle steps"
    };

  } catch (error: any) {
    AppLogger.error("Error handling product delete", {
      component: "webhook-processor",
      operation: "handleProductDelete"
    }, error);

    return {
      success: false,
      message: "Error handling product delete",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
