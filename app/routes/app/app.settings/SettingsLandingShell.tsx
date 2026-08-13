import styles from "./SettingsLandingShell.module.css";

export type SettingsWorkspaceView = "design" | "language" | "controls";

const SETTINGS_SECTIONS: Array<{
  id: SettingsWorkspaceView;
  title: string;
  description: string;
  icon: "edit" | "globe" | "filter";
}> = [
  {
    id: "design",
    title: "Design",
    description: "Modify and customize all design elements of the bundle here",
    icon: "edit",
  },
  {
    id: "language",
    title: "Language",
    description: "Configure all text, labels, and translations for your bundle here",
    icon: "globe",
  },
  {
    id: "controls",
    title: "Controls",
    description: "Change loading screen gif, add custom CSS, modify checkout settings and more",
    icon: "filter",
  },
];

export function SettingsLandingShell({
  onSelect,
  onIntent,
}: {
  onSelect: (view: SettingsWorkspaceView) => void;
  onIntent?: () => void;
}) {
  return (
    <s-page heading="Settings" inlineSize="large">
      <s-query-container
        containerName="settings-landing"
        className={styles.landingViewport}
      >
        <div className={styles.landingContent}>
          <s-grid
            gridTemplateColumns="@container settings-landing (inline-size > 720px) 1fr 1fr 1fr, 1fr"
            gap="base"
          >
            {SETTINGS_SECTIONS.map((section) => (
              <s-clickable
                key={section.id}
                accessibilityLabel={`Open ${section.title} settings`}
                padding="base"
                border="base"
                borderRadius="base"
                onFocus={onIntent}
                onClick={() => onSelect(section.id)}
              >
                <s-stack gap="base">
                  <s-icon type={section.icon} size="base" />
                  <s-heading>{section.title}</s-heading>
                  <s-paragraph color="subdued">{section.description}</s-paragraph>
                </s-stack>
              </s-clickable>
            ))}
          </s-grid>
        </div>
      </s-query-container>
    </s-page>
  );
}

export function SettingsWorkspaceError({ onExit }: { onExit: () => void }) {
  return (
    <s-page heading="Settings" inlineSize="large">
      <s-banner
        heading="Settings could not be loaded"
        tone="critical"
        dismissible={false}
        hidden={false}
      >
        <s-stack direction="block" gap="small">
          <s-paragraph>
            Reload the page or return to Settings and try again.
          </s-paragraph>
          <s-button onClick={onExit}>Return to Settings</s-button>
        </s-stack>
      </s-banner>
    </s-page>
  );
}
