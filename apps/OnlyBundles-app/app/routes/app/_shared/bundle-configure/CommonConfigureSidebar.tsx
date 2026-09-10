import { useState, type Ref } from "react";
import { useTranslation } from "react-i18next";
import type { ConfigureChildItem } from "../../../../lib/bundle-config/common-configure-page-model";
import type { ParentProductStatusUi } from "../../../../lib/parent-product-status-ui";
import { DiscountMethod } from "../../../../types/pricing";
import { getConfigureActionIcon } from "../../../../lib/bundle-config/configure-action-icons";
import { translateAdmin, translateAdminCopy } from "~/i18n/config";

type StatusBadge = { label: string; tone?: string } | null;
type CommonSetupItem = ConfigureChildItem & {
  iconType?: string;
  fullPageOnly?: boolean;
};

export interface CommonConfigureLiveCard {
  title: string;
  label: string;
  actionLabel: string;
  loading?: boolean;
  disabled?: boolean;
  onAction: () => void;
}

export interface CommonConfigureSidebarAdapter {
  activeSection: string;
  appEmbedEnabled: boolean;
  bundle: {
    bundleType?: string | null;
    shopifyProductId?: string | null;
  };
  bundleProduct?: {
    id?: string | null;
    title?: string | null;
  } | null;
  bundleSetupItems: CommonSetupItem[];
  bundleVisibilityChildItems: ConfigureChildItem[];
  formState: { bundleName?: string | null };
  handleBundleProductSelect: () => void | Promise<void>;
  handleSectionChange: (section: string) => void;
  handleSyncProduct: () => void;
  openProductInAdmin: (productId: string) => void;
  openSelectTemplateModal: () => void;
  parentProductStatusUi: ParentProductStatusUi;
  pricingState: {
    discountEnabled: boolean;
    discountType: string;
  };
  productImageUrl?: string | null;
  productTitle?: string | null;
  selectTemplateOpenButtonRef?: Ref<HTMLButtonElement>;
  stepSetupChildItems?: ConfigureChildItem[];
  styles: Record<string, string>;
  VisibilityBadge: (props: { isOptimised: boolean }) => JSX.Element;
}

function getProductId(adapter: CommonConfigureSidebarAdapter) {
  return (
    adapter.bundleProduct?.id?.split("/").pop() ||
    adapter.bundle.shopifyProductId?.split("/").pop() ||
    null
  );
}

function isItemActive(
  item: CommonSetupItem,
  adapter: CommonConfigureSidebarAdapter
) {
  const { activeSection } = adapter;
  if (activeSection === item.id) return true;
  if (
    item.id === "step_setup" &&
    adapter.stepSetupChildItems?.some((child) => child.id === activeSection)
  ) {
    return true;
  }
  if (
    item.id === "bundle_visibility" &&
    adapter.bundleVisibilityChildItems.some(
      (child) => child.id === activeSection
    )
  ) {
    return true;
  }
  return false;
}

export function getActiveConfigureSectionLabel({
  activeSection,
  bundleSetupItems,
  stepSetupChildItems,
  bundleVisibilityChildItems,
}: {
  activeSection: string;
  bundleSetupItems: ConfigureChildItem[];
  stepSetupChildItems: ConfigureChildItem[];
  bundleVisibilityChildItems: ConfigureChildItem[];
}) {
  const activeItem = [
    ...bundleSetupItems,
    ...stepSetupChildItems,
    ...bundleVisibilityChildItems,
  ].find((item) => item.id === activeSection);

  return activeItem?.label || bundleSetupItems[0]?.label || "Bundle setup";
}

export function getMobileSetupChevronIcon(
  open: boolean
): "chevron-up" | "chevron-down" {
  return open ? "chevron-up" : "chevron-down";
}

export function selectConfigureSection({
  sectionId,
  closeAfterSelection,
  handleSectionChange,
  closeMobileNavigation,
}: {
  sectionId: string;
  closeAfterSelection: boolean;
  handleSectionChange: (sectionId: string) => void;
  closeMobileNavigation: () => void;
}) {
  handleSectionChange(sectionId);
  if (closeAfterSelection) closeMobileNavigation();
}

export function getDiscountPricingStatusBadge(
  discountEnabled: boolean,
  discountType: string
): StatusBadge {
  if (!discountEnabled) return { label: "None" };

  switch (discountType) {
    case DiscountMethod.PERCENTAGE_OFF:
      return { label: "% off", tone: "success" };
    case DiscountMethod.FIXED_AMOUNT_OFF:
      return { label: "$ off", tone: "success" };
    case DiscountMethod.FIXED_BUNDLE_PRICE:
      return { label: "fixed", tone: "success" };
    case DiscountMethod.BUY_X_GET_Y:
      return { label: "BXGY", tone: "success" };
    default:
      return null;
  }
}

