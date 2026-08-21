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
        <s-stack direction="block" gap="base">
          <s-stack
            direction="inline"
            alignItems="start"
            justifyContent="space-between"
            gap="base"
          >
            <s-stack direction="inline" alignItems="start" gap="small">
              <s-icon
                type={embedStatus.enabled ? "check" : "alert-triangle"}
                tone={embedStatus.enabled ? "success" : "caution"}
              />
              <s-stack direction="block" gap="small-100">
                <s-heading>App Embed Status</s-heading>
                <s-text color="subdued">{embedStatus.description}</s-text>
              </s-stack>
            </s-stack>
            <s-badge tone={embedStatus.enabled ? "success" : "warning"}>
              {embedStatus.label}
            </s-badge>
          </s-stack>
          {!embedStatus.enabled && themeEditorUrl && onEnableEmbed && (
            <s-button variant="primary" icon="globe" onClick={onEnableEmbed}>
              Enable Here
            </s-button>
          )}
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack direction="block" gap="small-100">
            <s-heading>Publishing Best Practices</s-heading>
            <s-text color="subdued">
              Pick a placement and follow the quick guide to make your bundle
              discoverable on your store.
            </s-text>
          </s-stack>
          <s-grid
            gridTemplateColumns="@container bundle-visibility (inline-size > 760px) repeat(2, minmax(0, 1fr)), 1fr"
            gap="base"
          >
            {VISIBILITY_GUIDES.map(({ title, description, img, guide }: any) => (
              <s-box
                key={title}
                padding="base"
                border="base"
                borderRadius="base"
              >
                <s-stack direction="block" gap="base">
                  <s-image aspectRatio="16/7" src={img} alt={title} />
                  <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    gap="small"
                  >
                    <s-heading>{title}</s-heading>
                    <s-badge tone="info">5 min setup</s-badge>
                  </s-stack>
                  <s-text color="subdued">{description}</s-text>
                  <details>
                    <summary>Quick Setup Guide</summary>
                    <s-box paddingBlockStart="small">
                      <s-text color="subdued">{guide}</s-text>
                    </s-box>
                  </details>
                </s-stack>
              </s-box>
            ))}
          </s-grid>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" alignItems="start" gap="small">
            <s-icon type="globe" />
            <s-stack direction="block" gap="small-100">
              <s-heading>Your Bundle Link</s-heading>
              <s-text color="subdued">
                Use this link to place your bundle anywhere - theme components,
                emails, ads, or social bios.
              </s-text>
            </s-stack>
          </s-stack>
          {link.isLinked ? (
            <s-grid
              gridTemplateColumns="@container bundle-link (inline-size > 520px) minmax(0, 1fr) auto, 1fr"
              gap="small"
              alignItems="end"
            >
              <s-text-field label="Bundle link" value={link.url} disabled />
              <s-button
                variant="secondary"
                icon="duplicate"
                onClick={onCopyLink}
              >
                Copy Link
              </s-button>
            </s-grid>
          ) : (
            <s-banner tone="warning">{link.emptyMessage}</s-banner>
          )}
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" alignItems="center" gap="small">
            <s-icon type="product" />
            <s-heading>Want more placement options?</s-heading>
          </s-stack>
          <s-grid
            gridTemplateColumns="@container visibility-options (inline-size > 680px) repeat(2, minmax(0, 1fr)), 1fr"
            gap="base"
          >
            {placementOptions.map((option) => (
              <s-box
                key={option.title}
                padding="base"
                background="subdued"
                borderRadius="base"
              >
                <s-stack direction="block" gap="base">
                  <s-stack direction="block" gap="small-100">
                    <s-heading>{option.title}</s-heading>
                    <s-text color="subdued">{option.description}</s-text>
                  </s-stack>
                  <s-button
                    variant={option.variant}
                    icon="arrow-right"
                    onClick={option.onAction}
                  >
                    {option.actionLabel}
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-grid>
        </s-stack>
      </s-section>
    </s-stack>
  );
}
