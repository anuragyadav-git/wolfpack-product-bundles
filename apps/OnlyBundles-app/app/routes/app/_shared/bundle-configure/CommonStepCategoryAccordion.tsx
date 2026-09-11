import React, { useRef, useState } from "react";

import { moveArrayItem } from "../../../../lib/bundle-config/reorder-items";
import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { translateAdmin } from "~/i18n/config";
import {
  SelectedCollectionsPanel,
  SelectedProductsPanel,
} from "./CommonStepCategorySelectedItems";

export interface CommonStepCategoryAccordionAdapter {
  categoryActiveTabs: Record<string, number>;
  categoryOpen: Record<string, boolean>;
  draggedCatKey: string | null;
  dragOverCatKey: string | null;
  handleCatDragEnd: (event: React.DragEvent) => void;
  handleCatDragStart: (
    event: React.DragEvent,
    stepId: string,
    catKey: string
  ) => void;
  handleCatDrop: (
    event: React.DragEvent,
    stepId: string,
    catKey: string
  ) => void;
  hidePolarisModal: (modalRef: React.RefObject<any>) => void;
  markAsDirty: () => void;
  openStepCategoryMultiLanguageModal: (
    stepId: string,
    catIndex: number
  ) => void;
  setCategoryActiveTabs: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  setCategoryOpen: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setDragOverCatKey: (catKey: string | null) => void;
  shopify: unknown;
  showPolarisModal: (modalRef: React.RefObject<any>) => void;
  stepsState: {
    updateStepField: (stepId: string, field: string, value: unknown) => void;
  };
  translationActionsDisabled: boolean;
  styles: Record<string, string>;
  validationErrors?: Record<string, string>;
  clearValidationError?: (path: string) => void;
}

