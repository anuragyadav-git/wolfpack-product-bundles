import type { ComponentPropsWithRef } from "react";
import { translateAdmin } from "~/i18n/config";
import {
  ADDON_TEMPLATE_VARIABLES,
  TEMPLATE_VARIABLES,
} from "../configure-constants";

type ModalRef = ComponentPropsWithRef<"s-modal">["ref"];

export interface SelectedProduct {
  id?: string;
  graphqlId?: string;
  productId?: string;
  title?: string;
  name?: string;
  imageUrl?: string;
  image?: { url?: string };
  variants?: unknown[];
}

interface SelectedCollection {
  id?: string;
  title?: string;
  handle?: string;
}

export interface FpbSelectedItemsModalsProps {
  products: {
    modalRef: ModalRef;
    selected: SelectedProduct[];
    onClose: () => void;
    onOpenInAdmin: (productId: string) => void;
  };
  addonProducts: {
    modalRef: ModalRef;
    tierIndex: number;
    selected: SelectedProduct[];
    onAdd: (
      tierIndex: number,
      options: { reopenSelectedProductsModal: boolean }
    ) => void | Promise<void>;
    onClose: () => void;
    onRemove: (tierIndex: number, productIndex: number) => void;
  };
  collections: {
    modalRef: ModalRef;
    selected: SelectedCollection[];
    onClose: () => void;
  };
  variables: {
    templateModalRef: ModalRef;
    discountModalRef: ModalRef;
    addonModalRef: ModalRef;
    onCloseTemplate: () => void;
  };
  disableAddon: {
    modalRef: ModalRef;
    onCancel: () => void;
    onConfirm: () => void;
  };
  styles: Record<string, string>;
}

