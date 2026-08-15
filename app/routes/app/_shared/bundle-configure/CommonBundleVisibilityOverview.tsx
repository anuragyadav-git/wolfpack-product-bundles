import type {
  BundleLinkModel,
  EmbedStatusModel,
} from "../../../../lib/bundle-config/common-configure-page-model";

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

interface CommonBundleVisibilityOverviewProps {
  active: boolean;
  embedStatus: EmbedStatusModel;
  link: BundleLinkModel;
  onCopyLink: () => void;
  onEnableEmbed?: () => void;
  styles: Record<string, string>;
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
  styles,
  themeEditorUrl,
}: CommonBundleVisibilityOverviewProps) {
  if (!active) return null;

  return (
    <div className={styles.visibilityOverviewStack}>
      <div className={styles.visibilityOverviewCard}>
        <div className={styles.visibilityCardHeaderRow}>
          <div>
            <h3 className={styles.visibilityCardTitle}>App Embed Status</h3>
            <p className={styles.visibilityCardText}>{embedStatus.description}</p>
          </div>
          <div
            className={
              embedStatus.enabled
                ? styles.visibilityStatusEnabled
                : styles.visibilityStatusWarning
            }
          >
            {embedStatus.label}
          </div>
        </div>
        {!embedStatus.enabled && themeEditorUrl && onEnableEmbed && (
          <button
            type="button"
            className={styles.visibilitySecondaryAction}
            onClick={onEnableEmbed}
          >
            Enable Here
          </button>
        )}
      </div>

      <div className={styles.visibilityOverviewCard}>
        <div className={styles.visibilitySectionIntro}>
          <h3 className={styles.visibilityCardTitle}>
            Publishing Best Practices
          </h3>
          <p className={styles.visibilityCardText}>
            Pick a placement and follow the quick guide to make your bundle
            discoverable on your store.
          </p>
        </div>
        <div className={styles.publishingGuideGrid}>
          {VISIBILITY_GUIDES.map(({ title, description, img, guide }, index) => (
            <article key={title} className={styles.publishingGuideCard}>
              <div className={styles.publishingGuideMedia}>
                <img src={img} alt={title} />
                <span className={styles.publishingGuideIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={styles.publishingGuideBody}>
                <div className={styles.publishingGuideContent}>
                  <h4 className={styles.publishingGuideTitle}>{title}</h4>
                  <span className={styles.publishingGuideTime}>5 min setup</span>
                </div>
                <p className={styles.publishingGuideDescription}>
                  {description}
                </p>
                <details className={styles.publishingGuideDetails}>
                    <summary className={styles.publishingGuideAction}>
                      Quick Setup Guide
                    </summary>
                    <p className={styles.publishingGuideSteps}>{guide}</p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.visibilityOverviewCard}>
        <div className={styles.visibilitySectionIntro}>
          <h3 className={styles.visibilityCardTitle}>Your Bundle Link</h3>
          <p className={styles.visibilityCardText}>
            Use this link to place your bundle anywhere - theme components,
            emails, ads, or social bios.
          </p>
        </div>
        {link.isLinked ? (
          <div className={styles.visibilityLinkRow}>
            <input
              className={styles.visibilityTextInput}
              aria-label="Bundle link"
              value={link.url}
              disabled
              readOnly
            />
            <button
              type="button"
              className={styles.visibilitySecondaryAction}
              onClick={onCopyLink}
            >
              Copy Link
            </button>
          </div>
        ) : (
          <p className={styles.visibilityCardText}>{link.emptyMessage}</p>
        )}
      </div>

      <div className={styles.visibilityOverviewCard}>
        <h3 className={styles.visibilityCardTitle}>
          Want more placement options?
        </h3>
        {placementOptions.map((option) => (
          <div key={option.title} className={styles.visibilitySetupPanel}>
            <div>
              <h4 className={styles.visibilitySetupTitle}>{option.title}</h4>
              <p className={styles.visibilityCardText}>
                {option.description}
              </p>
            </div>
            <button
              type="button"
              className={
                option.variant === "primary"
                  ? styles.visibilityPrimaryAction
                  : styles.visibilitySecondaryAction
              }
              onClick={option.onAction}
            >
              {option.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
