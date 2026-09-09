import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

interface FpbMediaStep {
  bannerImageUrl?: string | null;
  id: string;
  imageUrl?: string | null;
  name: string;
}

export interface FpbImagesGifsPanelProps {
  activeAssetTabIndex: number;
  activeSection: string;
  bundleBannerDesktopUrl: string;
  bundleBannerMobileUrl: string;
  floatingBadgeEnabled: boolean;
  floatingBadgeText: string;
  fullPageBundleStyles: Record<string, string>;
  markAsDirty: () => void;
  setActiveAssetTabIndex: (index: number) => void;
  setBundleBannerDesktopUrl: (url: string) => void;
  setBundleBannerMobileUrl: (url: string) => void;
  setFloatingBadgeEnabled: (enabled: boolean) => void;
  setFloatingBadgeText: (text: string) => void;
  steps: FpbMediaStep[];
  updateStepField: (stepId: string, field: string, value: unknown) => void;
}

export function FpbImagesGifsPanel({
  activeAssetTabIndex,
  activeSection,
  bundleBannerDesktopUrl,
  bundleBannerMobileUrl,
  floatingBadgeEnabled,
  floatingBadgeText,
  fullPageBundleStyles,
  markAsDirty,
  setActiveAssetTabIndex,
  setBundleBannerDesktopUrl,
  setBundleBannerMobileUrl,
  setFloatingBadgeEnabled,
  setFloatingBadgeText,
  steps,
  updateStepField,
}: FpbImagesGifsPanelProps) {

  return (
    <>
      {activeSection === "images_gifs" && (
        <>
          <div
            style={{
              padding: "var(--s-space-400)",
              background: "var(--s-color-bg-surface-secondary, #f6f6f7)",
              borderRadius: 8,
            }}
          >
            <s-stack direction="inline" gap="small-100">
              <s-icon type="upload" />
              <s-stack direction="block">
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.mediaAssets"
                  )}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#6d7175" }}>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.addVisualMediaToEnhanceTheBundleExperienceForShoppers"
                  )}
                </p>
              </s-stack>
            </s-stack>
          </div>
          <s-section>
            <s-stack direction="block" gap="base">
              <s-stack direction="inline">
                <s-stack direction="inline" gap="small" inlineSize="100%">
                  <s-icon type="upload" />
                  <s-stack direction="block" gap="small-400">
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.promoBanner"
                      )}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#6d7175",
                      }}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.wideBannerDisplayedAtTheTopOfTheFullPageBundle"
                      )}
                    </p>
                  </s-stack>
                </s-stack>
                <s-badge tone="info">
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.pageHeader"
                  )}
                </s-badge>
              </s-stack>
              <div
                style={{
                  padding: "var(--s-space-400)",
                  background: "var(--s-color-bg-surface-secondary, #f6f6f7)",
                  borderRadius: 8,
                }}
              >
                <s-stack direction="inline" gap="large">
                  <s-stack direction="block" gap="small-400">
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6d7175",
                      }}
                    >
                      FORMAT
                    </p>
                    <p style={{ margin: 0, fontSize: 14 }}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.jpgPngWebpGifSvgAvif"
                      )}
                    </p>
                  </s-stack>
                </s-stack>
              </div>
              <s-divider />
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                  <AssetUpload
                    label={translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageDesktop"
                    )}
                    hint={`${translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
                    )} ${translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1900x230"
                    )}`}
                    value={bundleBannerDesktopUrl || null}
                    onChange={(url) => {
                      setBundleBannerDesktopUrl(url ?? "");
                      markAsDirty();
                    }}
                  />
                  <AssetUpload
                    label={translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageMobile"
                    )}
                    hint={`${translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
                    )} ${translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1100x500"
                    )}`}
                    value={bundleBannerMobileUrl || null}
                    onChange={(url) => {
                      setBundleBannerMobileUrl(url ?? "");
                      markAsDirty();
                    }}
                  />
              </s-grid>
            </s-stack>
          </s-section>
          {steps.length > 0 && (
            <s-section>
              <s-stack direction="block" gap="base">
                <s-stack direction="inline">
                  <s-stack direction="inline" gap="small" inlineSize="100%">
                    <s-icon type="upload" />
                    <s-stack direction="block" gap="small-400">
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.stepImages"
                        )}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#6d7175",
                        }}
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.tabIconAndBannerImagePerStepShownInTheWidget"
                        )}
                      </p>
                    </s-stack>
                  </s-stack>
                  <s-badge tone="info">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.perStep"
                    )}
                  </s-badge>
                </s-stack>
                <div>
                  <div className={fullPageBundleStyles.tabRow}>
                    {steps.map((step, i) => (
                      <button
                        key={`asset-step-${step.id}`}
                        onClick={() => setActiveAssetTabIndex(i)}
                        className={
                          activeAssetTabIndex === i
                            ? fullPageBundleStyles.tabActive
                            : fullPageBundleStyles.tab
                        }
                      >
                        {step.name || `Step ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
                {steps.map(
                  (step, index) =>
                    activeAssetTabIndex === index && (
                      <s-stack key={step.id} direction="block" gap="base">
                        <s-stack direction="block" gap="small-100">
                          <s-stack direction="block" gap="small-400">
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.tabIcon"
                              )}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#6d7175",
                              }}
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.circularIconInTheStepTabReplacesTheStepNumberWhenSetRecommended1"
                              )}
                            </p>
                          </s-stack>
                          <AssetUpload
                            label={translateAdmin(
                              "adminAttributes.chooseTabIcon"
                            )}
                            value={step.imageUrl ?? null}
                            onChange={(url) => {
                              updateStepField(
                                step.id,
                                "imageUrl",
                                url ?? null
                              );
                              markAsDirty();
                            }}
                          />
                        </s-stack>
                        <s-divider />
                        <s-stack direction="block" gap="small-100">
                          <s-stack direction="block" gap="small-400">
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.stepBannerImage"
                              )}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#6d7175",
                              }}
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.fullWidthImageAboveTheProductGridWhenThisStepIsActiveRecommended"
                              )}
                            </p>
                          </s-stack>
                          <AssetUpload
                            label={translateAdmin(
                              "adminAttributes.chooseBannerImage"
                            )}
                            value={step.bannerImageUrl ?? null}
                            onChange={(url) => {
                              updateStepField(
                                step.id,
                                "bannerImageUrl",
                                url ?? null
                              );
                              markAsDirty();
                            }}
                          />
                        </s-stack>
                      </s-stack>
                    )
                )}
              </s-stack>
            </s-section>
          )}
          <s-section>
            <s-stack direction="block" gap="base">
              <s-stack direction="inline">
                <s-stack direction="inline" gap="small" inlineSize="100%">
                  <s-icon type="note" />
                  <s-stack direction="block" gap="small-400">
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.floatingPromoBadge"
                      )}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#6d7175",
                      }}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.fixedBadgeAtBottomLeftOfThePageSessionDismissedWhenShopperClicks"
                      )}
                    </p>
                  </s-stack>
                </s-stack>
                <s-badge tone="info">
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.storefront"
                  )}
                </s-badge>
              </s-stack>
              <s-checkbox
                label={translateAdmin("adminAttributes.showFloatingPromoBadge")}
                checked={floatingBadgeEnabled || undefined}
                onChange={(e) => {
                  setFloatingBadgeEnabled(
                    (e.target as HTMLInputElement).checked
                  );
                  markAsDirty();
                }}
              />
              <DisabledConfigurationRegion disabled={!floatingBadgeEnabled}>
                <s-text-field
                  label={translateAdmin("adminAttributes.badgeText")}
                  value={floatingBadgeText}
                  disabled={!floatingBadgeEnabled || undefined}
                  onInput={(e) => {
                    setFloatingBadgeText(
                      (e.target as HTMLInputElement).value.slice(0, 60)
                    );
                    markAsDirty();
                  }}
                  placeholder={translateAdmin(
                    "adminAttributes.eGSave20TodayOnly"
                  )}
                  autocomplete="off"
                />
              </DisabledConfigurationRegion>
            </s-stack>
          </s-section>
        </>
      )}
    </>
  );
}
