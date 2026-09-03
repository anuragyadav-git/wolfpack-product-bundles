import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PpbDiscountMessageRuleFields } from "./PpbDiscountMessageRuleFields";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function PpbDiscountMessagingOptions() {
  const {
    DiscountMethod,
    discountMessagingMultiLanguageEnabled,
    markAsDirty,
    pricingState,
    productPageBundleStyles,
    QuestionHelpTooltip,
    ruleMessages,
    ruleMessagesByLocale,
    setActiveDiscountLocale,
    setDiscountMessagingMultiLanguageEnabled,
    setIsDiscountVariablesModalOpen,
    setRuleMessagesByLocale,
    shopLocales,
    activeDiscountLocale,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.displayOptionRow}>
      <s-stack
        direction="inline"
        gap="small"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-stack direction="inline" gap="small" alignItems="center">
          <div className={productPageBundleStyles.displayOptionText}>
            <p className={productPageBundleStyles.displayOptionTitle}>
              {translateAdmin("tooltips.discountMessaging.title")}
            </p>
            <p className={productPageBundleStyles.displayOptionDescription}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.editHowDiscountMessagesAppearAboveTheSubtotal"
              )}
            </p>
          </div>
          <QuestionHelpTooltip tooltipKey="discountMessaging" />
          <s-switch
            checked={pricingState.discountMessagingEnabled || undefined}
            onChange={(e) =>
              pricingState.setDiscountMessagingEnabled(
                (e.target as HTMLInputElement).checked
              )
            }
          />
        </s-stack>
        {shopLocales.length > 0 && (
          <s-checkbox
            label={translateAdmin("adminAttributes.enableMultiLanguage")}
            checked={discountMessagingMultiLanguageEnabled || undefined}
            disabled={!pricingState.discountMessagingEnabled || undefined}
            onChange={(e) => {
              setDiscountMessagingMultiLanguageEnabled(
                (e.target as HTMLInputElement).checked
              );
              markAsDirty();
            }}
          />
        )}
      </s-stack>
      {pricingState.discountType === DiscountMethod.BUY_X_GET_Y && (
        <s-paragraph>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.discountMessagingDisplaysTheTotalQuantityToClaimOfferBuyGetToEns"
          )}
        </s-paragraph>
      )}
      <DisabledConfigurationRegion
        disabled={!pricingState.discountMessagingEnabled}
      >
        <div className={productPageBundleStyles.nestedDisplayOptions}>
          <s-stack direction="block" gap="small">
            {shopLocales.length > 0 && (
              <DisabledConfigurationRegion
                disabled={!discountMessagingMultiLanguageEnabled}
              >
                <PpbDiscountLanguageSelector
                  activeDiscountLocale={activeDiscountLocale}
                  markAsDirty={markAsDirty}
                  ruleMessages={ruleMessages}
                  ruleMessagesByLocale={ruleMessagesByLocale}
                  setActiveDiscountLocale={setActiveDiscountLocale}
                  setRuleMessagesByLocale={setRuleMessagesByLocale}
                  shopLocales={shopLocales}
                />
              </DisabledConfigurationRegion>
            )}
            <div style={{ textAlign: "right" }}>
              <s-button
                variant="tertiary"
                icon="code"
                onClick={() => setIsDiscountVariablesModalOpen(true)}
              >
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
                )}
              </s-button>
            </div>
            <PpbDiscountMessageRuleFields />
          </s-stack>
        </div>
      </DisabledConfigurationRegion>
    </div>
  );
}

function PpbDiscountLanguageSelector({
  activeDiscountLocale,
  markAsDirty,
  ruleMessages,
  ruleMessagesByLocale,
  setActiveDiscountLocale,
  setRuleMessagesByLocale,
  shopLocales,
}: {
  activeDiscountLocale: string;
  markAsDirty: () => void;
  ruleMessages: Record<string, any>;
  ruleMessagesByLocale: Record<string, Record<string, any>>;
  setActiveDiscountLocale: (locale: string) => void;
  setRuleMessagesByLocale: (updater: any) => void;
  shopLocales: Array<{ locale: string; name: string; primary: boolean }>;
}) {
  return (
    <s-stack direction="block" gap="small-100">
      <s-select
        label={translateAdmin("dashboard.language.label")}
        value={activeDiscountLocale}
        onChange={(e) => {
          const locale = (e.target as HTMLSelectElement).value;
          setActiveDiscountLocale(locale);
          const primaryLocale =
            shopLocales.find((localeOption) => localeOption.primary)?.locale ??
            "en";
          if (locale !== primaryLocale && !ruleMessagesByLocale[locale]) {
            setRuleMessagesByLocale((prev: typeof ruleMessagesByLocale) => ({
              ...prev,
              [locale]: ruleMessages,
            }));
            markAsDirty();
          }
        }}
      >
        {shopLocales.map((localeOption) => (
          <s-option key={localeOption.locale} value={localeOption.locale}>
            {localeOption.name}
            {localeOption.primary ? " (default)" : ""}
          </s-option>
        ))}
      </s-select>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.activeLanguages"
        )}
      </p>
      <s-stack direction="inline" gap="small-100">
        {shopLocales
          .filter((localeOption) => localeOption.primary)
          .map((localeOption) => (
            <s-chip key={localeOption.locale}>{localeOption.name}</s-chip>
          ))}
        {Object.keys(ruleMessagesByLocale)
          .filter(
            (locale) =>
              !shopLocales.find(
                (localeOption) =>
                  localeOption.locale === locale && localeOption.primary
              )
          )
          .map((locale) => {
            const localeName =
              shopLocales.find((localeOption) => localeOption.locale === locale)
                ?.name ?? locale;
            return <s-chip key={locale}>{localeName}</s-chip>;
          })}
      </s-stack>
    </s-stack>
  );
}
