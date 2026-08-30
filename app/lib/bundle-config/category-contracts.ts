import {
  parseVariantSelectorConfiguration,
  type VariantSelectorMode,
} from "./variant-selector-config";

export type CategoryBundleType = "full_page" | "product_page";

export interface CategoryConditionContract {
  type: string;
  condition: string;
  value: string;
}

export interface CategoryProductContract {
  id: string;
  productId?: string;
  graphqlId?: string;
  handle?: string;
  variants?: unknown[];
  hasOnlyDefaultVariant?: boolean;
  images?: unknown[];
  title?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface CategoryCollectionContract {
  id: string;
  handle?: string;
  title?: string;
  [key: string]: unknown;
}

export interface CategoryContractInput {
  bundleType: CategoryBundleType;
  id: string;
  name: string;
  title?: string;
  subTitle?: string;
  sortOrder?: number;
  products?: CategoryProductContract[];
  collections?: CategoryCollectionContract[];
  conditions?: CategoryConditionContract[];
  categoryBanner?: string;
  categoryImg?: string;
  autoNextStepOnConditionMet?: boolean;
  multiLangData?: Record<string, unknown>;
  displayVariantsAsIndividualProducts?: boolean;
  variantSelectorMode?: VariantSelectorMode;
  swatchTooltipEnabled?: boolean;
  variantColorMap?: Record<string, string>;
}

export function buildCategoryContract(input: CategoryContractInput) {
  const products = input.products ?? [];
  const collections = input.collections ?? [];
  const conditions = input.conditions ?? [];
  const subTitle = input.subTitle ?? "";
  const categoryBanner = input.categoryBanner ?? "";
  const multiLangData = input.multiLangData ?? {};
  const autoNextStepOnConditionMet = input.autoNextStepOnConditionMet === true;

  if (input.bundleType === "full_page") {
    return {
      id: input.id,
      title: input.title ?? input.name,
      subTitle,
      categoryImg: input.categoryImg ?? "",
      conditions,
      autoNextStepOnConditionMet,
      products,
      collections,
      categoryBanner,
      multiLangData,
    };
  }

  const variantSelector = parseVariantSelectorConfiguration(input);

  return {
    id: input.id,
    ...(input.title ? { title: input.title } : {}),
    subTitle,
    name: input.name,
    sortOrder: input.sortOrder ?? 0,
    conditions,
    autoNextStepOnConditionMet,
    products,
    collections,
    categoryBanner,
    displayVariantsAsIndividualProducts: input.displayVariantsAsIndividualProducts === true,
    ...variantSelector,
    multiLangData,
  };
}
