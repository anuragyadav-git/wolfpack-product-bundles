import type { RefObject } from "react";

import { CONTROL_LAYOUTS } from "../../../lib/admin-configuration-surfaces";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import { AdminPageTitleBar } from "../../../components/AdminPageNavigation";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import { translateAdmin, translateAdminCopy } from "~/i18n/config";
import { getControlTabIcon } from "./SettingsDesignFields";
import {
  ControlsContentCards,
  SettingsVariablesModal,
} from "./SettingsControls";
import {
  SettingsContextualSaveBar,
  SettingsHelpModal,
} from "./SettingsFeedback";

type ControlLayout = (typeof CONTROL_LAYOUTS)[number];
type ControlTab = ControlLayout["tabs"][number];
type ControlField = ControlTab["fields"][number];

type SettingsControlsWorkspaceProps = {
  activeControlLayout: string;
  controlFieldValues: Record<string, string>;
  controlsNavigationRef: RefObject<HTMLDetailsElement>;
  hasNestedControlGroups: boolean;
  isControlsNavigationOpen: boolean;
  isDirty: boolean;
  selectedControlFields: ControlField[];
  selectedControlGroupTitle: string;
  selectedControlGroupTitles: string[];
  selectedControlLayout: ControlLayout;
  selectedControlTab: ControlTab;
  settingsHelpArticle: "inventory" | null;
  settingsVariablesModal: { title: string; variables: string[] } | null;
  taskAlert: AdminTaskAlert | null;
  onBack: () => void;
  onDismissAlert: () => void;
  onDiscard: () => void;
  onFieldAction: (label: string) => void;
  onFieldChange: (label: string, value: string) => void;
  onGroupChange: (groupTitle: string) => void;
  onHelpClose: () => void;
  onLayoutChange: (layoutLabel: string) => void;
  onNavigationOpenChange: (open: boolean) => void;
  onSave: () => void;
  onTabChange: (tabTitle: string) => void;
  onVariablesClose: () => void;
};

