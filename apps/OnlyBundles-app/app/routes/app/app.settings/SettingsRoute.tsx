import {
  useActionData,
  useFetcher,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import {
  CONTROL_LAYOUTS,
  LANGUAGE_CONFIGURATION,
} from "../../../lib/admin-configuration-surfaces";
import type { action } from "../app.settings";
import {
  getInitialControlFieldValues,
  getInitialDesignFieldValues,
  getInitialLanguageFieldValues,
  getConfirmedControlValues,
} from "./settings-state";
import {
  createLanguageSettingsSnapshot,
  showSettingsSaveFeedback,
} from "./settings-feedback";
import {
  createSettingsDesignState,
  type SettingsDesignPayload,
} from "../../../lib/settings-design-contract";
import { isShopBrandColors } from "../../../lib/shop-brand-colors";
import { DesignSettingsView } from "./DesignSettingsView";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import type { AdminTaskAlert } from "../../../lib/admin-alert-feedback";
import type { AdditionalConfigurationsNavigation } from "../../../lib/additional-configurations-navigation";
import { navigateWithSaveBarConfirmation } from "../../../lib/admin-unsaved-navigation";
import { SettingsControlsWorkspace } from "./SettingsControlsWorkspace";
import { SettingsLanguageWorkspace } from "./SettingsLanguageWorkspace";

type SettingsRouteProps = {
  initialView?: "design" | "language" | "controls";
  initialControlNavigation?: AdditionalConfigurationsNavigation;
  onControlNavigationChange?: (
    navigation: AdditionalConfigurationsNavigation
  ) => void;
  onExit: () => void;
  settingsPage: Record<string, unknown> | null;
  previewBundles: Array<{
    id: string;
    name: string;
    type: string;
    bundleType: "full_page" | "product_page";
    viewUrl: string;
  }>;
};

export function SettingsRoute({
  initialView = "design",
  initialControlNavigation,
  onControlNavigationChange,
  onExit,
  settingsPage,
  previewBundles,
}: SettingsRouteProps) {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const controlsFetcher = useFetcher<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const controlsNavigationRef = useRef<HTMLDetailsElement>(null);
  const pendingSavedControlValuesRef = useRef<Record<string, string> | null>(
    null
  );
  const pendingSavedLanguageStateRef = useRef<{
    languageMode: "SINGLE" | "MULTIPLE";
    localeFieldValues: Record<string, Record<string, string>>;
  } | null>(null);
  const [settingsHelpArticle, setSettingsHelpArticle] = useState<
    "inventory" | null
  >(null);
  const [settingsVariablesModal, setSettingsVariablesModal] = useState<{
    title: string;
    variables: string[];
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [taskAlert, setTaskAlert] = useState<AdminTaskAlert | null>(null);
  const persistedLanguageState =
    settingsPage?.language && typeof settingsPage.language === "object"
      ? (settingsPage.language as {
          languageMode?: "SINGLE" | "MULTIPLE";
          localeFieldValues?: Record<string, Record<string, string>>;
        })
      : null;
  const persistedControlState =
    settingsPage?.controls && typeof settingsPage.controls === "object"
      ? (settingsPage.controls as Record<string, string>)
      : null;
  const persistedDesignState = createSettingsDesignState(settingsPage?.design);
  const shopBrandColors = isShopBrandColors(settingsPage?.shopBrandColors)
    ? settingsPage.shopBrandColors
    : null;
  const advancedDesignAvailable =
    settingsPage?.advancedDesignAvailable !== false;
  const [settingsView, setSettingsView] = useState<
    "landing" | "design" | "language" | "controls"
  >(initialView);
  const initialLanguageLocaleValues =
    persistedLanguageState?.localeFieldValues ?? {
      en: getInitialLanguageFieldValues(),
    };
  const [languageMode, setLanguageMode] = useState<"SINGLE" | "MULTIPLE">(
    persistedLanguageState?.languageMode ?? "MULTIPLE"
  );
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languageLocaleValues, setLanguageLocaleValues] = useState<
    Record<string, Record<string, string>>
  >(initialLanguageLocaleValues);
  const [activeLanguagePanel, setActiveLanguagePanel] = useState<
    "cartCheckout" | string
  >("Product Card");
  const [activeLanguageLayout, setActiveLanguageLayout] = useState(
    "Landing Page Layout"
  );
  const [savedLanguageState, setSavedLanguageState] = useState(() => ({
    languageMode: persistedLanguageState?.languageMode ?? ("MULTIPLE" as const),
    localeFieldValues: initialLanguageLocaleValues,
  }));
  const [controlFieldValues, setControlFieldValues] = useState<
    Record<string, string>
  >({
    ...getInitialControlFieldValues(),
    ...(persistedControlState ?? {}),
  });
  const [savedControlFieldValues, setSavedControlFieldValues] = useState<
    Record<string, string>
  >({
    ...getInitialControlFieldValues(),
    ...(persistedControlState ?? {}),
  });
  const [designFieldValues, setDesignFieldValues] = useState<
    Record<string, string>
  >({
    ...getInitialDesignFieldValues(),
    ...persistedDesignState.fieldValues,
  });
  const [savedDesignFieldValues, setSavedDesignFieldValues] = useState<
    Record<string, string>
  >({
    ...getInitialDesignFieldValues(),
    ...persistedDesignState.fieldValues,
  });
  const [activeControlLayout, setActiveControlLayout] = useState(
    initialControlNavigation?.layout ?? CONTROL_LAYOUTS[0].label
  );
  const [activeControlTab, setActiveControlTab] = useState(
    initialControlNavigation?.tab ?? CONTROL_LAYOUTS[0].tabs[0].title
  );
  const [activeControlGroup, setActiveControlGroup] = useState(
    initialControlNavigation?.group ?? ""
  );
  const [isControlsNavigationOpen, setIsControlsNavigationOpen] =
    useState(true);
  const [inheritedColorFieldKeys, setInheritedColorFieldKeys] = useState(
    persistedDesignState.inheritedColorFieldKeys
  );
  const [savedInheritedColorFieldKeys, setSavedInheritedColorFieldKeys] =
    useState(persistedDesignState.inheritedColorFieldKeys);
  const selectedControlLayout =
    CONTROL_LAYOUTS.find((layout) => layout.label === activeControlLayout) ??
    CONTROL_LAYOUTS[0];
  const selectedControlTab =
    selectedControlLayout.tabs.find((tab) => tab.title === activeControlTab) ??
    selectedControlLayout.tabs[0];
  const selectedControlGroupTitles = Array.from(
    new Set(
      selectedControlTab.fields.map(
        (field) =>
          field.group ??
          selectedControlTab.contentTitle ??
          selectedControlTab.title
      )
    )
  );
  const hasNestedControlGroups =
    selectedControlTab.title === "CSS & Scripts" &&
    selectedControlGroupTitles.length > 1;
  const selectedControlGroupTitle = selectedControlGroupTitles.includes(
    activeControlGroup
  )
    ? activeControlGroup
    : selectedControlGroupTitles[0] ??
      selectedControlTab.contentTitle ??
      selectedControlTab.title;
  const selectedControlFields = hasNestedControlGroups
    ? selectedControlTab.fields.filter(
        (field) =>
          (field.group ??
            selectedControlTab.contentTitle ??
            selectedControlTab.title) === selectedControlGroupTitle
      )
    : selectedControlTab.fields;
  const languageFieldValues =
    languageLocaleValues[selectedLanguage] ??
    getInitialLanguageFieldValues(selectedLanguage);
  const currentLanguageState = createLanguageSettingsSnapshot(
    languageMode,
    languageLocaleValues
  );
  const isLanguageDirty =
    JSON.stringify(currentLanguageState) !== JSON.stringify(savedLanguageState);
  const isControlsDirty =
    JSON.stringify(controlFieldValues) !==
    JSON.stringify(savedControlFieldValues);
  const currentDesignState = {
    fieldValues: designFieldValues,
    inheritedColorFieldKeys,
  };
  const savedDesignState = {
    fieldValues: savedDesignFieldValues,
    inheritedColorFieldKeys: savedInheritedColorFieldKeys,
  };
  const isDesignDirty =
    JSON.stringify(currentDesignState) !== JSON.stringify(savedDesignState);
  const isDesignSaving =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "saveSettingsDesign";
  const isLanguageSaving =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "saveSettingsLanguage";
  const isControlsSaving =
    controlsFetcher.state !== "idle" &&
    controlsFetcher.formData?.get("intent") === "saveSettingsControls";
  const isActiveSubpageDirty =
    (settingsView === "design" && isDesignDirty) ||
    (settingsView === "language" && isLanguageDirty) ||
    (settingsView === "controls" && isControlsDirty);
  const closeControlsNavigationOnMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsControlsNavigationOpen(false);
    }
  };
  const navigateWithinControls = (navigate: () => void) => {
    if (!isControlsDirty) {
      navigate();
      return;
    }
    void navigateWithSaveBarConfirmation(
      () => shopify.saveBar.leaveConfirmation(),
      () => {
        discardActiveSettingsChanges();
        navigate();
      },
    );
  };
  const returnToSettingsLanding = () => {
    void navigateWithSaveBarConfirmation(
      () => shopify.saveBar.leaveConfirmation(),
      () => {
        if (isActiveSubpageDirty) discardActiveSettingsChanges();
        onExit();
      },
    );
  };

  const navigateToSettingsView = (
    nextView: "design" | "language" | "controls"
  ) => {
    void navigateWithSaveBarConfirmation(
      () => shopify.saveBar.leaveConfirmation(),
      () => {
        if (isActiveSubpageDirty) discardActiveSettingsChanges();
        setSettingsView(nextView);
        if (nextView === "language") setActiveLanguagePanel("cartCheckout");
      },
    );
  };

  function discardActiveSettingsChanges() {
    if (settingsView === "design") {
      setDesignFieldValues(savedDesignFieldValues);
      setInheritedColorFieldKeys(savedInheritedColorFieldKeys);
      return;
    }
    if (settingsView === "language") {
      setLanguageMode(savedLanguageState.languageMode);
      setSelectedLanguage("en");
      setActiveLanguageLayout("Landing Page Layout");
      setLanguageLocaleValues(savedLanguageState.localeFieldValues);
      return;
    }
    if (settingsView === "controls") {
      setControlFieldValues(savedControlFieldValues);
    }
  }

  const saveActiveSettingsChanges = () => {
    if (settingsView === "design") {
      const designPayload: SettingsDesignPayload =
        createSettingsDesignState(currentDesignState);
      submit(
        {
          intent: "saveSettingsDesign",
          payload: JSON.stringify(designPayload),
        },
        { method: "post" }
      );
      return;
    }
    if (settingsView === "language") {
      const submittedLanguageState = createLanguageSettingsSnapshot(
        languageMode,
        languageLocaleValues
      );
      pendingSavedLanguageStateRef.current = submittedLanguageState;
      submit(
        {
          intent: "saveSettingsLanguage",
          payload: JSON.stringify(submittedLanguageState),
        },
        { method: "post" }
      );
      return;
    }
    if (settingsView === "controls") {
      const submittedControlValues = { ...controlFieldValues };
      pendingSavedControlValuesRef.current = submittedControlValues;
      controlsFetcher.submit(
        {
          intent: "saveSettingsControls",
          payload: JSON.stringify(submittedControlValues),
        },
        { method: "post" }
      );
    }
  };

  useEffect(() => {
    if (!actionData) {
      return;
    }
    if (
      (actionData.success ||
        ("persisted" in actionData && actionData.persisted === true)) &&
      "intent" in actionData &&
      actionData.intent === "saveSettingsDesign" &&
      "savedState" in actionData
    ) {
      const confirmedState = createSettingsDesignState(actionData.savedState);
      setSavedDesignFieldValues(confirmedState.fieldValues);
      setSavedInheritedColorFieldKeys(confirmedState.inheritedColorFieldKeys);
    }
    if (
      (actionData.success ||
        ("persisted" in actionData && actionData.persisted === true)) &&
      "intent" in actionData &&
      actionData.intent === "saveSettingsLanguage"
    ) {
      const savedState =
        "savedState" in actionData &&
        actionData.savedState &&
        typeof actionData.savedState === "object"
          ? (actionData.savedState as {
              languageMode?: "SINGLE" | "MULTIPLE";
              localeFieldValues?: Record<string, Record<string, string>>;
            })
          : null;
      const confirmedState =
        savedState?.languageMode && savedState.localeFieldValues
          ? createLanguageSettingsSnapshot(
              savedState.languageMode,
              savedState.localeFieldValues
            )
          : pendingSavedLanguageStateRef.current;
      if (confirmedState) setSavedLanguageState(confirmedState);
      pendingSavedLanguageStateRef.current = null;
    } else if (
      actionData.success === false &&
      "intent" in actionData &&
      actionData.intent === "saveSettingsLanguage"
    ) {
      pendingSavedLanguageStateRef.current = null;
    }
    const error = showSettingsSaveFeedback(shopify, actionData);
    setTaskAlert(
      error
        ? {
            id: "settings-save",
            heading: t("common.alerts.settingsNotSaved"),
            message: error,
          }
        : null
    );
  }, [actionData, shopify, t]);

  useEffect(() => {
    const response = controlsFetcher.data;
    if (!response) return;
    const confirmedValues = getConfirmedControlValues(
      response,
      pendingSavedControlValuesRef.current
    );
    if (confirmedValues) {
      setSavedControlFieldValues(confirmedValues);
      pendingSavedControlValuesRef.current = null;
    } else if (
      response.success === false &&
      pendingSavedControlValuesRef.current
    ) {
      pendingSavedControlValuesRef.current = null;
    }
    const error = showSettingsSaveFeedback(shopify, response);
    setTaskAlert(
      error
        ? {
            id: "settings-save",
            heading: t("common.alerts.settingsNotSaved"),
            message: error,
          }
        : null
    );
  }, [controlsFetcher.data, controlFieldValues, shopify, t]);

  useEffect(() => {
    if (settingsView !== "controls") return;
    onControlNavigationChange?.({
      layout: selectedControlLayout.label,
      tab: selectedControlTab.title,
      group: selectedControlGroupTitle,
    });
  }, [
    onControlNavigationChange,
    selectedControlGroupTitle,
    selectedControlLayout.label,
    selectedControlTab.title,
    settingsView,
  ]);

  if (settingsView === "design") {
    return (
      <>
        <AdminTaskAlertBanner
          alert={taskAlert}
          onDismiss={() => setTaskAlert(null)}
        />
        <DesignSettingsView
          designFieldValues={designFieldValues}
          inheritedColorFieldKeys={inheritedColorFieldKeys}
          shopBrandColors={shopBrandColors}
          isActiveSubpageDirty={isActiveSubpageDirty}
          isDesignSaving={isDesignSaving}
          isPreviewModalOpen={isPreviewModalOpen}
          previewBundles={previewBundles}
          setSettingsView={() => returnToSettingsLanding()}
          setIsPreviewModalOpen={setIsPreviewModalOpen}
          setDesignFieldValues={setDesignFieldValues}
          setInheritedColorFieldKeys={setInheritedColorFieldKeys}
          discardActiveSettingsChanges={discardActiveSettingsChanges}
          saveActiveSettingsChanges={saveActiveSettingsChanges}
          advancedDesignAvailable={advancedDesignAvailable}
        />
      </>
    );
  }

  if (settingsView === "language") {
    const isProductPageLanguageLayout =
      activeLanguageLayout === "Product Page Layout";
    const activeLanguageTemplateFields = isProductPageLanguageLayout
      ? LANGUAGE_CONFIGURATION.productPageTemplateFields
      : LANGUAGE_CONFIGURATION.templateFields;
    const languageGroups =
      activeLanguagePanel === "cartCheckout"
        ? [
            {
              title: "Cart & Checkout",
              description: "Shared cart and checkout labels",
              fields: LANGUAGE_CONFIGURATION.sharedCartFields,
            },
          ]
        : activeLanguageTemplateFields[activeLanguagePanel] ?? [];

    return (
      <SettingsLanguageWorkspace
        activeLayout={activeLanguageLayout}
        activePanel={activeLanguagePanel}
        fieldGroups={languageGroups}
        fieldValues={languageFieldValues}
        isDirty={isActiveSubpageDirty}
        isSaving={isLanguageSaving}
        languageMode={languageMode}
        localeFieldValues={languageLocaleValues}
        selectedLocale={selectedLanguage}
        taskAlert={taskAlert}
        variablesModal={settingsVariablesModal}
        onBack={returnToSettingsLanding}
        onDiscard={discardActiveSettingsChanges}
        onDismissAlert={() => setTaskAlert(null)}
        onSave={saveActiveSettingsChanges}
        setActiveLayout={setActiveLanguageLayout}
        setActivePanel={setActiveLanguagePanel}
        setLanguageMode={setLanguageMode}
        setLocaleFieldValues={setLanguageLocaleValues}
        setSelectedLocale={setSelectedLanguage}
        setVariablesModal={setSettingsVariablesModal}
      />
    );
  }

  if (settingsView === "controls") {
    return (
      <SettingsControlsWorkspace
        activeControlLayout={activeControlLayout}
        controlFieldValues={controlFieldValues}
        controlsNavigationRef={controlsNavigationRef}
        hasNestedControlGroups={hasNestedControlGroups}
        isControlsNavigationOpen={isControlsNavigationOpen}
        isDirty={isActiveSubpageDirty}
        isSaving={isControlsSaving}
        selectedControlFields={selectedControlFields}
        selectedControlGroupTitle={selectedControlGroupTitle}
        selectedControlGroupTitles={selectedControlGroupTitles}
        selectedControlLayout={selectedControlLayout}
        selectedControlTab={selectedControlTab}
        settingsHelpArticle={settingsHelpArticle}
        settingsVariablesModal={settingsVariablesModal}
        taskAlert={taskAlert}
        onBack={returnToSettingsLanding}
        onDismissAlert={() => setTaskAlert(null)}
        onDiscard={discardActiveSettingsChanges}
        onFieldAction={(label) => {
          if (label === "shared.cartMessaging.isEnabled") {
            navigateToSettingsView("language");
            return;
          }
          if (
            label === "landingPage.trackInventoryOnAddToCart" ||
            label === "productPage.trackInventoryOnAddToCart"
          ) {
            setSettingsHelpArticle("inventory");
          }
        }}
        onFieldChange={(label, value) =>
          setControlFieldValues((current) => ({
            ...current,
            [label]: value,
          }))
        }
        onGroupChange={(groupTitle) =>
          navigateWithinControls(() => {
            setActiveControlGroup(groupTitle);
            closeControlsNavigationOnMobile();
          })
        }
        onHelpClose={() => setSettingsHelpArticle(null)}
        onLayoutChange={(layoutLabel) => {
          const nextLayout =
            CONTROL_LAYOUTS.find((layout) => layout.label === layoutLabel) ??
            CONTROL_LAYOUTS[0];
          navigateWithinControls(() => {
            setActiveControlLayout(nextLayout.label);
            setActiveControlTab(
              nextLayout.tabs[0]?.title ?? CONTROL_LAYOUTS[0].tabs[0].title
            );
            setActiveControlGroup("");
            closeControlsNavigationOnMobile();
          });
        }}
        onNavigationOpenChange={setIsControlsNavigationOpen}
        onSave={saveActiveSettingsChanges}
        onTabChange={(tabTitle) =>
          navigateWithinControls(() => {
            setActiveControlTab(tabTitle);
            setActiveControlGroup("");
            closeControlsNavigationOnMobile();
          })
        }
        onVariablesClose={() => setSettingsVariablesModal(null)}
      />
    );
  }

  return null;
}
