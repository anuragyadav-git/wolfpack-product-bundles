import type { ApiVersion } from "@shopify/shopify-api";
import type { authenticate } from "~/shopify.server";
import { AppLogger } from "../lib/logger";

type AdminApiContext = Awaited<ReturnType<typeof authenticate.admin>>["admin"];

export type AddOnDiscountSetupOutcome =
  | "created"
  | "reactivated"
  | "already_active";

export interface AddOnDiscountActivationResult {
  success: boolean;
  discountId?: string;
  functionId?: string;
  functionHandle?: string;
  outcome?: AddOnDiscountSetupOutcome;
  error?: string;
}

type AddOnDiscountFunction = {
  id: string;
  handle: string;
};

type ExistingAddOnDiscount = {
  id: string;
  status: string;
};

type DiscountFunctionRole = {
  key: "addons" | "subscription_initial";
  title: string;
  recurringCycleLimit?: number;
};

const ADDON_DISCOUNT_FUNCTION_HANDLE = "bundle-discount-function";
const ADDON_DISCOUNT_TITLE = "Add On";
const ADDON_ROLE: DiscountFunctionRole = { key: "addons", title: ADDON_DISCOUNT_TITLE };
const SUBSCRIPTION_INITIAL_ROLE: DiscountFunctionRole = {
  key: "subscription_initial",
  title: "Bundle Subscription - Initial Order",
  recurringCycleLimit: 1,
};
const ADDON_DISCOUNT_API_VERSION = "2026-07" as ApiVersion;

function formatGraphQLErrors(errors: Array<{ message?: string }> = []) {
  return errors
    .map((error) => error.message)
    .filter(Boolean)
    .join(", ");
}

function formatUserErrors(
  errors: Array<{ field?: string[]; message?: string }> = [],
) {
  return errors
    .map((error) => {
      const field = error.field?.length ? `${error.field.join(".")}: ` : "";
      return `${field}${error.message ?? "Unknown Shopify user error"}`;
    })
    .join(", ");
}

export class AddOnDiscountFunctionService {
  private static async getFunction(
    admin: AdminApiContext,
  ): Promise<AddOnDiscountFunction | null> {
    const QUERY = `
      query GetAddOnDiscountFunction {
        shopifyFunctions(first: 50) {
          nodes {
            id
            handle
          }
        }
      }
    `;

    const response = await admin.graphql(QUERY, {
      apiVersion: ADDON_DISCOUNT_API_VERSION,
    });
    const data = await response.json() as any;
    if (data.errors?.length) {
      throw new Error(`GraphQL errors: ${formatGraphQLErrors(data.errors)}`);
    }

    const match = data.data?.shopifyFunctions?.nodes?.find(
      (shopifyFunction: any) =>
        shopifyFunction?.handle === ADDON_DISCOUNT_FUNCTION_HANDLE,
    );

    return match
      ? {
          id: match.id,
          handle: match.handle,
        }
      : null;
  }

