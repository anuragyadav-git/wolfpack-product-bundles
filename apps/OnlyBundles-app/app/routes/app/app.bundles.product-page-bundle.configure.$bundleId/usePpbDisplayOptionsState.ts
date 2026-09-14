import { useEffect, useRef, useState } from "react";
import type { PricingRule } from "../../../types/pricing";
import { DiscountMethod } from "../../../types/pricing";
import {
  DEFAULT_PROGRESS_BAR_PROGRESS_TEXT,
  DEFAULT_PROGRESS_BAR_SUCCESS_TEXT,
} from "../../../lib/pricing-display-options";
import type { RuleMessagesByLocale } from "../../../lib/bundle-configure-translations";
import type { useBundlePricing } from "../../../hooks/useBundlePricing";

type SavedBundleQuantityOptions = {
  enabled?: boolean;
  defaultRuleId?: string | null;
  optionsByRuleId?: Record<string, { label?: string; subtext?: string }>;
  optionsByLocaleByRuleId?: Record<
    string,
    Record<string, { label: string; subtext: string }>
  >;
};

type SavedProgressBar = {
  enabled?: boolean;
  type?: string;
  progressText?: string;
  successText?: string;
};

type PpbDisplayOptionsBundle = {
  pricing?: {
    displayOptions?: {
      bundleQuantityOptions?: SavedBundleQuantityOptions;
      progressBar?: SavedProgressBar;
    };
    ruleMessagesByLocale?: RuleMessagesByLocale;
    messages?: {
      successMessage?: string;
      successMessageByLocale?: Record<string, string>;
    };
  };
};

