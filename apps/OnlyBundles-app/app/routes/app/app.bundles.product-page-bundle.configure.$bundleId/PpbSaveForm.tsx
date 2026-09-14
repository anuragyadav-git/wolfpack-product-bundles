import type {
  PricingRule,
  PricingRuleTierText,
} from "../../../types/pricing";
import { ConfigureContextualSaveBar } from "../_shared/bundle-configure/ConfigureContextualSaveBar";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbSaveFormFlowProps = Pick<
  PpbConfigureFlow,
  | "bundleProduct"
  | "discountMessagingMultiLanguageEnabled"
  | "handleSave"
  | "isDirty"
  | "progressBarEnabled"
  | "progressBarProgressText"
  | "progressBarSuccessText"
  | "progressBarType"
  | "qtyOptionsDefaultRuleId"
  | "qtyOptionsEnabled"
  | "qtyRuleLabels"
  | "qtyRuleSubtexts"
  | "qtyRuleTextsByLocaleByRuleId"
  | "ruleMessages"
  | "ruleMessagesByLocale"
  | "saveBarRef"
  | "setShowDiscardModal"
>;

export type PpbSaveFormProps = PpbSaveFormFlowProps & {
  conditionsState: Pick<PpbConfigureFlow["conditionsState"], "stepConditions">;
  fetcher: Pick<PpbConfigureFlow["fetcher"], "state">;
  formState: Pick<
    PpbConfigureFlow["formState"],
    "bundleName" | "bundleDescription" | "templateName" | "bundleStatus"
  >;
  pricingState: Pick<
    PpbConfigureFlow["pricingState"],
    | "discountEnabled"
    | "discountType"
    | "discountRules"
    | "showFooter"
    | "discountMessagingEnabled"
  >;
  stepsState: Pick<PpbConfigureFlow["stepsState"], "steps">;
  tierTextByLocaleByRuleId: Record<
    string,
    Record<string, PricingRuleTierText>
  >;
  tierTextByRuleId: Record<string, PricingRuleTierText>;
};

export function PpbSaveForm({
  bundleProduct,
  conditionsState,
  discountMessagingMultiLanguageEnabled,
  fetcher,
  formState,
  handleSave,
  isDirty,
  pricingState,
  progressBarEnabled,
  progressBarProgressText,
  progressBarSuccessText,
  progressBarType,
  qtyOptionsDefaultRuleId,
  qtyOptionsEnabled,
  qtyRuleLabels,
  qtyRuleSubtexts,
  qtyRuleTextsByLocaleByRuleId,
  ruleMessages,
  ruleMessagesByLocale,
  saveBarRef,
  setShowDiscardModal,
  stepsState,
  tierTextByLocaleByRuleId,
  tierTextByRuleId,
}: PpbSaveFormProps) {

  return (
    <>
      <form
        data-save-lock-allow="true"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
        onReset={(e) => {
          e.preventDefault();
          setShowDiscardModal(true);
        }}
      >
        <ConfigureContextualSaveBar
          isOpen={isDirty}
          isSaving={fetcher.state !== "idle"}
          onSave={() => void handleSave()}
          onDiscard={() => setShowDiscardModal(true)}
          saveBarRef={saveBarRef}
        />
        {/* Hidden inputs for form submission - values will be updated by React state changes */}
        <input type="hidden" name="bundleName" value={formState.bundleName} />
        <input
          type="hidden"
          name="bundleDescription"
          value={formState.bundleDescription}
        />
        <input
          type="hidden"
          name="templateName"
          value={formState.templateName}
        />
        <input
          type="hidden"
          name="bundleStatus"
          value={formState.bundleStatus}
        />
        <input
          type="hidden"
          name="bundleProduct"
          value={JSON.stringify(bundleProduct)}
        />
        <input
          type="hidden"
          name="stepsData"
          value={JSON.stringify(stepsState.steps)}
        />
        <input
          type="hidden"
          name="discountData"
          value={JSON.stringify({
            discountEnabled: pricingState.discountEnabled,
            discountType: pricingState.discountType,
            discountRules: pricingState.discountRules,
            showFooter: pricingState.showFooter,
            discountMessagingEnabled: pricingState.discountMessagingEnabled,
            ruleMessages,
            discountMessagingMultiLanguageEnabled,
            ruleMessagesByLocale: discountMessagingMultiLanguageEnabled
              ? ruleMessagesByLocale
              : null,
            tierTextByRuleId:
              Object.keys(tierTextByRuleId).length > 0
                ? tierTextByRuleId
                : null,
            tierTextByLocaleByRuleId:
              Object.keys(tierTextByLocaleByRuleId).length > 0
                ? tierTextByLocaleByRuleId
                : null,
            displayOptions: {
              bundleQuantityOptions: {
                enabled: qtyOptionsEnabled,
                defaultRuleId: qtyOptionsDefaultRuleId,
                optionsByRuleId: Object.fromEntries(
                  pricingState.discountRules.map((rule: PricingRule) => [
                    rule.id,
                    {
                      label:
                        qtyRuleLabels[rule.id] ??
                        `Box of ${rule.conditionValue ?? ""}`,
                      subtext: qtyRuleSubtexts[rule.id] ?? "",
                    },
                  ])
                ),
                optionsByLocaleByRuleId: qtyRuleTextsByLocaleByRuleId,
              },
              progressBar: {
                enabled: progressBarEnabled,
                type: progressBarType,
                progressText: progressBarProgressText,
                successText: progressBarSuccessText,
              },
            },
          })}
        />
        <input
          type="hidden"
          name="stepConditions"
          value={JSON.stringify(conditionsState.stepConditions)}
        />
      </form>
    </>
  );
}