export function SettingsControlsWorkspace({
  activeControlLayout,
  controlFieldValues,
  controlsNavigationRef,
  hasNestedControlGroups,
  isControlsNavigationOpen,
  isDirty,
  selectedControlFields,
  selectedControlGroupTitle,
  selectedControlGroupTitles,
  selectedControlLayout,
  selectedControlTab,
  settingsHelpArticle,
  settingsVariablesModal,
  taskAlert,
  onBack,
  onDismissAlert,
  onDiscard,
  onFieldAction,
  onFieldChange,
  onGroupChange,
  onHelpClose,
  onLayoutChange,
  onNavigationOpenChange,
  onSave,
  onTabChange,
  onVariablesClose,
}: SettingsControlsWorkspaceProps) {
  return (
    <>
      <AdminPageTitleBar
        title={translateAdmin(
          "adminExtracted.appSettings.settingsroute.additionalConfigurations"
        )}
        breadcrumbLabel="Settings"
        onBack={onBack}
      />
      <main className={styles.page}>
        <AdminTaskAlertBanner alert={taskAlert} onDismiss={onDismissAlert} />
        <header className={styles.hero}>
          <div className={styles.settingsSubpageHeaderLeft}>
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="arrow-left"
              accessibilityLabel={translateAdmin(
                "adminAttributes.backToSettings"
              )}
              onClick={onBack}
            />
            <h1 className={styles.title}>
              {translateAdmin(
                "adminExtracted.appSettings.settingsroute.additionalConfigurations"
              )}
            </h1>
          </div>
        </header>

        <section
          className={styles.controlsLayout}
          aria-label={translateAdmin(
            "adminExtracted.appSettings.settingsroute.additionalConfigurations"
          )}
        >
          <details
            ref={controlsNavigationRef}
            className={styles.responsiveSectionDisclosure}
            open={isControlsNavigationOpen}
            onToggle={(event) =>
              onNavigationOpenChange(event.currentTarget.open)
            }
          >
            <summary className={styles.responsiveSectionSummary}>
              <span>
                <span className={styles.responsiveSectionEyebrow}>
                  {translateAdmin(
                    "adminExtracted.appSettings.settingsroute.configurationSection"
                  )}
                </span>
                <strong>
                  {hasNestedControlGroups
                    ? translateAdminCopy(selectedControlGroupTitle)
                    : translateAdminCopy(selectedControlTab.title)}
                </strong>
              </span>
              <span aria-hidden="true">{"▾"}</span>
            </summary>
            <aside
              className={`${styles.controlsSidebarCard} ${styles.responsiveSectionContent}`}
            >
              <h2>
                {translateAdmin(
                  "adminExtracted.appSettings.settingsroute.appConfigurations"
                )}
              </h2>
              <p>
                {translateAdmin(
                  "adminExtracted.appSettings.settingsroute.configureYourBundleSettings"
                )}
              </p>
              <span className={styles.controlsLayoutSelectWrap}>
                <s-select
                  label={translateAdmin("adminAttributes.layoutSelector")}
                  labelAccessibilityVisibility="exclusive"
                  value={activeControlLayout}
                  onChange={(event) => {
                    const nextLayout = event.currentTarget.value;
                    if (nextLayout) onLayoutChange(nextLayout);
                  }}
                >
                  {CONTROL_LAYOUTS.map((layout) => (
                    <s-option key={layout.id} value={layout.label}>
                      {translateAdminCopy(layout.label)}
                    </s-option>
                  ))}
                </s-select>
              </span>
              <div
                className={styles.controlsNavList}
                role="tablist"
                aria-label={translateAdmin("adminAttributes.configurationTabs")}
              >
                {selectedControlLayout.tabs.map((tab) => (
                  <button
                    key={tab.title}
                    type="button"
                    className={
                      selectedControlTab.title === tab.title
                        ? styles.controlsNavActive
                        : styles.controlsNavButton
                    }
                    onClick={() => onTabChange(tab.title)}
                  >
                    <s-icon
                      type={getControlTabIcon(tab.title)}
                      size="small"
                    ></s-icon>
                    {translateAdminCopy(tab.title)}
                  </button>
                ))}
              </div>
              {hasNestedControlGroups ? (
                <div
                  className={styles.controlsSubNavList}
                  aria-label={translateAdminCopy(selectedControlTab.title)}
                >
                  {selectedControlGroupTitles.map((groupTitle) => (
                    <button
                      key={groupTitle}
                      type="button"
                      className={
                        selectedControlGroupTitle === groupTitle
                          ? styles.controlsSubNavActive
                          : styles.controlsSubNavButton
                      }
                      onClick={() => onGroupChange(groupTitle)}
                    >
                      {translateAdminCopy(groupTitle)}
                    </button>
                  ))}
                </div>
              ) : null}
            </aside>
          </details>
          <section className={styles.controlsContentColumn}>
            <ControlsContentCards
              title={
                hasNestedControlGroups
                  ? selectedControlGroupTitle
                  : selectedControlTab.contentTitle ?? selectedControlTab.title
              }
              description={
                hasNestedControlGroups
                  ? undefined
                  : selectedControlTab.contentDescription ??
                    selectedControlTab.description
              }
              fields={selectedControlFields}
              values={controlFieldValues}
              onFieldChange={onFieldChange}
              onFieldAction={onFieldAction}
            />
          </section>
        </section>
        <SettingsContextualSaveBar
          isOpen={isDirty}
          onDiscard={onDiscard}
          onSave={onSave}
        />
        <SettingsHelpModal article={settingsHelpArticle} onClose={onHelpClose} />
        <SettingsVariablesModal
          modal={settingsVariablesModal}
          onClose={onVariablesClose}
        />
      </main>
    </>
  );
}