function getItemStatusBadge(
  item: CommonSetupItem,
  adapter: CommonConfigureSidebarAdapter
): StatusBadge {
  if (item.id === "discount_pricing") {
    return getDiscountPricingStatusBadge(
      adapter.pricingState.discountEnabled,
      adapter.pricingState.discountType
    );
  }
  if (item.id === "bundle_visibility") {
    return adapter.appEmbedEnabled
      ? { label: "Optimised", tone: "success" }
      : { label: "Pending", tone: "warning" };
  }
  return null;
}

function renderStatusBadge(
  statusBadge: StatusBadge,
  VisibilityBadge: CommonConfigureSidebarAdapter["VisibilityBadge"]
) {
  if (!statusBadge) return null;
  if (statusBadge.label === "Pending" || statusBadge.label === "Optimised") {
    return <VisibilityBadge isOptimised={statusBadge.label === "Optimised"} />;
  }
  return (
    <s-badge tone={(statusBadge.tone as any) || "subdued"}>
      {statusBadge.label}
    </s-badge>
  );
}

export function CommonConfigureSidebar({
  adapter,
}: {
  adapter: CommonConfigureSidebarAdapter;
}) {
  const { t } = useTranslation();
  const {
    activeSection,
    bundleProduct,
    bundleSetupItems,
    bundleVisibilityChildItems,
    formState,
    handleBundleProductSelect,
    handleSectionChange,
    handleSyncProduct,
    openProductInAdmin,
    openSelectTemplateModal,
    parentProductStatusUi,
    productImageUrl,
    productTitle,
    selectTemplateOpenButtonRef,
    stepSetupChildItems = [],
    styles,
    VisibilityBadge,
  } = adapter;

  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const activeSectionLabel = getActiveConfigureSectionLabel({
    activeSection,
    bundleSetupItems,
    stepSetupChildItems,
    bundleVisibilityChildItems,
  });

  const renderSetupNavigation = ({
    closeAfterSelection = false,
    includeTemplateRef = false,
  }: {
    closeAfterSelection?: boolean;
    includeTemplateRef?: boolean;
  }) => (
    <div className={styles.setupNavList}>
      {bundleSetupItems.map((item) => {
        const isActive = isItemActive(item, adapter);
        const statusBadge = getItemStatusBadge(item, adapter);
        const selectSection = (sectionId: string) =>
          selectConfigureSection({
            sectionId,
            closeAfterSelection,
            handleSectionChange,
            closeMobileNavigation: () => setMobileNavigationOpen(false),
          });

        return (
          <div key={item.id}>
            {item.id === "select_template" && <s-divider />}
            <button
              type="button"
              className={`${styles.setupNavItem} ${
                isActive ? styles.setupNavItemActive : ""
              }`}
              onClick={() => {
                if (item.id === "select_template") {
                  openSelectTemplateModal();
                  if (closeAfterSelection) setMobileNavigationOpen(false);
                } else {
                  selectSection(item.id);
                }
              }}
              ref={
                includeTemplateRef && item.id === "select_template"
                  ? selectTemplateOpenButtonRef
                  : undefined
              }
            >
              <span className={styles.setupNavIcon} aria-hidden="true">
                {item.iconType ? (
                  <s-icon type={item.iconType as any} />
                ) : isActive ? (
                  "●"
                ) : (
                  "○"
                )}
              </span>
              <span className={styles.setupNavLabel}>
                {translateAdminCopy(item.label)}
              </span>
              <span className={styles.setupNavMeta}>
                {renderStatusBadge(statusBadge, VisibilityBadge)}
              </span>
            </button>
            {item.id === "step_setup" &&
              stepSetupChildItems.length > 0 &&
              (activeSection === "step_setup" ||
                stepSetupChildItems.some(
                  (child) => child.id === activeSection
                )) && (
                <div className={styles.subNav}>
                  {stepSetupChildItems.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`${styles.subNavItem} ${
                        activeSection === child.id
                          ? styles.subNavItemActive
                          : ""
                      }`}
                      onClick={() => selectSection(child.id)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            {item.id === "bundle_visibility" &&
              (activeSection === "bundle_visibility" ||
                bundleVisibilityChildItems.some(
                  (child) => child.id === activeSection
                )) && (
                <div className={styles.subNav}>
                  {bundleVisibilityChildItems.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`${styles.subNavItem} ${
                        activeSection === child.id
                          ? styles.subNavItemActive
                          : ""
                      }`}
                      onClick={() => selectSection(child.id)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.leftColumn}>
      <s-stack direction="block" gap="base">
        <s-section>
          <s-stack direction="block" gap="small">
            <div className={styles.leftCardHeader}>
              <h3 className={styles.leftCardTitle}>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.bundleProduct"
                )}
              </h3>
              <div className={styles.productMenuWrapper}>
                <s-button
                  commandFor="configure-bundle-product-actions"
                  icon="menu-vertical"
                  variant="tertiary"
                  accessibilityLabel={translateAdmin(
                    "adminAttributes.bundleProductOptions"
                  )}
                />
                <s-menu
                  id="configure-bundle-product-actions"
                  accessibilityLabel={translateAdmin(
                    "adminAttributes.bundleProductOptions"
                  )}
                >
                  <s-button
                    variant="tertiary"
                    icon="edit"
                    accessibilityLabel={translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.replaceProduct"
                    )}
                    onClick={() => void handleBundleProductSelect()}
                  >
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.replaceProduct"
                    )}
                  </s-button>
                  <s-button
                    variant="tertiary"
                    icon="duplicate"
                    accessibilityLabel={translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.syncProduct"
                    )}
                    onClick={handleSyncProduct}
                  >
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.syncProduct"
                    )}
                  </s-button>
                </s-menu>
              </div>
            </div>
            <div className={styles.bundleProductPanel}>
              <div className={styles.bundleProductSummary}>
                <div className={styles.bundleProductIconTile}>
                  {productImageUrl ? (
                    <s-image
                      src={productImageUrl}
                      alt=""
                      accessibilityRole="presentation"
                      aspectRatio="1/1"
                      objectFit="cover"
                    />
                  ) : (
                    <s-icon type="product" />
                  )}
                </div>
                <span className={styles.bundleProductName}>
                  {productTitle ||
                    bundleProduct?.title ||
                    formState.bundleName ||
                    translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.bundleProduct"
                    )}
                </span>
              </div>
              <s-clickable
                inlineSize="100%"
                border="base"
                borderRadius="small"
                padding="small"
                accessibilityLabel={translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.editProduct"
                )}
                onClick={() => {
                  const productId = getProductId(adapter);
                  if (!productId) {
                    void handleBundleProductSelect();
                    return;
                  }
                  openProductInAdmin(productId);
                }}
              >
                <s-stack
                  direction="inline"
                  gap="small"
                  alignItems="center"
                  justifyContent="center"
                >
                  <s-icon type="edit" />
                  <s-text>
                    {translateAdmin(
                      "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.editProduct"
                    )}
                  </s-text>
                </s-stack>
              </s-clickable>
            </div>
            <div className={styles.parentProductStatus}>
              <span>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.parentProductStatus"
                )}
              </span>
              {parentProductStatusUi.isLoading ? (
                <s-spinner
                  size="base"
                  accessibilityLabel={t(
                    "common.parentProductStatus.loadingTitle"
                  )}
                />
              ) : (
                <s-badge tone={parentProductStatusUi.tone as any}>
                  {parentProductStatusUi.label
                    ? translateAdminCopy(parentProductStatusUi.label)
                    : null}
                </s-badge>
              )}
            </div>
          </s-stack>
        </s-section>

        <div className={styles.desktopSetupSection}>
          <s-section>
            <s-stack direction="block" gap="small">
              <h3 className={styles.leftCardTitle}>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.bundleSetup"
                )}
              </h3>
              <p className={styles.leftCardSubtitle}>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.setUpYourBundleBuilder"
                )}
              </p>
              {renderSetupNavigation({ includeTemplateRef: true })}
            </s-stack>
          </s-section>
        </div>

        <details
          className={styles.mobileSetupSection}
          open={mobileNavigationOpen}
          onToggle={(event) =>
            setMobileNavigationOpen(event.currentTarget.open)
          }
        >
          <summary className={styles.mobileSetupSummary}>
            <span className={styles.mobileSetupSummaryText}>
              <span className={styles.mobileSetupTitle}>
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.commonconfiguresidebar.bundleSetup"
                )}
              </span>
              <span className={styles.mobileSetupActiveSection}>
                {translateAdminCopy(activeSectionLabel)}
              </span>
            </span>
            <span className={styles.mobileSetupChevron} aria-hidden="true">
              <s-icon type={getMobileSetupChevronIcon(mobileNavigationOpen)} />
            </span>
          </summary>
          <div className={styles.mobileSetupContent}>
            {renderSetupNavigation({ closeAfterSelection: true })}
          </div>
        </details>
      </s-stack>
    </div>
  );
}

export function CommonConfigureSupplement({
  liveCard,
  styles,
}: {
  liveCard: CommonConfigureLiveCard;
  styles: Record<string, string>;
}) {
  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <h3 className={styles.leftCardTitle}>
          {translateAdminCopy(liveCard.title)}
        </h3>
        <div className={styles.bundleLivePanel}>
          <span className={styles.bundleLivePlaceOnTheme}>
            {translateAdminCopy(liveCard.label)}
          </span>
          <s-button
            variant="secondary"
            icon={getConfigureActionIcon("place")}
            accessibilityLabel={translateAdminCopy(liveCard.actionLabel)}
            loading={liveCard.loading || undefined}
            disabled={liveCard.disabled || undefined}
            onClick={liveCard.onAction}
          >
            {translateAdminCopy(liveCard.actionLabel)}
          </s-button>
        </div>
      </s-stack>
    </s-section>
  );
}
