import React from "react";

import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { translateAdmin } from "~/i18n/config";

type SelectedItemsModalProps = {
  hidePolarisModal: (modalRef: React.RefObject<any>) => void;
  modalId: string;
  modalRef: React.RefObject<any>;
  showPolarisModal: (modalRef: React.RefObject<any>) => void;
  styles: Record<string, string>;
};

type SelectedProductsPanelProps = SelectedItemsModalProps & {
  products: any[];
  draggedProductIndex: number | null;
  handlePickProducts: () => Promise<void>;
  removeProduct: (productId: string) => void;
  reorderProduct: (fromIndex: number, toIndex: number) => void;
  setDraggedProductIndex: (index: number | null) => void;
};

export function SelectedProductsPanel({
  products,
  draggedProductIndex,
  handlePickProducts,
  hidePolarisModal,
  modalId,
  modalRef,
  removeProduct,
  reorderProduct,
  setDraggedProductIndex,
  showPolarisModal,
  styles,
}: SelectedProductsPanelProps) {
  return (
    <div>
      <p className={styles.categoryPickerHelp}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.productsSelectedHereWillBeDisplayedOnThisStep"
        )}
      </p>
      <div className={styles.productActions}>
        <s-button
          variant="primary"
          icon={getConfigureActionIcon("add-product")}
          onClick={handlePickProducts}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addProducts"
          )}
        </s-button>
        {products.length > 0 && (
          <s-clickable-chip onClick={() => showPolarisModal(modalRef)}>
            {translateAdmin("adminDynamic.selectedCount", {
              count: products.length,
            })}
          </s-clickable-chip>
        )}
      </div>
      <s-modal
        id={modalId}
        ref={modalRef}
        heading={translateAdmin("adminAttributes.selectedProducts")}
      >
        {products.length > 0 ? (
          <ul className={styles.selectedItemList}>
            {products.map((product: any, index: number) => (
              <li
                key={product.id ?? index}
                className={styles.categorySelectedItemRow}
                onDragOver={(event: React.DragEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onDrop={(event: React.DragEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (draggedProductIndex === null) return;
                  reorderProduct(draggedProductIndex, index);
                  setDraggedProductIndex(null);
                }}
              >
                <button
                  type="button"
                  className={styles.categorySelectedItemDrag}
                  aria-label={`Reorder ${product.title || "selected product"}`}
                  draggable="true"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                  }}
                  onDragStart={(event: React.DragEvent) => {
                    event.stopPropagation();
                    setDraggedProductIndex(index);
                  }}
                  onDragEnd={(event: React.DragEvent) => {
                    event.stopPropagation();
                    setDraggedProductIndex(null);
                  }}
                >
                  ::
                </button>
                <span className={styles.categorySelectedItemImage}>
                  <s-image
                    src={getProductImageUrl(product)}
                    alt={product.title || product.name || "Product"}
                    aspectRatio="1/1"
                    objectFit="cover"
                  />
                </span>
                <span className={styles.categorySelectedItemName}>
                  {product.title || product.name || "Unnamed Product"}
                </span>
                <s-button
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel={`Remove ${
                    product.title || "selected product"
                  }`}
                  onClick={() => removeProduct(product.id)}
                ></s-button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.noProductsSelectedForThisCategoryYet"
            )}
          </p>
        )}
        <s-button
          slot="secondary-actions"
          variant="secondary"
          commandFor={modalId}
          command="--hide"
          onClick={() => hidePolarisModal(modalRef)}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon={getConfigureActionIcon("add-product")}
          onClick={handlePickProducts}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addProducts"
          )}
        </s-button>
      </s-modal>
    </div>
  );
}

type SelectedCollectionsPanelProps = SelectedItemsModalProps & {
  collections: any[];
  draggedCollectionIndex: number | null;
  handlePickCollections: () => Promise<void>;
  removeCollection: (collectionId: string) => void;
  reorderCollection: (fromIndex: number, toIndex: number) => void;
  setDraggedCollectionIndex: (index: number | null) => void;
};

export function SelectedCollectionsPanel({
  collections,
  draggedCollectionIndex,
  handlePickCollections,
  hidePolarisModal,
  modalId,
  modalRef,
  removeCollection,
  reorderCollection,
  setDraggedCollectionIndex,
  showPolarisModal,
  styles,
}: SelectedCollectionsPanelProps) {
  return (
    <div>
      <p className={styles.categoryPickerHelp}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.collectionsSelectedHereWillBeDisplayedOnThisStep"
        )}
      </p>
      <div className={styles.productActions}>
        <s-button
          variant="primary"
          icon={getConfigureActionIcon("add-collection")}
          onClick={handlePickCollections}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addCollections"
          )}
        </s-button>
        {collections.length > 0 && (
          <s-clickable-chip onClick={() => showPolarisModal(modalRef)}>
            {translateAdmin("adminDynamic.selectedCount", {
              count: collections.length,
            })}
          </s-clickable-chip>
        )}
      </div>
      <s-modal
        id={modalId}
        ref={modalRef}
        heading={translateAdmin("adminAttributes.selectedCollections")}
      >
        {collections.length > 0 ? (
          <ul className={styles.selectedItemList}>
            {collections.map((collection: any, index: number) => (
              <li
                key={collection.id ?? index}
                className={styles.categorySelectedItemRow}
                onDragOver={(event: React.DragEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onDrop={(event: React.DragEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (draggedCollectionIndex === null) return;
                  reorderCollection(draggedCollectionIndex, index);
                  setDraggedCollectionIndex(null);
                }}
              >
                <button
                  type="button"
                  className={styles.categorySelectedItemDrag}
                  aria-label={`Reorder ${
                    collection.title || "selected collection"
                  }`}
                  draggable="true"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                  }}
                  onDragStart={(event: React.DragEvent) => {
                    event.stopPropagation();
                    setDraggedCollectionIndex(index);
                  }}
                  onDragEnd={(event: React.DragEvent) => {
                    event.stopPropagation();
                    setDraggedCollectionIndex(null);
                  }}
                >
                  ::
                </button>
                <span className={styles.categorySelectedItemName}>
                  {collection.title || "Unnamed Collection"}
                </span>
                <s-button
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel={`Remove ${
                    collection.title || "selected collection"
                  }`}
                  onClick={() => removeCollection(collection.id)}
                ></s-button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.noCollectionsSelectedForThisCategoryYet"
            )}
          </p>
        )}
        <s-button
          slot="secondary-actions"
          variant="secondary"
          commandFor={modalId}
          command="--hide"
          onClick={() => hidePolarisModal(modalRef)}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon={getConfigureActionIcon("add-collection")}
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

function getProductImageUrl(product: any) {
  return (
    product.imageUrl ||
    product.image?.url ||
    product.images?.[0]?.url ||
    product.images?.[0]?.originalSrc ||
    "/bundle.avif"
  );
}