export function FpbSelectedItemsModals({
  products,
  addonProducts,
  collections,
  variables,
  disableAddon,
  styles,
}: FpbSelectedItemsModalsProps) {
  return (
    <>
      {/* Selected Products Modal */}
      <s-modal
        ref={products.modalRef}
        heading={translateAdmin("adminAttributes.selectedProducts2")}
      >
        {(() => {
          const selectedProducts = products.selected;
          return selectedProducts.length > 0 ? (
            <s-stack direction="block" gap="small">
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                {translateAdmin("adminDynamic.selectedProductsInStep", {
                  count: selectedProducts.length,
                })}
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {selectedProducts.map((product, index) => {
                  const productId =
                    product.productId || product.id?.split("/").pop();
                  return (
                    <li
                      key={product.id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 0",
                        borderBottom: "1px solid #f1f2f3",
                      }}
                    >
                      <s-stack direction="inline" gap="small">
                        <s-thumbnail
                          src={
                            product.imageUrl ||
                            product.image?.url ||
                            "/bundle.avif"
                          }
                          alt={product.title || "Product"}
                          size="small"
                        />
                        <s-stack direction="block" gap="small-400">
                          <s-button
                            variant="tertiary"
                            onClick={() => {
                              if (!productId) return;
                              products.onOpenInAdmin(productId);
                            }}
                            disabled={!productId || undefined}
                          >
                            {product.title || product.name || "Unnamed Product"}
                          </s-button>
                          {product.variants && product.variants.length > 0 && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#6d7175",
                              }}
                            >
                              {translateAdmin(
                                "adminDynamic.variantsAvailable",
                                { count: product.variants.length }
                              )}
                            </p>
                          )}
                        </s-stack>
                      </s-stack>
                      <s-badge tone="info">
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.product"
                        )}
                      </s-badge>
                    </li>
                  );
                })}
              </ul>
            </s-stack>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.noProductsSelectedForThisStepYet"
              )}
            </p>
          );
        })()}
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={products.onClose}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      <s-modal
        id="addon-selected-products-modal"
        ref={addonProducts.modalRef}
        heading={translateAdmin("adminAttributes.selectedProducts")}
      >
        {(() => {
          const tierIndex = addonProducts.tierIndex;
          const selectedAddonProducts = addonProducts.selected;
          return selectedAddonProducts.length > 0 ? (
            <s-stack direction="block" gap="small">
              <ul className={styles.addonSelectedProductList}>
                {selectedAddonProducts.map((product, index) => (
                  <li
                    key={product.graphqlId || product.id || index}
                    className={styles.addonSelectedProductRow}
                  >
                    <span
                      className={styles.addonSelectedProductDrag}
                      aria-hidden="true"
                    >
                      <s-icon type="menu-horizontal" />
                    </span>
                    <span className={styles.addonSelectedProductName}>
                      {product.title || product.name || "Unnamed Product"}
                    </span>
                    <s-button
                      variant="tertiary"
                      tone="critical"
                      icon="delete"
                      accessibilityLabel={`Remove ${
                        product.title || "selected product"
                      }`}
                      onClick={() => addonProducts.onRemove(tierIndex, index)}
                    />
                  </li>
                ))}
              </ul>
            </s-stack>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.noProductsSelectedForThisTierYet"
              )}
            </p>
          );
        })()}
        <s-button
          slot="secondary-actions"
          variant="secondary"
          commandFor="addon-selected-products-modal"
          command="--hide"
          onClick={addonProducts.onClose}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="product-add"
          onClick={() =>
            addonProducts.onAdd(addonProducts.tierIndex, {
              reopenSelectedProductsModal: true,
            })
          }
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.commonstepcategoryaccordion.addProducts"
          )}
        </s-button>
      </s-modal>
      {/* Selected Collections Modal */}
      <s-modal
        ref={collections.modalRef}
        heading={translateAdmin("adminAttributes.selectedCollections2")}
      >
        {(() => {
          return collections.selected.length > 0 ? (
            <s-stack direction="block" gap="small">
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                {translateAdmin("adminDynamic.selectedCollectionsInStep", {
                  count: collections.selected.length,
                })}
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {collections.selected.map((collection, index) => (
                  <li
                    key={collection.id || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f2f3",
                    }}
                  >
                    <s-stack direction="block" gap="small-400">
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {collection.title || "Unnamed Collection"}
                      </span>
                      {collection.handle && (
                        <p
                          style={{ margin: 0, fontSize: 12, color: "#6d7175" }}
                        >
                          {translateAdmin("adminDynamic.collectionHandle", {
                            handle: collection.handle,
                          })}
                        </p>
                      )}
                    </s-stack>
                    <s-badge tone="success">
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.collection"
                      )}
                    </s-badge>
                  </li>
                ))}
              </ul>
            </s-stack>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.noCollectionsSelectedForThisStepYet"
              )}
            </p>
          );
        })()}
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={collections.onClose}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      {/* Template Variables Modal */}
      <s-modal
        id="template-variables-modal"
        ref={variables.templateModalRef}
        heading={translateAdmin("adminAttributes.messageVariables")}
        size="small"
      >
        <s-stack direction="block" gap="small">
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.useTheseVariablesInOnlyBundlesMessagesTheWidgetReplacesThemWithL"
            )}
          </p>
          <div className={styles.templateVariableGrid}>
            {TEMPLATE_VARIABLES.map(([variable, description]) => (
              <div key={variable} className={styles.templateVariableItem}>
                <s-badge>{variable}</s-badge>
                <s-text color="subdued">{description}</s-text>
              </div>
            ))}
          </div>
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="check"
          commandFor="template-variables-modal"
          command="--hide"
          onClick={variables.onCloseTemplate}
        >
          {translateAdmin("dashboard.storefrontSetup.enableModal.done")}
        </s-button>
      </s-modal>
      <s-modal
        id="discount-variables-modal"
        ref={variables.discountModalRef}
        heading={translateAdmin("adminAttributes.variables")}
        size="base"
      >
        <div>
          {TEMPLATE_VARIABLES.map(([variable, description], index) => (
            <div key={variable}>
              {index > 0 && <s-divider />}
              <div className={styles.discountVariableRow}>
                <s-text color="subdued">{description}</s-text>
                <span className={styles.discountVariableCode}>{variable}</span>
              </div>
            </div>
          ))}
        </div>
      </s-modal>
      <s-modal
        id="addon-variables-modal"
        ref={variables.addonModalRef}
        heading={translateAdmin("adminAttributes.variables")}
        size="base"
      >
        <div>
          {ADDON_TEMPLATE_VARIABLES.map(([variable, description], index) => (
            <div key={variable}>
              {index > 0 && <s-divider />}
              <div className={styles.discountVariableRow}>
                <s-text color="subdued">{description}</s-text>
                <span className={styles.discountVariableCode}>{variable}</span>
              </div>
            </div>
          ))}
        </div>
      </s-modal>
      <s-modal
        id="disable-addon-step-modal"
        ref={disableAddon.modalRef}
        heading={translateAdmin("adminAttributes.disablePersonalizationStep")}
        size="small"
      >
        <p style={{ margin: 0, fontSize: 14 }}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.thisWillDisableTheAddOnsStepAreYouSureYouWantToDisable"
          )}
        </p>
        <s-button slot="secondary-actions" onClick={disableAddon.onCancel}>
          {translateAdmin("dashboard.deleteModal.cancel")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={disableAddon.onConfirm}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.yes"
          )}
        </s-button>
      </s-modal>
    </>
  );
}
