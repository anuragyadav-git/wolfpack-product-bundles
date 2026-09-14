import type { AdminTaskAlert } from "../lib/admin-alert-feedback";
import type { BundleProductData } from "../types/bundle-configure";
import type { EntitlementFailureData } from "../components/billing/EntitlementUpgradeModal";

type ConfigureModalKey =
  | "pageSelection"
  | "widgetInstall"
  | "products"
  | "collections";

interface ConfigureRouteState {
  isDirty: boolean;
  modals: Record<ConfigureModalKey, boolean>;
  currentModalStepId: string;
  isLoadingPages: boolean;
  availablePages: any[];
  selectedPage: any | null;
  bundleProduct: BundleProductData | null;
  productStatus: string;
  productTitle: string;
  productImageUrl: string;
  selectedCollections: Record<string, any[]>;
  ruleMessages: Record<string, { discountText: string; successMessage: string }>;
  activeTabIndex: number;
  activeSection: string;
  forceNavigation: boolean;
  showAutoPlacementBanner: boolean;
  dismissedBanners: string[];
  operationAlert: AdminTaskAlert | null;
  entitlementFailure: EntitlementFailureData | null;
}

type LoadedConfigureState = Partial<Pick<
  ConfigureRouteState,
  | "bundleProduct"
  | "productStatus"
  | "productTitle"
  | "productImageUrl"
  | "selectedCollections"
  | "ruleMessages"
>>;

type ConfigureRouteAction =
  | { type: "initialize"; value: LoadedConfigureState }
  | { type: "resetNavigation" }
  | { type: "setDirty"; value: boolean }
  | { type: "openModal"; modal: ConfigureModalKey; stepId?: string }
  | { type: "closeModal"; modal: ConfigureModalKey }
  | { type: "setCurrentModalStepId"; value: string }
  | { type: "setLoadingPages"; value: boolean }
  | { type: "setAvailablePages"; value: any[] }
  | { type: "setSelectedPage"; value: any | null }
  | { type: "setBundleProduct"; value: BundleProductData | null }
  | { type: "setProductStatus"; value: string }
  | { type: "setProductTitle"; value: string }
  | { type: "setProductImageUrl"; value: string }
  | { type: "setSelectedCollections"; value: Record<string, any[]> }
  | {
      type: "setRuleMessages";
      value: Record<string, { discountText: string; successMessage: string }>;
    }
  | { type: "setActiveTabIndex"; value: number }
  | { type: "setActiveSection"; value: string }
  | { type: "setForceNavigation"; value: boolean }
  | { type: "setShowAutoPlacementBanner"; value: boolean }
  | { type: "setDismissedBanners"; value: string[] }
  | { type: "setOperationAlert"; value: AdminTaskAlert | null }
  | { type: "setEntitlementFailure"; value: EntitlementFailureData | null };

export function createInitialConfigureRouteState(): ConfigureRouteState {
  return {
    isDirty: false,
    modals: {
      pageSelection: false,
      widgetInstall: false,
      products: false,
      collections: false,
    },
    currentModalStepId: "",
    isLoadingPages: false,
    availablePages: [],
    selectedPage: null,
    bundleProduct: null,
    productStatus: "",
    productTitle: "",
    productImageUrl: "",
    selectedCollections: {},
    ruleMessages: {},
    activeTabIndex: 0,
    activeSection: "step_setup",
    forceNavigation: false,
    showAutoPlacementBanner: false,
    dismissedBanners: [],
    operationAlert: null,
    entitlementFailure: null,
  };
}

export function reduceConfigureRouteState(
  state: ConfigureRouteState,
  action: ConfigureRouteAction,
): ConfigureRouteState {
  switch (action.type) {
    case "initialize":
      return {
        ...state,
        bundleProduct: action.value.bundleProduct ?? null,
        productStatus: action.value.productStatus ?? "",
        productTitle: action.value.productTitle ?? "",
        productImageUrl: action.value.productImageUrl ?? "",
        selectedCollections: action.value.selectedCollections ?? {},
        ruleMessages: action.value.ruleMessages ?? {},
        isDirty: false,
      };
    case "resetNavigation":
      return {
        ...state,
        activeTabIndex: 0,
        activeSection: "step_setup",
        forceNavigation: false,
      };
    case "setDirty":
      return { ...state, isDirty: action.value };
    case "openModal":
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: true },
        currentModalStepId: action.stepId ?? state.currentModalStepId,
      };
    case "closeModal":
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: false },
      };
    case "setCurrentModalStepId":
      return { ...state, currentModalStepId: action.value };
    case "setLoadingPages":
      return { ...state, isLoadingPages: action.value };
    case "setAvailablePages":
      return { ...state, availablePages: action.value };
    case "setSelectedPage":
      return { ...state, selectedPage: action.value };
    case "setBundleProduct":
      return { ...state, bundleProduct: action.value, isDirty: true };
    case "setProductStatus":
      return { ...state, productStatus: action.value, isDirty: true };
    case "setProductTitle":
      return { ...state, productTitle: action.value };
    case "setProductImageUrl":
      return { ...state, productImageUrl: action.value };
    case "setSelectedCollections":
      return { ...state, selectedCollections: action.value, isDirty: true };
    case "setRuleMessages":
      return { ...state, ruleMessages: action.value, isDirty: true };
    case "setActiveTabIndex":
      return { ...state, activeTabIndex: action.value };
    case "setActiveSection":
      return { ...state, activeSection: action.value };
    case "setForceNavigation":
      return { ...state, forceNavigation: action.value };
    case "setShowAutoPlacementBanner":
      return { ...state, showAutoPlacementBanner: action.value };
    case "setDismissedBanners":
      return { ...state, dismissedBanners: action.value };
    case "setOperationAlert":
      return { ...state, operationAlert: action.value };
    case "setEntitlementFailure":
      return { ...state, entitlementFailure: action.value };
  }
}
