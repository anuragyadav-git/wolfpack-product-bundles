import { useCallback, useMemo, useState } from "react";
import type { MultiLanguageField } from "../../../components/bundle-configure/MultiLanguageTextModal";
import {
  buildPpbAddonTranslationFields,
  getPpbAddonFooterTranslationValues,
  mergePpbAddonFooterTranslationValues,
} from "../../../lib/bundle-configure-translations";
import type { StepSetupMultiLanguageTarget } from "./ConfigureBundleFlow.helpers";

export function usePpbMultiLanguageHandlers({
  shopLocales,
  stepsState,
  textOverridesByLocale,
  setTextOverridesByLocale,
  bundleEmbedMultiLangText,
  setBundleEmbedMultiLangText,
  bundleWidgetMultiLangText,
  setBundleWidgetMultiLangText,
  ruleMessages,
  ruleMessagesByLocale,
  setRuleMessagesByLocale,
  setDiscountMessagingMultiLanguageEnabled,
  markAsDirty,
}: {
  shopLocales: Array<{ primary: boolean; locale: string }>;
  stepsState: any;
  textOverridesByLocale: Record<string, Record<string, string>>;
  setTextOverridesByLocale: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  bundleEmbedMultiLangText: Record<
    string,
    { upsellConfiguration?: { title?: string; subTitle?: string } }
  >;
  setBundleEmbedMultiLangText: React.Dispatch<
    React.SetStateAction<
      Record<string, { upsellConfiguration?: { title?: string; subTitle?: string } }>
    >
  >;
  bundleWidgetMultiLangText: Record<string, Record<string, string>>;
  setBundleWidgetMultiLangText: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  ruleMessages: Record<string, { discountText?: string; successMessage?: string }>;
  ruleMessagesByLocale: Record<
    string,
    Record<string, { discountText?: string; successMessage?: string }>
  >;
  setRuleMessagesByLocale: React.Dispatch<React.SetStateAction<any>>;
  setDiscountMessagingMultiLanguageEnabled: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  markAsDirty: () => void;
}) {
  const [multiLanguageFields, setMultiLanguageFields] = useState<
    MultiLanguageField[]
  >([]);
  const [multiLanguageTitle, setMultiLanguageTitle] =
    useState("Multi Language");
  const [isMultiLanguageModalOpen, setIsMultiLanguageModalOpen] =
    useState(false);
  const [multiLanguageTarget, setMultiLanguageTarget] =
    useState<StepSetupMultiLanguageTarget>({ type: "text-overrides" });
  const [textOverridesLocale, setTextOverridesLocale] = useState<string>("");
  const defaultMultiLanguageLocale = useCallback(
    () =>
      shopLocales.find((locale) => locale.primary)?.locale ??
      shopLocales[0]?.locale ??
      "",
    [shopLocales],
  );
  const openMultiLanguageModal = useCallback(
    (
      title: string,
      fields: MultiLanguageField[],
      target: "text-overrides" | "widget" | "embed" = "text-overrides",
    ) => {
      setMultiLanguageTarget({ type: target });
      setMultiLanguageTitle(title);
      setMultiLanguageFields(fields);
      setTextOverridesLocale(defaultMultiLanguageLocale());
      setIsMultiLanguageModalOpen(true);
    },
    [defaultMultiLanguageLocale],
  );
  const openStepMultiLanguageModal = useCallback(
    (stepId: string) => {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === stepId,
      ) as any;
      if (!step) return;
      setMultiLanguageTarget({ type: "step", stepId });
      setMultiLanguageTitle("Customize Text for Multiple Languages");
      setMultiLanguageFields([
        {
          key: "productPageStepText",
          label: "Step Name",
          fallback: step.name ?? "",
        },
        {
          key: "productPageSubtext",
          label: "Step Title",
          fallback: step.pageTitle ?? "",
        },
      ]);
      setTextOverridesLocale(defaultMultiLanguageLocale());
      setIsMultiLanguageModalOpen(true);
    },
    [defaultMultiLanguageLocale, stepsState.steps],
  );
  const openStepCategoryMultiLanguageModal = useCallback(
    (stepId: string, categoryIndex: number) => {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === stepId,
      ) as any;
      const category = (((step as any)?.StepCategory as any[] | undefined) ??
        [])[categoryIndex];
      if (!category) return;
      setMultiLanguageTarget({ type: "step-category", stepId, categoryIndex });
      setMultiLanguageTitle("Customize Text for Multiple Languages");
      setMultiLanguageFields([
        {
          key: "name",
          label: "Category Name",
          fallback: category.name ?? `Category ${categoryIndex + 1}`,
        },
        {
          key: "title",
          label: "Category Title",
          fallback: category.title ?? "",
        },
      ]);
      setTextOverridesLocale(defaultMultiLanguageLocale());
      setIsMultiLanguageModalOpen(true);
    },
    [defaultMultiLanguageLocale, stepsState.steps],
  );
  const openAddonMultiLanguageModal = useCallback(
    (stepId: string, target: "step" | "section" | "footer") => {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === stepId,
      ) as any;
      if (!step) return;
      const targetType = `addon-${target}` as StepSetupMultiLanguageTarget["type"];
      setMultiLanguageTarget({ type: targetType, stepId } as StepSetupMultiLanguageTarget);
      setMultiLanguageTitle("Customize Text for Multiple Languages");
      setMultiLanguageFields(
        buildPpbAddonTranslationFields(
          target,
          step,
          ruleMessages[`addons-${stepId}`] ?? {},
        ),
      );
      setTextOverridesLocale(defaultMultiLanguageLocale());
      setIsMultiLanguageModalOpen(true);
    },
    [defaultMultiLanguageLocale, ruleMessages, stepsState.steps],
  );
  const activeMultiLanguageValues = useMemo(() => {
    if (multiLanguageTarget?.type === "step") {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === multiLanguageTarget.stepId,
      ) as any;
      return (step?.multiLangData ?? {}) as Record<
        string,
        Record<string, string>
      >;
    }
    if (multiLanguageTarget?.type === "step-category") {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === multiLanguageTarget.stepId,
      ) as any;
      const category = (((step as any)?.StepCategory as any[] | undefined) ??
        [])[multiLanguageTarget.categoryIndex];
      return (category?.multiLangData ?? {}) as Record<
        string,
        Record<string, string>
      >;
    }
    if (
      multiLanguageTarget?.type === "addon-step" ||
      multiLanguageTarget?.type === "addon-section"
    ) {
      const step = stepsState.steps.find(
        (candidate: any) => candidate.id === multiLanguageTarget.stepId,
      ) as any;
      return (step?.multiLangData ?? {}) as Record<string, Record<string, string>>;
    }
    if (multiLanguageTarget?.type === "addon-footer") {
      return getPpbAddonFooterTranslationValues(
        ruleMessagesByLocale,
        multiLanguageTarget.stepId,
      );
    }
    if (multiLanguageTarget?.type === "embed") {
      return Object.fromEntries(
        Object.entries(bundleEmbedMultiLangText).map(([locale, entry]: any) => [
          locale,
          entry.upsellConfiguration ?? {},
        ]),
      );
    }
    if (multiLanguageTarget?.type === "widget") {
      return bundleWidgetMultiLangText;
    }
    return textOverridesByLocale;
  }, [bundleEmbedMultiLangText, bundleWidgetMultiLangText, multiLanguageTarget, ruleMessagesByLocale, stepsState.steps, textOverridesByLocale]);
  const saveStepSetupMultiLanguageValues = useCallback(
    (nextValues: Record<string, Record<string, string>>) => {
      if (multiLanguageTarget?.type === "step") {
        stepsState.updateStepField(
          multiLanguageTarget.stepId,
          "multiLangData",
          nextValues,
        );
        markAsDirty();
        return;
      }
      if (multiLanguageTarget?.type === "step-category") {
        const step = stepsState.steps.find(
          (candidate: any) => candidate.id === multiLanguageTarget.stepId,
        ) as any;
        const categories =
          ((step as any)?.StepCategory as any[] | undefined) ?? [];
        const updatedCategories = categories.map((category, index) =>
          index === multiLanguageTarget.categoryIndex
            ? {
                ...category,
                multiLangData: nextValues,
              }
            : category,
        );
        stepsState.updateStepField(
          multiLanguageTarget.stepId,
          "StepCategory",
          updatedCategories,
        );
        markAsDirty();
        return;
      }
      if (
        multiLanguageTarget?.type === "addon-step" ||
        multiLanguageTarget?.type === "addon-section"
      ) {
        stepsState.updateStepField(
          multiLanguageTarget.stepId,
          "multiLangData",
          nextValues,
        );
        markAsDirty();
        return;
      }
      if (multiLanguageTarget?.type === "addon-footer") {
        setRuleMessagesByLocale((current: typeof ruleMessagesByLocale) =>
          mergePpbAddonFooterTranslationValues(
            current,
            multiLanguageTarget.stepId,
            nextValues,
          ),
        );
        setDiscountMessagingMultiLanguageEnabled(true);
        markAsDirty();
        return;
      }
      if (multiLanguageTarget?.type === "embed") {
        setBundleEmbedMultiLangText(
          Object.fromEntries(
            Object.entries(nextValues).map(([locale, values]: any) => [
              locale,
              {
                upsellConfiguration: {
                  title: values.title,
                  subTitle: values.subTitle,
                },
              },
            ]),
          ),
        );
        markAsDirty();
        return;
      }
      if (multiLanguageTarget?.type === "widget") {
        setBundleWidgetMultiLangText(nextValues);
        markAsDirty();
        return;
      }
      setTextOverridesByLocale(nextValues);
      markAsDirty();
    },
    [markAsDirty, multiLanguageTarget, ruleMessagesByLocale, setBundleEmbedMultiLangText, setBundleWidgetMultiLangText, setDiscountMessagingMultiLanguageEnabled, setRuleMessagesByLocale, setTextOverridesByLocale, stepsState],
  );

  return {
    textOverridesLocale,
    setTextOverridesLocale,
    multiLanguageFields,
    setMultiLanguageFields,
    multiLanguageTitle,
    setMultiLanguageTitle,
    isMultiLanguageModalOpen,
    setIsMultiLanguageModalOpen,
    multiLanguageTarget,
    setMultiLanguageTarget,
    defaultMultiLanguageLocale,
    openMultiLanguageModal,
    openStepMultiLanguageModal,
    openStepCategoryMultiLanguageModal,
    openAddonMultiLanguageModal,
    activeMultiLanguageValues,
    saveStepSetupMultiLanguageValues,
  };
}
