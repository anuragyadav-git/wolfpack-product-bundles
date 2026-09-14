import { BundleType } from "../constants/bundle";

export type SidekickBundleDraft = {
  title?: string;
  bundleType?: BundleType;
};

type SidekickBundleDraftValidation = {
  draft: SidekickBundleDraft;
  errors: string[];
};

type SidekickToolRegistry = {
  register: (
    name: string,
    handler: (
      input: Record<string, unknown>,
    ) => Record<string, unknown> | Promise<Record<string, unknown>>,
  ) => () => void;
};

type SidekickIntentRequest = {
  value: unknown;
  subscribe: (callback: (request: unknown) => void) => () => void;
};

export function resolveSidekickAppBridge<T>(
  scope: { shopify?: T } | undefined,
): T | null {
  return scope?.shopify ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSidekickBundleDraft(
  input: unknown,
): SidekickBundleDraftValidation {
  if (!isRecord(input)) {
    return { draft: {}, errors: ["invalid_input"] };
  }

  const draft: SidekickBundleDraft = {};
  const errors: string[] = [];

  if (input.title !== undefined) {
    if (typeof input.title !== "string") {
      errors.push("invalid_title");
    } else {
      const title = input.title.trim();
      if (title.length < 3 || title.length > 255) {
        errors.push("invalid_title");
      } else {
        draft.title = title;
      }
    }
  }

  if (input.bundle_type !== undefined) {
    if (
      input.bundle_type !== BundleType.FULL_PAGE &&
      input.bundle_type !== BundleType.PRODUCT_PAGE
    ) {
      errors.push("invalid_bundle_type");
    } else {
      draft.bundleType = input.bundle_type;
    }
  }

  return errors.length > 0 ? { draft: {}, errors } : { draft, errors };
}

export function readSidekickProductImportRequest(
  request: unknown,
): SidekickBundleDraftValidation | null {
  if (!isRecord(request)) return null;
  if (
    typeof request.type !== "string" ||
    request.type.toLowerCase() !== "shopify/product" ||
    request.action !== "import"
  ) {
    return null;
  }

  return validateSidekickBundleDraft(request.data ?? {});
}

export function registerSidekickBundleDraftTool(
  tools: SidekickToolRegistry,
  applyDraft: (draft: SidekickBundleDraft) => void,
) {
  return tools.register("stage_bundle_draft", async (input) => {
    const result = validateSidekickBundleDraft(input);
    if (result.errors.length > 0) {
      return {
        staged: false,
        requires_confirmation: true,
        errors: result.errors,
      };
    }

    applyDraft(result.draft);
    return {
      staged: true,
      requires_confirmation: true,
      draft: result.draft,
    };
  });
}

export function initializeSidekickBundleIntentBridge({
  tools,
  request,
  applyDraft,
  onInvalidIntent,
}: {
  tools: SidekickToolRegistry;
  request: SidekickIntentRequest;
  applyDraft: (draft: SidekickBundleDraft) => void;
  onInvalidIntent: (errors: string[]) => void;
}) {
  const unregisterTool = registerSidekickBundleDraftTool(tools, applyDraft);

  const handleIntent = (intent: unknown) => {
    const result = readSidekickProductImportRequest(intent);
    if (!result) return;

    if (result.errors.length > 0) {
      onInvalidIntent(result.errors);
      return;
    }

    applyDraft(result.draft);
  };

  handleIntent(request.value);
  const unsubscribeIntent = request.subscribe(handleIntent);

  return () => {
    unsubscribeIntent();
    unregisterTool();
  };
}