export function usePpbDisplayOptionsState({
  bundle,
  shopLocales,
  pricingState,
  markAsDirty,
}: {
  bundle: PpbDisplayOptionsBundle;
  shopLocales: Array<{ primary: boolean; locale: string }>;
  pricingState: ReturnType<typeof useBundlePricing>;
  markAsDirty: () => void;
}) {
  const _savedDisplayOpts = bundle.pricing?.displayOptions ?? {};
  const savedQuantityOptionsByRuleId = (_savedDisplayOpts?.bundleQuantityOptions
    ?.optionsByRuleId ?? {}) as Record<
    string,
    { label?: string; subtext?: string }
  >;
  const [qtyOptionsEnabled, setQtyOptionsEnabled] = useState<boolean>(
    _savedDisplayOpts?.bundleQuantityOptions?.enabled === true,
  );
  const [qtyOptionsDefaultRuleId, setQtyOptionsDefaultRuleId] = useState<
    string | null
  >(_savedDisplayOpts?.bundleQuantityOptions?.defaultRuleId ?? null);
  const [qtyRuleLabels, setQtyRuleLabels] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(savedQuantityOptionsByRuleId).map(([ruleId, option]) => [
        ruleId,
        option.label ?? "",
      ]),
    ),
  );
  const [qtyRuleSubtexts, setQtyRuleSubtexts] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      Object.entries(savedQuantityOptionsByRuleId).map(([ruleId, option]) => [
        ruleId,
        option.subtext ?? "",
      ]),
    ),
  );
  const [qtyRuleTextsByLocaleByRuleId, setQtyRuleTextsByLocaleByRuleId] =
    useState<
      Record<string, Record<string, { label: string; subtext: string }>>
    >(_savedDisplayOpts?.bundleQuantityOptions?.optionsByLocaleByRuleId ?? {});
  const [progressBarEnabled, setProgressBarEnabled] = useState<boolean>(
    _savedDisplayOpts?.progressBar?.enabled === true,
  );
  const [progressBarType, setProgressBarType] = useState<string>(
    _savedDisplayOpts?.progressBar?.type ?? "step_based",
  );
  const [progressBarProgressText] = useState<string>(
    _savedDisplayOpts?.progressBar?.progressText ??
      DEFAULT_PROGRESS_BAR_PROGRESS_TEXT,
  );
  const [progressBarSuccessText] = useState<string>(
    _savedDisplayOpts?.progressBar?.successText ??
      DEFAULT_PROGRESS_BAR_SUCCESS_TEXT,
  );
  const {
    setTierTextByLocaleByRuleId,
    setTierTextByRuleId,
    tierTextByLocaleByRuleId,
    tierTextByRuleId,
  } = pricingState;
  const [isProgressBarMultiLangModalOpen, setIsProgressBarMultiLangModalOpen] =
    useState(false);
  const [activeProgressBarLocale, setActiveProgressBarLocale] =
    useState<string>(
      shopLocales.find((l) => l.primary)?.locale ??
        shopLocales[0]?.locale ??
        "",
    );
  const [
    isBundleQuantityMultiLangModalOpen,
    setIsBundleQuantityMultiLangModalOpen,
  ] = useState(false);
  const [activeBundleQuantityLocale, setActiveBundleQuantityLocale] =
    useState<string>(
      shopLocales.find((l) => l.primary)?.locale ??
        shopLocales[0]?.locale ??
        "",
    );
  const [
    discountMessagingMultiLanguageEnabled,
    setDiscountMessagingMultiLanguageEnabled,
  ] = useState<boolean>(!!bundle.pricing?.ruleMessagesByLocale);
  const [ruleMessagesByLocale, setRuleMessagesByLocale] =
    useState<RuleMessagesByLocale>(
      bundle.pricing?.ruleMessagesByLocale ?? {},
  );
  const [activeDiscountLocale, setActiveDiscountLocale] = useState<string>(
    shopLocales.find((l) => l.primary)?.locale ??
      shopLocales[0]?.locale ??
      "",
  );
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState<string>(
    bundle.pricing?.messages?.successMessage ?? "",
  );
  const [successMessageByLocale, setSuccessMessageByLocale] = useState<
    Record<string, string>
  >(
    bundle.pricing?.messages?.successMessageByLocale ?? {},
  );
  const templateVariablesModalRef = useRef<any>(null);
  const discountVariablesModalRef = useRef<any>(null);
  const [isDiscountVariablesModalOpen, setIsDiscountVariablesModalOpen] =
    useState(false);
  const bundleQuantityOptionsEligible =
    pricingState.discountType !== DiscountMethod.BUY_X_GET_Y &&
    pricingState.discountRules.length > 0 &&
    pricingState.discountRules.every(
      (rule: PricingRule) => rule.conditionType === "quantity",
    );
  const displayOptionsInactive =
    !pricingState.discountEnabled || pricingState.discountRules.length === 0;

  useEffect(() => {
    if (!bundleQuantityOptionsEligible && qtyOptionsEnabled) {
      setQtyOptionsEnabled(false);
      markAsDirty();
    }
  }, [bundleQuantityOptionsEligible, qtyOptionsEnabled, markAsDirty]);

  return {
    _savedDisplayOpts,
    savedQuantityOptionsByRuleId,
    qtyOptionsEnabled,
    setQtyOptionsEnabled,
    qtyOptionsDefaultRuleId,
    setQtyOptionsDefaultRuleId,
    qtyRuleLabels,
    setQtyRuleLabels,
    qtyRuleSubtexts,
    setQtyRuleSubtexts,
    qtyRuleTextsByLocaleByRuleId,
    setQtyRuleTextsByLocaleByRuleId,
    progressBarEnabled,
    setProgressBarEnabled,
    progressBarType,
    setProgressBarType,
    progressBarProgressText,
    progressBarSuccessText,
    tierTextByRuleId,
    setTierTextByRuleId,
    tierTextByLocaleByRuleId,
    setTierTextByLocaleByRuleId,
    isProgressBarMultiLangModalOpen,
    setIsProgressBarMultiLangModalOpen,
    activeProgressBarLocale,
    setActiveProgressBarLocale,
    isBundleQuantityMultiLangModalOpen,
    setIsBundleQuantityMultiLangModalOpen,
    activeBundleQuantityLocale,
    setActiveBundleQuantityLocale,
    discountMessagingMultiLanguageEnabled,
    setDiscountMessagingMultiLanguageEnabled,
    ruleMessagesByLocale,
    setRuleMessagesByLocale,
    activeDiscountLocale,
    setActiveDiscountLocale,
    globalSuccessMessage,
    setGlobalSuccessMessage,
    successMessageByLocale,
    setSuccessMessageByLocale,
    templateVariablesModalRef,
    discountVariablesModalRef,
    isDiscountVariablesModalOpen,
    setIsDiscountVariablesModalOpen,
    bundleQuantityOptionsEligible,
    displayOptionsInactive,
  };
}
