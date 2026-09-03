import { useRef, useState } from "react";

import { moveArrayItem } from "../../../lib/bundle-config/reorder-items";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { getStepCategories } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";

export function PpbCategoryCollectionsPanel({
  step,
  catIndex,
  catCollections,
}: {
  step: any;
  catIndex: number;
  catCollections: any[];
}) {
  const {
    hidePolarisModal,
    markAsDirty,
    productPageBundleStyles,
    shopify,
    showPolarisModal,
    stepsState,
  } = usePpbConfigureContext();
  const selectedCollectionsModalRef = useRef<any>(null);
  const [draggedCollectionIndex, setDraggedCollectionIndex] = useState<
    number | null
  >(null);

  const updateCategoryCollections = (collections: any[]) => {
    const updated = getStepCategories(step).map(
      (category: any, index: number) =>
        index === catIndex
          ? {
              ...category,
              collections,
            }
          : category
    );
    stepsState.updateStepField(step.id, "StepCategory", updated);
    markAsDirty();
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

    updateCategoryCollections(
      picked.map((collection: any) => ({
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
      }))
    );
  };

  const removeCollection = (collectionId: string) => {
    updateCategoryCollections(
      catCollections.filter((collection: any) => collection.id !== collectionId)
    );
  };

  const reorderCollection = (fromIndex: number, toIndex: number) => {
    updateCategoryCollections(
      moveArrayItem(catCollections, fromIndex, toIndex)
    );
  };

  return (
    <div>
      <p className={productPageBundleStyles.categoryPickerHelp}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.collectionsSelectedHereWillBeDisplayedOnThisStep"
        )}
      </p>
      <div className={productPageBundleStyles.productActions}>
        <s-button
          variant="primary"
          icon="collection"
          onClick={handlePickCollections}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addCollections"
          )}
        </s-button>
        {catCollections.length > 0 && (
          <button
            type="button"
            className={productPageBundleStyles.selectedItemsChip}
            onClick={() => showPolarisModal(selectedCollectionsModalRef)}
          >
            {translateAdmin("adminDynamic.selectedCount", {
              count: catCollections.length,
            })}
          </button>
        )}
      </div>
      <s-modal
        ref={selectedCollectionsModalRef}
        heading={translateAdmin("adminAttributes.selectedCollections")}
      >
        {catCollections.length > 0 ? (
          <ul className={productPageBundleStyles.selectedItemList}>
            {catCollections.map((collection: any, index: number) => (
              <li
                key={collection.id ?? index}
                className={productPageBundleStyles.selectedItemRow}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (draggedCollectionIndex === null) return;
                  reorderCollection(draggedCollectionIndex, index);
                  setDraggedCollectionIndex(null);
                }}
              >
                <button
                  type="button"
                  className={productPageBundleStyles.selectedItemDrag}
                  aria-label={`Reorder ${
                    collection.title || "selected collection"
                  }`}
                  draggable="true"
                  onDragStart={(event) => {
                    event.stopPropagation();
                    setDraggedCollectionIndex(index);
                  }}
                  onDragEnd={(event) => {
                    event.stopPropagation();
                    setDraggedCollectionIndex(null);
                  }}
                >
                  ::
                </button>
                <span className={productPageBundleStyles.selectedItemName}>
                  {collection.title || "Unnamed Collection"}
                </span>
                <button
                  type="button"
                  className={productPageBundleStyles.selectedItemRemove}
                  aria-label={`Remove ${
                    collection.title || "selected collection"
                  }`}
                  onClick={() => removeCollection(collection.id)}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.x"
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {translateAdmin(
              "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.noCollectionsSelectedForThisCategoryYet"
            )}
          </p>
        )}
        <s-button
          slot="secondary-actions"
          variant="secondary"
          onClick={() => hidePolarisModal(selectedCollectionsModalRef)}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="collection"
          onClick={handlePickCollections}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addCollections"
          )}
        </s-button>
      </s-modal>
    </div>
  );
}
