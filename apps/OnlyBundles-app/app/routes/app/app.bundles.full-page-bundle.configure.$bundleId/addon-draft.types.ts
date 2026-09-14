export type AddonTierConditionDraft = {
  id?: string | number;
  type?: string;
  condition?: string;
  value?: string | number;
};

export type AddonSelectedVariantDraft = {
  id?: string | number;
  variantId?: string | number;
  variantGraphqlId?: string;
  inventoryQuantity?: number | null;
  inventoryPolicy?: string | null;
  price?: string | number | null;
  title?: string;
  variantTitle?: string;
};

export type AddonSelectedProductDraft = {
  id?: string;
  graphqlId?: string;
  productId?: string;
  title?: string;
  name?: string;
  handle?: string | null;
  imageUrl?: string;
  image?: { url?: string };
  images?: Array<{ originalSrc?: string | null; url?: string | null }>;
  variants?: AddonSelectedVariantDraft[];
  tags?: string[];
  hasOnlyDefaultVariant?: boolean;
};

export type AddonTierDraft = {
  tierId?: string;
  title?: string;
  selectedAddonProducts?: AddonSelectedProductDraft[];
  eligibilityType?: string;
  eligibilityValue?: number | string;
  eligibilityCondition?: {
    type?: string;
    value?: number | string;
    isValidateEligibilityConditionEnabled?: boolean;
  };
  discountType?: string;
  discountValue?: number | string;
  discount?: { type?: string; value?: number | string };
  displayVariantsAsIndividualProducts_addons?: boolean;
  displayFree?: boolean;
  conditions?: AddonTierConditionDraft[];
};

export type AddonDraft = {
  isPersonalizationEnabled: boolean;
  personalizeStepText: string;
  personalizePageSubtext: string;
  stepImage: string | null;
  addonProductsEnabled: boolean;
  addonProductsTitle: string;
  addonTiers: AddonTierDraft[];
  addonMultiLangData: Record<string, Record<string, string>>;
};

export type AddonDraftUpdate = Partial<AddonDraft>;

export type AddonDraftInput = Partial<AddonDraft> &
  Pick<AddonDraft, "isPersonalizationEnabled" | "addonProductsEnabled">;
