import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbSelectedItemsModals({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    ADDON_TEMPLATE_VARIABLES,
    addonDraft,
    addonSelectedProductsModalRef,
    addonSelectedProductsTierIndex,
    addonVariablesModalRef,
    collectionsModalRef,
    currentModalStepId,
    disableAddonStepModalRef,
    discountVariablesModalRef,
    fullPageBundleStyles,
    handleAddonSelectedProductAdd,
    handleAddonSelectedProductRemove,
    handleCloseAddonSelectedProductsModal,
    handleCloseCollectionsModal,
    handleCloseProductsModal,
    handleDisableAddonStepConfirm,
    hidePolarisModal,
    openProductInAdmin,
    productsModalRef,
    selectedCollections,
    setIsDisableAddonStepModalOpen,
    stepsState,
    TEMPLATE_VARIABLES,
    templateVariablesModalRef,
  } = flow;

  return (
    <>
      {/* Selected Products Modal */}
      <s-modal
        ref={productsModalRef}
        heading={translateAdmin("adminAttributes.selectedProducts2")}
      >
        {(() => {
          const currentStep = stepsState.steps.find(
            (step) => step.id === currentModalStepId
          );
          const selectedProducts = currentStep?.StepProduct || [];
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
                {selectedProducts.map((product: any, index: number) => {
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
                        <img
                          src={
                            product.imageUrl ||
                            product.image?.url ||
                            "/bundle.avif"
                          }
                          alt={product.title || "Product"}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                        <s-stack direction="block" gap="small-400">
                          <s-button
                            variant="tertiary"
                            onClick={() => {
                              if (!productId) return;
                              openProductInAdmin(productId);
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
          onClick={handleCloseProductsModal}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      <s-modal
        id="addon-selected-products-modal"
        ref={addonSelectedProductsModalRef}
        heading={translateAdmin("adminAttributes.selectedProducts")}
      >
        {(() => {
          const addonTiers = Array.isArray(addonDraft.addonTiers)
            ? addonDraft.addonTiers
            : [];
          const tierIndex = addonSelectedProductsTierIndex ?? 0;
          const tier = addonTiers[tierIndex] ?? addonTiers[0];
          const selectedAddonProducts = Array.isArray(
            tier?.selectedAddonProducts
          )
            ? tier.selectedAddonProducts
            : [];
          return selectedAddonProducts.length > 0 ? (
            <s-stack direction="block" gap="small">
              <ul className={fullPageBundleStyles.addonSelectedProductList}>
                {selectedAddonProducts.map((product: any, index: number) => (
                  <li
                    key={product.graphqlId || product.id || index}
                    className={fullPageBundleStyles.addonSelectedProductRow}
                  >
                    <button
                      type="button"
                      className={fullPageBundleStyles.addonSelectedProductDrag}
                      aria-label={`Reorder ${
                        product.title || "selected product"
                      }`}
                    >
                      ::
                    </button>
                    <span
                      className={fullPageBundleStyles.addonSelectedProductName}
                    >
                      {product.title || product.name || "Unnamed Product"}
                    </span>
                    <button
                      type="button"
                      className={
                        fullPageBundleStyles.addonSelectedProductRemove
                      }
                      aria-label={`Remove ${
                        product.title || "selected product"
                      }`}
                      onClick={() =>
                        handleAddonSelectedProductRemove(tierIndex, index)
                      }
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.x"
                      )}
                    </button>
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
          onClick={handleCloseAddonSelectedProductsModal}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          icon="product-add"
          onClick={() =>
            handleAddonSelectedProductAdd(addonSelectedProductsTierIndex ?? 0, {
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
        ref={collectionsModalRef}
        heading={translateAdmin("adminAttributes.selectedCollections2")}
      >
        {(() => {
          const collections = selectedCollections[currentModalStepId] || [];
          return collections.length > 0 ? (
            <s-stack direction="block" gap="small">
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                {translateAdmin("adminDynamic.selectedCollectionsInStep", {
                  count: collections.length,
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
                {collections.map((collection: any, index: number) => (
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
          onClick={handleCloseCollectionsModal}
        >
          {translateAdmin("dashboard.storefrontSetup.close")}
        </s-button>
      </s-modal>
      {/* Template Variables Modal */}
      <s-modal
        id="template-variables-modal"
        ref={templateVariablesModalRef}
        heading={translateAdmin("adminAttributes.messageVariables")}
        size="small"
      >
        <s-stack direction="block" gap="small">
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.useTheseVariablesInOnlyBundlesMessagesTheWidgetReplacesThemWithL"
            )}
          </p>
          <div className={fullPageBundleStyles.templateVariableGrid}>
            {TEMPLATE_VARIABLES.map(([variable, description]: any) => (
              <div
                key={variable}
                className={fullPageBundleStyles.templateVariableItem}
              >
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
          onClick={() => hidePolarisModal(templateVariablesModalRef)}
        >
          {translateAdmin("dashboard.storefrontSetup.enableModal.done")}
        </s-button>
      </s-modal>
      <s-modal
        id="discount-variables-modal"
        ref={discountVariablesModalRef}
        heading={translateAdmin("adminAttributes.variables")}
        size="base"
      >
        <div>
          {TEMPLATE_VARIABLES.map(([variable, description]: any, index) => (
            <div key={variable}>
              {index > 0 && <s-divider />}
              <div className={fullPageBundleStyles.discountVariableRow}>
                <s-text color="subdued">{description}</s-text>
                <span className={fullPageBundleStyles.discountVariableCode}>
                  {variable}
                </span>
              </div>
            </div>
          ))}
        </div>
      </s-modal>
      <s-modal
        id="addon-variables-modal"
        ref={addonVariablesModalRef}
        heading={translateAdmin("adminAttributes.variables")}
        size="base"
      >
        <div>
          {ADDON_TEMPLATE_VARIABLES.map(
            ([variable, description]: any, index) => (
              <div key={variable}>
                {index > 0 && <s-divider />}
                <div className={fullPageBundleStyles.discountVariableRow}>
                  <s-text color="subdued">{description}</s-text>
                  <span className={fullPageBundleStyles.discountVariableCode}>
                    {variable}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </s-modal>
      <s-modal
        id="disable-addon-step-modal"
        ref={disableAddonStepModalRef}
        heading={translateAdmin("adminAttributes.disablePersonalizationStep")}
        size="small"
      >
        <p style={{ margin: 0, fontSize: 14 }}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.thisWillDisableTheAddOnsStepAreYouSureYouWantToDisable"
          )}
        </p>
        <s-button
          slot="secondary-actions"
          onClick={() => setIsDisableAddonStepModalOpen(false)}
        >
          {translateAdmin("dashboard.deleteModal.cancel")}
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={handleDisableAddonStepConfirm}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.configureselecteditemsmodals.yes"
          )}
        </s-button>
      </s-modal>
    </>
  );
}