  private static async findExistingDiscounts(
    admin: AdminApiContext,
    functionId: string,
    role: DiscountFunctionRole,
  ): Promise<ExistingAddOnDiscount[]> {
    const QUERY = `
      query FindAddOnAutomaticDiscounts {
        discountNodes(first: 50) {
          nodes {
            id
            discount {
              __typename
              ... on DiscountAutomaticApp {
                title
                status
                appDiscountType {
                  functionId
                }
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(QUERY, {
      apiVersion: ADDON_DISCOUNT_API_VERSION,
    });
    const data = await response.json() as any;
    if (data.errors?.length) {
      throw new Error(`GraphQL errors: ${formatGraphQLErrors(data.errors)}`);
    }

    return (data.data?.discountNodes?.nodes ?? [])
      .filter((node: any) => {
        const discount = node?.discount;
        return discount?.__typename === "DiscountAutomaticApp"
          && discount?.title === role.title
          && discount?.appDiscountType?.functionId === functionId;
      })
      .map((node: any) => ({
        id: node.id,
        status: node.discount.status,
      }));
  }

  private static async activateAutomaticDiscount(
    admin: AdminApiContext,
    discount: ExistingAddOnDiscount,
    shopifyFunction: AddOnDiscountFunction,
  ): Promise<AddOnDiscountActivationResult> {
    const MUTATION = `
      mutation ActivateAddOnAutomaticDiscount($id: ID!) {
        discountAutomaticActivate(id: $id) {
          automaticDiscountNode {
            id
            automaticDiscount {
              __typename
              ... on DiscountAutomaticApp {
                status
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const response = await admin.graphql(MUTATION, {
      apiVersion: ADDON_DISCOUNT_API_VERSION,
      variables: { id: discount.id },
    });
    const data = await response.json() as any;
    if (data.errors?.length) {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        discountId: discount.id,
        error: `GraphQL errors: ${formatGraphQLErrors(data.errors)}`,
      };
    }

    const payload = data.data?.discountAutomaticActivate;
    const userErrors = payload?.userErrors ?? [];
    if (userErrors.length) {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        discountId: discount.id,
        error: `User errors: ${formatUserErrors(userErrors)}`,
      };
    }

    const activated = payload?.automaticDiscountNode;
    const status = activated?.automaticDiscount?.status;
    if (!activated?.id || status !== "ACTIVE") {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        discountId: discount.id,
        error: `Shopify did not activate add-on discount '${discount.id}' (status: ${status ?? "unknown"})`,
      };
    }

    return {
      success: true,
      functionId: shopifyFunction.id,
      functionHandle: shopifyFunction.handle,
      discountId: activated.id,
      outcome: "reactivated",
    };
  }

  private static async createAutomaticDiscount(
    admin: AdminApiContext,
    shopifyFunction: AddOnDiscountFunction,
    role: DiscountFunctionRole,
  ): Promise<AddOnDiscountActivationResult> {
    const MUTATION = `
      mutation CreateAddOnAutomaticDiscount($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
            status
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const response = await admin.graphql(MUTATION, {
      apiVersion: ADDON_DISCOUNT_API_VERSION,
      variables: {
        automaticAppDiscount: {
          title: role.title,
          functionHandle: shopifyFunction.handle,
          startsAt: new Date().toISOString(),
          discountClasses: ["PRODUCT"],
          combinesWith: {
            orderDiscounts: true,
            productDiscounts: true,
            shippingDiscounts: false,
          },
          ...(role.recurringCycleLimit !== undefined
            ? { recurringCycleLimit: role.recurringCycleLimit }
            : {}),
          metafields: [{
            namespace: "$app",
            key: "discount_role",
            type: "single_line_text_field",
            value: role.key,
          }],
        },
      },
    });
    const data = await response.json() as any;

    if (data.errors?.length) {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        error: `GraphQL errors: ${formatGraphQLErrors(data.errors)}`,
      };
    }

    const payload = data.data?.discountAutomaticAppCreate;
    const userErrors = payload?.userErrors ?? [];
    if (userErrors.length) {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        error: `User errors: ${formatUserErrors(userErrors)}`,
      };
    }

    const created = payload?.automaticAppDiscount;
    if (!created?.discountId || created.status !== "ACTIVE") {
      return {
        success: false,
        functionId: shopifyFunction.id,
        functionHandle: shopifyFunction.handle,
        discountId: created?.discountId,
        error: `Shopify did not create an active add-on discount (status: ${created?.status ?? "unknown"})`,
      };
    }

    return {
      success: true,
      functionId: shopifyFunction.id,
      functionHandle: shopifyFunction.handle,
      discountId: created.discountId,
      outcome: "created",
    };
  }

  static async completeSetup(
    admin: AdminApiContext,
    shopDomain: string,
  ): Promise<AddOnDiscountActivationResult> {
    return this.completeRoleSetup(admin, shopDomain, ADDON_ROLE);
  }

  static async completeSubscriptionInitialSetup(
    admin: AdminApiContext,
    shopDomain: string,
  ): Promise<AddOnDiscountActivationResult> {
    return this.completeRoleSetup(admin, shopDomain, SUBSCRIPTION_INITIAL_ROLE);
  }

  private static async completeRoleSetup(
    admin: AdminApiContext,
    shopDomain: string,
    role: DiscountFunctionRole,
  ): Promise<AddOnDiscountActivationResult> {
    AppLogger.info("Starting add-on discount function setup", {
      component: "addon-discount-function",
      operation: "complete-setup",
    }, { shopDomain });

    try {
      const shopifyFunction = await this.getFunction(admin);
      if (!shopifyFunction) {
        const error = `Discount function '${ADDON_DISCOUNT_FUNCTION_HANDLE}' not found - has the app been deployed?`;
        AppLogger.warn(error, {
          component: "addon-discount-function",
          operation: "complete-setup",
        }, { shopDomain });
        return { success: false, error };
      }

      const existingDiscounts = await this.findExistingDiscounts(
        admin,
        shopifyFunction.id,
        role,
      );
      const activeDiscount = existingDiscounts.find(
        (discount) => discount.status === "ACTIVE",
      );
      if (activeDiscount) {
        return {
          success: true,
          functionId: shopifyFunction.id,
          functionHandle: shopifyFunction.handle,
          discountId: activeDiscount.id,
          outcome: "already_active",
        };
      }

      const inactiveDiscount = existingDiscounts[0];
      const result = inactiveDiscount
        ? await this.activateAutomaticDiscount(
            admin,
            inactiveDiscount,
            shopifyFunction,
          )
        : await this.createAutomaticDiscount(admin, shopifyFunction, role);

      if (!result.success) {
        AppLogger.warn("Add-on automatic discount setup failed", {
          component: "addon-discount-function",
          operation: "complete-setup",
        }, { shopDomain, error: result.error });
      }

      return result;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown add-on discount activation error";
      AppLogger.warn("Add-on automatic discount setup failed", {
        component: "addon-discount-function",
        operation: "complete-setup",
      }, { shopDomain, error: message });
      return {
        success: false,
        error: message,
      };
    }
  }
}
