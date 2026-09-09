import {
  deleteAddonTierAtIndex,
  getNextAddonTierAccordionIndex,
  normalizeAddonTierAccordionIndex,
} from "../../../../lib/addon-tier-accordion";
import { translateAdmin } from "~/i18n/config";
import {
  createDefaultAddonDraftTier,
  createDefaultAddonTierCondition,
} from "../addon-helpers";
import type { AddonTierDraft } from "../addon-draft.types";
import { FpbAddonTierRules } from "./FpbAddonTierRules";

export function FpbAddonTierEditor({
  activeTierIndex,
  tiers,
  styles,
  onActiveTierIndexChange,
  onAddProducts,
  onOpenSelectedProducts,
  onTiersChange,
}: {
  activeTierIndex: number | null;
  tiers: AddonTierDraft[];
  styles: Record<string, string>;
  onActiveTierIndexChange: (
    updater: (currentIndex: number | null) => number | null
  ) => void;
  onAddProducts: (tierIndex: number) => void;
  onOpenSelectedProducts: (tierIndex: number) => void;
  onTiersChange: (tiers: AddonTierDraft[]) => void;
}) {
  return (
    <>
      {(() => {
        const addonTiers = tiers;
        const updateAddonTiers = onTiersChange;
        const deleteAddonTier = (tierIndex: number) => {
          const updated = deleteAddonTierAtIndex(addonTiers, tierIndex);
          if (updated === addonTiers) return;
          updateAddonTiers(updated);
          onActiveTierIndexChange((currentIndex) =>
            normalizeAddonTierAccordionIndex(currentIndex, updated.length)
          );
        };
        const getAddonConditions = (tier: AddonTierDraft) =>
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
                (rule, idx) => String(rule.id ?? idx) !== ruleId
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
              conditions: conditions.map((rule, idx) =>
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
              const isActiveTier = activeTierIndex === idx;
              return (
                <div
                  key={idx}
                  className={`${styles.addonsTierCard} ${
                    isActiveTier ? styles.addonsTierCardActive : ""
                  }`}
                >
                  <div
                    className={`${styles.addonsTierHeader} ${
                      isActiveTier ? styles.addonsTierHeaderActive : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActiveTier}
                    onClick={() =>
                      onActiveTierIndexChange((currentIndex) =>
                        getNextAddonTierAccordionIndex(currentIndex, idx)
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onActiveTierIndexChange((currentIndex) =>
                          getNextAddonTierAccordionIndex(currentIndex, idx)
                        );
                      }
                    }}
                  >
                    <span
                      className={styles.addonsTierDragPlaceholder}
                      aria-hidden="true"
                    />
                    <h4 className={styles.addonsTierTitle}>
                      {translateAdmin("adminDynamic.tierNumber", {
                        number: idx + 1,
                      })}
                    </h4>
                    <div
                      className={styles.categoryActions}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <s-button
                        variant="tertiary"
                        tone="critical"
                        icon="delete"
                        accessibilityLabel={`Delete Tier ${idx + 1}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          deleteAddonTier(idx);
                        }}
                      />
                    </div>
                    <s-button
                      variant="tertiary"
                      icon={isActiveTier ? "arrow-left" : "arrow-right"}
                      accessibilityLabel={
                        isActiveTier ? "Collapse tier" : "Expand tier"
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        onActiveTierIndexChange((currentIndex) =>
                          getNextAddonTierAccordionIndex(currentIndex, idx)
                        );
                      }}
                    />
                  </div>
                  {isActiveTier && (
                    <div className={styles.addonsTierBody}>
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
                        <div className={styles.addonsProductSelectionRow}>
                          <s-button
                            variant="primary"
                            icon="product-add"
                            onClick={() => onAddProducts(idx)}
                          >
                            {translateAdmin(
                              "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addProducts"
                            )}
                          </s-button>
                          {Array.isArray(tier.selectedAddonProducts) &&
                            tier.selectedAddonProducts.length > 0 && (
                              <s-button
                                variant="tertiary"
                                onClick={() => onOpenSelectedProducts(idx)}
                              >
                                {translateAdmin("adminDynamic.selectedCount", {
                                  count: tier.selectedAddonProducts.length,
                                })}
                              </s-button>
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
                        <div className={styles.addonsDiscountGrid}>
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
                        <FpbAddonTierRules
                          actionClassName={styles.addonsTierRuleAction}
                          ruleCardClassName={styles.ruleCard}
                          ruleFieldsClassName={styles.ruleFields}
                          ruleHeaderClassName={styles.ruleHeader}
                          rules={getAddonConditions(tier)}
                          rulesListClassName={styles.rulesList}
                          tierIndex={idx}
                          tierRulesClassName={styles.addonsTierRules}
                          onAdd={addAddonTierCondition}
                          onRemove={removeAddonTierCondition}
                          onUpdate={updateAddonTierCondition}
                        />
                      </s-stack>
                    </div>
                  )}
                </div>
              );
            })}
            <s-clickable
              inlineSize="100%"
              border="base"
              borderRadius="small"
              padding="small"
              accessibilityLabel={translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addAddOnsTier"
              )}
              onClick={() => {
                updateAddonTiers([
                  ...addonTiers,
                  {
                    ...createDefaultAddonDraftTier(addonTiers.length),
                  },
                ]);
                onActiveTierIndexChange(() => addonTiers.length);
              }}
            >
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="center"
              >
                <s-icon type="plus" />
                <s-text>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addAddOnsTier"
                  )}
                </s-text>
              </s-stack>
            </s-clickable>
          </>
        );
      })()}
    </>
  );
}
