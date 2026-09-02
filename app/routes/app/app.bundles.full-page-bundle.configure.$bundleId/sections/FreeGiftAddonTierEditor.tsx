import {
  deleteAddonTierAtIndex,
  getNextAddonTierAccordionIndex,
  normalizeAddonTierAccordionIndex,
} from "../../../../lib/addon-tier-accordion";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbAddonTierEditor({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    activeAddonTierIndex,
    addonDraft,
    CATEGORY_CONDITION_OPERATOR_OPTIONS,
    createDefaultAddonDraftTier,
    createDefaultAddonTierCondition,
    fullPageBundleStyles,
    handleAddonSelectedProductAdd,
    openAddonSelectedProductsModal,
    setActiveAddonTierIndex,
    updateAddonDraft,
  } = flow;

  return (
    <>
      {(() => {
        const addonTiers: any[] = Array.isArray(addonDraft.addonTiers)
          ? (addonDraft.addonTiers as any[])
          : [];
        const updateAddonTiers = (updated: any[]) => {
          updateAddonDraft({ addonTiers: updated });
        };
        const deleteAddonTier = (tierIndex: number) => {
          const updated = deleteAddonTierAtIndex(addonTiers, tierIndex);
          if (updated === addonTiers) return;
          updateAddonTiers(updated);
          setActiveAddonTierIndex((currentIndex: number | null) =>
            normalizeAddonTierAccordionIndex(currentIndex, updated.length)
          );
        };
        const getAddonConditions = (tier: any) =>
          Array.isArray(tier?.conditions) ? tier.conditions : [];
        const addAddonTierCondition = (tierIndex: number) => {
          const updated = addonTiers.map((tier, i) => {
            if (i !== tierIndex) return tier;
            const conditions = getAddonConditions(tier);
            const defaultRule = {
              ...createDefaultAddonTierCondition(),
            };
            return {
              ...tier,
              conditions: [...conditions, defaultRule],
            };
          });
          updateAddonTiers(updated);
        };
        const removeAddonTierCondition = (
          tierIndex: number,
          ruleId: string
        ) => {
          const updated = addonTiers.map((tier, i) => {
            if (i !== tierIndex) return tier;
            const conditions = getAddonConditions(tier);
            return {
              ...tier,
              conditions: conditions.filter(
                (rule: any, idx: number) => String(rule.id ?? idx) !== ruleId
              ),
            };
          });
          updateAddonTiers(updated);
        };
        const updateAddonTierCondition = (
          tierIndex: number,
          ruleId: string,
          field: string,
          value: string
        ) => {
          const updated = addonTiers.map((tier, i) => {
            if (i !== tierIndex) return tier;
            const conditions = getAddonConditions(tier);
            return {
              ...tier,
              conditions: conditions.map((rule: any, idx: number) =>
                String(rule.id ?? idx) === ruleId
                  ? { ...rule, [field]: value }
                  : rule
              ),
            };
          });
          updateAddonTiers(updated);
        };
        return (
          <>
            {addonTiers.map((tier, idx) => {
              const isActiveTier = activeAddonTierIndex === idx;
              return (
                <div
                  key={idx}
                  className={`${fullPageBundleStyles.addonsTierCard} ${
                    isActiveTier
                      ? fullPageBundleStyles.addonsTierCardActive
                      : ""
                  }`}
                >
                  <div
                    className={`${fullPageBundleStyles.addonsTierHeader} ${
                      isActiveTier
                        ? fullPageBundleStyles.addonsTierHeaderActive
                        : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActiveTier}
                    onClick={() =>
                      setActiveAddonTierIndex((currentIndex: number | null) =>
                        getNextAddonTierAccordionIndex(currentIndex, idx)
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveAddonTierIndex((currentIndex: number | null) =>
                          getNextAddonTierAccordionIndex(currentIndex, idx)
                        );
                      }
                    }}
                  >
                    <span
                      className={fullPageBundleStyles.addonsTierDragPlaceholder}
                      aria-hidden="true"
                    />
                    <h4 className={fullPageBundleStyles.addonsTierTitle}>
                      {translateAdmin("adminDynamic.tierNumber", {
                        number: idx + 1,
                      })}
                    </h4>
                    <div
                      className={fullPageBundleStyles.categoryActions}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={
                          fullPageBundleStyles.categoryDeleteIconButton
                        }
                        title={`Delete Tier ${idx + 1}`}
                        aria-label={`Delete Tier ${idx + 1}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          deleteAddonTier(idx);
                        }}
                      >
                        <s-icon type="delete" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={fullPageBundleStyles.categoryChevron}
                      aria-label={
                        isActiveTier ? "Collapse tier" : "Expand tier"
                      }
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveAddonTierIndex((currentIndex: number | null) =>
                          getNextAddonTierAccordionIndex(currentIndex, idx)
                        );
                      }}
                    >
                      {isActiveTier ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9L7 5L11 9"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 5L7 9L11 5"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {isActiveTier && (
                    <div className={fullPageBundleStyles.addonsTierBody}>
                      <s-stack direction="block" gap="small">
                        <s-text-field
                          label={translateAdmin("adminAttributes.tierTitle")}
                          value={tier.title ?? `Tier ${idx + 1}`}
                          onInput={(e) => {
                            const updated = addonTiers.map((t, i) =>
                              i === idx
                                ? {
                                    ...t,
                                    title: (e.target as HTMLInputElement).value,
                                  }
                                : t
                            );
                            updateAddonTiers(updated);
                          }}
                          autocomplete="off"
                        />
                        <div
                          className={
                            fullPageBundleStyles.addonsProductSelectionRow
                          }
                        >
                          <s-button
                            variant="primary"
                            icon="product-add"
                            onClick={() => handleAddonSelectedProductAdd(idx)}
                          >
                            {translateAdmin(
                              "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addProducts"
                            )}
                          </s-button>
                          {Array.isArray(tier.selectedAddonProducts) &&
                            tier.selectedAddonProducts.length > 0 && (
                              <button
                                type="button"
                                className={`${fullPageBundleStyles.addonsSelectedCount} ${fullPageBundleStyles.addonsSelectedButton}`}
                                onClick={() =>
                                  openAddonSelectedProductsModal(idx)
                                }
                              >
                                {translateAdmin("adminDynamic.selectedCount", {
                                  count: tier.selectedAddonProducts.length,
                                })}
                              </button>
                            )}
                        </div>
                        <s-checkbox
                          label={translateAdmin(
                            "adminAttributes.displayVariantsAsIndividualProducts"
                          )}
                          checked={
                            tier.displayVariantsAsIndividualProducts_addons ===
                              true || undefined
                          }
                          onChange={(e) => {
                            const updated = addonTiers.map((t, i) =>
                              i === idx
                                ? {
                                    ...t,
                                    displayVariantsAsIndividualProducts_addons:
                                      (e.target as HTMLInputElement).checked,
                                  }
                                : t
                            );
                            updateAddonTiers(updated);
                          }}
                        />
                        <div
                          className={fullPageBundleStyles.addonsDiscountGrid}
                        >
                          <s-select
                            label={translateAdmin(
                              "adminAttributes.discountBasedOn"
                            )}
                            value={
                              tier.eligibilityType ||
                              tier.eligibilityCondition?.type ||
                              "QUANTITY"
                            }
                            onChange={(e) => {
                              const updated = addonTiers.map((t, i) =>
                                i === idx
                                  ? {
                                      ...t,
                                      eligibilityType: (
                                        e.target as HTMLSelectElement
                                      ).value,
                                    }
                                  : t
                              );
                              updateAddonTiers(updated);
                            }}
                          >
                            <s-option value="QUANTITY">
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.bundleProductQuantity"
                              )}
                            </s-option>
                            <s-option value="AMOUNT">
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.bundleValue"
                              )}
                            </s-option>
                          </s-select>
                          <s-number-field
                            label={
                              (tier.eligibilityType ||
                                tier.eligibilityCondition?.type) === "AMOUNT"
                                ? "Value"
                                : "Qty"
                            }
                            value={String(
                              tier.eligibilityValue ??
                                tier.eligibilityCondition?.value ??
                                1
                            )}
                            onInput={(e) => {
                              const updated = addonTiers.map((t, i) =>
                                i === idx
                                  ? {
                                      ...t,
                                      eligibilityValue: Math.max(
                                        1,
                                        Number(
                                          (e.target as HTMLInputElement).value
                                        ) || 1
                                      ),
                                    }
                                  : t
                              );
                              updateAddonTiers(updated);
                            }}
                            min={1}
                          />
                          <s-number-field
                            label={translateAdmin(
                              "adminAttributes.discountOnAddOns"
                            )}
                            value={String(
                              tier.discountValue ?? tier.discount?.value ?? 0
                            )}
                            onInput={(e) => {
                              const updated = addonTiers.map((t, i) =>
                                i === idx
                                  ? {
                                      ...t,
                                      discountType: "PERCENTAGE",
                                      discountValue:
                                        Number(
                                          (e.target as HTMLInputElement).value
                                        ) || 0,
                                    }
                                  : t
                              );
                              updateAddonTiers(updated);
                            }}
                            min={0}
                            max={100}
                            suffix="%"
                          />
                        </div>
                        <div className={fullPageBundleStyles.addonsTierRules}>
                          <h5>
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.tierRules"
                            )}
                          </h5>
                          <p>
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.createRulesBasedOnQuantityOfProductsAddedOnThisTier"
                            )}
                          </p>
                          <p>
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.noteRulesAreOnlyValidOnThisTier"
                            )}
                          </p>
                          {getAddonConditions(tier).length > 0 && (
                            <div className={fullPageBundleStyles.rulesList}>
                              {getAddonConditions(tier).map(
                                (rule: any, ruleIndex: number) => (
                                  <div
                                    key={rule.id || ruleIndex}
                                    className={fullPageBundleStyles.ruleCard}
                                  >
                                    <div
                                      className={
                                        fullPageBundleStyles.ruleHeader
                                      }
                                    >
                                      <h4
                                        style={{
                                          margin: 0,
                                          fontSize: 14,
                                          fontWeight: 650,
                                        }}
                                      >
                                        {translateAdmin(
                                          "adminDynamic.ruleNumber",
                                          { number: ruleIndex + 1 }
                                        )}
                                      </h4>
                                      <s-button
                                        variant="tertiary"
                                        tone="critical"
                                        icon="delete"
                                        onClick={() =>
                                          removeAddonTierCondition(
                                            idx,
                                            String(rule.id ?? ruleIndex)
                                          )
                                        }
                                      >
                                        {translateAdmin(
                                          "adminExtracted.shared.filePicker.filepickertrigger.remove"
                                        )}
                                      </s-button>
                                    </div>
                                    <div
                                      className={
                                        fullPageBundleStyles.ruleFields
                                      }
                                    >
                                      <s-select
                                        label={translateAdmin(
                                          "dashboard.table.type"
                                        )}
                                        value={rule.type || "quantity"}
                                        onChange={(e) =>
                                          updateAddonTierCondition(
                                            idx,
                                            String(rule.id ?? ruleIndex),
                                            "type",
                                            (e.target as HTMLSelectElement)
                                              .value
                                          )
                                        }
                                      >
                                        <s-option value="quantity">
                                          {translateAdmin(
                                            "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.quantity"
                                          )}
                                        </s-option>
                                        <s-option value="amount">
                                          {translateAdmin(
                                            "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.amount"
                                          )}
                                        </s-option>
                                      </s-select>
                                      <s-select
                                        label={translateAdmin(
                                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                                        )}
                                        value={
                                          rule.condition || "lessThanOrEqualTo"
                                        }
                                        onChange={(e) =>
                                          updateAddonTierCondition(
                                            idx,
                                            String(rule.id ?? ruleIndex),
                                            "condition",
                                            (e.target as HTMLSelectElement)
                                              .value
                                          )
                                        }
                                      >
                                        {[
                                          ...CATEGORY_CONDITION_OPERATOR_OPTIONS,
                                        ].map((opt) => (
                                          <s-option
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.label}
                                          </s-option>
                                        ))}
                                      </s-select>
                                      <s-number-field
                                        label={translateAdmin(
                                          "adminAttributes.value"
                                        )}
                                        value={rule.value ?? ""}
                                        onInput={(e) => {
                                          updateAddonTierCondition(
                                            idx,
                                            String(rule.id ?? ruleIndex),
                                            "value",
                                            (e.target as HTMLInputElement).value
                                          );
                                        }}
                                        autocomplete="off"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          <div
                            className={
                              fullPageBundleStyles.addonsTierRuleAction
                            }
                          >
                            <button
                              type="button"
                              className={
                                fullPageBundleStyles.addonsTierFullWidthButton
                              }
                              onClick={() => addAddonTierCondition(idx)}
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addTierRule"
                              )}
                            </button>
                          </div>
                        </div>
                      </s-stack>
                    </div>
                  )}
                </div>
              );
            })}
            <div className={fullPageBundleStyles.addonsTierAddAction}>
              <button
                type="button"
                className={fullPageBundleStyles.addonsTierFullWidthButton}
                onClick={() => {
                  updateAddonTiers([
                    ...addonTiers,
                    {
                      ...createDefaultAddonDraftTier(addonTiers.length),
                    },
                  ]);
                  setActiveAddonTierIndex(addonTiers.length);
                }}
              >
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addAddOnsTier"
                )}
              </button>
            </div>
          </>
        );
      })()}
    </>
  );
}
