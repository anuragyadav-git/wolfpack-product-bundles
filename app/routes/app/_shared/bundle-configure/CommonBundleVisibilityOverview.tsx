import type {
  BundleLinkModel,
  EmbedStatusModel,
} from "../../../../lib/bundle-config/common-configure-page-model";
import styles from "./CommonBundleVisibilityOverview.module.css";

interface VisibilityGuide {
  title: string;
  description: string;
  img: string;
  guide: string;
}

interface VisibilityPlacementOption {
  title: string;
  description: string;
  actionLabel: string;
  variant: "primary" | "secondary";
  onAction: () => void;
}

const VISIBILITY_GUIDES: VisibilityGuide[] = [
  {
    title: "Hero Banner",
    description:
      "Add a button to your homepage hero to drive shoppers directly to your bundle.",
    img: "/visibility-hero-banner.svg",
    guide:
      "Copy your bundle link, open the theme editor, add or select an image banner, set the button label and link, then save.",
  },
  {
    title: "Navigation Menu",
    description:
      "Add your bundle as a nav link so shoppers can find it from anywhere on your store.",
    img: "/visibility-navigation-menu.svg",
    guide:
      "Copy your bundle link, open Content > Menus, add the bundle as a main-menu item, then save the menu.",
  },
  {
    title: "Announcement Banner",
    description:
      "Show your offer in the announcement bar so visitors see it instantly.",
    img: "/visibility-announcement-bar.svg",
    guide:
      "Copy your bundle link, open the theme editor, enable the announcement bar, add offer copy and the bundle link, then save.",
  },
  {
    title: "Featured Product Card",
    description:
      "Feature your bundle product on your homepage so shoppers find it right away.",
    img: "/visibility-featured-product.svg",
    guide:
      "Add the bundle product to a collection, open the theme editor, select Featured Collection, choose that collection, lower the max product count, then save.",
  },
];

export function PublishingBestPractices() {
  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="block" gap="small-100">
          <s-heading>Publishing Best Practices</s-heading>
          <s-text color="subdued">
            Pick a placement and follow the quick guide to make your bundle
            discoverable on your store.
          </s-text>
        </s-stack>
        <div className={styles.practiceGrid}>
          {VISIBILITY_GUIDES.map(({ title, description, img, guide }) => (
            <div key={title} className={styles.practiceCard}>
              <s-box border="base" borderRadius="base">
                <s-image aspectRatio="2/1" src={img} alt={title} />
                <s-box padding="base">
                  <div className={styles.practiceCardBody}>
                    <s-heading>{title}</s-heading>
                    <div className={styles.practiceDescription}>
                      <s-text color="subdued">{description}</s-text>
                    </div>
                    <div className={styles.practiceFooter}>
                      <details className={styles.quickGuide}>
                        <summary>Quick Setup Guide</summary>
                        <s-box paddingBlockStart="small">
                          <s-text color="subdued">{guide}</s-text>
                        </s-box>
                      </details>
                      <s-text color="subdued">5 min setup</s-text>
                    </div>
                  </div>
                </s-box>
              </s-box>
            </div>
          ))}
        </div>
      </s-stack>
    </s-section>
  );
}

interface CommonBundleVisibilityOverviewProps {
  active: boolean;
  embedStatus: EmbedStatusModel;
  link: BundleLinkModel;
  onCopyLink: () => void;
  onEnableEmbed?: () => void;
  themeEditorUrl?: string | null;
  placementOptions: VisibilityPlacementOption[];
}

export function CommonBundleVisibilityOverview({
  active,
  embedStatus,
  link,
  onCopyLink,
  onEnableEmbed,
  placementOptions,
  themeEditorUrl,
}: CommonBundleVisibilityOverviewProps) {
  if (!active) return null;

  return (
    <s-stack direction="block" gap="base">
      <s-section>
        <div className={styles.compactCardRow}>
          <div className={styles.compactCardCopy}>
            <s-stack direction="inline" alignItems="center" gap="small">
              <s-heading>App Embed Status</s-heading>
              <s-badge tone={embedStatus.enabled ? "success" : "warning"}>
                {embedStatus.label}
              </s-badge>
            </s-stack>
            <s-text color="subdued">{embedStatus.description}</s-text>
          </div>
          {!embedStatus.enabled && themeEditorUrl && onEnableEmbed && (
            <s-button
              variant="primary"
              icon="theme-edit"
              onClick={onEnableEmbed}
            >
              Enable Here
            </s-button>
          )}
        </div>
      </s-section>

      <PublishingBestPractices />

      <s-section>
        <div className={styles.compactCardStack}>
          <div className={styles.compactCardCopy}>
            <s-heading>Your Bundle Link</s-heading>
            <s-text color="subdued">
              Share it in your theme, emails, ads, or social profiles.
            </s-text>
          </div>
          {link.isLinked ? (
            <div className={styles.bundleLinkRow}>
              <s-text-field
                label="Bundle link"
                labelAccessibilityVisibility="exclusive"
                value={link.url}
                disabled
              />
              <s-button
                variant="secondary"
                icon="duplicate"
                onClick={onCopyLink}
              >
                Copy Link
              </s-button>
            </div>
          ) : (
            <s-box paddingBlockEnd="small-200">
              <s-banner heading="Bundle link unavailable" tone="warning">
                {link.emptyMessage}
              </s-banner>
            </s-box>
          )}
        </div>
      </s-section>

      <s-section>
        <div className={styles.compactCardStack}>
          <s-heading>Want more placement options?</s-heading>
          <div className={styles.placementOptionsGrid}>
            {placementOptions.map((option) => (
              <s-box
                key={option.title}
                padding="small"
                background="subdued"
                borderRadius="base"
              >
                <div className={styles.placementOptionRow}>
                  <div className={styles.compactCardCopy}>
                    <s-heading>{option.title}</s-heading>
                    <s-text color="subdued">{option.description}</s-text>
                  </div>
                  <s-button
                    variant={option.variant}
                    icon="arrow-right"
                    onClick={option.onAction}
                  >
                    {option.actionLabel}
                  </s-button>
                </div>
              </s-box>
            ))}
          </div>
        </div>
      </s-section>
    </s-stack>
  );
}
