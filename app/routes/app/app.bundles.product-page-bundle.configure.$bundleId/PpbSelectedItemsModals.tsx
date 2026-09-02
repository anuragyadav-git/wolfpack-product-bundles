import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbSelectedItemsModals() {
  const {
    DiscardChangesModal,
    closeDiscardModal,
    collectionsModalRef,
    currentModalStepId,
    handleCloseCollectionsModal,
    handleCloseProductsModal,
    handleConfirmDiscard,
    openProductInAdmin,
    productsModalRef,
    selectedCollections,
    showDiscardModal,
    stepsState,
  } = usePpbConfigureContext();

  return (
    <>
      {/* Selected Products Modal */}
      <s-modal
        ref={productsModalRef}
        heading={translateAdmin("adminAttributes.selectedProducts")}
      >
        <s-stack direction="block" gap="base">
          {(() => {
            const currentStep = stepsState.steps.find(
              (step) => step.id === currentModalStepId
            );
            const selectedProducts = currentStep?.StepProduct || [];
            return selectedProducts.length > 0 ? (
              <s-stack direction="block" gap="small">
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {translateAdmin("adminDynamic.selectedProductsForStep", {
                    count: selectedProducts.length,
                  })}
                </span>
                <s-section>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {selectedProducts.map((product: any, index: number) => {
                      const productId =
                        product.productId || product.id?.split("/").pop();
                      return (
                        <li key={product.id || index}>
                          <s-stack
                            direction="inline"
                            gap="small-100"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <s-stack
                              direction="inline"
                              gap="small"
                              alignItems="center"
                            >
                              <img
                                src={
                                  product.imageUrl ||
                                  product.image?.url ||
                                  "/bundle.avif"
                                }
                                alt={product.title || product.name || "Product"}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                              <s-stack direction="block">
                                <s-button
                                  variant="tertiary"
                                  onClick={() => {
                                    if (!productId) return;
                                    openProductInAdmin(productId);
                                  }}
                                  disabled={!productId || undefined}
                                >
                                  <s-icon type="view" />
                                  {product.title ||
                                    product.name ||
                                    "Unnamed Product"}
                                </s-button>
                                {product.variants &&
                                  product.variants.length > 0 && (
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 14,
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
                          </s-stack>
                        </li>
                      );
                    })}
                  </ul>
                </s-section>
              </s-stack>
            ) : (
              <s-stack direction="block" gap="small-100" alignItems="center">
                <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.noProductsSelectedForThisStepYet"
                  )}
                </p>
              </s-stack>
            );
          })()}
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={handleCloseProductsModal}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      {/* Selected Collections Modal */}
      <s-modal
        ref={collectionsModalRef}
        heading={translateAdmin("adminAttributes.selectedCollections")}
      >
        <s-stack direction="block" gap="base">
          {(() => {
            const collections = selectedCollections[currentModalStepId] || [];
            return collections.length > 0 ? (
              <s-stack direction="block" gap="small">
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {translateAdmin("adminDynamic.selectedCollectionsForStep", {
                    count: collections.length,
                  })}
                </span>
                <s-section>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {collections.map((collection: any, index: number) => (
                      <li key={collection.id || index}>
                        <s-stack
                          direction="inline"
                          gap="small-100"
                          justifyContent="space-between"
                        >
                          <s-stack direction="block">
                            <span style={{ fontSize: 14, fontWeight: 500 }}>
                              {collection.title || "Unnamed Collection"}
                            </span>
                            {collection.handle && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  color: "#6d7175",
                                }}
                              >
                                {translateAdmin(
                                  "adminDynamic.collectionHandle",
                                  { handle: collection.handle }
                                )}
                              </p>
                            )}
                          </s-stack>
                          <s-badge tone="success">
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.collection"
                            )}
                          </s-badge>
                        </s-stack>
                      </li>
                    ))}
                  </ul>
                </s-section>
              </s-stack>
            ) : (
              <s-stack direction="block" gap="small-100" alignItems="center">
                <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.noCollectionsSelectedForThisStepYet"
                  )}
                </p>
              </s-stack>
            );
          })()}
        </s-stack>
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={handleCloseCollectionsModal}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      <DiscardChangesModal
        open={showDiscardModal}
        onDiscard={handleConfirmDiscard}
        onContinue={closeDiscardModal}
      />
    </>
  );
}