export function CommonStepCategoryAccordion({
  adapter,
  step,
  cat,
  catIndex,
  categoryControls,
}: {
  adapter: CommonStepCategoryAccordionAdapter;
  step: any;
  cat: any;
  catIndex: number;
  categoryControls?: React.ReactNode;
}) {
  const {
    categoryActiveTabs,
    categoryOpen,
    draggedCatKey,
    dragOverCatKey,
    handleCatDragEnd,
    handleCatDragStart,
    handleCatDrop,
    hidePolarisModal,
    markAsDirty,
    openStepCategoryMultiLanguageModal,
    setCategoryActiveTabs,
    setCategoryOpen,
    setDragOverCatKey,
    shopify,
    showPolarisModal,
    stepsState,
    styles,
    translationActionsDisabled,
    validationErrors = {},
    clearValidationError,
  } = adapter;
  const catKey = `${step.id}__${cat.id ?? catIndex}`;
  const catActiveTab = categoryActiveTabs[catKey] ?? 0;
  const stepCategories = (step.StepCategory as any[]) ?? [];
  const catProducts = (cat.products as any[]) ?? [];
  const catCollections = (cat.collections as any[]) ?? [];
  const isOpen = categoryOpen[catKey] ?? false;
  const shouldRenderCategoryNameField = stepCategories.length > 1;
  const categoryPath = `steps.${step.id}.categories.${
    cat.id ?? `category-${catIndex + 1}`
  }`;
  const modalIdBase = `configure-category-${catKey.replace(
    /[^a-zA-Z0-9_-]/g,
    "-"
  )}`;
  const selectedProductsModalId = `${modalIdBase}-selected-products-modal`;
  const selectedCollectionsModalId = `${modalIdBase}-selected-collections-modal`;
  const selectedProductsModalRef = useRef<any>(null);
  const selectedCollectionsModalRef = useRef<any>(null);
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(
    null
  );
  const [draggedCollectionIndex, setDraggedCollectionIndex] = useState<
    number | null
  >(null);

  const updateCategory = (updater: (category: any) => any) => {
    const updated = stepCategories.map((category: any, index: number) =>
      index === catIndex ? updater(category) : category
    );
    stepsState.updateStepField(step.id, "StepCategory", updated);
    markAsDirty();
    clearValidationError?.(`${categoryPath}.resources`);
  };

  const handlePickProducts = async () => {
    const picked = await (shopify as any).resourcePicker({
      type: "product",
      multiple: true,
      selectionIds: catProducts.map((product: any) => ({ id: product.id })),
    });
    if (!picked) return;

    updateCategory((category: any) => ({
      ...category,
      products: picked.map((product: any) => ({
        id: product.id,
        title: product.title,
        imageUrl:
          product.images?.[0]?.originalSrc || product.images?.[0]?.url || null,
        variants: product.variants || null,
        minQuantity: 0,
        maxQuantity: 10,
      })),
    }));
  };

  const handlePickCollections = async () => {
    const picked = await (shopify as any).resourcePicker({
      type: "collection",
      multiple: true,
      selectionIds: catCollections.map((collection: any) => ({
        id: collection.id,
      })),
    });
    if (!picked) return;

    updateCategory((category: any) => ({
      ...category,
      collections: picked.map((collection: any) => ({
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
      })),
    }));
  };

  const removeCategoryProduct = (productId: string) => {
    updateCategory((category: any) => ({
      ...category,
      products: ((category.products as any[]) ?? []).filter(
        (product: any) => product.id !== productId
      ),
    }));
  };

  const removeCategoryCollection = (collectionId: string) => {
    updateCategory((category: any) => ({
      ...category,
      collections: ((category.collections as any[]) ?? []).filter(
        (collection: any) => collection.id !== collectionId
      ),
    }));
  };

  const reorderCategoryProducts = (fromIndex: number, toIndex: number) => {
    updateCategory((category: any) => ({
      ...category,
      products: moveArrayItem(
        (category.products as any[]) ?? [],
        fromIndex,
        toIndex
      ),
    }));
  };

  const reorderCategoryCollections = (fromIndex: number, toIndex: number) => {
    updateCategory((category: any) => ({
      ...category,
      collections: moveArrayItem(
        (category.collections as any[]) ?? [],
        fromIndex,
        toIndex
      ),
    }));
  };

  return (
    <div
      data-cat-key={catKey}
      className={`${styles.categoryAccordion}${
        dragOverCatKey === catKey ? ` ${styles.categoryDragOver}` : ""
      }`}
      onDragOver={(event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (draggedCatKey && draggedCatKey !== catKey)
          setDragOverCatKey(catKey);
      }}
      onDragLeave={(event: React.DragEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragOverCatKey(null);
      }}
      onDrop={(event: React.DragEvent) => handleCatDrop(event, step.id, catKey)}
    >
      <div className={styles.categoryAccordionHeader} data-expanded={isOpen}>
        <span
          className={styles.categoryDrag}
          aria-hidden="true"
          draggable="true"
          onDragStart={(event: React.DragEvent) => {
            event.stopPropagation();
            handleCatDragStart(event, step.id, catKey);
          }}
          onDragEnd={handleCatDragEnd}
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
        >
          ::
        </span>
        <s-clickable
          inlineSize="100%"
          aria-expanded={isOpen}
          onClick={() =>
            setCategoryOpen((prev) => ({
              ...prev,
              [catKey]: !prev[catKey],
            }))
          }
        >
          <s-stack
            direction="inline"
            alignItems="center"
            justifyContent="space-between"
            gap="small"
          >
            <span className={styles.categoryName}>
              {cat.name || `Category ${catIndex + 1}`}
            </span>
            <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
          </s-stack>
        </s-clickable>
        <div
          className={styles.categoryActions}
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
        >
          <s-button
            variant="tertiary"
            icon="duplicate"
            accessibilityLabel={translateAdmin("adminAttributes.clone")}
            onClick={() => {
              stepsState.updateStepField(step.id, "StepCategory", [
                ...stepCategories,
                {
                  ...stepCategories[catIndex],
                  id: `cat-${Date.now()}`,
                  name: `${
                    stepCategories[catIndex].name || `Category ${catIndex + 1}`
                  } Copy`,
                  sortOrder: stepCategories.length,
                },
              ]);
              markAsDirty();
            }}
          ></s-button>
          <s-button
            variant="tertiary"
            tone="critical"
            icon="delete"
            accessibilityLabel={translateAdmin("dashboard.deleteModal.delete")}
            onClick={() => {
              const updated = stepCategories.filter(
                (_category: any, index: number) => index !== catIndex
              );
              stepsState.updateStepField(step.id, "StepCategory", updated);
              markAsDirty();
            }}
          ></s-button>
        </div>
      </div>
      {isOpen && (
        <div className={styles.categoryAccordionBody}>
          {shouldRenderCategoryNameField && (
            <div className={styles.categoryFieldGroup}>
              <div className={styles.catNameRow}>
                <div className={styles.categoryInputStack}>
                  <s-text-field
                    id={`configure-${categoryPath.replace(
                      /[^a-zA-Z0-9_-]/g,
                      "-"
                    )}-name`}
                    label={translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.categoryName"
                    )}
                    value={cat.name ?? ""}
                    placeholder={`Category ${catIndex + 1}`}
                    error={validationErrors[`${categoryPath}.name`]}
                    onInput={(event: Event) => {
                      const value = (event.currentTarget as HTMLInputElement).value;
                      const updated = stepCategories.map(
                        (category: any, index: number) =>
                          index === catIndex
                            ? {
                                ...category,
                                name: value,
                                title: value,
                              }
                            : category
                      );
                      stepsState.updateStepField(
                        step.id,
                        "StepCategory",
                        updated
                      );
                      markAsDirty();
                      clearValidationError?.(`${categoryPath}.name`);
                    }}
                  />
                </div>
                <s-button
                  variant="secondary"
                  icon={getConfigureActionIcon("translate")}
                  disabled={translationActionsDisabled || undefined}
                  onClick={() =>
                    openStepCategoryMultiLanguageModal(step.id, catIndex)
                  }
                >
                  {translateAdmin(
                    "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                  )}
                </s-button>
              </div>
            </div>
          )}
          <div className={styles.tabRow}>
            <button
              type="button"
              className={catActiveTab === 0 ? styles.tabActive : styles.tab}
              onClick={() =>
                setCategoryActiveTabs((prev) => ({
                  ...prev,
                  [catKey]: 0,
                }))
              }
            >
              {translateAdmin("adminDynamic.products")}
              {catProducts.length > 0 && (
                <span className={styles.tabBadge}>{catProducts.length}</span>
              )}
            </button>
            <button
              type="button"
              className={catActiveTab === 1 ? styles.tabActive : styles.tab}
              onClick={() =>
                setCategoryActiveTabs((prev) => ({
                  ...prev,
                  [catKey]: 1,
                }))
              }
            >
              {translateAdmin("adminDynamic.collections")}
              {catCollections.length > 0 && (
                <span className={styles.tabBadge}>{catCollections.length}</span>
              )}
            </button>
          </div>
          {catActiveTab === 0 && (
            <SelectedProductsPanel
              products={catProducts}
              draggedProductIndex={draggedProductIndex}
              handlePickProducts={handlePickProducts}
              modalId={selectedProductsModalId}
              modalRef={selectedProductsModalRef}
              removeProduct={removeCategoryProduct}
              reorderProduct={reorderCategoryProducts}
              setDraggedProductIndex={setDraggedProductIndex}
              showPolarisModal={showPolarisModal}
              hidePolarisModal={hidePolarisModal}
              styles={styles}
            />
          )}
          {catActiveTab === 1 && (
            <SelectedCollectionsPanel
              collections={catCollections}
              draggedCollectionIndex={draggedCollectionIndex}
              handlePickCollections={handlePickCollections}
              modalId={selectedCollectionsModalId}
              modalRef={selectedCollectionsModalRef}
              removeCollection={removeCategoryCollection}
              reorderCollection={reorderCategoryCollections}
              setDraggedCollectionIndex={setDraggedCollectionIndex}
              showPolarisModal={showPolarisModal}
              hidePolarisModal={hidePolarisModal}
              styles={styles}
            />
          )}
          {categoryControls}
          {validationErrors[`${categoryPath}.resources`] && (
            <s-text
              id={`configure-${categoryPath.replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
              )}-resources`}
              tone="critical"
            >
              {validationErrors[`${categoryPath}.resources`]}
            </s-text>
          )}
        </div>
      )}
    </div>
  );
}
