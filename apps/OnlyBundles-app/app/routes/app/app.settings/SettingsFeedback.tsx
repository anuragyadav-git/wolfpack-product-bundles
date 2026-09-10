import { useEffect, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { SettingsField } from "../../../lib/admin-configuration-surfaces";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import { translateAdmin } from "~/i18n/config";
import {
  showPolarisModal,
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";

export function SettingsContextualSaveBar({
  isOpen,
  isSaving = false,
  onDiscard,
  onSave,
}: {
  isOpen: boolean;
  isSaving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const shopify = useAppBridge();
  const isSaveBarShown = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isSaveBarShown.current = true;
      void shopify.saveBar.show("settings-contextual-save-bar");
    } else if (isSaveBarShown.current) {
      isSaveBarShown.current = false;
      void shopify.saveBar.hide("settings-contextual-save-bar");
    }
  }, [isOpen, shopify]);

  useEffect(
    () => () => {
      if (!isSaveBarShown.current) return;
      isSaveBarShown.current = false;
      void shopify.saveBar.hide("settings-contextual-save-bar");
    },
    [shopify],
  );

  return (
    <ui-save-bar id="settings-contextual-save-bar">
      <button type="button" disabled={isSaving} onClick={onDiscard}>
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.configurecontextualsavebar.discard"
        )}
      </button>
      <button
        type="button"
        variant="primary"
        disabled={isSaving}
        loading={isSaving ? "true" : undefined}
        onClick={onSave}
      >
        {translateAdmin("dashboard.language.save")}
      </button>
    </ui-save-bar>
  );
}

export function SettingsHelpModal({
  article,
  onClose,
}: {
  article: "inventory" | null;
  onClose: () => void;
}) {
  const modalRef = useRef<any>(null);
  useModalHideListener(modalRef, onClose);

  useEffect(() => {
    if (article) showPolarisModal(modalRef);
  }, [article]);

  if (!article) {
    return null;
  }

  return (
    <s-modal
      ref={modalRef}
      id="settings-help-modal"
      heading={translateAdmin(
        "adminExtracted.appSettings.settingsfeedback.productLevelInventoryTracking"
      )}
    >
      <s-button slot="secondary-actions" onClick={onClose}>
        {translateAdmin("common.actions.close")}
      </s-button>
      <div className={styles.settingsHelpBody}>
          <p>
            {translateAdmin(
              "adminExtracted.appSettings.settingsfeedback.enableTheInventoryTrackingToggleInAdditionalConfigurationsToAppl"
            )}
          </p>
          <ul>
            <li>
              {translateAdmin(
                "adminExtracted.appSettings.settingsfeedback.eachChildProductShouldHaveShopifyTrackQuantityEnabled"
              )}
            </li>
            <li>
              {translateAdmin(
                "adminExtracted.appSettings.settingsfeedback.productsWithZeroInventoryAreNotShownInTheBundle"
              )}
            </li>
            <li>
              {translateAdmin(
                "adminExtracted.appSettings.settingsfeedback.digitalProductsShouldUseInventory0OrBelowSoTheyAreRecognizedCorr"
              )}
            </li>
            <li>
              {translateAdmin(
                "adminExtracted.appSettings.settingsfeedback.ifTrackQuantityIsDisabledTheProductMayStillAppearButCannotBeAdde"
              )}
            </li>
            <li>
              {translateAdmin(
                "adminExtracted.appSettings.settingsfeedback.ifOutOfStockSellingIsEnabledAndInventoryIsAbove0DigitalProductDe"
              )}
            </li>
          </ul>
      </div>
    </s-modal>
  );
}

export function DetailGroup({
  title,
  description,
  fields,
}: {
  title: string;
  description?: string;
  fields: SettingsField[];
}) {
  const fieldGroups = fields.reduce<
    Array<{ title: string; fields: SettingsField[] }>
  >((groups, field) => {
    const groupTitle = field.group ?? "";
    const existingGroup = groups.find((group) => group.title === groupTitle);
    if (existingGroup) {
      existingGroup.fields.push(field);
      return groups;
    }
    groups.push({ title: groupTitle, fields: [field] });
    return groups;
  }, []);

  return (
    <section className={styles.detailGroup}>
      <div>
        <h3 className={styles.detailTitle}>{title}</h3>
        {description && (
          <p className={styles.detailDescription}>{description}</p>
        )}
      </div>
      {fieldGroups.map((group) => (
        <div
          key={`${title}-${group.title || "default"}`}
          className={styles.fieldGroup}
        >
          {group.title && (
            <h4 className={styles.fieldGroupTitle}>{group.title}</h4>
          )}
          <div className={styles.detailGrid}>
            {group.fields.map((field) => (
              <div key={`${title}-${field.label}`} className={styles.fieldCard}>
                <div className={styles.fieldTopLine}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  {field.state && (
                    <span className={styles.statePill}>{field.state}</span>
                  )}
                </div>
                {field.value !== undefined && (
                  <div className={styles.fieldValue}>
                    {field.value || "Blank"}
                  </div>
                )}
                {field.description && (
                  <p className={styles.fieldDescription}>{field.description}</p>
                )}
                {field.options && (
                  <div className={styles.optionRail}>
                    {field.options.map((option) => (
                      <span key={option} className={styles.optionChip}>
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
